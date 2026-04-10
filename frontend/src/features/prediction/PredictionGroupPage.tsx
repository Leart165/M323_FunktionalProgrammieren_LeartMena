import { type JSX, useEffect, useState } from "react";

import "../../App.css";
import CountryFlag from "../../components/CountryFlag";
import { clearPredictionGroupScores, loadPredictionGroupDetails, savePredictionGroupScores } from "./predictionDataSource";
import type { PredictionGroupDetails } from "./models";

interface PredictionGroupPageProps {
    groupId: string;
    onNavigate: (to: string) => void;
}

type ScoreEntry = { home: string; away: string };

export default function PredictionGroupPage({ groupId, onNavigate }: PredictionGroupPageProps): JSX.Element {
    const [data, setData] = useState<PredictionGroupDetails | null>(null);
    const [scores, setScores] = useState<Record<string, ScoreEntry>>({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [hasPendingChanges, setHasPendingChanges] = useState(false);

    useEffect(() => {
        let active = true;
        const load = async (): Promise<void> => {
            const result = await loadPredictionGroupDetails(groupId);
            if (!active || !result) {
                return;
            }
            setData(result);

            const initial: Record<string, ScoreEntry> = {};
            for (const fixture of result.fixtures) {
                initial[fixture.fixtureId] = {
                    home: fixture.predictedHomeGoals == null ? "" : String(fixture.predictedHomeGoals),
                    away: fixture.predictedAwayGoals == null ? "" : String(fixture.predictedAwayGoals),
                };
            }
            setScores(initial);
            setHasPendingChanges(false);
        };

        void load();
        return () => {
            active = false;
        };
    }, [groupId]);

    const handleScoreChange = (fixtureId: string, side: "home" | "away", value: string): void => {
        const sanitized = value.replace(/[^0-9]/g, "").slice(0, 2);
        setScores((previous) => ({
            ...previous,
            [fixtureId]: {
                ...(previous[fixtureId] ?? { home: "", away: "" }),
                [side]: sanitized,
            },
        }));
        setHasPendingChanges(true);
    };

    const handleClearPredictions = async (): Promise<void> => {
        setSaving(true);
        setMessage(null);

        try {
            const result = await clearPredictionGroupScores(groupId);
            if (!result) {
                setMessage("Gruppe nicht gefunden.");
                return;
            }

            setData(result);
            const cleared = Object.fromEntries(result.fixtures.map((fixture) => [fixture.fixtureId, { home: "", away: "" }]));
            setScores(cleared);
            setHasPendingChanges(false);
            setMessage("Predictions gelöscht.");
        } catch {
            setMessage("Predictions konnten nicht gelöscht werden.");
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (!data || !hasPendingChanges) {
            return;
        }

        const timeoutId = window.setTimeout(async () => {
            setSaving(true);
            setMessage("Speichert...");

            const completeScores = Object.entries(scores)
                .filter(([, score]) => score.home !== "" && score.away !== "")
                .map(([fixtureId, score]) => ({
                    fixtureId,
                    homeGoals: Number(score.home),
                    awayGoals: Number(score.away),
                }));

            try {
                const result = await savePredictionGroupScores(
                    groupId,
                    completeScores,
                );

                if (!result) {
                    setMessage("Gruppe nicht gefunden.");
                    return;
                }

                setData(result);
                setScores((current) =>
                    Object.fromEntries(result.fixtures.map((fixture) => {
                        const local = current[fixture.fixtureId] ?? { home: "", away: "" };
                        const hasIncompleteLocalValue =
                            (local.home !== "" && local.away === "") ||
                            (local.home === "" && local.away !== "");

                        if (hasIncompleteLocalValue) {
                            return [fixture.fixtureId, local];
                        }

                        return [
                            fixture.fixtureId,
                            {
                                home: fixture.predictedHomeGoals == null ? "" : String(fixture.predictedHomeGoals),
                                away: fixture.predictedAwayGoals == null ? "" : String(fixture.predictedAwayGoals),
                            },
                        ];
                    })),
                );
                setHasPendingChanges(false);
                setMessage("Automatisch gespeichert.");
            } catch {
                setMessage("Speichern fehlgeschlagen.");
            } finally {
                setSaving(false);
            }
        }, 450);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [data, groupId, hasPendingChanges, scores]);

    return (
        <div className="bg-brand-black text-white font-sans selection:bg-brand-gold selection:text-brand-black min-h-screen">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img
                    alt="Prediction Background"
                    className="w-full h-full object-cover opacity-20"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXeYQhPPBVinyLvGdz3n-CXDjC3Q-lK4ruC1Jjc1hmWpP0CBaAzqfcf7CcaSCTFHFO9iVk7m9lZOGfxn0jPCcP496Ym2ZgocH9S37BMuS1-i0v-Zw8NUm7Ux8TzDwPP6L9u4xw65JgfDMUviVVaKGVV-kIML_UeGsI1avdqDb_c4F9v2o4PrnsKTGugwZjewYkIsJzxUjDWpM7tuCjK3L07RbsmM36vqblImft260JCGycL8ogi2rYtnvaD4to2hFS586oM721HXCV"
                />
                <div className="absolute inset-0 stadium-overlay"></div>
            </div>

            <header className="fixed top-0 left-0 right-0 z-50 bg-brand-black/90 backdrop-blur-lg border-b border-white/5">
                <div className="px-4 h-16 flex items-center justify-between">
                    <button className="w-10 h-10 flex items-center justify-start text-brand-gold" onClick={() => onNavigate("/prediction")} type="button">
                        <span className="material-symbols-outlined">arrow_back_ios</span>
                    </button>
                    <div className="font-extrabold text-lg tracking-tighter">
                        PREDICT <span className="text-brand-gold">GROUP {groupId.toUpperCase()}</span>
                    </div>
                    <button className="w-10 h-10 flex items-center justify-end text-brand-gold" type="button">
                        <span className="material-symbols-outlined">edit_note</span>
                    </button>
                </div>
            </header>

            <main className="relative z-10 pt-16 pb-32">
                <div className="px-4 mt-6">
                    {!data && <div className="glass-card rounded-xl p-4 text-sm text-gray-400">Loading group prediction...</div>}

                    {data && (
                        <>
                            <div className="mb-4 space-y-3">
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        className="bg-white/10 border border-white/10 py-3 rounded-xl text-white font-black uppercase italic text-xs tracking-wider disabled:opacity-60"
                                        disabled={saving}
                                        onClick={() => void handleClearPredictions()}
                                        type="button"
                                    >
                                        Clear Group
                                    </button>
                                </div>
                                {message && <div className="glass-card rounded-xl p-3 text-xs text-gray-300">{message}</div>}
                            </div>

                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xs font-black tracking-[0.2em] uppercase text-brand-gold">Standings</h2>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{data.venue}</span>
                                </div>
                                <div className="glass-panel rounded-2xl overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[760px] text-left border-collapse">
                                        <thead>
                                            <tr className="text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-white/5">
                                                <th className="py-3 pl-3">#</th>
                                                <th className="py-3">Team</th>
                                                <th className="py-3 text-center">PL</th>
                                                <th className="py-3 text-center">W</th>
                                                <th className="py-3 text-center">D</th>
                                                <th className="py-3 text-center">L</th>
                                                <th className="py-3 text-center">+/-</th>
                                                <th className="py-3 text-center">GD</th>
                                                <th className="py-3 text-center">PTS</th>
                                                <th className="py-3 pr-3 text-center">Next</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm font-semibold">
                                            {data.standings.map((row, index) => (
                                                <tr key={`${row.pos}-${row.team.shortName}`} className={index === 0 ? "border-b border-white/5 bg-brand-gold/5" : index < data.standings.length - 1 ? "border-b border-white/5" : ""}>
                                                    <td className={`py-3 pl-3 font-black italic ${index === 0 ? "text-brand-gold" : ""}`}>{row.pos}</td>
                                                    <td className="py-3 flex items-center gap-2">
                                                        <CountryFlag className="h-4 w-6" countryName={row.team.name} />
                                                        <span>{row.team.shortName}</span>
                                                    </td>
                                                    <td className="py-3 text-center text-gray-400">{row.played}</td>
                                                    <td className="py-3 text-center text-gray-400">{row.wins}</td>
                                                    <td className="py-3 text-center text-gray-400">{row.draws}</td>
                                                    <td className="py-3 text-center text-gray-400">{row.losses}</td>
                                                    <td className="py-3 text-center text-gray-400">{row.goalDelta}</td>
                                                    <td className="py-3 text-center text-gray-400">{row.gd}</td>
                                                    <td className="py-3 text-center font-black">{row.pts}</td>
                                                    <td className="py-3 pr-3 text-center">{row.next}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xs font-black tracking-[0.2em] uppercase text-brand-gold">Predict Fixtures</h2>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Enter score</span>
                                </div>
                                <div className="space-y-3">
                                    {data.fixtures.map((fixture) => {
                                        const score = scores[fixture.fixtureId] ?? { home: "", away: "" };

                                        return (
                                            <div key={fixture.fixtureId} className="glass-card p-4 rounded-xl">
                                                <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                                                    {fixture.matchdayLabel} • Match {fixture.matchNumber} • {fixture.dateLabel}
                                                </div>
                                                <div className="text-[9px] font-bold text-brand-gold uppercase tracking-widest mb-3">
                                                    {fixture.venue}
                                                </div>
                                                <div className="grid grid-cols-[minmax(0,1fr)_44px_16px_44px_minmax(0,1fr)] items-center gap-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <CountryFlag className="h-3.5 w-5 text-[10px]" countryName={fixture.homeTeam.name} />
                                                        <span className="text-xs font-extrabold italic uppercase truncate">{fixture.homeTeam.name}</span>
                                                    </div>

                                                    <input
                                                        className="w-11 h-10 rounded-lg bg-black/60 border border-brand-gold/25 text-center text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                                                        inputMode="numeric"
                                                        onChange={(event) => handleScoreChange(fixture.fixtureId, "home", event.target.value)}
                                                        placeholder="0"
                                                        type="text"
                                                        value={score.home}
                                                    />
                                                    <span className="text-xs font-black text-brand-gold italic">:</span>
                                                    <input
                                                        className="w-11 h-10 rounded-lg bg-black/60 border border-brand-gold/25 text-center text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus:outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
                                                        inputMode="numeric"
                                                        onChange={(event) => handleScoreChange(fixture.fixtureId, "away", event.target.value)}
                                                        placeholder="0"
                                                        type="text"
                                                        value={score.away}
                                                    />

                                                    <div className="flex items-center gap-2 min-w-0 justify-end">
                                                        <span className="text-xs font-extrabold italic uppercase truncate text-right block">{fixture.awayTeam.name}</span>
                                                        <CountryFlag className="h-3.5 w-5 text-[10px]" countryName={fixture.awayTeam.name} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
