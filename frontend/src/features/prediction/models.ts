import type { GroupTeam, StandingRow, ThirdPlacedTeamRow } from "../simulation/models";

export type { ThirdPlacedTeamRow };

export interface PredictionGroupListItem {
    groupId: string;
    venue: string;
    teams: GroupTeam[];
}

export interface PredictionFixture {
    fixtureId: string;
    matchNumber: number;
    matchdayLabel: string;
    dateLabel: string;
    venue: string;
    homeTeam: GroupTeam;
    awayTeam: GroupTeam;
    predictedHomeGoals: number | null;
    predictedAwayGoals: number | null;
}

export interface PredictionGroupDetails {
    groupId: string;
    venue: string;
    standings: StandingRow[];
    fixtures: PredictionFixture[];
}

export interface PredictionScoreInput {
    fixtureId: string;
    homeGoals: number | null;
    awayGoals: number | null;
}
