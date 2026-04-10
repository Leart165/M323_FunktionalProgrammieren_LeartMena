import type { KnockoutBracketData, KnockoutScoreInput } from "./models";

export async function loadKnockoutBracket(apiBase = "/api/simulation"): Promise<KnockoutBracketData> {
    const response = await fetch(`${apiBase}/knockout`);
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as KnockoutBracketData;
}

async function postKnockoutAction(url: string): Promise<KnockoutBracketData> {
    const response = await fetch(url, { method: "POST" });
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as KnockoutBracketData;
}

export async function simulateKnockoutRound(apiBase = "/api/simulation"): Promise<KnockoutBracketData> {
    return postKnockoutAction(`${apiBase}/knockout/simulate-round`);
}

export async function simulateAllKnockout(apiBase = "/api/simulation"): Promise<KnockoutBracketData> {
    return postKnockoutAction(`${apiBase}/knockout/simulate-all`);
}

export async function savePredictionKnockoutScores(scores: KnockoutScoreInput[]): Promise<KnockoutBracketData> {
    const response = await fetch("/api/prediction/knockout/scores", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ scores }),
    });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as KnockoutBracketData;
}

export async function clearPredictionKnockoutScores(): Promise<KnockoutBracketData> {
    const response = await fetch("/api/prediction/knockout/scores", { method: "DELETE" });
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as KnockoutBracketData;
}
