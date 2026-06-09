<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    open    = $bindable(false),
    title,
    children,
    footer,
  }: {
    open?:    boolean;
    title:    string;
    children: Snippet;
    footer?:  Snippet;
  } = $props();

  function close(): void {
    open = false;
  }

  function onOverlayKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      close();
    }
  }
</script>

{#if open}
  <!-- Overlay — keyboard accessible -->
  <div
    class="fixed inset-0 z-40 flex items-center justify-center p-4"
    style="background: rgba(10,10,15,0.6); backdrop-filter: blur(4px)"
    role="button"
    tabindex="0"
    onclick={close}
    onkeydown={onOverlayKeydown}
    aria-label="Close modal"
  >
    <!-- Modal card -->
    <div
      class="relative w-full max-w-md rounded-2xl p-8 shadow-2xl
             animate-[modalIn_0.2s_ease]"
      style="background: white"
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby="modal-title"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <h2
        id="modal-title"
        class="text-lg font-bold mb-5"
        style="font-family: 'Syne', sans-serif"
      >
        {title}
      </h2>

      {@render children()}

      {#if footer}
        <div class="flex gap-3 justify-end mt-6 pt-4"
             style="border-top: 1px solid var(--border)">
          {@render footer()}
        </div>
      {/if}

      <button
        onclick={close}
        class="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center
               justify-center text-sm transition-colors hover:bg-gray-100"
        style="color: var(--text-muted)"
        aria-label="Close modal"
      >
        ✕
      </button>
    </div>
  </div>
{/if}

<style>
  @keyframes modalIn {
    from { transform: scale(0.95) translateY(10px); opacity: 0; }
    to   { transform: scale(1)    translateY(0);    opacity: 1; }
  }
</style>