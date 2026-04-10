import type { GroupDetails, GroupItem } from "./models";

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
