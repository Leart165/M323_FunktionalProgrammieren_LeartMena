using Backend.Api.DTOs;

namespace Backend.Api.Services;

public sealed class TournamentStateService
{
    private readonly object _sync = new();
    private readonly TournamentDataService _tournamentDataService;
    private Dictionary<string, MatchScore> _predictionScores = new(StringComparer.OrdinalIgnoreCase);
    private Dictionary<string, MatchScore> _predictionKnockoutScores = new(StringComparer.OrdinalIgnoreCase);
    private Dictionary<string, MatchScore> _simulationScores = new(StringComparer.OrdinalIgnoreCase);
    private Dictionary<string, MatchScore> _simulationKnockoutScores = new(StringComparer.OrdinalIgnoreCase);

    public TournamentStateService(TournamentDataService data)
    {
        _tournamentDataService = data;
    }

    public TournamentProjection GetPredictionProjection()
    {
        lock (_sync)
        {
            return BuildTournamentProjection(_predictionScores, _predictionKnockoutScores);
        }
    }

    public TournamentProjection GetSimulationProjection()
    {
        lock (_sync)
        {
            return BuildTournamentProjection(_simulationScores, _simulationKnockoutScores);
        }
    }

    public PredictionGroupDetailsDto? SavePredictionGroup(string groupId, IReadOnlyList<PredictionScoreInput> scores)
    {
        var fixtures = _tournamentDataService.FindGroupFixtures(groupId);
        if (fixtures.Count == 0)
        {
            return null;
        }

        var updates = scores
            .Where(score => score.HomeGoals is not null && score.AwayGoals is not null)
            .ToDictionary(
                score => score.FixtureId,
                score => new MatchScore(score.HomeGoals!.Value, score.AwayGoals!.Value),
                StringComparer.OrdinalIgnoreCase);

        lock (_sync)
        {
            var updatedPredictionScores = new Dictionary<string, MatchScore>(_predictionScores, StringComparer.OrdinalIgnoreCase);

            foreach (var fixture in fixtures)
            {
                updatedPredictionScores.Remove(fixture.FixtureId);
            }

            foreach (var update in updates)
            {
                if (fixtures.Any(fixture => string.Equals(fixture.FixtureId, update.Key, StringComparison.OrdinalIgnoreCase)))
                {
                    updatedPredictionScores[update.Key] = update.Value;
                }
            }

            _predictionScores = updatedPredictionScores;
            _predictionKnockoutScores = new Dictionary<string, MatchScore>(StringComparer.OrdinalIgnoreCase);
            var projection = BuildTournamentProjection(_predictionScores, _predictionKnockoutScores);
            return projection.PredictionGroups.TryGetValue(groupId, out var details) ? details : null;
        }
    }

    public PredictionGroupDetailsDto? ClearPredictionGroup(string groupId)
    {
        var fixtures = _tournamentDataService.FindGroupFixtures(groupId);
        if (fixtures.Count == 0)
        {
            return null;
        }

        lock (_sync)
        {
            var predictionScoresAfterClear = new Dictionary<string, MatchScore>(_predictionScores, StringComparer.OrdinalIgnoreCase);
            foreach (var fixture in fixtures)
            {
                predictionScoresAfterClear.Remove(fixture.FixtureId);
            }

            _predictionScores = predictionScoresAfterClear;
            _predictionKnockoutScores = new Dictionary<string, MatchScore>(StringComparer.OrdinalIgnoreCase);
            var projection = BuildTournamentProjection(_predictionScores, _predictionKnockoutScores);
            return projection.PredictionGroups.TryGetValue(groupId, out var details) ? details : null;
        }
    }

    public KnockoutBracketDto SavePredictionKnockout(IReadOnlyList<PredictionScoreInput> scores)
    {
        var validScoreUpdatesByFixtureId = scores
            .Where(score => score.HomeGoals is not null && score.AwayGoals is not null)
            .Select(score => new KeyValuePair<string, MatchScore>(
                score.FixtureId,
                EnsureKnockoutWinnerScore(score.HomeGoals!.Value, score.AwayGoals!.Value)))
            .ToDictionary(entry => entry.Key, entry => entry.Value, StringComparer.OrdinalIgnoreCase);

        lock (_sync)
        {
            _predictionKnockoutScores = new Dictionary<string, MatchScore>(validScoreUpdatesByFixtureId, StringComparer.OrdinalIgnoreCase);
            return BuildTournamentProjection(_predictionScores, _predictionKnockoutScores).Knockout;
        }
    }

    public KnockoutBracketDto ClearPredictionKnockout()
    {
        lock (_sync)
        {
            _predictionKnockoutScores = new Dictionary<string, MatchScore>(StringComparer.OrdinalIgnoreCase);
            return BuildTournamentProjection(_predictionScores, _predictionKnockoutScores).Knockout;
        }
    }

    public GroupDetailsDto? SimulateGroup(string groupId)
    {
        var group = _tournamentDataService.FindGroup(groupId);
        if (group is null)
        {
            return null;
        }

        var fixtures = _tournamentDataService.FindGroupFixtures(groupId);
        var strengths = _tournamentDataService.GetStrengths();

        lock (_sync)
        {
            var updatedSimulationScores = TournamentCalculations.SimulateGroupFixtures(
                fixtures,
                _simulationScores,
                strengths,
                Random.Shared.Next());

            _simulationScores = new Dictionary<string, MatchScore>(updatedSimulationScores, StringComparer.OrdinalIgnoreCase);
            var projection = BuildTournamentProjection(_simulationScores, _simulationKnockoutScores);
            return projection.SimulationGroups.TryGetValue(groupId, out var details) ? details : null;
        }
    }

    public TournamentProjection SimulateAllGroups()
    {
        var strengths = _tournamentDataService.GetStrengths();

        lock (_sync)
        {
            var baseSeed = Random.Shared.Next();
            var simulatedScores = _tournamentDataService.GetGroupDefinitions()
                .Aggregate(
                    (IReadOnlyDictionary<string, MatchScore>)new Dictionary<string, MatchScore>(_simulationScores, StringComparer.OrdinalIgnoreCase),
                    (scoresSoFar, groupDefinition) => TournamentCalculations.SimulateGroupFixtures(
                        _tournamentDataService.FindGroupFixtures(groupDefinition.Id),
                        scoresSoFar,
                        strengths,
                        baseSeed + groupDefinition.Id[0]));

            _simulationScores = new Dictionary<string, MatchScore>(simulatedScores, StringComparer.OrdinalIgnoreCase);
            return BuildTournamentProjection(_simulationScores, _simulationKnockoutScores);
        }
    }

    public KnockoutBracketDto SimulateNextKnockoutRound()
    {
        lock (_sync)
        {
            var projection = BuildTournamentProjection(_simulationScores, _simulationKnockoutScores);
            var nextStage = projection.Knockout.Stages.FirstOrDefault(stage => stage.Matches.Any(match => match.Status != "simulated"));
            if (nextStage is null)
            {
                return projection.Knockout;
            }

            _simulationKnockoutScores = new Dictionary<string, MatchScore>(
                BuildSimulationKnockoutScores(
                    _simulationScores,
                    _simulationKnockoutScores,
                    new HashSet<string>(StringComparer.OrdinalIgnoreCase) { nextStage.Title }),
                StringComparer.OrdinalIgnoreCase);

            return BuildTournamentProjection(_simulationScores, _simulationKnockoutScores).Knockout;
        }
    }

    public KnockoutBracketDto SimulateAllKnockout()
    {
        lock (_sync)
        {
            _simulationKnockoutScores = new Dictionary<string, MatchScore>(
                BuildSimulationKnockoutScores(_simulationScores, _simulationKnockoutScores, null),
                StringComparer.OrdinalIgnoreCase);

            return BuildTournamentProjection(_simulationScores, _simulationKnockoutScores).Knockout;
        }
    }

    public void ResetKnockout()
    {
        lock (_sync)
        {
            _simulationKnockoutScores = new Dictionary<string, MatchScore>(StringComparer.OrdinalIgnoreCase);
        }
    }

    public void ResetSimulation()
    {
        lock (_sync)
        {
            _simulationScores = new Dictionary<string, MatchScore>(StringComparer.OrdinalIgnoreCase);
            _simulationKnockoutScores = new Dictionary<string, MatchScore>(StringComparer.OrdinalIgnoreCase);
        }
    }

    private TournamentProjection BuildTournamentProjection(
        IReadOnlyDictionary<string, MatchScore> groupScores,
        IReadOnlyDictionary<string, MatchScore> knockoutScores)
    {
        return TournamentCalculations.BuildTournamentProjection(
            _tournamentDataService.GetGroupDefinitions(),
            _tournamentDataService.GetGroupFixtures(),
            groupScores,
            _tournamentDataService.GetKnockoutTemplates(),
            knockoutScores);
    }

    private IReadOnlyDictionary<string, MatchScore> BuildSimulationKnockoutScores(
        IReadOnlyDictionary<string, MatchScore> groupScores,
        IReadOnlyDictionary<string, MatchScore> existingKnockoutScores,
        IReadOnlySet<string>? stageTitles)
    {
        return TournamentCalculations.SimulateKnockoutScores(
            _tournamentDataService.GetGroupDefinitions(),
            _tournamentDataService.GetGroupFixtures(),
            groupScores,
            _tournamentDataService.GetKnockoutTemplates(),
            existingKnockoutScores,
            _tournamentDataService.GetStrengths(),
            Random.Shared.Next(),
            stageTitles);
    }

    private static MatchScore EnsureKnockoutWinnerScore(int homeGoals, int awayGoals)
    {
        if (homeGoals != awayGoals)
        {
            return new MatchScore(homeGoals, awayGoals);
        }

        return new MatchScore(homeGoals + 1, awayGoals);
    }
}
