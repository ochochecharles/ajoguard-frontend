<script lang="ts">
  import { browser } from '$app/environment';
  import { saveAuth } from '$lib/auth';
  import type { Collector } from '$lib/auth';

  // The backend redirects here after a successful Google OAuth sign-in as:
  //   /oauth-callback#access_token=...&refresh_token=...&expires_in=...&collector=...
  // We read the hash, persist the session, then bounce to the dashboard.

  let error = $state('');

  if (browser) {
    const hash = window.location.hash.replace(/^#/, '');
    const params = new URLSearchParams(hash);

    const accessToken  = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresIn    = params.get('expires_in') ?? '8h';
    const collectorRaw = params.get('collector');

    if (!accessToken || !refreshToken || !collectorRaw) {
      error = 'The sign-in response was incomplete. Please try again.';
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } else {
      try {
        const collector = JSON.parse(decodeURIComponent(collectorRaw)) as Collector;
        saveAuth({ accessToken, refreshToken, expiresIn, collector });
        // Clean the hash out of the URL before navigating.
        history.replaceState(null, '', window.location.pathname);
        window.location.href = '/app';
      } catch {
        error = 'Could not restore your session. Please try again.';
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    }
  }
</script>

<div class="min-h-screen flex flex-col items-center justify-center gap-3 p-4"
     style="background: var(--ink)">

  <div class="text-2xl font-black"
       style="font-family: 'Syne', sans-serif; color: var(--accent)">
    AjoGuard
  </div>

  {#if error}
    <p class="text-sm" style="color: var(--danger)">{error}</p>
  {:else}
    <div class="w-8 h-8 rounded-full border-2 animate-spin"
         style="border-color: var(--ink-muted); border-top-color: var(--accent)">
    </div>
    <p class="text-sm" style="color: var(--text-muted)">
      Signing you in…
    </p>
  {/if}
</div>