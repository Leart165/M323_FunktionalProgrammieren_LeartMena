import { type JSX, useEffect, useState } from "react";

import "../../App.css";
import CountryFlag from "../../components/CountryFlag";
import { loadSimulationGroupDetails, simulateGroup, type GroupDetails } from "./simulationDataSource";

interface GroupDetailsPageProps {
    groupId: string;
    onNavigate: (to: string) => void;
}

export default function GroupDetailsPage({ groupId, onNavigate }: GroupDetailsPageProps): JSX.Element {
    const [data, setData] = useState<GroupDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [simulating, setSimulating] = useState(false);

    useEffect(() => {
        let active = true;

        const load = async (): Promise<void> => {
            try {
                const payload = await loadSimulationGroupDetails(groupId);
                if (active) {
                    if (!payload) {
                        setError("Gruppe nicht gefunden.");
                        setData(null);
                        return;
                    }
                    setData(payload);
                    setError(null);
                }
            } catch {
                if (active) {
                    setError("Group-Details konnten nicht geladen werden.");
                    setData(null);
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
    }, [groupId]);

    const groupLabel = data?.id ?? groupId.toUpperCase();

    const handleSimulateGroup = async (): Promise<void> => {
        setSimulating(true);
        setError(null);

        try {
            const payload = await simulateGroup(groupId);
            if (!payload) {
                setError("Gruppe nicht gefunden.");
                return;
            }

            setData(payload);
        } catch {
            setError("Gruppe konnte nicht simuliert werden.");
        } finally {
            setSimulating(false);
        }
    };

    return (
        <div className="bg-brand-black text-white font-sans selection:bg-brand-gold selection:text-brand-black antialiased min-h-screen">
            <header className="fixed top-0 left-0 right-0 z-50 bg-brand-black/90 backdrop-blur-lg border-b border-white/5">
                <div className="px-4 h-16 flex items-center justify-between">
                    <button className="w-10 h-10 flex items-center justify-start text-brand-gold" onClick={() => onNavigate("/simulation")} type="button">
                        <span className="material-symbols-outlined">arrow_back_ios</span>
                    </button>
                    <div className="font-extrabold text-lg tracking-tighter">
                        GROUP <span className="text-brand-gold">{groupLabel}</span>
                    </div>
                    <button className="w-10 h-10 flex items-center justify-end text-brand-gold" type="button">
                        <span className="material-symbols-outlined">info</span>
                    </button>
                </div>
            </header>

            <main className="pt-16 pb-32">
                <div className="fixed inset-0 z-[-1]">
                    <img
                        alt="Stadium Background"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2Q6l1t8tR4Tv8Xl7cWWNSLkKei8-8HcXdTzbsmmaW-Dm-glZhlvNGOQSM2G_bJ-zgA-OOX7FLl3CcYCbzDOWeQ7ebKix8i8gpi2VbXV95-mvS9n6c5DHlFlbbNztih9DzDe7JU-D0ZECWmUjpuwDjjgTtPhVjUl3yDJLSdF5Xyv9V51EKAbye1bO7YO1GQM0r1Yz1OvdPnDy0RtWljir8Ccgrx26vkdtZ4fOCzDUU_eKAQlVmT0n1E9o5afHVNzO6MDPOAK-0rVfN"
                    />
                    <div className="absolute inset-0 hero-gradient-overlay"></div>
                </div>

                <div className="px-4 mt-6">
                    <div className="pb-4 pt-2">
                        <button
                            className="w-full bg-brand-gold text-brand-black h-14 rounded-2xl flex items-center justify-center gap-3 shadow-[0_10px_30px_-5px_rgba(212,175,55,0.4)] active:scale-95 transition-transform disabled:opacity-60"
                            disabled={simulating}
                            onClick={() => void handleSimulateGroup()}
                            type="button"
                        >
                            <span className="material-symbols-outlined font-black">bolt</span>
                            <span className="text-sm font-black uppercase tracking-widest italic">{simulating ? "Simulating..." : "Simulate Whole Group"}</span>
                        </button>
                    </div>
                    {loading && <div className="glass-card rounded-xl p-4 text-sm text-gray-300">Lade Group-Details...</div>}
                    {!loading && error && <div className="glass-card rounded-xl p-4 text-sm text-red-300">{error}</div>}

                    {!loading && !error && data && (
                        <>
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xs font-black tracking-[0.2em] uppercase text-brand-gold">Standings</h2>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Live Updates</span>
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
                                    <h2 className="text-xs font-black tracking-[0.2em] uppercase text-brand-gold">Fixtures</h2>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-neon"></div>
                                        <span className="text-[10px] font-bold text-brand-neon uppercase">Sim Ready</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {data.fixtures.map((fixture) => (
                                            <div key={fixture.fixtureId} className="glass-card p-4 rounded-xl flex items-center justify-between">
                                            <div className="flex flex-col gap-1 w-2/3">
                                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                                    {fixture.matchdayLabel} • Match {fixture.matchNumber} • {fixture.dateLabel}
                                                </span>
                                                <span className="text-[9px] font-bold text-brand-gold uppercase tracking-widest">
                                                    {fixture.venue}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <CountryFlag className="h-3 w-4 text-[10px]" countryName={fixture.home.name} />
                                                            <span className="text-sm font-extrabold italic uppercase">{fixture.home.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <CountryFlag className="h-3 w-4 text-[10px]" countryName={fixture.away.name} />
                                                            <span className="text-sm font-extrabold italic uppercase">{fixture.away.name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs font-black text-brand-gold px-2 py-1 border border-brand-gold/30 rounded italic">VS</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-brand-lightGray rounded flex items-center justify-center text-xs font-black text-brand-gold">
                                                        {fixture.homeScore ?? "-"}
                                                    </div>
                                                    <span className="text-[10px] font-black text-brand-gold">:</span>
                                                    <div className="w-8 h-8 bg-brand-lightGray rounded flex items-center justify-center text-xs font-black text-white">
                                                        {fixture.awayScore ?? "-"}
                                                    </div>
                                                </div>
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{fixture.status}</span>
                                            </div>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-brand-black border-t border-white/10 px-6 py-4 flex justify-between items-center z-50">
                <button className="flex flex-col items-center gap-1 text-gray-500" onClick={() => onNavigate("/")} type="button">
                    <span className="material-symbols-outlined">home</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-brand-gold" onClick={() => onNavigate("/simulation")} type="button">
                    <span className="material-symbols-outlined">leaderboard</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Groups</span>
                </button>
                <div className="flex flex-col items-center gap-1 text-gray-500">
                    <span className="material-symbols-outlined">play_circle</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Sim</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-gray-500">
                    <span className="material-symbols-outlined">settings</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Settings</span>
                </div>
            </nav>
        </div>
    );
}
