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

export interface ThirdPlacedTeamRow {
    rank: number;
    team: string;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalDelta: string;
    goalDifference: number;
    points: number;
    next: number;
}
