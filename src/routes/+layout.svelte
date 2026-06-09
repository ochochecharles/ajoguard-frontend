<script lang="ts">
  import '../app.css';
  import type { Snippet } from 'svelte';
  import { navigating } from '$app/stores';
  import Toast from '$lib/components/Toast.svelte';

  let { children }: { children: Snippet } = $props();
</script>

<!-- Navigation progress bar -->
{#if $navigating}
  <div class="fixed top-0 left-0 right-0 z-50 h-0.5"
       style="background: var(--surface-3)">
    <div class="h-full animate-pulse"
         style="background: var(--accent); width: 60%">
    </div>
  </div>
{/if}

{@render children()}

<!-- Toast sits outside all page content so it always appears on top -->
<Toast />