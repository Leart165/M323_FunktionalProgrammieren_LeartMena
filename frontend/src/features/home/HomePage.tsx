import { useEffect, useState, type JSX } from "react";

import "../../App.css";

interface HomePageProps {
    onNavigate: (to: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps): JSX.Element {
    const [countdown, setCountdown] = useState<{ days: string; hours: string; mins: string; secs: string }>({
        days: "00",
        hours: "00",
        mins: "00",
        secs: "00",
    });

    useEffect(() => {
        const kickoffUtc = new Date("2026-06-11T19:00:00Z").getTime();

        const updateCountdown = (): void => {
            const now = Date.now();
            const distance = Math.max(0, kickoffUtc - now);

            const totalMinutes = Math.floor(distance / (1000 * 60));
            const days = Math.floor(totalMinutes / (60 * 24));
            const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
            const mins = totalMinutes % 60;
            const secs = Math.floor((distance % (1000 * 60)) / 1000);

            setCountdown({
                days: String(days).padStart(2, "0"),
                hours: String(hours).padStart(2, "0"),
                mins: String(mins).padStart(2, "0"),
                secs: String(secs).padStart(2, "0"),
            });
        };

        updateCountdown();
        const intervalId = window.setInterval(updateCountdown, 1000);

        console.log("WC 2026 Countdown Active");
        return () => {
            window.clearInterval(intervalId);
        };
    }, []);

    return (
        <div className="bg-brand-black text-white font-sans selection:bg-brand-gold selection:text-brand-black min-h-screen">
            <header className="fixed top-0 left-0 right-0 z-50 bg-brand-black/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-dashboard px-4 md:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-gold text-brand-black font-black px-2 py-1 rounded text-xl" data-purpose="logo-icon">
                            WC
                        </div>
                        <div className="font-extrabold text-xl tracking-tighter">
                            UNITED <span className="text-brand-gold">2026</span>
                        </div>
                    </div>

                    <nav className="hidden lg:flex items-center gap-8 text-sm font-bold tracking-widest text-gray-400">
                        <a className="text-brand-gold border-b-2 border-brand-gold pb-1 transition-colors" href="#">
                            HOME
                        </a>
                        <button
                            className="hover:text-white transition-colors"
                            onClick={() => {
                                onNavigate("/simulation");
                            }}
                            type="button"
                        >
                            SIMULATION
                        </button>
                        <button
                            className="hover:text-white transition-colors"
                            onClick={() => {
                                onNavigate("/prediction");
                            }}
                            type="button"
                        >
                            PREDICTOR
                        </button>
                    </nav>
                </div>
            </header>

            <main className="pt-20 pb-24 md:pb-8">
                <section className="relative min-h-[70vh] flex items-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            alt="MetLife Stadium"
                            className="w-full h-full object-cover"
                            src="https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=1920"
                        />
                        <div className="absolute inset-0 hero-gradient-overlay"></div>
                    </div>
                    <div className="relative z-10 max-w-dashboard px-4 md:px-8 w-full">
                        <div className="inline-block bg-brand-gold px-3 py-1 mb-6">
                            <span className="text-[10px] font-black tracking-[0.2em] text-brand-black uppercase">Road to MetLife</span>
                        </div>

                        <h1 className="hero-title text-5xl md:text-8xl lg:text-9xl font-black uppercase max-w-4xl italic">
                            THE WORLD&apos;S <br />
                            <span className="text-brand-gold">GREATEST</span> <br />
                            STAGE
                        </h1>

                        <div className="mt-12 flex gap-8 md:gap-12" id="countdown-timer">
                            <div className="text-center md:text-left">
                                <div className="text-4xl md:text-6xl font-black">{countdown.days}</div>
                                <div className="text-[10px] md:text-xs font-bold text-gray-400 tracking-widest uppercase mt-1">Days</div>
                            </div>
                            <div className="text-center md:text-left border-l border-white/10 pl-8 md:pl-12">
                                <div className="text-4xl md:text-6xl font-black">{countdown.hours}</div>
                                <div className="text-[10px] md:text-xs font-bold text-gray-400 tracking-widest uppercase mt-1">Hours</div>
                            </div>
                            <div className="text-center md:text-left border-l border-white/10 pl-8 md:pl-12">
                                <div className="text-4xl md:text-6xl font-black">{countdown.mins}</div>
                                <div className="text-[10px] md:text-xs font-bold text-gray-400 tracking-widest uppercase mt-1">Mins</div>
                            </div>
                            <div className="text-center md:text-left border-l border-white/10 pl-8 md:pl-12">
                                <div className="text-4xl md:text-6xl font-black">{countdown.secs}</div>
                                <div className="text-[10px] md:text-xs font-bold text-gray-400 tracking-widest uppercase mt-1">Secs</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="max-w-dashboard px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div
                            className="glass-card rounded-2xl overflow-hidden group cursor-pointer"
                            data-purpose="card-simulation"
                            onClick={() => {
                                onNavigate("/simulation");
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    onNavigate("/simulation");
                                }
                            }}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="relative h-64 flex items-center justify-center overflow-hidden">
                                <img
                                    alt="Simulation Graphic"
                                    className="absolute w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                                    src="https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=1600"
                                />
                                <div className="relative z-10 w-32 h-32 rounded-full border-2 border-brand-gold/30 flex items-center justify-center bg-brand-gold/5">
                                    <svg className="h-12 w-12 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="1.5"
                                        ></path>
                                        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                                    </svg>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tight">Start Simulation</h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    Test every scenario. From group stages to the trophy lift. Craft your perfect tournament path.
                                </p>
                                <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center">
                                    <svg className="h-6 w-6 text-brand-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div
                            className="glass-card rounded-2xl overflow-hidden group cursor-pointer"
                            data-purpose="card-predictor"
                            onClick={() => {
                                onNavigate("/prediction");
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    onNavigate("/prediction");
                                }
                            }}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="relative h-64 flex items-center justify-center overflow-hidden">
                                <img
                                    alt="Predictor Graphic"
                                    className="absolute w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
                                    src="https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=1600"
                                />
                                <div className="relative z-10 w-48 h-32 bg-brand-gray/80 border border-white/10 rounded-lg transform -rotate-12 flex flex-col p-4 shadow-2xl">
                                    <div className="w-full h-2 bg-brand-gold/30 rounded mb-2"></div>
                                    <div className="w-3/4 h-2 bg-white/10 rounded mb-4"></div>
                                    <div className="mt-auto flex justify-between">
                                        <div className="w-8 h-8 rounded-full bg-brand-gold/20"></div>
                                        <div className="w-8 h-8 rounded-full bg-brand-gold"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8">
                                <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tight">Predictor Mode</h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                    Earn points, climb the global leaderboard with your picks. Win exclusive digital rewards.
                                </p>
                                <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:border-brand-gold transition-colors">
                                    <svg className="h-5 w-5 text-white group-hover:text-brand-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                        ></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-brand-gray rounded-2xl p-8 flex flex-col" data-purpose="live-feed">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <h4 className="text-xs font-black tracking-widest uppercase">Live Feed</h4>
                            </div>
                            <div className="space-y-8">
                                <div className="border-l-2 border-brand-gold pl-4">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">2 MINS AGO</span>
                                    <p className="text-sm font-bold mt-1 leading-snug">USA Head Coach names preliminary 30-man squad for simulation.</p>
                                </div>
                                <div className="border-l-2 border-white/10 pl-4">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">15 MINS AGO</span>
                                    <p className="text-sm font-bold mt-1 leading-snug text-gray-400">Argentina training sessions moved to Miami facilities.</p>
                                </div>
                                <div className="border-l-2 border-white/10 pl-4">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">1 HOUR AGO</span>
                                    <p className="text-sm font-bold mt-1 leading-snug text-gray-400">New Predictor rewards announced for Season 2.</p>
                                </div>
                            </div>
                            <button className="mt-auto w-full py-4 border border-white/5 bg-white/5 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-white/10 transition-colors">
                                View All Updates
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-brand-black border-t border-white/10 px-6 py-4 flex justify-between items-center z-50">
                <div className="flex flex-col items-center gap-1 text-brand-gold">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path>
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-gray-500">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                        ></path>
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Stats</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-gray-500">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                        ></path>
                        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Live</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-gray-500">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                        ></path>
                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Settings</span>
                </div>
            </nav>
        </div>
    );
}
