<script lang="ts">
  import { subscribeToasts, dismissToast } from '$lib/stores/toast.store';
  import type { ToastItem, ToastType } from '$lib/stores/toast.store';
  import { onMount, onDestroy } from 'svelte';

  let toasts = $state<ToastItem[]>([]);
  let unsubscribe: () => void;

  onMount(() => {
    unsubscribe = subscribeToasts((t) => {
      toasts = t;
    });
  });

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });

  const styles: Record<ToastType, string> = {
    success: 'bg-[var(--ink)] text-[var(--accent)]',
    error:   'bg-red-50 text-red-700 border border-red-200',
    info:    'bg-blue-50 text-blue-700 border border-blue-200',
  };

  const icons: Record<ToastType, string> = {
    success: '✓',
    error:   '✗',
    info:    'ℹ',
  };
</script>

<div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
  {#each toasts as toast (toast.id)}
    <div class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                shadow-lg pointer-events-auto max-w-xs
                animate-[slideIn_0.3s_ease] {styles[toast.type]}">
      <span class="font-bold">{icons[toast.type]}</span>
      <span class="flex-1">{toast.message}</span>
      <button
        onclick={() => dismissToast(toast.id)}
        class="opacity-60 hover:opacity-100 transition-opacity ml-1"
      >
        ✕
      </button>
    </div>
  {/each}
</div>

<style>
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);   opacity: 1; }
  }
</style>