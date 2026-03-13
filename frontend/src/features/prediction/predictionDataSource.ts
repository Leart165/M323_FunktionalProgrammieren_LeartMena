import { loadSimulationGroups, type GroupItem, type GroupTeam } from "../simulation/simulationDataSource";

export interface PredictionGroupListItem {
    groupId: string;
    venue: string;
    teams: GroupTeam[];
}

export interface PredictionStandingRow {
    pos: number;
    team: GroupTeam;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalDelta: string;
    gd: number;
    pts: number;
    next: number;
}

export interface PredictionFixture {
    fixtureId: string;
    matchNumber: number;
    matchdayLabel: string;
    dateLabel: string;
    homeTeam: GroupTeam;
    awayTeam: GroupTeam;
    predictedHomeGoals: number | null;
    predictedAwayGoals: number | null;
}

export interface PredictionGroupDetails {
    groupId: string;
    venue: string;
    standings: PredictionStandingRow[];
    fixtures: PredictionFixture[];
}

// API contracts for later backend integration
export interface PredictionGroupListItemDto {
    groupId: string;
    venue: string;
    teams: GroupTeam[];
}

export interface PredictionGroupDetailsDto {
    groupId: string;
    venue: string;
    standings: PredictionStandingRow[];
    fixtures: PredictionFixture[];
}

function buildFixtures(groupId: string, teams: GroupTeam[]): PredictionFixture[] {
    if (teams.length < 4) {
        return [];
    }

    const [a, b, c, d] = teams;
    const dates = ["June 11", "June 12", "June 16", "June 17", "June 20", "June 21"];
    const matchdays = ["Matchday 1", "Matchday 1", "Matchday 2", "Matchday 2", "Matchday 3", "Matchday 3"];

    const pairs = [
        { home: a, away: b },
        { home: c, away: d },
        { home: a, away: c },
        { home: b, away: d },
        { home: a, away: d },
        { home: b, away: c },
    ];

    return pairs.map((pair, index) => ({
        fixtureId: `${groupId}-${index + 1}`,
        matchNumber: index + 1,
        matchdayLabel: matchdays[index],
        dateLabel: dates[index],
        homeTeam: pair.home,
        awayTeam: pair.away,
        predictedHomeGoals: null,
        predictedAwayGoals: null,
    }));
}

function buildStandings(teams: GroupTeam[]): PredictionStandingRow[] {
    return teams.map((team, index) => ({
        pos: index + 1,
        team,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalDelta: "-",
        gd: 0,
        pts: 0,
        next: 0,
    }));
}

function toGroupListDto(groups: GroupItem[]): PredictionGroupListItemDto[] {
    return groups.map((group) => ({
        groupId: group.id,
        venue: group.venue,
        teams: group.teams,
    }));
}

function toGroupDetailsDto(group: GroupItem): PredictionGroupDetailsDto {
    return {
        groupId: group.id,
        venue: group.venue,
        standings: buildStandings(group.teams),
        fixtures: buildFixtures(group.id, group.teams),
    };
}

export async function loadPredictionGroups(): Promise<PredictionGroupListItem[]> {
    // Replace later with: fetch('/api/prediction/groups')
    const groups = await loadSimulationGroups();
    return toGroupListDto(groups);
}

export async function loadPredictionGroupDetails(groupId: string): Promise<PredictionGroupDetails | null> {
    // Replace later with: fetch(`/api/prediction/groups/${groupId}`)
    const groups = await loadSimulationGroups();
    const group = groups.find((item) => item.id.toUpperCase() === groupId.toUpperCase());
    if (!group) {
        return null;
    }

    return toGroupDetailsDto(group);
}
