export interface KnockoutMatch {
    id: string;
    label: string;
    dateLabel: string;
    venue: string;
    home: string;
    away: string;
    nextMatchId?: string | null;
    status?: "simulated" | "pending";
    homeScore?: number;
    awayScore?: number;
}

export interface KnockoutStage {
    title: string;
    matches: KnockoutMatch[];
}

export interface KnockoutBracketData {
    stages: KnockoutStage[];
}

export interface KnockoutScoreInput {
    fixtureId: string;
    homeGoals: number | null;
    awayGoals: number | null;
}
