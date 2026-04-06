import { type JSX, useEffect, useState } from "react";

import "../../App.css";
import CountryFlag from "../../components/CountryFlag";
import { loadPredictionGroupDetails, loadPredictionGroups, type PredictionGroupListItem } from "./predictionDataSource";

interface PredictionPageProps {
    onNavigate: (to: string) => void;
}

interface ThirdPlacedTeamRow {
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

const defaultBestThirdPlacedRows: ThirdPlacedTeamRow[] = [
    { rank: 1, team: "Algeria", played: 0, wins: 0, draws: 0, losses: 0, goalDelta: "-", goalDifference: 0, points: 0, next: 0 },
    { rank: 2, team: "Australia", played: 0, wins: 0, draws: 0, losses: 0, goalDelta: "-", goalDifference: 0, points: 0, next: 0 },
    { rank: 3, team: "Egypt", played: 0, wins: 0, draws: 0, losses: 0, goalDelta: "-", goalDifference: 0, points: 0, next: 0 },
    { rank: 4, team: "Ivory Coast", played: 0, wins: 0, draws: 0, losses: 0, goalDelta: "-", goalDifference: 0, points: 0, next: 0 },
    { rank: 5, team: "Norway", played: 0, wins: 0, draws: 0, losses: 0, goalDelta: "-", goalDifference: 0, points: 0, next: 0 },
    { rank: 6, team: "Panama", played: 0, wins: 0, draws: 0, losses: 0, goalDelta: "-", goalDifference: 0, points: 0, next: 0 },
    { rank: 7, team: "Qatar", played: 0, wins: 0, draws: 0, losses: 0, goalDelta: "-", goalDifference: 0, points: 0, next: 0 },
    { rank: 8, team: "Saudi Arabia", played: 0, wins: 0, draws: 0, losses: 0, goalDelta: "-", goalDifference: 0, points: 0, next: 0 },
    { rank: 9, team: "Scotland", played: 0, wins: 0, draws: 0, losses: 0, goalDelta: "-", goalDifference: 0, points: 0, next: 0 },
    { rank: 10, team: "South Africa", played: 0, wins: 0, draws: 0, losses: 0, goalDelta: "-", goalDifference: 0, points: 0, next: 0 },
    { rank: 11, team: "Tunisia", played: 0, wins: 0, draws: 0, losses: 0, goalDelta: "-", goalDifference: 0, points: 0, next: 0 },
    { rank: 12, team: "Uzbekistan", played: 0, wins: 0, draws: 0, losses: 0, goalDelta: "-", goalDifference: 0, points: 0, next: 0 },
];

export default function PredictionPage({ onNavigate }: PredictionPageProps): JSX.Element {
    const [groups, setGroups] = useState<PredictionGroupListItem[]>([]);
    const [bestThirdRows, setBestThirdRows] = useState<ThirdPlacedTeamRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [knockoutReady, setKnockoutReady] = useState(false);

    useEffect(() => {
        let active = true;
        const load = async (): Promise<void> => {
            try {
                const data = await loadPredictionGroups();
                if (active) {
                    setGroups(data);
                    setError(null);
                }

                const details = await Promise.all(data.map((group) => loadPredictionGroupDetails(group.groupId)));
                if (active) {
                    setKnockoutReady(details.every((group) =>
                        group !== null && group.fixtures.every((fixture) =>
                            fixture.predictedHomeGoals !== null && fixture.predictedAwayGoals !== null)));
                }
            } catch {
                if (active) {
                    setError("Prediction groups konnten nicht geladen werden.");
                    setGroups([]);
                    setKnockoutReady(false);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void load();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        const loadBestThird = async (): Promise<void> => {
            try {
                const response = await fetch("/api/prediction/best-third");
                if (!response.ok) {
                    if (active) {
                        setBestThirdRows(defaultBestThirdPlacedRows);
                    }
                    return;
                }

                const rows = (await response.json()) as ThirdPlacedTeamRow[];
                if (active) {
                    setBestThirdRows(rows);
                }
            } catch {
                if (active) {
                    setBestThirdRows(defaultBestThirdPlacedRows);
                }
            }
        };

        void loadBestThird();
        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="bg-brand-black text-white font-sans selection:bg-brand-gold selection:text-brand-black min-h-screen">
            <div className="fixed inset-0 z-0">
                <img
                    alt="Prediction Background"
                    className="w-full h-full object-cover opacity-20"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXeYQhPPBVinyLvGdz3n-CXDjC3Q-lK4ruC1Jjc1hmWpP0CBaAzqfcf7CcaSCTFHFO9iVk7m9lZOGfxn0jPCcP496Ym2ZgocH9S37BMuS1-i0v-Zw8NUm7Ux8TzDwPP6L9u4xw65JgfDMUviVVaKGVV-kIML_UeGsI1avdqDb_c4F9v2o4PrnsKTGugwZjewYkIsJzxUjDWpM7tuCjK3L07RbsmM36vqblImft260JCGycL8ogi2rYtnvaD4to2hFS586oM721HXCV"
                />
                <div className="absolute inset-0 stadium-overlay"></div>
            </div>

            <header className="fixed top-0 left-0 right-0 z-50 bg-brand-black/80 backdrop-blur-md border-b border-white/5 px-4 h-16 flex items-center justify-between">
                <button className="flex items-center gap-2" onClick={() => onNavigate("/")} type="button">
                    <span className="material-symbols-outlined text-brand-gold">arrow_back_ios</span>
                    <div className="font-black text-lg tracking-tighter uppercase italic">
                        PREDICTION <span className="text-brand-gold">CENTER</span>
                    </div>
                </button>
                <div className="bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/20">
                    <span className="text-[10px] font-black text-brand-gold tracking-widest uppercase italic">Groups A-L</span>
                </div>
            </header>

            <main className="relative z-10 pt-20 pb-32 px-4">
                <section className="mb-6">
                    <h1 className="text-2xl font-black italic uppercase tracking-tight">
                        Prediction <span className="text-brand-gold">Center</span>
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">Open a group and predict every fixture with your own scoreline.</p>
                </section>

                <section className="mb-6">
                    <button
                        className="w-full bg-white/10 border border-white/10 py-3 rounded-xl flex items-center justify-center gap-2 text-white font-black uppercase italic text-xs tracking-wider disabled:opacity-50"
                        disabled={!knockoutReady}
                        onClick={() => onNavigate("/prediction/knockout")}
                        type="button"
                    >
                        <span className="material-symbols-outlined text-sm">leaderboard</span>
                        {knockoutReady ? "Open Predictor Bracket" : "Complete All Groups First"}
                    </button>
                </section>

                <section className="grid grid-cols-2 gap-4">
                    {loading && <div className="glass-card rounded-2xl p-5 text-sm text-gray-400">Lade Prediction-Gruppen...</div>}
                    {!loading && error && <div className="glass-card rounded-2xl p-5 text-sm text-red-300">{error}</div>}
                    {!loading && !error && groups.length === 0 && <div className="glass-card rounded-2xl p-5 text-sm text-gray-400">Keine Gruppen vorhanden.</div>}

                    {groups.map((group) => (
                        <div
                            key={group.groupId}
                            className="glass-card rounded-2xl p-5 relative overflow-hidden cursor-pointer"
                            onClick={() => onNavigate(`/prediction/group/${group.groupId}`)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    onNavigate(`/prediction/group/${group.groupId}`);
                                }
                            }}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="text-6xl font-black italic">{group.groupId}</span>
                            </div>
                            <div className="mb-4 border-b border-white/10 pb-2">
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-brand-gold">Group {group.groupId}</h3>
                            </div>
                            <div className="space-y-2">
                                {group.teams.map((team) => (
                                    <div key={team.name} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <CountryFlag className="h-4 w-6" countryName={team.name} />
                                            <span className="text-xs font-bold uppercase truncate">{team.name}</span>
                                            {team.tag && <span className={`text-[9px] ${team.tagClassName ?? "text-gray-500 font-bold"}`}>{team.tag}</span>}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[9px] text-gray-500 uppercase">GD <span className="text-gray-300 font-bold">{team.gd}</span></span>
                                            <span className="text-[9px] text-gray-500 uppercase">PTS <span className="text-white font-black">{team.pts}</span></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>

                <section className="glass-card rounded-2xl p-4 mt-6">
                    <h2 className="text-xs font-black tracking-[0.2em] uppercase text-brand-gold mb-3">Best 3rd Placed Teams</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-white/10 bg-white/5">
                                    <th className="py-2 pl-3">#</th>
                                    <th className="py-2">Team</th>
                                    <th className="py-2 text-center">PL</th>
                                    <th className="py-2 text-center">W</th>
                                    <th className="py-2 text-center">D</th>
                                    <th className="py-2 text-center">L</th>
                                    <th className="py-2 text-center">+/-</th>
                                    <th className="py-2 text-center">GD</th>
                                    <th className="py-2 text-center">PTS</th>
                                    <th className="py-2 pr-3 text-center">Next</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs">
                                {bestThirdRows.map((row) => (
                                    <tr key={row.rank} className="border-b border-white/10 last:border-b-0">
                                        <td className="py-2 pl-3 font-black text-brand-gold">{row.rank}</td>
                                        <td className="py-2 font-semibold">{row.team}</td>
                                        <td className="py-2 text-center">{row.played}</td>
                                        <td className="py-2 text-center">{row.wins}</td>
                                        <td className="py-2 text-center">{row.draws}</td>
                                        <td className="py-2 text-center">{row.losses}</td>
                                        <td className="py-2 text-center text-gray-400">{row.goalDelta}</td>
                                        <td className="py-2 text-center">{row.goalDifference}</td>
                                        <td className="py-2 text-center font-black">{row.points}</td>
                                        <td className="py-2 pr-3 text-center">{row.next}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-brand-black/95 backdrop-blur-xl border-t border-white/10 px-8 pt-4 pb-8 flex justify-between items-center z-50">
                <button className="flex flex-col items-center gap-1 text-gray-500" onClick={() => onNavigate("/")} type="button">
                    <span className="material-symbols-outlined">home</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter">Home</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-500" onClick={() => onNavigate("/simulation")} type="button">
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter">Sim</span>
                </button>
                <div className="flex flex-col items-center gap-1 text-brand-gold">
                    <span className="material-symbols-outlined">analytics</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter">Predict</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-gray-500">
                    <span className="material-symbols-outlined">person</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter">Profile</span>
                </div>
            </nav>
        </div>
    );
}
