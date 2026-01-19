<script setup lang="ts">
defineProps<{ icon?: any; title: string }>()
</script>

<template>
    <div>
        <div class="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-1">
            <component :is="icon" class="w-4 h-4" v-if="icon" />
            {{ title }}
        </div>
        <div class="bg-zinc-950/50 border border-zinc-800 rounded-xl divide-y divide-zinc-800/50 overflow-hidden shadow-sm">
            <slot />
        </div>
    </div>
</template>