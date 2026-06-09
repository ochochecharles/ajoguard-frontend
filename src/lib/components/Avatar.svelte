<script lang="ts">
  /**
   * Avatar — dark circle showing a person's initials.
   * Used in member lists and tables.
   *
   * size controls dimensions:
   *   sm → 28px (for table rows)
   *   md → 36px (default)
   *   lg → 48px (for profile displays)
   */

  import { initials } from '$lib/utils';

  type Size = 'sm' | 'md' | 'lg';

  let {
    name,
    size = 'md',
  }: {
    name:  string;
    size?: Size;
  } = $props();

  const sizes: Record<Size, string> = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };
</script>

<div class="rounded-full flex items-center justify-center
            font-bold font-syne shrink-0 {sizes[size]}"
     style="background: var(--ink); color: var(--accent)">
  {initials(name)}
</div>