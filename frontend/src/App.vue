<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { GetAdapters, RestartAdapter } from "../wailsjs/go/main/App";
import { WindowMinimise, Quit } from "../wailsjs/runtime/runtime";
import { RefreshCw, Wifi, Hexagon, Zap, Minus, X, Info, Network, Globe, Router } from 'lucide-vue-next';
import SkeletonCard from './components/SkeletonCard.vue';
import DetailGroup from './components/DetailGroup.vue';
import DetailItem from './components/DetailItem.vue';

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

const adapters = ref<Adapter[]>([]);
const loading = ref(true);
const restarting = ref<string | null>(null);
const selectedAdapter = ref<Adapter | null>(null);
const isClosing = ref(false);

const fetchData = async () => {
    loading.value = true;
    try {
        const data = await GetAdapters();
        adapters.value = data || [];
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

let interval: number;

onMounted(() => {
    fetchData();
    interval = setInterval(fetchData, 5000) as unknown as number;
});

onUnmounted(() => {
    clearInterval(interval);
});

const handleRestart = async (e: Event, name: string) => {
    e.stopPropagation();
    if (restarting.value) return;
    restarting.value = name;
    try {
        await RestartAdapter(name);
        await fetchData();
    } catch (e) {
        console.error(e);
    } finally {
        restarting.value = null;
    }
};

const handleCloseModal = () => {
    isClosing.value = true;
    setTimeout(() => {
        selectedAdapter.value = null;
        isClosing.value = false;
    }, 150);
};

const openModal = (adapter: Adapter) => {
    selectedAdapter.value = adapter;
    isClosing.value = false;
}
</script>

<template>
    <div class="h-screen flex flex-col bg-zinc-950 border border-zinc-800/50">
        <header 
            class="flex-none h-14 flex items-center justify-between px-4 bg-zinc-900/50 backdrop-blur-md border-b border-white/5 z-20"
            style="--wails-draggable: drag"
        >
            <div class="flex items-center gap-3">
                <div class="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    <Hexagon class="w-4 h-4 text-indigo-400" />
                </div>
                <span class="font-bold text-sm tracking-wide text-zinc-200">NetKit</span>
            </div>
            
            <div 
                class="flex items-center gap-2" 
                style="--wails-draggable: no-drag"
            >
                <button @click="WindowMinimise" class="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"><Minus class="w-4 h-4" /></button>
                <button @click="Quit" class="p-2 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"><X class="w-4 h-4" /></button>
            </div>
        </header>

        <div class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth z-10">
            <div class="flex justify-between items-center mb-2 px-1">
                <h2 class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Interfaces</h2>
                <button @click="fetchData" class="p-2 rounded-full hover:bg-zinc-900 text-zinc-500 hover:text-indigo-400 transition-colors cursor-pointer active:rotate-180 duration-500">
                    <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
                </button>
            </div>

            <template v-if="loading && adapters.length === 0">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </template>
            <template v-else>
                <div 
                    v-for="adapter in adapters" 
                    :key="adapter.name" 
                    @click="openModal(adapter)"
                    class="group relative overflow-hidden bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5 transition-all duration-300 cursor-pointer 
                    hover:border-indigo-500/50 hover:bg-zinc-900/80 hover:scale-[1.02] hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)]
                    active:scale-[0.98]"
                >
                    <div class="absolute -right-6 -top-6 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                        <Wifi class="w-32 h-32 text-indigo-500/10 blur-2xl" />
                    </div>
                    <div class="absolute inset-0 bg-linear-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div class="flex justify-between items-start mb-4 relative z-10">
                        <div>
                            <h3 class="font-semibold text-base text-zinc-100 truncate max-w-48 group-hover:text-indigo-200 transition-colors">{{ adapter.name }}</h3>
                            <p class="text-[10px] text-zinc-500 truncate max-w-56 mt-0.5 font-mono group-hover:text-zinc-400 transition-colors">{{ adapter.interfaceDesc }}</p>
                        </div>
                        <div class="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all duration-300" :class="adapter.status === 'Up' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-rose-500/5 text-rose-400 border-rose-500/20'">
                            <div class="w-1.5 h-1.5 rounded-full" :class="adapter.status === 'Up' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'" />
                            {{ adapter.status }}
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 mb-5 relative z-10">
                        <div class="bg-black/40 rounded-lg p-2 border border-white/5 group-hover:border-white/10 transition-colors">
                            <span class="text-[9px] text-zinc-500 block uppercase mb-0.5">Speed</span>
                            <span class="text-xs font-mono text-zinc-300">{{ adapter.speed || 'N/A' }}</span>
                        </div>
                        <div class="bg-black/40 rounded-lg p-2 border border-white/5 group-hover:border-white/10 transition-colors">
                            <span class="text-[9px] text-zinc-500 block uppercase mb-0.5">IP v4</span>
                            <span class="text-xs font-mono text-zinc-300 truncate">{{ adapter.ipv4?.[0] || '---' }}</span>
                        </div>
                    </div>

                    <button
                        @click="(e) => handleRestart(e, adapter.name)"
                        :disabled="restarting !== null"
                        class="w-full relative z-10 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer overflow-hidden"
                        :class="restarting === adapter.name ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' : 'bg-zinc-100 text-zinc-950 border border-zinc-100 hover:border-indigo-400 hover:text-white hover:bg-zinc-900 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]'"
                    >
                        <template v-if="restarting === adapter.name">
                            <RefreshCw class="w-4 h-4 animate-spin" />
                            <span>Restarting...</span>
                        </template>
                        <template v-else>
                            <Zap class="w-4 h-4" />
                            <span>Restart Interface</span>
                        </template>
                    </button>
                </div>
            </template>
            
            <div v-if="!loading && adapters.length === 0" class="text-center py-20 animate-fade-in">
                <div class="w-16 h-16 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                    <Wifi class="w-8 h-8 text-zinc-700" />
                </div>
                <p class="text-sm text-zinc-500">No adapters found</p>
            </div>
        </div>

        <div v-if="selectedAdapter" class="fixed inset-0 z-50 flex items-center justify-center p-6" :class="isClosing ? 'animate-fade-out' : 'animate-fade-in'">
            <div class="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" @click="handleCloseModal" />
            <div class="relative w-full max-w-sm bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ring-1 ring-white/10" :class="isClosing ? 'animate-scale-out' : 'animate-scale-in'">
                <div class="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-xl">
                    <h3 class="font-semibold text-zinc-100 flex items-center gap-2">
                        <Info class="w-4 h-4 text-indigo-400" /> Details
                    </h3>
                    <button @click="handleCloseModal" class="p-1 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"><X class="w-5 h-5" /></button>
                </div>
                <div class="p-0 overflow-y-auto">
                    <div class="p-5 bg-linear-to-b from-zinc-800/50 to-zinc-900/50 border-b border-zinc-800/50">
                        <div class="text-lg font-bold text-white mb-1 shadow-black drop-shadow-sm">{{ selectedAdapter.name }}</div>
                        <div class="text-xs text-zinc-500 font-mono">{{ selectedAdapter.interfaceDesc }}</div>
                    </div>
                    
                    <div class="p-5 space-y-6 bg-zinc-900/50">
                        <DetailGroup :icon="Globe" title="IP Addresses">
                            <DetailItem label="IPv4" :values="selectedAdapter.ipv4" />
                            <DetailItem label="IPv6" :values="selectedAdapter.ipv6" />
                        </DetailGroup>

                        <DetailGroup :icon="Router" title="Network Config">
                            <DetailItem label="Gateway" :values="selectedAdapter.gateway" />
                            <DetailItem label="DNS Servers" :values="selectedAdapter.dns" />
                        </DetailGroup>

                        <DetailGroup :icon="Network" title="Hardware">
                            <DetailItem label="MAC Address" :values="[selectedAdapter.macAddress]" />
                            <DetailItem label="Link Speed" :values="[selectedAdapter.speed]" />
                        </DetailGroup>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>