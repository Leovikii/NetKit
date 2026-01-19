<script setup lang="ts">
defineProps<{ label: string; values?: string[] }>()
</script>

<template>
    <div class="flex flex-col gap-1 p-3 hover:bg-zinc-800/40 transition-colors duration-200">
        <span class="text-[10px] text-zinc-500 font-medium">{{ label }}</span>
        <template v-if="values && values.length > 0">
            <span 
                v-for="(v, i) in values" 
                :key="i" 
                class="text-xs font-mono text-zinc-300 break-all select-text selection:bg-indigo-500/30"
            >
                {{ v }}
            </span>
        </template>
        <span v-else class="text-xs text-zinc-600 italic">Not Configured</span>
    </div>
</template>