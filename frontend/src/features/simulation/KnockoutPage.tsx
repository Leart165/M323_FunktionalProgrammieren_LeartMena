import { type JSX, useEffect, useState } from "react";

import "../../App.css";
import { loadKnockoutBracket, type KnockoutBracketData, type KnockoutMatch } from "./knockoutDataSource";

interface KnockoutPageProps {
    onNavigate: (to: string) => void;
}

const CARD_HEIGHT = 118;
const CARD_GAP = 26;
const UNIT = CARD_HEIGHT + CARD_GAP;

function getMatchTop(stageIndex: number, matchIndex: number): number {
    const step = 2 ** stageIndex;
    return ((step - 1) * UNIT) / 2 + matchIndex * step * UNIT;
}

function MatchCard({ match }: { match: KnockoutMatch }): JSX.Element {
    const simulated = match.status === "simulated";

    return (
        <div className={`glass-card rounded-xl p-3 h-[118px] ${simulated ? "border-l-2 border-l-brand-gold/60" : ""}`}>
            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest truncate">{match.id} • {match.dateLabel}</div>
            <div className="text-[9px] text-gray-400 uppercase truncate">{match.venue}</div>
            <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] font-bold uppercase tracking-tight pr-2 truncate">{match.home}</span>
                <div className="w-7 h-6 shrink-0 bg-brand-lightGray rounded flex items-center justify-center text-[11px] font-black text-brand-gold">
                    {match.homeScore ?? "-"}
                </div>
            </div>
            <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] font-bold uppercase tracking-tight pr-2 truncate">{match.away}</span>
                <div className="w-7 h-6 shrink-0 bg-brand-lightGray rounded flex items-center justify-center text-[11px] font-black text-gray-500">
                    {match.awayScore ?? "-"}
                </div>
            </div>
        </div>
    );
}

export default function KnockoutPage({ onNavigate }: KnockoutPageProps): JSX.Element {
    const [data, setData] = useState<KnockoutBracketData | null>(null);

    useEffect(() => {
        let active = true;
        const load = async (): Promise<void> => {
            const result = await loadKnockoutBracket();
            if (active) {
                setData(result);
            }
        };
        void load();
        return () => {
            active = false;
        };
    }, []);

    const primaryStages = data?.stages.slice(0, 4) ?? [];
    const finalStage = data?.stages[4];
    const bracketHeight = 16 * UNIT - CARD_GAP;

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
                <button className="flex items-center gap-2" onClick={() => onNavigate("/simulation")} type="button">
                    <span className="material-symbols-outlined text-brand-gold">arrow_back_ios</span>
                    <div className="font-black text-lg tracking-tighter uppercase italic">
                        KNOCKOUT <span className="text-brand-gold">BRACKET</span>
                    </div>
                </button>
                <div className="bg-brand-gold/10 px-3 py-1 rounded-full border border-brand-gold/20">
                    <span className="text-[10px] font-black text-brand-gold tracking-widest uppercase italic">Road to Metlife</span>
                </div>
            </header>

            <main className="relative z-10 pt-20 pb-44 overflow-x-auto no-scrollbar px-6">
                {!data && <div className="glass-card rounded-xl p-4 text-sm text-gray-400">Lade Bracket...</div>}

                {data && (
                    <div className="flex gap-12 min-w-max">
                        {primaryStages.map((stage, stageIndex) => (
                            <section key={stage.title} className="bracket-column relative" style={{ height: bracketHeight }}>
                                <div className="sticky top-0 z-20 py-2 bg-brand-black/60 backdrop-blur-md rounded-lg border border-white/5 text-center mb-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.28em] text-gray-300 italic">{stage.title}</h3>
                                </div>

                                {stage.matches.map((match, matchIndex) => {
                                    const top = getMatchTop(stageIndex, matchIndex) + 44;
                                    const center = top + CARD_HEIGHT / 2;

                                    let connector: JSX.Element | null = null;
                                    if (stageIndex < 3) {
                                        const nextTop = getMatchTop(stageIndex + 1, Math.floor(matchIndex / 2)) + 44;
                                        const nextCenter = nextTop + CARD_HEIGHT / 2;
                                        const delta = nextCenter - center;
                                        const verticalTop = delta >= 0 ? "50%" : `calc(50% + ${delta}px)`;

                                        connector = (
                                            <>
                                                <div className={`absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-[2px] ${match.status === "simulated" ? "neon-line" : "bg-white/10"}`}></div>
                                                <div
                                                    className={`absolute right-[-24px] w-[2px] ${match.status === "simulated" ? "bg-brand-neon/50" : "bg-white/10"}`}
                                                    style={{
                                                        top: verticalTop,
                                                        height: Math.abs(delta),
                                                    }}
                                                ></div>
                                                <div
                                                    className={`absolute right-[-48px] h-[2px] w-6 ${match.status === "simulated" ? "neon-line" : "bg-white/10"}`}
                                                    style={{
                                                        top: `calc(50% + ${delta}px)`,
                                                    }}
                                                ></div>
                                            </>
                                        );
                                    }

                                    return (
                                        <div key={match.id} className="absolute left-0 w-full" style={{ top }}>
                                            {stageIndex > 0 && <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-[2px] bg-white/10"></div>}
                                            <MatchCard match={match} />
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

                                    {finalStage.matches.map((match) => (
                                        <div key={match.id} className="mb-4 last:mb-0 p-3 rounded-xl bg-white/5 border border-white/10">
                                            <div className="text-[9px] font-bold text-brand-gold uppercase tracking-widest mb-1">{match.label} • {match.dateLabel}</div>
                                            <div className="text-[9px] text-gray-400 uppercase mb-2">{match.venue}</div>
                                            <div className="text-xs font-black uppercase italic">{match.home}</div>
                                            <div className="text-[10px] text-brand-gold font-black italic my-1">VS</div>
                                            <div className="text-xs font-black uppercase italic">{match.away}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>

            <div className="fixed bottom-20 left-4 right-4 z-50 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <button className="bg-brand-lightGray/80 backdrop-blur-lg border border-white/10 py-3 rounded-xl flex items-center justify-center gap-2 text-white font-black uppercase italic text-xs tracking-wider" type="button">
                        <span className="material-symbols-outlined text-sm">play_circle</span>
                        Simulate Round
                    </button>
                    <button className="glossy-button py-3 rounded-xl flex items-center justify-center gap-2 text-brand-black font-black uppercase italic text-xs tracking-wider" type="button">
                        <span className="material-symbols-outlined text-sm font-bold">fast_forward</span>
                        Simulate All
                    </button>
                </div>
            </div>

            <nav className="fixed bottom-0 left-0 right-0 bg-brand-black/95 backdrop-blur-xl border-t border-white/10 px-8 pt-4 pb-8 flex justify-between items-center z-50">
                <button className="flex flex-col items-center gap-1 text-gray-500" onClick={() => onNavigate("/simulation")} type="button">
                    <span className="material-symbols-outlined">dashboard</span>
                    <span className="text-[9px] font-black uppercase tracking-tighter">Groups</span>
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
