<script lang="ts">
  /**
   * EmptyState — shown when a table or list has no data.
   * Provides a friendly message instead of a blank space.
   */

  let {
    icon  = '📋',
    title = 'Nothing here yet',
    sub   = '',
  }: {
    icon?:  string;
    title?: string;
    sub?:   string;
  } = $props();
</script>

<div class="flex flex-col items-center justify-center py-16 px-6 text-center">
  <div class="text-4xl mb-3">{icon}</div>
  <div class="font-semibold text-sm mb-1" style="color: var(--text-soft); font-family: 'Syne', sans-serif;">
    {title}
  </div>
  {#if sub}
    <div class="text-sm" style="color: var(--text-muted)">{sub}</div>
  {/if}
</div>