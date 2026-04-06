import { type JSX, useEffect, useState } from "react";

import "../../App.css";
import {
    clearPredictionKnockoutScores,
    loadKnockoutBracket,
    savePredictionKnockoutScores,
    simulateAllKnockout,
    simulateKnockoutRound,
    type KnockoutBracketData,
    type KnockoutMatch,
    type KnockoutScoreInput,
    type KnockoutStage,
} from "./knockoutDataSource";

interface KnockoutPageProps {
    onNavigate: (to: string) => void;
    apiBase?: "/api/simulation" | "/api/prediction";
    backRoute?: string;
    title?: string;
    allowSimulation?: boolean;
}

const CARD_HEIGHT = 118;
const CARD_GAP = 26;
const UNIT = CARD_HEIGHT + CARD_GAP;

type ScoreEntry = { home: string; away: string };

function getMatchTop(stageIndex: number, matchIndex: number): number {
    const step = 2 ** stageIndex;
    return ((step - 1) * UNIT) / 2 + matchIndex * step * UNIT;
}

function isPlaceholderTeamName(teamName: string): boolean {
    return ["1st Group ", "2nd Group ", "3rd Group ", "Winner ", "Runner-up "]
        .some((prefix) => teamName.startsWith(prefix));
}

function MatchCard({
    editable,
    match,
    onChange,
    score,
}: {
    editable: boolean;
    match: KnockoutMatch;
    onChange: (matchId: string, side: "home" | "away", value: string) => void;
    score: ScoreEntry;
}): JSX.Element {
    const simulated = match.status === "simulated";

    return (
        <div className={`glass-card rounded-xl p-3 h-[118px] ${simulated ? "border-l-2 border-l-brand-gold/60" : ""}`}>
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest truncate">{match.id} • {match.dateLabel}</div>
            <div className="text-[9px] text-gray-400 uppercase truncate">{match.venue}</div>
            <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] font-bold uppercase tracking-tight pr-2 truncate">{match.home}</span>
                {editable ? (
                    <input
                        className="w-9 h-7 rounded-md bg-black/60 border border-brand-gold/25 text-center text-[11px] font-black text-white focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                        inputMode="numeric"
                        onChange={(event) => onChange(match.id, "home", event.target.value)}
                        placeholder="0"
                        type="text"
                        value={score.home}
                    />
                ) : (
                    <div className="w-7 h-6 shrink-0 bg-brand-lightGray rounded flex items-center justify-center text-[11px] font-black text-brand-gold">
                        {match.homeScore ?? "-"}
                    </div>
                )}
            </div>
            <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] font-bold uppercase tracking-tight pr-2 truncate">{match.away}</span>
                {editable ? (
                    <input
                        className="w-9 h-7 rounded-md bg-black/60 border border-brand-gold/25 text-center text-[11px] font-black text-white focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                        inputMode="numeric"
                        onChange={(event) => onChange(match.id, "away", event.target.value)}
                        placeholder="0"
                        type="text"
                        value={score.away}
                    />
                ) : (
                    <div className="w-7 h-6 shrink-0 bg-brand-lightGray rounded flex items-center justify-center text-[11px] font-black text-gray-500">
                        {match.awayScore ?? "-"}
                    </div>
                )}
            </div>
        </div>
    );
}

function FinalMatchCard({
    editable,
    match,
    onChange,
    score,
}: {
    editable: boolean;
    match: KnockoutMatch;
    onChange: (matchId: string, side: "home" | "away", value: string) => void;
    score: ScoreEntry;
}): JSX.Element {
    const simulated = match.status === "simulated";
    const winner = simulated
        ? (match.homeScore ?? 0) >= (match.awayScore ?? 0) ? match.home : match.away
        : null;

    return (
        <div className="mb-4 last:mb-0 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[9px] font-bold text-brand-gold uppercase tracking-widest mb-1">{match.label} • {match.dateLabel}</div>
            <div className="text-[9px] text-gray-400 uppercase mb-3">{match.venue}</div>
            <div className="flex items-center justify-between text-xs font-black uppercase italic">
                <span>{match.home}</span>
                {editable ? (
                    <input
                        className="w-10 h-8 rounded-md bg-black/60 border border-brand-gold/25 text-center text-xs font-black text-white focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                        inputMode="numeric"
                        onChange={(event) => onChange(match.id, "home", event.target.value)}
                        placeholder="0"
                        type="text"
                        value={score.home}
                    />
                ) : (
                    <span className="text-brand-gold">{match.homeScore ?? "-"}</span>
                )}
            </div>
            <div className="flex items-center justify-between text-xs font-black uppercase italic mt-2">
                <span>{match.away}</span>
                {editable ? (
                    <input
                        className="w-10 h-8 rounded-md bg-black/60 border border-brand-gold/25 text-center text-xs font-black text-white focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                        inputMode="numeric"
                        onChange={(event) => onChange(match.id, "away", event.target.value)}
                        placeholder="0"
                        type="text"
                        value={score.away}
                    />
                ) : (
                    <span className="text-white">{match.awayScore ?? "-"}</span>
                )}
            </div>
            {winner && <div className="mt-3 text-[10px] font-black uppercase tracking-widest text-brand-gold">Winner: {winner}</div>}
        </div>
    );
}

function orderStagesForDisplay(stages: KnockoutStage[]): KnockoutStage[] {
    const ordered = stages.map((stage) => ({ ...stage, matches: [...stage.matches] }));

    for (let index = ordered.length - 2; index >= 0; index -= 1) {
        const nextStage = ordered[index + 1];
        const nextStageOrder = new Map(nextStage.matches.map((match, matchIndex) => [match.id, matchIndex]));

        ordered[index] = {
            ...ordered[index],
            matches: ordered[index].matches
                .map((match: KnockoutMatch, matchIndex: number) => ({ match, matchIndex }))
                .sort((left: { match: KnockoutMatch; matchIndex: number }, right: { match: KnockoutMatch; matchIndex: number }) => {
                    const leftOrder = left.match.nextMatchId ? nextStageOrder.get(left.match.nextMatchId) ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
                    const rightOrder = right.match.nextMatchId ? nextStageOrder.get(right.match.nextMatchId) ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;

                    if (leftOrder !== rightOrder) {
                        return leftOrder - rightOrder;
                    }

                    return left.matchIndex - right.matchIndex;
                })
                .map((item: { match: KnockoutMatch; matchIndex: number }) => item.match),
        };
    }

    return ordered;
}

export default function KnockoutPage({
    onNavigate,
    apiBase = "/api/simulation",
    backRoute = "/simulation",
    title = "KNOCKOUT BRACKET",
    allowSimulation = true,
}: KnockoutPageProps): JSX.Element {
    const [data, setData] = useState<KnockoutBracketData | null>(null);
    const [scores, setScores] = useState<Record<string, ScoreEntry>>({});
    const [message, setMessage] = useState<string | null>(null);
    const [hasPendingChanges, setHasPendingChanges] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let active = true;
        const load = async (): Promise<void> => {
            const result = await loadKnockoutBracket(apiBase);
            if (active) {
                setData(result);
                setScores(Object.fromEntries(result.stages
                    .flatMap((stage) => stage.matches)
                    .map((match) => [match.id, {
                        home: match.homeScore == null ? "" : String(match.homeScore),
                        away: match.awayScore == null ? "" : String(match.awayScore),
                    }])));
            }
        };
        void load();
        return () => {
            active = false;
        };
    }, [apiBase]);

    const orderedStages = data ? orderStagesForDisplay(data.stages) : [];
    const primaryStages = orderedStages.slice(0, 4);
    const finalStage = orderedStages[4];
    const bracketHeight = 16 * UNIT - CARD_GAP;
    const titleParts = title.split(" ");
    const needsCompletedGroups = orderedStages[0]?.matches.some((match) => isPlaceholderTeamName(match.home) || isPlaceholderTeamName(match.away)) ?? false;
    const homeRoute = backRoute.startsWith("/prediction") ? "/prediction" : "/simulation";
    const homeLabel = backRoute.startsWith("/prediction") ? "Predict" : "Groups";
    const editable = apiBase === "/api/prediction" && !needsCompletedGroups;

    const handleScoreChange = (matchId: string, side: "home" | "away", value: string): void => {
        const sanitized = value.replace(/[^0-9]/g, "").slice(0, 2);
        setScores((current) => ({
            ...current,
            [matchId]: {
                ...(current[matchId] ?? { home: "", away: "" }),
                [side]: sanitized,
            },
        }));
        setHasPendingChanges(true);
    };

    useEffect(() => {
        if (!editable || !hasPendingChanges) {
            return;
        }

        const timeoutId = window.setTimeout(async () => {
            setSubmitting(true);
            setMessage("Speichert...");

            const nextScores: KnockoutScoreInput[] = Object.entries(scores)
                .filter(([, score]) => score.home !== "" && score.away !== "")
                .map(([fixtureId, score]) => ({
                    fixtureId,
                    homeGoals: Number(score.home),
                    awayGoals: Number(score.away),
                }));

            try {
                const result = await savePredictionKnockoutScores(nextScores);
                setData(result);
                setScores((current) => Object.fromEntries(result.stages
                    .flatMap((stage) => stage.matches)
                    .map((match) => {
                        const local = current[match.id] ?? { home: "", away: "" };
                        const hasIncompleteLocalValue = (local.home !== "" && local.away === "") || (local.home === "" && local.away !== "");

                        if (hasIncompleteLocalValue) {
                            return [match.id, local];
                        }

                        return [match.id, {
                            home: match.homeScore == null ? "" : String(match.homeScore),
                            away: match.awayScore == null ? "" : String(match.awayScore),
                        }];
                    })));
                setHasPendingChanges(false);
                setMessage("Bracket gespeichert.");
            } catch {
                setMessage("Bracket konnte nicht gespeichert werden.");
            } finally {
                setSubmitting(false);
            }
        }, 450);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [editable, hasPendingChanges, scores]);

    function findTarget(stageIndex: number, match: KnockoutMatch): { top: number; delta: number } | null {
        const nextStage = primaryStages[stageIndex + 1];
        if (!nextStage || !match.nextMatchId) {
            return null;
        }

        const nextMatchIndex = nextStage.matches.findIndex((item) => item.id === match.nextMatchId);
        if (nextMatchIndex === -1) {
            return null;
        }

        const currentTop = getMatchTop(stageIndex, primaryStages[stageIndex].matches.findIndex((item) => item.id === match.id)) + 44;
        const currentCenter = currentTop + CARD_HEIGHT / 2;
        const nextTop = getMatchTop(stageIndex + 1, nextMatchIndex) + 44;
        const nextCenter = nextTop + CARD_HEIGHT / 2;

        return { top: currentTop, delta: nextCenter - currentCenter };
    }

    return (
        <div className="bg-brand-black text-white font-sans selection:bg-brand-gold selection:text-brand-black">
            <div className="fixed inset-0 z-0">
                <img
                    alt="Stadium Background"
                    className="w-full h-full object-cover opacity-20"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQ9WBf_Ve_nN4lfVdHPbEzdnAFBo8dUvp6G0Llyj-PFYUfsskMh_kGFdP_7Zvf_7NDF6jzeDPUQnRfvBWyjg7--fmkWObFai6kh4PvYKUlpkS7GIRyMUKzveRZ6oLHU3goJH8pMDjg2uHYZiWO14OQNT98wfWN-4Tj1YS8AhMdOOHZyPBkOVwx1EfuMTHvFDLeZcz2YDsD6W9ZmWaisj6tf6YKTG5wo7aeGu0Zz20s6wyiK1aMzZ6z-tBsoIooVBEjJhCyWYry9F51"
                />
                <div className="absolute inset-0 stadium-overlay"></div>
            </div>

            <header className="fixed top-0 left-0 right-0 z-50 bg-brand-black/80 backdrop-blur-md border-b border-white/5 px-4 h-16 flex items-center justify-between">
                <button className="flex items-center gap-2" onClick={() => onNavigate(backRoute)} type="button">
                    <span className="material-symbols-outlined text-brand-gold">arrow_back_ios</span>
                    <div className="font-black text-lg tracking-tighter uppercase italic">
                        {titleParts[0]} <span className="text-brand-gold">{titleParts.slice(1).join(" ")}</span>
                    </div>
                </button>
                <div className="bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/20">
                    <span className="text-[10px] font-black text-brand-gold tracking-widest uppercase italic">Road to Metlife</span>
                </div>
            </header>

            <main className="relative z-10 pt-20 pb-44 overflow-x-auto no-scrollbar px-6">
                {!data && <div className="glass-card rounded-xl p-4 text-sm text-gray-400">Lade Bracket...</div>}
                {editable && message && <div className="glass-card rounded-xl p-3 text-xs text-gray-300 mb-4 max-w-md">{message}</div>}

                {data && needsCompletedGroups && (
                    <div className="glass-card rounded-2xl p-5 max-w-md">
                        <h2 className="text-sm font-black uppercase tracking-widest text-brand-gold">Bracket Locked</h2>
                        <p className="text-sm text-gray-300 mt-2">Complete all group predictions first. The knockout bracket opens only after every group match has a saved score.</p>
                        <button
                            className="mt-4 glossy-button px-4 py-3 rounded-xl text-brand-black font-black uppercase italic text-xs tracking-wider"
                            onClick={() => onNavigate(backRoute)}
                            type="button"
                        >
                            Back to Groups
                        </button>
                    </div>
                )}

                {data && !needsCompletedGroups && (
                    <div className="flex gap-12 min-w-max">
                        {primaryStages.map((stage, stageIndex) => (
                            <section key={stage.title} className="bracket-column relative" style={{ height: bracketHeight }}>
                                <div className="sticky top-0 z-20 py-2 bg-brand-black/60 backdrop-blur-md rounded-lg border border-white/5 text-center mb-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.28em] text-gray-300 italic">{stage.title}</h3>
                                </div>

                                {stage.matches.map((match, matchIndex) => {
                                    const top = getMatchTop(stageIndex, matchIndex) + 44;
                                    const matchEditable = editable && !isPlaceholderTeamName(match.home) && !isPlaceholderTeamName(match.away);

                                    let connector: JSX.Element | null = null;
                                    if (stageIndex < 3) {
                                        const target = findTarget(stageIndex, match);
                                        if (target) {
                                            const verticalTop = target.delta >= 0 ? "50%" : `calc(50% + ${target.delta}px)`;

                                            connector = (
                                                <>
                                                    <div className={`absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-[2px] ${match.status === "simulated" ? "neon-line" : "bg-white/10"}`}></div>
                                                    <div
                                                        className={`absolute right-[-24px] w-[2px] ${match.status === "simulated" ? "bg-brand-neon/50" : "bg-white/10"}`}
                                                        style={{
                                                            top: verticalTop,
                                                            height: Math.abs(target.delta),
                                                        }}
                                                    ></div>
                                                    <div
                                                        className={`absolute right-[-48px] h-[2px] w-6 ${match.status === "simulated" ? "neon-line" : "bg-white/10"}`}
                                                        style={{
                                                            top: `calc(50% + ${target.delta}px)`,
                                                        }}
                                                    ></div>
                                                </>
                                            );
                                        }
                                    }

                                    return (
                                        <div key={match.id} className="absolute left-0 w-full" style={{ top }}>
                                            {stageIndex > 0 && <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-[2px] bg-white/10"></div>}
                                            <MatchCard
                                                editable={matchEditable}
                                                match={match}
                                                onChange={handleScoreChange}
                                                score={scores[match.id] ?? { home: "", away: "" }}
                                            />
                                            {connector}
                                        </div>
                                    );
                                })}
                            </section>
                        ))}

                        {finalStage && (
                            <section className="bracket-column relative" style={{ height: bracketHeight }}>
                                <div className="sticky top-0 z-20 py-2 bg-brand-gold/20 backdrop-blur-md rounded-lg border border-brand-gold/30 text-center mb-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold italic">{finalStage.title}</h3>
                                </div>

                                <div className="absolute left-0 right-0 top-[36%] glass-card rounded-2xl p-5 border-2 border-brand-gold/30 bg-gradient-to-br from-brand-gold/10 to-transparent shadow-[0_0_24px_rgba(212,175,55,0.18)]">
                                    <div className="flex items-center justify-center mb-4">
                                        <span className="material-symbols-outlined text-brand-gold text-5xl">emoji_events</span>
                                    </div>

                                    {finalStage.matches.map((match) => {
                                        const matchEditable = editable && !isPlaceholderTeamName(match.home) && !isPlaceholderTeamName(match.away);
                                        return (
                                        <FinalMatchCard
                                            key={match.id}
                                            editable={matchEditable}
                                            match={match}
                                            onChange={handleScoreChange}
                                            score={scores[match.id] ?? { home: "", away: "" }}
                                        />
                                        );
                                    })}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>

            {editable && (
                <div className="fixed bottom-20 left-4 right-4 z-50 flex flex-col gap-3">
                    <button
                        className="bg-white/5 border border-white/20 py-3 rounded-xl flex items-center justify-center gap-2 text-white font-black uppercase italic text-xs tracking-wider disabled:opacity-60"
                        disabled={submitting}
                        onClick={async () => {
                            setSubmitting(true);
                            try {
                                const result = await clearPredictionKnockoutScores();
                                setData(result);
                                setScores(Object.fromEntries(result.stages
                                    .flatMap((stage) => stage.matches)
                                    .map((match) => [match.id, { home: "", away: "" }])));
                                setHasPendingChanges(false);
                                setMessage("Bracket gelöscht.");
                            } catch {
                                setMessage("Bracket konnte nicht gelöscht werden.");
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                        type="button"
                    >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Clear Bracket
                    </button>
                </div>
            )}

            {allowSimulation && (
                <div className="fixed bottom-20 left-4 right-4 z-50 flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            className="bg-brand-lightGray/80 backdrop-blur-lg border border-white/10 py-3 rounded-xl flex items-center justify-center gap-2 text-white font-black uppercase italic text-xs tracking-wider disabled:opacity-60"
                            disabled={submitting}
                            onClick={async () => {
                                setSubmitting(true);
                                try {
                                    setData(await simulateKnockoutRound(apiBase));
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                            type="button"
                        >
                            <span className="material-symbols-outlined text-sm">play_circle</span>
                            Simulate Round
                        </button>
                        <button
                            className="glossy-button py-3 rounded-xl flex items-center justify-center gap-2 text-brand-black font-black uppercase italic text-xs tracking-wider disabled:opacity-60"
                            disabled={submitting}
                            onClick={async () => {
                                setSubmitting(true);
                                try {
                                    setData(await simulateAllKnockout(apiBase));
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                            type="button"
                        >
                            <span className="material-symbols-outlined text-sm font-bold">fast_forward</span>
                            Simulate All
                        </button>
                    </div>
                </div>
            )}

            <nav className="fixed bottom-0 left-0 right-0 bg-brand-black/95 backdrop-blur-xl border-t border-white/10 px-8 pt-4 pb-8 flex justify-between items-center z-50">
                <button className="flex flex-col items-center gap-1 text-gray-500" onClick={() => onNavigate(homeRoute)} type="button">
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter">{homeLabel}</span>
                </button>
                <div className="flex flex-col items-center gap-1 text-gray-500">
                    <span className="material-symbols-outlined">stadium</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter">Venues</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-brand-gold">
                    <span className="material-symbols-outlined">leaderboard</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter">Bracket</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-gray-500">
                    <span className="material-symbols-outlined">person</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter">Profile</span>
                </div>
            </nav>
            <div className="fixed bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-50"></div>
        </div>
    );
}
