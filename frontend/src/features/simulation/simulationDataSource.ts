export interface GroupTeam {
    name: string;
    shortName: string;
    flagClassName: string;
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
    matchNumber: number;
    matchdayLabel: string;
    dateLabel: string;
    home: GroupTeam;
    away: GroupTeam;
}

export interface GroupDetails {
    id: string;
    teams: GroupTeam[];
    standings: StandingRow[];
    fixtures: FixtureRow[];
    expertPick?: string;
}

// API DTO contracts (shape that backend can return later)
export interface SimulationGroupTeamDto {
    name: string;
    shortName: string;
    flagClassName: string;
    tag?: string;
    tagClassName?: string;
}

export interface SimulationGroupDto {
    id: string;
    venue: string;
    teams: SimulationGroupTeamDto[];
}

export interface SimulationStandingDto {
    pos: number;
    team: SimulationGroupTeamDto;
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalDelta: string;
    gd: number;
    pts: number;
    next: number;
}

export interface SimulationFixtureDto {
    matchNumber: number;
    matchdayLabel: string;
    dateLabel: string;
    home: SimulationGroupTeamDto;
    away: SimulationGroupTeamDto;
}

export interface SimulationGroupDetailsDto {
    id: string;
    teams: SimulationGroupTeamDto[];
    standings: SimulationStandingDto[];
    fixtures: SimulationFixtureDto[];
    expertPick?: string;
}

interface SimulationApiMockPayload {
    groups: SimulationGroupDto[];
    groupDetailsById: Record<string, SimulationGroupDetailsDto>;
}

function toGroupTeam(input: SimulationGroupTeamDto): GroupTeam {
    return {
        name: input.name,
        shortName: input.shortName,
        flagClassName: input.flagClassName,
        tag: input.tag,
        tagClassName: input.tagClassName,
    };
}

function toGroupItem(input: SimulationGroupDto): GroupItem {
    return {
        id: input.id,
        venue: input.venue,
        teams: input.teams.map(toGroupTeam),
    };
}

function toGroupDetails(input: SimulationGroupDetailsDto): GroupDetails {
    return {
        id: input.id,
        teams: input.teams.map(toGroupTeam),
        standings: input.standings.map((row) => ({
            pos: row.pos,
            team: toGroupTeam(row.team),
            played: row.played,
            wins: row.wins,
            draws: row.draws,
            losses: row.losses,
            goalDelta: row.goalDelta,
            gd: row.gd,
            pts: row.pts,
            next: row.next,
        })),
        fixtures: input.fixtures.map((fixture) => ({
            matchNumber: fixture.matchNumber,
            matchdayLabel: fixture.matchdayLabel,
            dateLabel: fixture.dateLabel,
            home: toGroupTeam(fixture.home),
            away: toGroupTeam(fixture.away),
        })),
        expertPick: input.expertPick,
    };
}

const apiMockPayload: SimulationApiMockPayload = {
    groups: [
        {
            id: "A",
            venue: "MetLife Arena",
            teams: [
                { name: "United States", shortName: "USA", flagClassName: "bg-blue-900", tag: "HOST", tagClassName: "text-brand-gold font-black" },
                { name: "Mexico", shortName: "MEX", flagClassName: "bg-red-600" },
                { name: "Colombia", shortName: "COL", flagClassName: "bg-yellow-400" },
                { name: "Poland", shortName: "POL", flagClassName: "bg-white border border-gray-300" },
            ],
        },
        {
            id: "B",
            venue: "SoFi Stadium",
            teams: [
                { name: "Spain", shortName: "ESP", flagClassName: "bg-yellow-600" },
                { name: "South Korea", shortName: "KOR", flagClassName: "bg-blue-600" },
                { name: "Morocco", shortName: "MAR", flagClassName: "bg-red-800" },
                { name: "Canada", shortName: "CAN", flagClassName: "bg-gray-500", tag: "HOST", tagClassName: "text-brand-gold font-black" },
            ],
        },
        {
            id: "C",
            venue: "Estadio Azteca",
            teams: [
                { name: "Brazil", shortName: "BRA", flagClassName: "bg-green-600" },
                { name: "Croatia", shortName: "CRO", flagClassName: "bg-red-600" },
                { name: "Japan", shortName: "JPN", flagClassName: "bg-white border border-gray-300" },
                { name: "Ghana", shortName: "GHA", flagClassName: "bg-yellow-500" },
            ],
        },
        {
            id: "D",
            venue: "AT&T Stadium",
            teams: [
                { name: "France", shortName: "FRA", flagClassName: "bg-blue-700" },
                { name: "Serbia", shortName: "SRB", flagClassName: "bg-red-700" },
                { name: "Ecuador", shortName: "ECU", flagClassName: "bg-yellow-400" },
                { name: "Tunisia", shortName: "TUN", flagClassName: "bg-red-600" },
            ],
        },
        {
            id: "E",
            venue: "Levi's Stadium",
            teams: [
                { name: "Argentina", shortName: "ARG", flagClassName: "bg-sky-400" },
                { name: "Denmark", shortName: "DEN", flagClassName: "bg-red-700" },
                { name: "Cameroon", shortName: "CMR", flagClassName: "bg-green-700" },
                { name: "Wales", shortName: "WAL", flagClassName: "bg-red-600" },
            ],
        },
        {
            id: "F",
            venue: "Lumen Field",
            teams: [
                { name: "England", shortName: "ENG", flagClassName: "bg-white border border-gray-300" },
                { name: "Uruguay", shortName: "URU", flagClassName: "bg-sky-400" },
                { name: "Nigeria", shortName: "NGA", flagClassName: "bg-green-700" },
                { name: "Poland", shortName: "POL", flagClassName: "bg-red-600" },
            ],
        },
        {
            id: "G",
            venue: "Mercedes-Benz Stadium",
            teams: [
                { name: "Portugal", shortName: "POR", flagClassName: "bg-green-700" },
                { name: "Netherlands", shortName: "NED", flagClassName: "bg-orange-500" },
                { name: "Saudi Arabia", shortName: "KSA", flagClassName: "bg-green-700" },
                { name: "Costa Rica", shortName: "CRC", flagClassName: "bg-blue-700" },
            ],
        },
        {
            id: "H",
            venue: "NRG Stadium",
            teams: [
                { name: "Germany", shortName: "GER", flagClassName: "bg-gray-900" },
                { name: "United States", shortName: "USA", flagClassName: "bg-blue-900" },
                { name: "Iran", shortName: "IRN", flagClassName: "bg-green-600" },
                { name: "Peru", shortName: "PER", flagClassName: "bg-red-700" },
            ],
        },
        {
            id: "I",
            venue: "Arrowhead Stadium",
            teams: [
                { name: "Italy", shortName: "ITA", flagClassName: "bg-blue-700" },
                { name: "Colombia", shortName: "COL", flagClassName: "bg-yellow-500" },
                { name: "Senegal", shortName: "SEN", flagClassName: "bg-green-700" },
                { name: "Scotland", shortName: "SCO", flagClassName: "bg-blue-700" },
            ],
        },
        {
            id: "J",
            venue: "Hard Rock Stadium",
            teams: [
                { name: "Belgium", shortName: "BEL", flagClassName: "bg-red-700" },
                { name: "Mexico", shortName: "MEX", flagClassName: "bg-green-700" },
                { name: "Ukraine", shortName: "UKR", flagClassName: "bg-blue-500" },
                { name: "Qatar", shortName: "QAT", flagClassName: "bg-red-800" },
            ],
        },
        {
            id: "K",
            venue: "Lincoln Financial Field",
            teams: [
                { name: "Spain", shortName: "ESP", flagClassName: "bg-yellow-600" },
                { name: "Sweden", shortName: "SWE", flagClassName: "bg-yellow-500" },
                { name: "Ivory Coast", shortName: "CIV", flagClassName: "bg-orange-500" },
                { name: "New Zealand", shortName: "NZL", flagClassName: "bg-black" },
            ],
        },
        {
            id: "L",
            venue: "BC Place",
            teams: [
                { name: "Croatia", shortName: "CRO", flagClassName: "bg-red-600" },
                { name: "Switzerland", shortName: "SUI", flagClassName: "bg-red-700" },
                { name: "Paraguay", shortName: "PAR", flagClassName: "bg-red-600" },
                { name: "Jamaica", shortName: "JAM", flagClassName: "bg-yellow-500" },
            ],
        },
    ],
    groupDetailsById: {},
};

for (const group of apiMockPayload.groups) {
    const [t1, t2, t3, t4] = group.teams;
    apiMockPayload.groupDetailsById[group.id] = {
        id: group.id,
        teams: group.teams,
        standings: group.teams.map((team, index) => ({
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
        })),
        fixtures: [
            { matchNumber: 1, matchdayLabel: "Matchday 1", dateLabel: "June 11", home: t1, away: t2 },
            { matchNumber: 2, matchdayLabel: "Matchday 1", dateLabel: "June 12", home: t3, away: t4 },
            { matchNumber: 3, matchdayLabel: "Matchday 2", dateLabel: "June 16", home: t1, away: t3 },
            { matchNumber: 4, matchdayLabel: "Matchday 2", dateLabel: "June 17", home: t2, away: t4 },
            { matchNumber: 5, matchdayLabel: "Matchday 3", dateLabel: "June 20", home: t1, away: t4 },
            { matchNumber: 6, matchdayLabel: "Matchday 3", dateLabel: "June 21", home: t2, away: t3 },
        ],
        expertPick: `${t1.name} to Advance`,
    };
}

export async function loadSimulationGroups(): Promise<GroupItem[]> {
    // Replace later with: fetch('/api/simulation/groups')
    return apiMockPayload.groups.map(toGroupItem);
}

export async function loadSimulationGroupDetails(groupId: string): Promise<GroupDetails | null> {
    // Replace later with: fetch(`/api/simulation/groups/${groupId}`)
    const dto = apiMockPayload.groupDetailsById[groupId.toUpperCase()];
    return dto ? toGroupDetails(dto) : null;
}
