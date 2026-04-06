using Backend.Api.Services;
using Xunit;

namespace Backend.Api.Tests;

public sealed class TournamentCalculationsTests
{
    [Fact]
    public void BuildProjection_ComputesGroupStandingsFromPureScores()
    {
        var groups = new[]
        {
            new GroupDefinition("A", "Test Stadium", new[]
            {
                Team("Alpha", "ALP"),
                Team("Bravo", "BRA"),
                Team("Charlie", "CHA"),
                Team("Delta", "DEL"),
            }),
        };

        var fixtures = new[]
        {
            Fixture("A-1", "A", 1, "Alpha", "Bravo"),
            Fixture("A-2", "A", 2, "Charlie", "Delta"),
            Fixture("A-3", "A", 3, "Alpha", "Charlie"),
            Fixture("A-4", "A", 4, "Bravo", "Delta"),
            Fixture("A-5", "A", 5, "Alpha", "Delta"),
            Fixture("A-6", "A", 6, "Bravo", "Charlie"),
        };

        var scores = new Dictionary<string, MatchScore>(StringComparer.OrdinalIgnoreCase)
        {
            ["A-1"] = new(2, 0),
            ["A-2"] = new(1, 1),
            ["A-3"] = new(1, 0),
            ["A-4"] = new(2, 1),
            ["A-5"] = new(0, 0),
            ["A-6"] = new(1, 3),
        };

        var projection = TournamentCalculations.BuildProjection(
            groups,
            fixtures,
            scores,
            Array.Empty<KnockoutTemplateDefinition>(),
            new Dictionary<string, MatchScore>(StringComparer.OrdinalIgnoreCase));

        var standings = projection.SimulationGroups["A"].Standings;

        Assert.Equal(["Alpha", "Charlie", "Bravo", "Delta"], standings.Select(row => row.Team.Name).ToArray());
        Assert.Equal([7, 4, 3, 2], standings.Select(row => row.Pts).ToArray());
        Assert.Equal([3, 1, -3, -1], standings.Select(row => row.Gd).ToArray());
    }

    [Fact]
    public void BuildProjection_SelectsExactlyEightBestThirdPlacedTeams()
    {
        var data = new TournamentDataService();
        var groupScores = CreateCompletedGroupScores(data);

        var projection = TournamentCalculations.BuildProjection(
            data.GetGroupDefinitions(),
            data.GetGroupFixtures(),
            groupScores,
            data.GetKnockoutTemplates(),
            new Dictionary<string, MatchScore>(StringComparer.OrdinalIgnoreCase));

        Assert.Equal(12, projection.BestThird.Count);
        Assert.Equal(8, projection.BestThird.Count(row => row.Next == 1));
        Assert.All(projection.PredictionGroups.Values, group => Assert.Equal(6, group.Fixtures.Count));
    }

    [Fact]
    public void BuildProjection_ResolvesKnockoutWinnersIntoNextRound()
    {
        var data = new TournamentDataService();
        var groupScores = CreateCompletedGroupScores(data);

        var initialProjection = TournamentCalculations.BuildProjection(
            data.GetGroupDefinitions(),
            data.GetGroupFixtures(),
            groupScores,
            data.GetKnockoutTemplates(),
            new Dictionary<string, MatchScore>(StringComparer.OrdinalIgnoreCase));

        var roundOf32 = initialProjection.Knockout.Stages.First(stage => stage.Title == "Round of 32").Matches;
        var m74 = roundOf32.First(match => match.Id == "M74");
        var m77 = roundOf32.First(match => match.Id == "M77");

        var knockoutScores = new Dictionary<string, MatchScore>(StringComparer.OrdinalIgnoreCase)
        {
            ["M74"] = new(2, 0),
            ["M77"] = new(1, 0),
        };

        var resolvedProjection = TournamentCalculations.BuildProjection(
            data.GetGroupDefinitions(),
            data.GetGroupFixtures(),
            groupScores,
            data.GetKnockoutTemplates(),
            knockoutScores);

        var roundOf16 = resolvedProjection.Knockout.Stages.First(stage => stage.Title == "Round of 16").Matches;
        var m89 = roundOf16.First(match => match.Id == "M89");

        Assert.Equal("M89", m74.NextMatchId);
        Assert.Equal("M89", m77.NextMatchId);
        Assert.Equal(m74.Home, m89.Home);
        Assert.Equal(m77.Home, m89.Away);
    }

    [Fact]
    public void SimulateKnockoutScores_CanLimitSimulationToSingleStage()
    {
        var data = new TournamentDataService();
        var groupScores = CreateCompletedGroupScores(data);

        var knockoutScores = TournamentCalculations.SimulateKnockoutScores(
            data.GetGroupDefinitions(),
            data.GetGroupFixtures(),
            groupScores,
            data.GetKnockoutTemplates(),
            new Dictionary<string, MatchScore>(StringComparer.OrdinalIgnoreCase),
            data.GetStrengths(),
            seed: 42,
            stageTitlesToSimulate: new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Round of 32" });

        Assert.Equal(16, knockoutScores.Count);
        Assert.All(knockoutScores.Keys, matchId => Assert.StartsWith("M", matchId, StringComparison.OrdinalIgnoreCase));
        Assert.DoesNotContain("M89", knockoutScores.Keys);
    }

    private static Dictionary<string, MatchScore> CreateCompletedGroupScores(TournamentDataService data)
    {
        return data.GetGroupFixtures()
            .ToDictionary(
                fixture => fixture.FixtureId,
                fixture => new MatchScore(1, 0),
                StringComparer.OrdinalIgnoreCase);
    }

    private static GroupTeamDefinition Team(string name, string shortName)
    {
        return new GroupTeamDefinition(name, shortName, "bg-gray-500", null, null);
    }

    private static FixtureDefinition Fixture(string fixtureId, string groupId, int matchNumber, string homeTeam, string awayTeam)
    {
        return new FixtureDefinition(fixtureId, groupId, matchNumber, "Matchday", "Date", "Venue", homeTeam, awayTeam);
    }
}
