import type {
    PredictionGroupDetails,
    PredictionGroupListItem,
    PredictionScoreInput,
} from "./models";

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
}

export async function loadPredictionGroups(): Promise<PredictionGroupListItem[]> {
    const response = await fetch("/api/prediction/groups");
    return parseResponse<PredictionGroupListItem[]>(response);
}

export async function loadPredictionGroupDetails(groupId: string): Promise<PredictionGroupDetails | null> {
    const response = await fetch(`/api/prediction/groups/${encodeURIComponent(groupId)}`);

    if (response.status === 404) {
        return null;
    }

    return parseResponse<PredictionGroupDetails>(response);
}

export async function savePredictionGroupScores(groupId: string, scores: PredictionScoreInput[]): Promise<PredictionGroupDetails | null> {
    const response = await fetch(`/api/prediction/groups/${encodeURIComponent(groupId)}/scores`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ scores }),
    });

    if (response.status === 404) {
        return null;
    }

    return parseResponse<PredictionGroupDetails>(response);
}

export async function clearPredictionGroupScores(groupId: string): Promise<PredictionGroupDetails | null> {
    const response = await fetch(`/api/prediction/groups/${encodeURIComponent(groupId)}/scores`, {
        method: "DELETE",
    });

    if (response.status === 404) {
        return null;
    }

    return parseResponse<PredictionGroupDetails>(response);
}
