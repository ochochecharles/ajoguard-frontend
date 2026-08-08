<script lang="ts">
  import { onMount } from 'svelte';
  import { resolve } from '$app/paths';
  import { auth } from '$lib/api';
  import { saveAuth } from '$lib/auth';
  import { API_BASE_URL, GOOGLE_CLIENT_ID } from '$lib/config';
  import { addToast } from '$lib/stores/toast.store';

  // ─── State ───────────────────────────────────────────────

  let submitting = $state(false);
  let gisReady   = $state(false);

  // ─── Google Identity Services (ID-token flow) ────────────
  // Preferred SPA flow per the backend contract: the frontend gets a Google
  // ID token, then POSTs it to /auth/google/login. Only active when a
  // PUBLIC_GOOGLE_CLIENT_ID is configured at build time; otherwise the page
  // falls back to the browser-redirect flow (GET /auth/google).

  type GoogleAccounts = {
    id: {
      initialize: (config: { client_id: string; callback: (r: { credential: string }) => void }) => void;
      renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
    };
  };

  let googleAccounts: GoogleAccounts | null = null;

  function loadGisScript(): void {
    const script = document.createElement('script');
    script.src   = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleAccounts = (window as unknown as { google?: GoogleAccounts }).google ?? null;
      if (googleAccounts) {
        gisReady = true;
        initGisButton();
      }
    };
    document.head.appendChild(script);
  }

  function initGisButton(): void {
    const el = document.getElementById('g_id_onload_container');
    if (!el || !googleAccounts) return;

    googleAccounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback:  handleCredentialResponse,
    });

    googleAccounts.id.renderButton(el, {
      theme:      'outline',
      size:       'large',
      width:      el.offsetWidth || 320,
      text:       'continue_with',
      shape:      'pill',
    });
  }

  async function handleCredentialResponse(response: { credential: string }): Promise<void> {
    submitting = true;
    try {
      const result = await auth.googleLogin(response.credential);
      saveAuth(result);
      addToast(`Welcome back, ${result.collector.name}`, 'success');
      window.location.href = '/';
    } catch (error) {
      addToast((error as Error).message, 'error');
      // An unregistered email — let them register instead.
      if ((error as { statusCode?: number }).statusCode === 404) {
        window.location.href = '/register';
      }
    } finally {
      submitting = false;
    }
  }

  // ─── Browser-redirect flow (zero frontend config) ────────
  // Navigate to the backend's Google consent screen. On success the backend
  // posts back to <CLIENT_ORIGIN>/oauth-callback#access_token=...&... and the
  // SPA captures the tokens from the URL hash.

  function startRedirectLogin(): void {
    window.location.href = `${API_BASE_URL}/auth/google`;
  }

  onMount(() => {
    if (GOOGLE_CLIENT_ID) loadGisScript();
  });
</script>

<div class="min-h-screen flex items-center justify-center p-4"
     style="background: var(--ink)">

  <div class="w-full max-w-sm">

    <!-- Logo -->
    <div class="text-center mb-8">
      <div class="text-3xl font-black mb-1"
           style="font-family: 'Syne', sans-serif; color: var(--accent)">
        AjoGuard
      </div>
      <div class="text-xs tracking-widest uppercase"
           style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
        Savings Intelligence
      </div>
    </div>

    <!-- Card -->
    <div class="rounded-2xl p-8" style="background: var(--surface)">

      <h1 class="text-xl font-bold mb-1"
          style="font-family: 'Syne', sans-serif">
        Collector Login
      </h1>
      <p class="text-sm mb-6" style="color: var(--text-muted)">
        Sign in securely with your Google account
      </p>

      <div class="space-y-4">

        <!-- ID-token button (when PUBLIC_GOOGLE_CLIENT_ID is set) -->
        {#if gisReady}
          <div id="g_id_onload_container" class="w-full flex justify-center"></div>

          <div class="flex items-center gap-3 my-1">
            <div class="flex-1 h-px" style="background: var(--border)"></div>
            <span class="text-xs" style="color: var(--text-muted)">or</span>
            <div class="flex-1 h-px" style="background: var(--border)"></div>
          </div>
        {/if}

        <!-- Redirect-flow button -->
        <button
          onclick={startRedirectLogin}
          disabled={submitting}
          class="w-full py-3 rounded-xl text-sm font-semibold
                 transition-opacity disabled:opacity-60 flex items-center
                 justify-center gap-2"
          style="background: var(--accent); color: var(--ink)"
        >
          {#if submitting}
            <span class="w-4 h-4 border-2 rounded-full animate-spin"
                  style="border-color: var(--ink); border-top-color: transparent">
            </span>
            Signing in...
          {:else}
            <svg class="w-4 h-4" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          {/if}
        </button>

        <p class="text-xs leading-relaxed text-center" style="color: var(--text-muted)">
          You'll be redirected to Google to verify your identity.
          Your email address is never shared with third parties.
        </p>
      </div>
    </div>

    <!-- Footer note -->
    <p class="text-center text-xs mt-6" style="color: var(--text-muted)">
      Don't have an account?
      <a href={resolve('/register')} class="font-medium" style="color: var(--accent)">
        Register here
      </a>
    </p>

  </div>
</div>