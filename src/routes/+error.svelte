<script lang="ts">
  import { page } from '$app/stores';
  import { resolve } from '$app/paths';
</script>

<div class="min-h-screen flex items-center justify-center p-6"
     style="background: var(--surface)">

  <div class="text-center max-w-sm">

    <!-- Error code -->
    <div class="text-7xl font-black mb-4"
         style="font-family: 'Syne', sans-serif; color: var(--ink)">
      {$page.status}
    </div>

    <!-- Error message -->
    <div class="text-xl font-bold mb-2"
         style="font-family: 'Syne', sans-serif">
      {$page.status === 404 ? 'Page not found' : 'Something went wrong'}
    </div>

    <p class="text-sm mb-8" style="color: var(--text-muted)">
      {$page.error?.message ?? 'An unexpected error occurred'}
    </p>

    <!-- Actions -->
    <div class="flex gap-3 justify-center">
      <button
        onclick={() => window.history.back()}
        class="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        style="border: 1px solid var(--border); color: var(--text)"
      >
        Go back
      </button>

      <a
        href={resolve('/')}
        class="px-4 py-2.5 rounded-xl text-sm font-semibold no-underline"
        style="background: var(--ink); color: var(--accent)"
      >
        Go to dashboard
      </a>
    </div>

  </div>

</div>