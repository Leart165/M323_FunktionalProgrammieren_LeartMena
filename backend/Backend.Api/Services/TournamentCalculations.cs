using Backend.Api.DTOs;

namespace Backend.Api.Services;

public static class TournamentCalculations
{
    public static TournamentProjection BuildProjection(
        IReadOnlyList<GroupDefinition> groups,
        IReadOnlyList<FixtureDefinition> fixtures,
        IReadOnlyDictionary<string, MatchScore> scores,
        IReadOnlyList<KnockoutTemplateDefinition> knockoutTemplates,
        IReadOnlyDictionary<string, MatchScore> knockoutScores,
        Func<GroupTeamDefinition, GroupTeamDto>? teamMapper = null)
    {
        var mapTeam = teamMapper ?? CreateTeamDto;

        var groupResults = groups
            .Select(group => BuildGroupResult(group, fixtures.Where(fixture => fixture.GroupId == group.Id).ToList(), scores))
            .ToList();

        var bestThirdTeams = BuildBestThirdTable(groupResults);
        var qualifiedThirdPlaceGroups = bestThirdTeams.Where(team => team.Next == 1)
            .Select(row => row.GroupId)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var groupSummaries = groupResults
            .Select(CreateGroupSummary)
            .ToList();

        var simulationGroups = groupResults.ToDictionary(
            group => group.Group.Id,
            group => new GroupDetailsDto(
                group.Group.Id,
                group.Group.Teams.Select(mapTeam).ToList(),
                group.OrderedStats.Select((stats, index) => CreateStandingRow(group.Group, stats, index, qualifiedThirdPlaceGroups)).ToList(),
                group.Fixtures.Select(fixture => CreateSimulationFixture(group.Group, fixture, scores)).ToList()),
            StringComparer.OrdinalIgnoreCase);

        var predictionGroups = groupResults.ToDictionary(
            group => group.Group.Id,
            table => new PredictionGroupDetailsDto(
                table.Group.Id,
                table.Group.VenueSummary,
                table.OrderedStats.Select((stats, index) => CreateStandingRow(table.Group, stats, index, qualifiedThirdPlaceGroups)).ToList(),
                table.Fixtures.Select(fixture => CreatePredictionFixture(table.Group, fixture, scores)).ToList()),
            StringComparer.OrdinalIgnoreCase);

        return new TournamentProjection(
            groupSummaries,
            simulationGroups,
            predictionGroups,
            BuildKnockoutBracket(groupResults, bestThirdTeams, knockoutTemplates, knockoutScores),
            bestThirdTeams.Select((row, index) => new ThirdPlacedTeamRowDto(
                index + 1,
                row.TeamName,
                row.Played,
                row.Wins,
                row.Draws,
                row.Losses,
                FormatGoalDelta(row.GoalsFor, row.GoalsAgainst),
                row.GoalDifference,
                row.Points,
                row.Next)).ToList());
    }

    public static IReadOnlyDictionary<string, MatchScore> SimulateKnockoutScores(
        IReadOnlyList<GroupDefinition> groups,
        IReadOnlyList<FixtureDefinition> fixtures,
        IReadOnlyDictionary<string, MatchScore> groupScores,
        IReadOnlyList<KnockoutTemplateDefinition> knockoutTemplates,
        IReadOnlyDictionary<string, MatchScore> existingKnockoutScores,
        IReadOnlyDictionary<string, TeamStrengthDto> strengths,
        int seed,
        IReadOnlySet<string>? stageTitlesToSimulate = null)
    {
        var groupResults = groups
            .Select(group => BuildGroupResult(group, fixtures.Where(fixture => fixture.GroupId == group.Id).ToList(), groupScores))
            .ToList();

        var bestThirdTeams = BuildBestThirdTable(groupResults);
        var thirdPlaceAssignments = AssignThirdPlaceTeams(knockoutTemplates, bestThirdTeams);
        var knockoutScores = new Dictionary<string, MatchScore>(existingKnockoutScores, StringComparer.OrdinalIgnoreCase);
        var knockoutWinners = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var knockoutLosers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        foreach (var template in knockoutTemplates.OrderBy(ExtractMatchNumber))
        {
            var homeTeam = ResolveKnockoutSlot(template.Id, template.HomeSlot, groupResults, bestThirdTeams, thirdPlaceAssignments, knockoutWinners, knockoutLosers);
            var awayTeam = ResolveKnockoutSlot(template.Id, template.AwaySlot, groupResults, bestThirdTeams, thirdPlaceAssignments, knockoutWinners, knockoutLosers);

            if (homeTeam is null || awayTeam is null)
            {
                continue;
            }

            if (knockoutScores.TryGetValue(template.Id, out var existingScore))
            {
                var existingWinner = existingScore.HomeGoals >= existingScore.AwayGoals ? homeTeam : awayTeam;
                var existingLoser = existingScore.HomeGoals >= existingScore.AwayGoals ? awayTeam : homeTeam;
                knockoutWinners[template.Id] = existingWinner;
                knockoutLosers[template.Id] = existingLoser;
                continue;
            }

            if (stageTitlesToSimulate is not null && !stageTitlesToSimulate.Contains(template.StageTitle))
            {
                continue;
            }

            var result = SimulateKnockoutMatch(template.Id, homeTeam, awayTeam, strengths, seed);
            knockoutScores[template.Id] = result.Score;
            knockoutWinners[template.Id] = result.Winner;
            knockoutLosers[template.Id] = result.Loser;
        }

        return knockoutScores;
    }

    public static IReadOnlyDictionary<string, MatchScore> SimulateGroupFixtures(
        GroupDefinition group,
        IReadOnlyList<FixtureDefinition> fixtures,
        IReadOnlyDictionary<string, MatchScore> existingScores,
        IReadOnlyDictionary<string, TeamStrengthDto> strengths,
        int seed)
    {
        return fixtures
            .OrderBy(fixture => fixture.MatchNumber)
            .Aggregate(
                new Dictionary<string, MatchScore>(existingScores, StringComparer.OrdinalIgnoreCase),
                (current, fixture) =>
                {
                    if (current.ContainsKey(fixture.FixtureId))
                    {
                        return current;
                    }

                    var result = SimulateMatch(
                        fixture,
                        strengths[fixture.HomeTeam].Rating,
                        strengths[fixture.AwayTeam].Rating,
                        seed);

                    return new Dictionary<string, MatchScore>(current, StringComparer.OrdinalIgnoreCase)
                    {
                        [fixture.FixtureId] = result
                    };
                });
    }

    public static MatchScore SimulateMatch(FixtureDefinition fixture, int homeStrength, int awayStrength, int seed)
    {
        var homeEdge = 45;
        var diff = (homeStrength + homeEdge) - awayStrength;
        var expectedHome = Clamp(1.15 + (diff / 260.0), 0.2, 3.5);
        var expectedAway = Clamp(1.05 - (diff / 310.0), 0.15, 3.2);

        var homeGoals = SamplePoisson(expectedHome, CombineSeed(seed, fixture.FixtureId, "home"));
        var awayGoals = SamplePoisson(expectedAway, CombineSeed(seed, fixture.FixtureId, "away"));
        return new MatchScore(homeGoals, awayGoals);
    }

    private static GroupResult BuildGroupResult(
        GroupDefinition group,
        IReadOnlyList<FixtureDefinition> fixtures,
        IReadOnlyDictionary<string, MatchScore> scores)
    {
        var initialStats = group.Teams.ToDictionary(
            team => team.Name,
            team => TeamStats.Empty(team.Name),
            StringComparer.OrdinalIgnoreCase);

        var standingsByTeam = fixtures.Aggregate(
            (IReadOnlyDictionary<string, TeamStats>)initialStats,
            (current, fixture) => ApplyFixtureResult(current, fixture, scores));

        var orderedStats = standingsByTeam.Values
            .OrderByDescending(stats => stats.Points)
            .ThenByDescending(stats => stats.GoalDifference)
            .ThenByDescending(stats => stats.GoalsFor)
            .ThenBy(stats => stats.TeamName, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return new GroupResult(group, fixtures, standingsByTeam, orderedStats);
    }

    private static IReadOnlyDictionary<string, TeamStats> ApplyFixtureResult(
        IReadOnlyDictionary<string, TeamStats> standings,
        FixtureDefinition fixture,
        IReadOnlyDictionary<string, MatchScore> scores)
    {
        if (!scores.TryGetValue(fixture.FixtureId, out var score))
        {
            return standings;
        }

        var home = standings[fixture.HomeTeam];
        var away = standings[fixture.AwayTeam];
        var homePoints = GetPoints(score.HomeGoals, score.AwayGoals);
        var awayPoints = GetPoints(score.AwayGoals, score.HomeGoals);

        var updatedHome = home with
        {
            Played = home.Played + 1,
            Wins = home.Wins + (homePoints == 3 ? 1 : 0),
            Draws = home.Draws + (homePoints == 1 ? 1 : 0),
            Losses = home.Losses + (homePoints == 0 ? 1 : 0),
            GoalsFor = home.GoalsFor + score.HomeGoals,
            GoalsAgainst = home.GoalsAgainst + score.AwayGoals,
            GoalDifference = (home.GoalsFor + score.HomeGoals) - (home.GoalsAgainst + score.AwayGoals),
            Points = home.Points + homePoints
        };

        var updatedAway = away with
        {
            Played = away.Played + 1,
            Wins = away.Wins + (awayPoints == 3 ? 1 : 0),
            Draws = away.Draws + (awayPoints == 1 ? 1 : 0),
            Losses = away.Losses + (awayPoints == 0 ? 1 : 0),
            GoalsFor = away.GoalsFor + score.AwayGoals,
            GoalsAgainst = away.GoalsAgainst + score.HomeGoals,
            GoalDifference = (away.GoalsFor + score.AwayGoals) - (away.GoalsAgainst + score.HomeGoals),
            Points = away.Points + awayPoints
        };

        return new Dictionary<string, TeamStats>(standings, StringComparer.OrdinalIgnoreCase)
        {
            [fixture.HomeTeam] = updatedHome,
            [fixture.AwayTeam] = updatedAway
        };
    }

    private static IReadOnlyList<ThirdPlaceTeam> BuildBestThirdTable(IReadOnlyList<GroupResult> groupResults)
    {
        return groupResults
            .Where(group => group.OrderedStats.Count >= 3)
            .Select(group =>
            {
                var stats = group.OrderedStats[2];
                return new ThirdPlaceTeam(
                    group.Group.Id,
                    stats.TeamName,
                    stats.Played,
                    stats.Wins,
                    stats.Draws,
                    stats.Losses,
                    stats.GoalsFor,
                    stats.GoalsAgainst,
                    stats.GoalDifference,
                    stats.Points,
                    0);
            })
            .OrderByDescending(team => team.Points)
            .ThenByDescending(team => team.GoalDifference)
            .ThenByDescending(team => team.GoalsFor)
            .ThenBy(team => team.TeamName, StringComparer.OrdinalIgnoreCase)
            .Select((team, index) => team with { Next = index < 8 ? 1 : 0 })
            .ToList();
    }

    private static StandingRowDto CreateStandingRow(
        GroupDefinition group,
        TeamStats stats,
        int index,
        IReadOnlySet<string> qualifiedThirdPlaceGroups)
    {
        var team = FindGroupTeam(group, stats.TeamName);
        var next = index < 2 || (index == 2 && qualifiedThirdPlaceGroups.Contains(group.Id)) ? 1 : 0;

        return new StandingRowDto(
            index + 1,
            new GroupTeamDto(team.Name, team.ShortName, team.FlagClassName, stats.GoalDifference, stats.Points, team.Tag, team.TagClassName),
            stats.Played,
            stats.Wins,
            stats.Draws,
            stats.Losses,
            FormatGoalDelta(stats.GoalsFor, stats.GoalsAgainst),
            stats.GoalDifference,
            stats.Points,
            next);
    }

    private static SimulationFixtureDto CreateSimulationFixture(
        GroupDefinition group,
        FixtureDefinition fixture,
        IReadOnlyDictionary<string, MatchScore> scores)
    {
        var homeTeam = FindGroupTeam(group, fixture.HomeTeam);
        var awayTeam = FindGroupTeam(group, fixture.AwayTeam);
        scores.TryGetValue(fixture.FixtureId, out var score);

        return new SimulationFixtureDto(
            fixture.FixtureId,
            fixture.MatchNumber,
            fixture.MatchdayLabel,
            fixture.DateLabel,
            fixture.Venue,
            new GroupTeamDto(homeTeam.Name, homeTeam.ShortName, homeTeam.FlagClassName, 0, 0, homeTeam.Tag, homeTeam.TagClassName),
            new GroupTeamDto(awayTeam.Name, awayTeam.ShortName, awayTeam.FlagClassName, 0, 0, awayTeam.Tag, awayTeam.TagClassName),
            score?.HomeGoals,
            score?.AwayGoals,
            score is null ? "pending" : "simulated");
    }

    private static PredictionFixtureDto CreatePredictionFixture(
        GroupDefinition group,
        FixtureDefinition fixture,
        IReadOnlyDictionary<string, MatchScore> scores)
    {
        var homeTeam = FindGroupTeam(group, fixture.HomeTeam);
        var awayTeam = FindGroupTeam(group, fixture.AwayTeam);
        scores.TryGetValue(fixture.FixtureId, out var score);

        return new PredictionFixtureDto(
            fixture.FixtureId,
            fixture.MatchNumber,
            fixture.MatchdayLabel,
            fixture.DateLabel,
            fixture.Venue,
            new GroupTeamDto(homeTeam.Name, homeTeam.ShortName, homeTeam.FlagClassName, 0, 0, homeTeam.Tag, homeTeam.TagClassName),
            new GroupTeamDto(awayTeam.Name, awayTeam.ShortName, awayTeam.FlagClassName, 0, 0, awayTeam.Tag, awayTeam.TagClassName),
            score?.HomeGoals,
            score?.AwayGoals);
    }

    private static GroupItemDto CreateGroupSummary(GroupResult group)
    {
        var stadiumCount = group.Fixtures
            .Select(fixture => fixture.Venue)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Count();

        return new GroupItemDto(
            group.Group.Id,
            stadiumCount == 1 ? "1 stadium" : $"{stadiumCount} stadiums",
            group.Group.Teams
                .Select(team =>
                {
                    var stats = group.StandingsByTeam[team.Name];
                    return new GroupTeamDto(team.Name, team.ShortName, team.FlagClassName, stats.GoalDifference, stats.Points, team.Tag, team.TagClassName);
                })
                .ToList());
    }

    private static GroupTeamDto CreateTeamDto(GroupTeamDefinition team)
    {
        return new GroupTeamDto(team.Name, team.ShortName, team.FlagClassName, 0, 0, team.Tag, team.TagClassName);
    }

    private static GroupTeamDefinition FindGroupTeam(GroupDefinition group, string teamName)
    {
        return group.Teams.First(team => string.Equals(team.Name, teamName, StringComparison.OrdinalIgnoreCase));
    }

    private static int GetPoints(int goalsFor, int goalsAgainst)
    {
        if (goalsFor > goalsAgainst) return 3;
        if (goalsFor == goalsAgainst) return 1;
        return 0;
    }

    private static string FormatGoalDelta(int goalsFor, int goalsAgainst) => $"{goalsFor}:{goalsAgainst}";

    private static KnockoutBracketDto BuildKnockoutBracket(
        IReadOnlyList<GroupResult> groupResults,
        IReadOnlyList<ThirdPlaceTeam> bestThirdTeams,
        IReadOnlyList<KnockoutTemplateDefinition> knockoutTemplates,
        IReadOnlyDictionary<string, MatchScore> knockoutScores)
    {
        var thirdPlaceAssignments = AssignThirdPlaceTeams(knockoutTemplates, bestThirdTeams);
        var nextMatchByWinner = BuildNextMatchMap(knockoutTemplates);
        var winners = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var losers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        var matches = knockoutTemplates
            .OrderBy(ExtractMatchNumber)
            .Select(template =>
            {
                var home = ResolveKnockoutSlot(template.Id, template.HomeSlot, groupResults, bestThirdTeams, thirdPlaceAssignments, winners, losers) ?? template.HomeSlot;
                var away = ResolveKnockoutSlot(template.Id, template.AwaySlot, groupResults, bestThirdTeams, thirdPlaceAssignments, winners, losers) ?? template.AwaySlot;
                knockoutScores.TryGetValue(template.Id, out var score);

                if (score is not null && !string.Equals(home, template.HomeSlot, StringComparison.OrdinalIgnoreCase) && !string.Equals(away, template.AwaySlot, StringComparison.OrdinalIgnoreCase))
                {
                    var winner = score.HomeGoals >= score.AwayGoals ? home : away;
                    var loser = score.HomeGoals >= score.AwayGoals ? away : home;
                    winners[template.Id] = winner;
                    losers[template.Id] = loser;
                }

                return new
                {
                    template.StageTitle,
                    Match = new KnockoutMatchDto(
                        template.Id,
                        template.Label,
                        template.DateLabel,
                        template.Venue,
                        home,
                        away,
                        nextMatchByWinner.TryGetValue(template.Id, out var nextMatchId) ? nextMatchId : null,
                        score is null ? "pending" : "simulated",
                        score?.HomeGoals,
                        score?.AwayGoals)
                };
            })
            .ToList();

        return new KnockoutBracketDto(
            matches
                .GroupBy(item => item.StageTitle)
                .Select(stage => new KnockoutStageDto(stage.Key, stage.Select(item => item.Match).ToList()))
                .ToList());
    }

    private static string? ResolveKnockoutSlot(
        string matchId,
        string slot,
        IReadOnlyList<GroupResult> groupResults,
        IReadOnlyList<ThirdPlaceTeam> bestThirdTeams,
        IReadOnlyDictionary<string, string> thirdPlaceAssignments,
        IReadOnlyDictionary<string, string> winners,
        IReadOnlyDictionary<string, string> losers)
    {
        if (slot.StartsWith("1st Group ", StringComparison.OrdinalIgnoreCase))
        {
            return ResolveGroupStanding(groupResults, slot["1st Group ".Length..], 0);
        }

        if (slot.StartsWith("2nd Group ", StringComparison.OrdinalIgnoreCase))
        {
            return ResolveGroupStanding(groupResults, slot["2nd Group ".Length..], 1);
        }

        if (slot.StartsWith("3rd Group ", StringComparison.OrdinalIgnoreCase))
        {
            return thirdPlaceAssignments.TryGetValue(matchId, out var assignedTeam) ? assignedTeam : null;
        }

        if (slot.StartsWith("Winner ", StringComparison.OrdinalIgnoreCase))
        {
            var previousMatchId = slot["Winner ".Length..];
            return winners.TryGetValue(previousMatchId, out var winner) ? winner : null;
        }

        if (slot.StartsWith("Runner-up ", StringComparison.OrdinalIgnoreCase))
        {
            var previousMatchId = slot["Runner-up ".Length..];
            return losers.TryGetValue(previousMatchId, out var loser) ? loser : null;
        }

        return slot;
    }

    private static IReadOnlyDictionary<string, string> AssignThirdPlaceTeams(
        IReadOnlyList<KnockoutTemplateDefinition> knockoutTemplates,
        IReadOnlyList<ThirdPlaceTeam> bestThirdTeams)
    {
        var qualifiedTeams = bestThirdTeams
            .Where(team => team.Next == 1)
            .ToList();

        var matchSlots = knockoutTemplates
            .Where(template => template.HomeSlot.StartsWith("3rd Group ", StringComparison.OrdinalIgnoreCase)
                || template.AwaySlot.StartsWith("3rd Group ", StringComparison.OrdinalIgnoreCase))
            .Select(template => new ThirdPlaceSlot(
                template.Id,
                ParseAllowedGroups(template.HomeSlot) ?? ParseAllowedGroups(template.AwaySlot) ?? new HashSet<string>(StringComparer.OrdinalIgnoreCase)))
            .OrderBy(slot => slot.AllowedGroups.Count)
            .ThenBy(slot => ExtractMatchNumber(slot.MatchId))
            .ToList();

        var assignments = new Dictionary<string, ThirdPlaceTeam>(StringComparer.OrdinalIgnoreCase);

        bool Search(int index, HashSet<string> usedGroups)
        {
            if (index >= matchSlots.Count)
            {
                return true;
            }

            var slot = matchSlots[index];
            var candidates = qualifiedTeams
                .Where(team => slot.AllowedGroups.Contains(team.GroupId) && !usedGroups.Contains(team.GroupId))
                .OrderByDescending(team => team.Points)
                .ThenByDescending(team => team.GoalDifference)
                .ThenByDescending(team => team.GoalsFor)
                .ThenBy(team => team.GroupId, StringComparer.OrdinalIgnoreCase)
                .ToList();

            foreach (var candidate in candidates)
            {
                assignments[slot.MatchId] = candidate;
                var nextUsedGroups = new HashSet<string>(usedGroups, StringComparer.OrdinalIgnoreCase) { candidate.GroupId };
                if (Search(index + 1, nextUsedGroups))
                {
                    return true;
                }
            }

            assignments.Remove(slot.MatchId);
            return false;
        }

        Search(0, new HashSet<string>(StringComparer.OrdinalIgnoreCase));

        return assignments.ToDictionary(entry => entry.Key, entry => entry.Value.TeamName, StringComparer.OrdinalIgnoreCase);
    }

    private static HashSet<string>? ParseAllowedGroups(string slot)
    {
        if (!slot.StartsWith("3rd Group ", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        return slot["3rd Group ".Length..]
            .Split('/', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
    }

    private static IReadOnlyDictionary<string, string> BuildNextMatchMap(IReadOnlyList<KnockoutTemplateDefinition> knockoutTemplates)
    {
        return knockoutTemplates
            .SelectMany(template => new[]
            {
                TryCreateNextMatchLink(template.HomeSlot, template.Id),
                TryCreateNextMatchLink(template.AwaySlot, template.Id),
            })
            .Where(link => link is not null)
            .Select(link => link!)
            .GroupBy(link => link.FromMatchId, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(group => group.Key, group => group.First().ToMatchId, StringComparer.OrdinalIgnoreCase);
    }

    private static KnockoutLink? TryCreateNextMatchLink(string slot, string toMatchId)
    {
        if (!slot.StartsWith("Winner ", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        return new KnockoutLink(slot["Winner ".Length..], toMatchId);
    }

    private static string? ResolveGroupStanding(IReadOnlyList<GroupResult> groupResults, string groupId, int index)
    {
        var group = groupResults.FirstOrDefault(result => string.Equals(result.Group.Id, groupId, StringComparison.OrdinalIgnoreCase));
        if (group is null || group.OrderedStats.Count <= index)
        {
            return null;
        }

        return group.OrderedStats[index].TeamName;
    }

    private static SimulatedKnockoutMatch SimulateKnockoutMatch(
        string matchId,
        string homeTeam,
        string awayTeam,
        IReadOnlyDictionary<string, TeamStrengthDto> strengths,
        int seed)
    {
        var score = SimulateMatch(
            new FixtureDefinition(matchId, "KO", ExtractMatchNumber(matchId), "Knockout", matchId, matchId, homeTeam, awayTeam),
            strengths[homeTeam].Rating,
            strengths[awayTeam].Rating,
            seed);

        if (score.HomeGoals != score.AwayGoals)
        {
            return score.HomeGoals > score.AwayGoals
                ? new SimulatedKnockoutMatch(score, homeTeam, awayTeam)
                : new SimulatedKnockoutMatch(score, awayTeam, homeTeam);
        }

        var homeStrength = strengths[homeTeam].Rating;
        var awayStrength = strengths[awayTeam].Rating;
        var homeWinsTiebreak = NextUnitDouble(CombineSeed(seed, matchId, "tiebreak"), 1) + (homeStrength / 5000.0)
            >= NextUnitDouble(CombineSeed(seed, matchId, "away-tiebreak"), 1) + (awayStrength / 5000.0);

        var adjustedScore = homeWinsTiebreak
            ? score with { HomeGoals = score.HomeGoals + 1 }
            : score with { AwayGoals = score.AwayGoals + 1 };

        return homeWinsTiebreak
            ? new SimulatedKnockoutMatch(adjustedScore, homeTeam, awayTeam)
            : new SimulatedKnockoutMatch(adjustedScore, awayTeam, homeTeam);
    }

    private static int ExtractMatchNumber(KnockoutTemplateDefinition template) => ExtractMatchNumber(template.Id);

    private static int ExtractMatchNumber(string matchId)
    {
        return int.TryParse(matchId.TrimStart('M'), out var number) ? number : int.MaxValue;
    }

    private static double Clamp(double value, double min, double max) => Math.Max(min, Math.Min(max, value));

    private static int SamplePoisson(double lambda, int seed)
    {
        var l = Math.Exp(-lambda);
        var k = 0;
        var p = 1.0;

        while (p > l && k < 8)
        {
            k += 1;
            p *= NextUnitDouble(seed, k);
        }

        return Math.Max(0, k - 1);
    }

    private static int CombineSeed(int seed, string fixtureId, string side)
    {
        unchecked
        {
            var hash = seed;
            foreach (var ch in $"{fixtureId}:{side}")
            {
                hash = (hash * 31) + ch;
            }

            return hash;
        }
    }

    private static double NextUnitDouble(int seed, int offset)
    {
        unchecked
        {
            var value = seed + (offset * 1103515245) + 12345;
            value ^= value << 13;
            value ^= value >> 17;
            value ^= value << 5;
            var positive = value & 0x7fffffff;
            return (positive + 1.0) / int.MaxValue;
        }
    }

    private sealed record TeamStats(
        string TeamName,
        int Played,
        int Wins,
        int Draws,
        int Losses,
        int GoalsFor,
        int GoalsAgainst,
        int GoalDifference,
        int Points)
    {
        public static TeamStats Empty(string teamName) => new(teamName, 0, 0, 0, 0, 0, 0, 0, 0);
    }

    private sealed record ThirdPlaceTeam(
        string GroupId,
        string TeamName,
        int Played,
        int Wins,
        int Draws,
        int Losses,
        int GoalsFor,
        int GoalsAgainst,
        int GoalDifference,
        int Points,
        int Next);

    private sealed record GroupResult(
        GroupDefinition Group,
        IReadOnlyList<FixtureDefinition> Fixtures,
        IReadOnlyDictionary<string, TeamStats> StandingsByTeam,
        IReadOnlyList<TeamStats> OrderedStats);

    private sealed record SimulatedKnockoutMatch(MatchScore Score, string Winner, string Loser);

    private sealed record ThirdPlaceSlot(string MatchId, IReadOnlySet<string> AllowedGroups);

    private sealed record KnockoutLink(string FromMatchId, string ToMatchId);
}
