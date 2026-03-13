export interface KnockoutMatch {
    id: string;
    label: string;
    dateLabel: string;
    venue: string;
    home: string;
    away: string;
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

const roundOf32: KnockoutMatch[] = [
    { id: "M73", label: "Round of 32", dateLabel: "Sun, Jun 28 • 3:00 PM", venue: "SoFi Stadium (Inglewood)", home: "2nd Group A", away: "2nd Group B", status: "simulated", homeScore: 2, awayScore: 1 },
    { id: "M74", label: "Round of 32", dateLabel: "Mon, Jun 29 • 4:30 PM", venue: "Gillette Stadium (Foxboro)", home: "1st Group E", away: "Best 3rd Place", status: "pending" },
    { id: "M75", label: "Round of 32", dateLabel: "Mon, Jun 29 • 9:00 PM", venue: "Estadio BBVA (Monterrey)", home: "1st Group F", away: "2nd Group C", status: "pending" },
    { id: "M76", label: "Round of 32", dateLabel: "Mon, Jun 29 • 1:00 PM", venue: "NRG Stadium (Houston)", home: "1st Group C", away: "2nd Group F", status: "pending" },
    { id: "M77", label: "Round of 32", dateLabel: "Tue, Jun 30 • 5:00 PM", venue: "MetLife Stadium (NJ)", home: "1st Group I", away: "Best 3rd Place", status: "pending" },
    { id: "M78", label: "Round of 32", dateLabel: "Tue, Jun 30 • 1:00 PM", venue: "AT&T Stadium (Dallas)", home: "2nd Group E", away: "2nd Group I", status: "pending" },
    { id: "M79", label: "Round of 32", dateLabel: "Tue, Jun 30 • 9:00 PM", venue: "Estadio Azteca (Mexico City)", home: "1st Group A", away: "Best 3rd Place", status: "pending" },
    { id: "M80", label: "Round of 32", dateLabel: "Wed, Jul 1 • 12:00 PM", venue: "Mercedes-Benz Stadium (Atlanta)", home: "1st Group L", away: "Best 3rd Place", status: "pending" },
    { id: "M81", label: "Round of 32", dateLabel: "Wed, Jul 1 • 8:00 PM", venue: "Levi's Stadium (Santa Clara)", home: "1st Group D", away: "Best 3rd Place", status: "pending" },
    { id: "M82", label: "Round of 32", dateLabel: "Wed, Jul 1 • 4:00 PM", venue: "Lumen Field (Seattle)", home: "1st Group G", away: "Best 3rd Place", status: "pending" },
    { id: "M83", label: "Round of 32", dateLabel: "Thu, Jul 2 • 7:00 PM", venue: "BMO Field (Toronto)", home: "2nd Group K", away: "2nd Group L", status: "pending" },
    { id: "M84", label: "Round of 32", dateLabel: "Thu, Jul 2 • 3:00 PM", venue: "SoFi Stadium (Inglewood)", home: "1st Group H", away: "2nd Group J", status: "pending" },
    { id: "M85", label: "Round of 32", dateLabel: "Thu, Jul 2 • 11:00 PM", venue: "BC Place (Vancouver)", home: "1st Group B", away: "Best 3rd Place", status: "pending" },
    { id: "M86", label: "Round of 32", dateLabel: "Fri, Jul 3 • 6:00 PM", venue: "Hard Rock Stadium (Miami)", home: "1st Group J", away: "2nd Group H", status: "pending" },
    { id: "M87", label: "Round of 32", dateLabel: "Fri, Jul 3 • 9:30 PM", venue: "Arrowhead Stadium (Kansas City)", home: "1st Group K", away: "Best 3rd Place", status: "pending" },
    { id: "M88", label: "Round of 32", dateLabel: "Fri, Jul 3 • 2:00 PM", venue: "AT&T Stadium (Dallas)", home: "2nd Group D", away: "2nd Group G", status: "pending" },
];

const roundOf16: KnockoutMatch[] = [
    { id: "M89", label: "Round of 16", dateLabel: "Sat, Jul 4 • 5:00 PM", venue: "Lincoln Financial Field (Philadelphia)", home: "Winner M74", away: "Winner M77", status: "pending" },
    { id: "M90", label: "Round of 16", dateLabel: "Sat, Jul 4 • 1:00 PM", venue: "NRG Stadium (Houston)", home: "Winner M73", away: "Winner M75", status: "pending" },
    { id: "M91", label: "Round of 16", dateLabel: "Sun, Jul 5 • 4:00 PM", venue: "MetLife Stadium (NJ)", home: "Winner M76", away: "Winner M78", status: "pending" },
    { id: "M92", label: "Round of 16", dateLabel: "Sun, Jul 5 • 8:00 PM", venue: "Estadio Azteca (Mexico City)", home: "Winner M79", away: "Winner M80", status: "pending" },
    { id: "M93", label: "Round of 16", dateLabel: "Mon, Jul 6 • 3:00 PM", venue: "AT&T Stadium (Dallas)", home: "Winner M83", away: "Winner M84", status: "pending" },
    { id: "M94", label: "Round of 16", dateLabel: "Mon, Jul 6 • 8:00 PM", venue: "Lumen Field (Seattle)", home: "Winner M81", away: "Winner M82", status: "pending" },
    { id: "M95", label: "Round of 16", dateLabel: "Tue, Jul 7 • 12:00 PM", venue: "Mercedes-Benz Stadium (Atlanta)", home: "Winner M86", away: "Winner M88", status: "pending" },
    { id: "M96", label: "Round of 16", dateLabel: "Tue, Jul 7 • 4:00 PM", venue: "BC Place (Vancouver)", home: "Winner M85", away: "Winner M87", status: "pending" },
];

const quarterFinals: KnockoutMatch[] = [
    { id: "M97", label: "Quarter-final", dateLabel: "Thu, Jul 9 • 4:00 PM", venue: "Gillette Stadium (Foxboro)", home: "Winner M89", away: "Winner M90", status: "pending" },
    { id: "M98", label: "Quarter-final", dateLabel: "Fri, Jul 10 • 3:00 PM", venue: "SoFi Stadium (Inglewood)", home: "Winner M93", away: "Winner M94", status: "pending" },
    { id: "M99", label: "Quarter-final", dateLabel: "Sat, Jul 11 • 5:00 PM", venue: "Hard Rock Stadium (Miami)", home: "Winner M91", away: "Winner M92", status: "pending" },
    { id: "M100", label: "Quarter-final", dateLabel: "Sat, Jul 11 • 9:00 PM", venue: "Arrowhead Stadium (Kansas City)", home: "Winner M95", away: "Winner M96", status: "pending" },
];

const semiFinals: KnockoutMatch[] = [
    { id: "M101", label: "Semi-final", dateLabel: "Tue, Jul 14 • 3:00 PM", venue: "AT&T Stadium (Dallas)", home: "Winner M97", away: "Winner M98", status: "pending" },
    { id: "M102", label: "Semi-final", dateLabel: "Wed, Jul 15 • 3:00 PM", venue: "Mercedes-Benz Stadium (Atlanta)", home: "Winner M99", away: "Winner M100", status: "pending" },
];

const finals: KnockoutMatch[] = [
    { id: "M103", label: "Third Place", dateLabel: "Sat, Jul 18 • 5:00 PM", venue: "Hard Rock Stadium (Miami)", home: "Loser M101", away: "Loser M102", status: "pending" },
    { id: "M104", label: "Final", dateLabel: "Sun, Jul 19 • 3:00 PM", venue: "MetLife Stadium (East Rutherford)", home: "Winner M101", away: "Winner M102", status: "pending" },
];

export async function loadKnockoutBracket(): Promise<KnockoutBracketData> {
    return {
        stages: [
            { title: "Round of 32", matches: roundOf32 },
            { title: "Round of 16", matches: roundOf16 },
            { title: "Quarter-finals", matches: quarterFinals },
            { title: "Semi-finals", matches: semiFinals },
            { title: "Final Stage", matches: finals },
        ],
    };
}
