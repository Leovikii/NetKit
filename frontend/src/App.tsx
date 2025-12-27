import { useState, useEffect } from 'react';
import { GetAdapters, RestartAdapter } from "../wailsjs/go/main/App";
import { WindowMinimise, Quit } from "../wailsjs/runtime/runtime";
import { RefreshCw, Wifi, Hexagon, Zap, Minus, X, Info, Network, Globe, Router } from 'lucide-react';
import './App.css';

interface Adapter {
    name: string;
    interfaceDesc: string;
    status: string;
    macAddress: string;
    speed: string;
    ipv4: string[];
    ipv6: string[];
    gateway: string[];
    dns: string[];
}

function App() {
    const [adapters, setAdapters] = useState<Adapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [restarting, setRestarting] = useState<string | null>(null);
    const [selectedAdapter, setSelectedAdapter] = useState<Adapter | null>(null);
    const [isClosing, setIsClosing] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await GetAdapters();
            setAdapters(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleRestart = async (e: React.MouseEvent, name: string) => {
        e.stopPropagation();
        if (restarting) return;
        setRestarting(name);
        try {
            await RestartAdapter(name);
            await fetchData();
        } catch (e) {
            console.error(e);
        } finally {
            setRestarting(null);
        }
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setSelectedAdapter(null);
            setIsClosing(false);
        }, 150);
    };

    const openModal = (adapter: Adapter) => {
        setSelectedAdapter(adapter);
        setIsClosing(false);
    }

    return (
        <div className="h-screen flex flex-col bg-zinc-950 border border-zinc-800/50">
            <header 
                className="flex-none h-14 flex items-center justify-between px-4 bg-zinc-900/50 backdrop-blur-md border-b border-white/5 z-20"
                style={{ "--wails-draggable": "drag" } as React.CSSProperties}
            >
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <Hexagon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="font-bold text-sm tracking-wide text-zinc-200">NetKit</span>
                </div>
                
                <div 
                    className="flex items-center gap-2" 
                    style={{ "--wails-draggable": "no-drag" } as React.CSSProperties}
                >
                    <button onClick={WindowMinimise} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"><Minus className="w-4 h-4" /></button>
                    <button onClick={Quit} className="p-2 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth z-10">
                <div className="flex justify-between items-center mb-2 px-1">
                    <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Interfaces</h2>
                    <button onClick={fetchData} className="p-2 rounded-full hover:bg-zinc-900 text-zinc-500 hover:text-indigo-400 transition-colors cursor-pointer active:rotate-180 duration-500">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {loading && adapters.length === 0 ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    adapters.map((adapter) => (
                        <div 
                            key={adapter.name} 
                            onClick={() => openModal(adapter)}
                            className="group relative overflow-hidden bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5 transition-all duration-300 cursor-pointer 
                            hover:border-indigo-500/50 hover:bg-zinc-900/80 hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)]
                            active:scale-[0.98]"
                        >
                            <div className="absolute -right-6 -top-6 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                                <Wifi className="w-32 h-32 text-indigo-500/10 blur-2xl" />
                            </div>
                            <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <h3 className="font-semibold text-base text-zinc-100 truncate max-w-48 group-hover:text-indigo-200 transition-colors">{adapter.name}</h3>
                                    <p className="text-[10px] text-zinc-500 truncate max-w-56 mt-0.5 font-mono group-hover:text-zinc-400 transition-colors">{adapter.interfaceDesc}</p>
                                </div>
                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all duration-300 ${adapter.status === 'Up' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-rose-500/5 text-rose-400 border-rose-500/20'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${adapter.status === 'Up' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                                    {adapter.status}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mb-5 relative z-10">
                                <div className="bg-black/40 rounded-lg p-2 border border-white/5 group-hover:border-white/10 transition-colors">
                                    <span className="text-[9px] text-zinc-500 block uppercase mb-0.5">Speed</span>
                                    <span className="text-xs font-mono text-zinc-300">{adapter.speed || 'N/A'}</span>
                                </div>
                                <div className="bg-black/40 rounded-lg p-2 border border-white/5 group-hover:border-white/10 transition-colors">
                                    <span className="text-[9px] text-zinc-500 block uppercase mb-0.5">IP v4</span>
                                    <span className="text-xs font-mono text-zinc-300 truncate">{adapter.ipv4?.[0] || '---'}</span>
                                </div>
                            </div>

                            <button
                                onClick={(e) => handleRestart(e, adapter.name)}
                                disabled={restarting !== null}
                                className={`w-full relative z-10 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer overflow-hidden ${restarting === adapter.name ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' : 'bg-zinc-100 text-zinc-950 border border-zinc-100 hover:border-indigo-400 hover:text-white hover:bg-zinc-900 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]'}`}
                            >
                                {restarting === adapter.name ? <><RefreshCw className="w-4 h-4 animate-spin" /><span>Restarting...</span></> : <><Zap className="w-4 h-4" /><span>Restart Interface</span></>}
                            </button>
                        </div>
                    ))
                )}
                
                {!loading && adapters.length === 0 && (
                     <div className="text-center py-20 animate-fade-in">
                        <div className="w-16 h-16 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                            <Wifi className="w-8 h-8 text-zinc-700" />
                        </div>
                        <p className="text-sm text-zinc-500">No adapters found</p>
                    </div>
                )}
            </div>

            {selectedAdapter && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center p-6 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
                    <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={handleCloseModal} />
                    <div className={`relative w-full max-w-sm bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ring-1 ring-white/10 ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
                        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-xl">
                            <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
                                <Info className="w-4 h-4 text-indigo-400" /> Details
                            </h3>
                            <button onClick={handleCloseModal} className="p-1 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-0 overflow-y-auto">
                            <div className="p-5 bg-linear-to-b from-zinc-800/50 to-zinc-900/50 border-b border-zinc-800/50">
                                <div className="text-lg font-bold text-white mb-1 shadow-black drop-shadow-sm">{selectedAdapter.name}</div>
                                <div className="text-xs text-zinc-500 font-mono">{selectedAdapter.interfaceDesc}</div>
                            </div>
                            
                            <div className="p-5 space-y-6 bg-zinc-900/50">
                                <DetailGroup icon={<Globe className="w-4 h-4" />} title="IP Addresses">
                                    <DetailItem label="IPv4" values={selectedAdapter.ipv4} />
                                    <DetailItem label="IPv6" values={selectedAdapter.ipv6} />
                                </DetailGroup>

                                <DetailGroup icon={<Router className="w-4 h-4" />} title="Network Config">
                                    <DetailItem label="Gateway" values={selectedAdapter.gateway} />
                                    <DetailItem label="DNS Servers" values={selectedAdapter.dns} />
                                </DetailGroup>

                                <DetailGroup icon={<Network className="w-4 h-4" />} title="Hardware">
                                    <DetailItem label="MAC Address" values={[selectedAdapter.macAddress]} />
                                    <DetailItem label="Link Speed" values={[selectedAdapter.speed]} />
                                </DetailGroup>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const SkeletonCard = () => (
    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-5 animate-pulse">
        <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
                <div className="h-5 bg-zinc-800/80 rounded w-32"></div>
                <div className="h-3 bg-zinc-800/50 rounded w-48"></div>
            </div>
            <div className="h-6 w-14 bg-zinc-800/50 rounded-md"></div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-5">
            <div className="h-10 bg-zinc-800/30 rounded-lg"></div>
            <div className="h-10 bg-zinc-800/30 rounded-lg"></div>
        </div>
        <div className="h-11 bg-zinc-800/50 rounded-lg w-full"></div>
    </div>
);

const DetailGroup = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div>
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-1">
            {icon} {title}
        </div>
        <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl divide-y divide-zinc-800/50 overflow-hidden shadow-sm">
            {children}
        </div>
    </div>
);

const DetailItem = ({ label, values }: { label: string, values: string[] }) => (
    <div className="flex flex-col gap-1 p-3 hover:bg-zinc-800/40 transition-colors duration-200">
        <span className="text-[10px] text-zinc-500 font-medium">{label}</span>
        {values && values.length > 0 ? (
            values.map((v, i) => (
                <span key={i} className="text-xs font-mono text-zinc-300 break-all select-text selection:bg-indigo-500/30">{v}</span>
            ))
        ) : (
            <span className="text-xs text-zinc-600 italic">Not Configured</span>
        )}
    </div>
);

export default App;