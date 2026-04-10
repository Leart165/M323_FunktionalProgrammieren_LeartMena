using Backend.Api.DTOs;

namespace Backend.Api.Services;

public sealed class TournamentDataService
{
    private static readonly IReadOnlyList<GroupDefinition> GroupDefinitions = TournamentSeedData.GroupDefinitions;
    private static readonly IReadOnlyList<FixtureDefinition> GroupFixtures = TournamentSeedData.GroupFixtures;
    private static readonly IReadOnlyList<KnockoutTemplateDefinition> KnockoutTemplates = TournamentSeedData.KnockoutTemplates;
    private static readonly IReadOnlyDictionary<string, TeamStrengthDto> Strengths = TournamentSeedData.Strengths;

    public IReadOnlyList<GroupDefinition> GetGroupDefinitions() => GroupDefinitions;

    public IReadOnlyList<FixtureDefinition> GetGroupFixtures() => GroupFixtures;

    public IReadOnlyList<KnockoutTemplateDefinition> GetKnockoutTemplates() => KnockoutTemplates;

    public IReadOnlyDictionary<string, TeamStrengthDto> GetStrengths() => Strengths;

    public IReadOnlyList<TeamCatalogItemDto> GetTeams()
    {
        return GroupDefinitions
            .SelectMany(group => group.Teams)
            .Select(team => new TeamCatalogItemDto(
                team.Name,
                team.ShortName,
                team.FlagClassName,
                team.Tag,
                team.TagClassName,
                Strengths[team.Name].Rating))
            .OrderBy(team => team.Name, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    public IReadOnlyList<GroupCatalogItemDto> GetGroups()
    {
        return GroupDefinitions
            .Select(group => new GroupCatalogItemDto(
                group.Id,
                group.VenueSummary,
                group.Teams.Select(ToGroupTeamDto).ToList()))
            .ToList();
    }

    public IReadOnlyList<StadiumDto> GetStadiums()
    {
        var venues = GroupFixtures
            .Select(fixture => fixture.Venue)
            .Concat(KnockoutTemplates.Select(template => template.Venue))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(name => name, StringComparer.OrdinalIgnoreCase)
            .Select(name => new StadiumDto(name))
            .ToList();

        return venues;
    }

    public IReadOnlyList<MatchCatalogItemDto> GetMatches()
    {
        var groupStage = GroupFixtures.Select(fixture => new MatchCatalogItemDto(
            fixture.FixtureId,
            "Group Stage",
            fixture.GroupId,
            fixture.MatchNumber,
            fixture.MatchdayLabel,
            fixture.DateLabel,
            fixture.Venue,
            fixture.HomeTeam,
            fixture.AwayTeam)).ToList();

        var knockout = KnockoutTemplates.Select(template => new MatchCatalogItemDto(
            template.Id,
            template.StageTitle,
            null,
            null,
            template.Label,
            template.DateLabel,
            template.Venue,
            template.HomeSlot,
            template.AwaySlot)).ToList();

        return groupStage.Concat(knockout).ToList();
    }

    public GroupDefinition? FindGroup(string groupId)
    {
        return GroupDefinitions.FirstOrDefault(group => string.Equals(group.Id, groupId, StringComparison.OrdinalIgnoreCase));
    }

    public IReadOnlyList<FixtureDefinition> FindGroupFixtures(string groupId)
    {
        return GroupFixtures
            .Where(fixture => string.Equals(fixture.GroupId, groupId, StringComparison.OrdinalIgnoreCase))
            .OrderBy(fixture => fixture.MatchNumber)
            .ToList();
    }

    private static GroupTeamDto ToGroupTeamDto(GroupTeamDefinition team)
    {
        return new GroupTeamDto(team.Name, team.ShortName, team.FlagClassName, 0, 0, team.Tag, team.TagClassName);
    }
}
