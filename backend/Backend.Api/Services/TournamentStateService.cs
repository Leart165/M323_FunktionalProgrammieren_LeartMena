namespace Backend.Api.Services;

public sealed class TournamentStateService
{
    private readonly object _sync = new();
    private readonly TournamentDataService _data;
    private Dictionary<string, MatchScore> _predictionScores = new(StringComparer.OrdinalIgnoreCase);
    private Dictionary<string, MatchScore> _predictionKnockoutScores = new(StringComparer.OrdinalIgnoreCase);
    private Dictionary<string, MatchScore> _simulationScores = new(StringComparer.OrdinalIgnoreCase);
    private Dictionary<string, MatchScore> _simulationKnockoutScores = new(StringComparer.OrdinalIgnoreCase);

    public TournamentStateService(TournamentDataService data)
    {
        _data = data;
    }

    public TournamentProjection GetPredictionProjection()
    {
        lock (_sync)
        {
            return BuildProjection(_predictionScores, _predictionKnockoutScores);
        }
    }

    public TournamentProjection GetSimulationProjection()
    {
        lock (_sync)
        {
            return BuildProjection(_simulationScores, _simulationKnockoutScores);
        }
    }

    public PredictionGroupDetailsDto? SavePredictionGroup(string groupId, IReadOnlyList<PredictionScoreInput> scores)
    {
        var fixtures = _data.FindGroupFixtures(groupId);
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
            var next = new Dictionary<string, MatchScore>(_predictionScores, StringComparer.OrdinalIgnoreCase);

            foreach (var fixture in fixtures)
            {
                next.Remove(fixture.FixtureId);
            }

            foreach (var update in updates)
            {
                if (fixtures.Any(fixture => string.Equals(fixture.FixtureId, update.Key, StringComparison.OrdinalIgnoreCase)))
                {
                    next[update.Key] = update.Value;
                }
            }

            _predictionScores = next;
            _predictionKnockoutScores = new Dictionary<string, MatchScore>(StringComparer.OrdinalIgnoreCase);
            var projection = BuildProjection(_predictionScores, _predictionKnockoutScores);
            return projection.PredictionGroups.TryGetValue(groupId, out var details) ? details : null;
        }
    }

    public PredictionGroupDetailsDto? ClearPredictionGroup(string groupId)
    {
        var fixtures = _data.FindGroupFixtures(groupId);
        if (fixtures.Count == 0)
        {
            return null;
        }

        lock (_sync)
        {
            var next = new Dictionary<string, MatchScore>(_predictionScores, StringComparer.OrdinalIgnoreCase);
            foreach (var fixture in fixtures)
            {
                next.Remove(fixture.FixtureId);
            }

            _predictionScores = next;
            _predictionKnockoutScores = new Dictionary<string, MatchScore>(StringComparer.OrdinalIgnoreCase);
            var projection = BuildProjection(_predictionScores, _predictionKnockoutScores);
            return projection.PredictionGroups.TryGetValue(groupId, out var details) ? details : null;
        }
    }

    public KnockoutBracketDto SavePredictionKnockout(IReadOnlyList<PredictionScoreInput> scores)
    {
        var updates = scores
            .Where(score => score.HomeGoals is not null && score.AwayGoals is not null)
            .Select(score => new KeyValuePair<string, MatchScore>(
                score.FixtureId,
                NormalizeKnockoutScore(score.HomeGoals!.Value, score.AwayGoals!.Value)))
            .ToDictionary(entry => entry.Key, entry => entry.Value, StringComparer.OrdinalIgnoreCase);

        lock (_sync)
        {
            _predictionKnockoutScores = new Dictionary<string, MatchScore>(updates, StringComparer.OrdinalIgnoreCase);
            return BuildProjection(_predictionScores, _predictionKnockoutScores).Knockout;
        }
    }

    public KnockoutBracketDto ClearPredictionKnockout()
    {
        lock (_sync)
        {
            _predictionKnockoutScores = new Dictionary<string, MatchScore>(StringComparer.OrdinalIgnoreCase);
            return BuildProjection(_predictionScores, _predictionKnockoutScores).Knockout;
        }
    }

    public GroupDetailsDto? SimulateGroup(string groupId, int? seed = null)
    {
        var group = _data.FindGroup(groupId);
        if (group is null)
        {
            return null;
        }

        var fixtures = _data.FindGroupFixtures(groupId);
        var strengths = _data.GetStrengths();

        lock (_sync)
        {
            var next = TournamentCalculations.SimulateGroupFixtures(
                group,
                fixtures,
                _simulationScores,
                strengths,
                seed ?? Random.Shared.Next());

            _simulationScores = new Dictionary<string, MatchScore>(next, StringComparer.OrdinalIgnoreCase);
            var projection = BuildProjection(_simulationScores, _simulationKnockoutScores);
            return projection.SimulationGroups.TryGetValue(groupId, out var details) ? details : null;
        }
    }

    public TournamentProjection SimulateAllGroups(int? seed = null)
    {
        var strengths = _data.GetStrengths();

        lock (_sync)
        {
            var baseSeed = seed ?? Random.Shared.Next();
            var simulated = _data.GetGroupDefinitions()
                .Aggregate(
                    (IReadOnlyDictionary<string, MatchScore>)new Dictionary<string, MatchScore>(_simulationScores, StringComparer.OrdinalIgnoreCase),
                    (current, group) => TournamentCalculations.SimulateGroupFixtures(
                        group,
                        _data.FindGroupFixtures(group.Id),
                        current,
                        strengths,
                        baseSeed + group.Id[0]));

            _simulationScores = new Dictionary<string, MatchScore>(simulated, StringComparer.OrdinalIgnoreCase);
            return BuildProjection(_simulationScores, _simulationKnockoutScores);
        }
    }

    public KnockoutBracketDto SimulateNextKnockoutRound(int? seed = null)
    {
        lock (_sync)
        {
            var projection = BuildProjection(_simulationScores, _simulationKnockoutScores);
            var nextStage = projection.Knockout.Stages.FirstOrDefault(stage => stage.Matches.Any(match => match.Status != "simulated"));
            if (nextStage is null)
            {
                return projection.Knockout;
            }

            _simulationKnockoutScores = new Dictionary<string, MatchScore>(
                BuildSimulationKnockoutScores(
                    _simulationScores,
                    _simulationKnockoutScores,
                    seed,
                    new HashSet<string>(StringComparer.OrdinalIgnoreCase) { nextStage.Title }),
                StringComparer.OrdinalIgnoreCase);

            return BuildProjection(_simulationScores, _simulationKnockoutScores).Knockout;
        }
    }

    public KnockoutBracketDto SimulateAllKnockout(int? seed = null)
    {
        lock (_sync)
        {
            _simulationKnockoutScores = new Dictionary<string, MatchScore>(
                BuildSimulationKnockoutScores(_simulationScores, _simulationKnockoutScores, seed, null),
                StringComparer.OrdinalIgnoreCase);

            return BuildProjection(_simulationScores, _simulationKnockoutScores).Knockout;
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

    private TournamentProjection BuildProjection(
        IReadOnlyDictionary<string, MatchScore> groupScores,
        IReadOnlyDictionary<string, MatchScore> knockoutScores)
    {
        return TournamentCalculations.BuildProjection(
            _data.GetGroupDefinitions(),
            _data.GetGroupFixtures(),
            groupScores,
            _data.GetKnockoutTemplates(),
            knockoutScores);
    }

    private IReadOnlyDictionary<string, MatchScore> BuildSimulationKnockoutScores(
        IReadOnlyDictionary<string, MatchScore> groupScores,
        IReadOnlyDictionary<string, MatchScore> existingKnockoutScores,
        int? seed,
        IReadOnlySet<string>? stageTitles)
    {
        return TournamentCalculations.SimulateKnockoutScores(
            _data.GetGroupDefinitions(),
            _data.GetGroupFixtures(),
            groupScores,
            _data.GetKnockoutTemplates(),
            existingKnockoutScores,
            _data.GetStrengths(),
            seed ?? Random.Shared.Next(),
            stageTitles);
    }

    private static MatchScore NormalizeKnockoutScore(int homeGoals, int awayGoals)
    {
        if (homeGoals != awayGoals)
        {
            return new MatchScore(homeGoals, awayGoals);
        }

        return new MatchScore(homeGoals + 1, awayGoals);
    }
}

public sealed record PredictionScoreInput(string FixtureId, int? HomeGoals, int? AwayGoals);
