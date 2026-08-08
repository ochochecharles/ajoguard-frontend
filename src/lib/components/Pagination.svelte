<script lang="ts">
  /**
   * Pagination — prev/next controls with page count for API list endpoints
   * (which respond with { data, page, limit, total, totalPages }).
   */

  let {
    page,
    totalPages,
    total,
    onchange,
  }: {
    page:       number;
    totalPages: number;
    total:      number;
    onchange:   (page: number) => void;
  } = $props();

  function go(delta: number): void {
    const next = Math.min(Math.max(1, page + delta), Math.max(1, totalPages));
    if (next !== page) onchange(next);
  }
</script>

{#if totalPages > 1}
  <div class="flex items-center justify-between flex-wrap gap-3 px-6 py-4"
       style="border-top: 1px solid var(--border)">
    <span class="text-xs" style="color: var(--text-muted)">
      {total} result{total !== 1 ? 's' : ''}
    </span>

    <div class="flex items-center gap-2">
      <button
        onclick={() => go(-1)}
        disabled={page <= 1}
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
               disabled:opacity-40"
        style="border: 1px solid var(--border); color: var(--text)"
      >
        ← Prev
      </button>

      <span class="text-xs" style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
        Page {page} of {totalPages}
      </span>

      <button
        onclick={() => go(1)}
        disabled={page >= totalPages}
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
               disabled:opacity-40"
        style="border: 1px solid var(--border); color: var(--text)"
      >
        Next →
      </button>
    </div>
  </div>
{/if}