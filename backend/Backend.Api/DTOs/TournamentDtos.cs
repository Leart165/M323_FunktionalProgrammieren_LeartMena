namespace Backend.Api.DTOs;

public sealed record GroupTeamDto(string Name, string ShortName, string FlagClassName, int Gd, int Pts, string? Tag, string? TagClassName);

public sealed record GroupItemDto(string Id, string Venue, IReadOnlyList<GroupTeamDto> Teams);

public sealed record StandingRowDto(
    int Pos,
    GroupTeamDto Team,
    int Played,
    int Wins,
    int Draws,
    int Losses,
    string GoalDelta,
    int Gd,
    int Pts,
    int Next
);

public sealed record SimulationFixtureDto(
    string FixtureId,
    int MatchNumber,
    string MatchdayLabel,
    string DateLabel,
    string Venue,
    GroupTeamDto Home,
    GroupTeamDto Away,
    int? HomeScore,
    int? AwayScore,
    string Status
);

public sealed record GroupDetailsDto(string Id, IReadOnlyList<GroupTeamDto> Teams, IReadOnlyList<StandingRowDto> Standings, IReadOnlyList<SimulationFixtureDto> Fixtures);

public sealed record ThirdPlacedTeamRowDto(
    int Rank,
    string Team,
    int Played,
    int Wins,
    int Draws,
    int Losses,
    string GoalDelta,
    int GoalDifference,
    int Points,
    int Next
);

public sealed record KnockoutMatchDto(
    string Id,
    string Label,
    string DateLabel,
    string Venue,
    string Home,
    string Away,
    string? NextMatchId = null,
    string Status = "pending",
    int? HomeScore = null,
    int? AwayScore = null
);

public sealed record KnockoutStageDto(string Title, IReadOnlyList<KnockoutMatchDto> Matches);

public sealed record KnockoutBracketDto(IReadOnlyList<KnockoutStageDto> Stages);

public sealed record PredictionGroupListItemDto(string GroupId, string Venue, IReadOnlyList<GroupTeamDto> Teams);

public sealed record PredictionFixtureDto(
    string FixtureId,
    int MatchNumber,
    string MatchdayLabel,
    string DateLabel,
    string Venue,
    GroupTeamDto HomeTeam,
    GroupTeamDto AwayTeam,
    int? PredictedHomeGoals,
    int? PredictedAwayGoals
);

public sealed record PredictionGroupDetailsDto(string GroupId, string Venue, IReadOnlyList<StandingRowDto> Standings, IReadOnlyList<PredictionFixtureDto> Fixtures);

public sealed record TeamCatalogItemDto(string Name, string ShortName, string FlagClassName, string? Tag, string? TagClassName, int Rating);

public sealed record GroupCatalogItemDto(string Id, string Venue, IReadOnlyList<GroupTeamDto> Teams);

public sealed record StadiumDto(string Name);

public sealed record MatchCatalogItemDto(
    string Id,
    string Stage,
    string? GroupId,
    int? MatchNumber,
    string Label,
    string DateLabel,
    string Venue,
    string Home,
    string Away
);

public sealed record TeamStrengthDto(string Team, int Rating);

public sealed record PredictionScoreInput(string FixtureId, int? HomeGoals, int? AwayGoals);

public sealed record PredictionGroupUpdateRequest(IReadOnlyList<PredictionScoreInput> Scores);

public sealed record MatchScore(int HomeGoals, int AwayGoals);

public sealed record TournamentProjection(
    IReadOnlyList<GroupItemDto> Groups,
    IReadOnlyDictionary<string, GroupDetailsDto> SimulationGroups,
    IReadOnlyDictionary<string, PredictionGroupDetailsDto> PredictionGroups,
    KnockoutBracketDto Knockout,
    IReadOnlyList<ThirdPlacedTeamRowDto> BestThird);

public sealed record GroupDefinition(string Id, string VenueSummary, IReadOnlyList<GroupTeamDefinition> Teams);

public sealed record GroupTeamDefinition(string Name, string ShortName, string FlagClassName, string? Tag, string? TagClassName);

public sealed record FixtureDefinition(
    string FixtureId,
    string GroupId,
    int MatchNumber,
    string MatchdayLabel,
    string DateLabel,
    string Venue,
    string HomeTeam,
    string AwayTeam
);

public sealed record KnockoutTemplateDefinition(
    string Id,
    string StageTitle,
    string Label,
    string DateLabel,
    string Venue,
    string HomeSlot,
    string AwaySlot
);
