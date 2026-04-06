export interface GroupTeam {
    name: string;
    shortName: string;
    flagClassName: string;
    gd: number;
    pts: number;
    tag?: string;
    tagClassName?: string;
}

export interface GroupItem {
    id: string;
    venue: string;
    teams: GroupTeam[];
}

export interface StandingRow {
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

export interface FixtureRow {
    fixtureId: string;
    matchNumber: number;
    matchdayLabel: string;
    dateLabel: string;
    venue: string;
    home: GroupTeam;
    away: GroupTeam;
    homeScore: number | null;
    awayScore: number | null;
    status: string;
}

export interface GroupDetails {
    id: string;
    teams: GroupTeam[];
    standings: StandingRow[];
    fixtures: FixtureRow[];
}

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
}

export async function loadSimulationGroups(): Promise<GroupItem[]> {
    const response = await fetch("/api/simulation/groups");
    return parseResponse<GroupItem[]>(response);
}

export async function loadSimulationGroupDetails(groupId: string): Promise<GroupDetails | null> {
    const response = await fetch(`/api/simulation/groups/${encodeURIComponent(groupId)}`);

    if (response.status === 404) {
        return null;
    }

    return parseResponse<GroupDetails>(response);
}

export async function simulateGroup(groupId: string): Promise<GroupDetails | null> {
    const response = await fetch(`/api/simulation/groups/${encodeURIComponent(groupId)}/simulate`, {
        method: "POST",
    });

    if (response.status === 404) {
        return null;
    }

    return parseResponse<GroupDetails>(response);
}

export async function simulateAllGroups(): Promise<GroupItem[]> {
    const response = await fetch("/api/simulation/simulate-all", {
        method: "POST",
    });

    return parseResponse<GroupItem[]>(response);
}

export async function resetSimulation(): Promise<void> {
    const response = await fetch("/api/simulation/reset", {
        method: "POST",
    });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }
}
