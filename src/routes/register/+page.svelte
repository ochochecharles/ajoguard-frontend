<script lang="ts">
  import { resolve } from '$app/paths';
  import { API_BASE_URL } from '$lib/config';
  import { addToast } from '$lib/stores/toast.store';

  // ─── State ───────────────────────────────────────────────

  // Mode: start a new group as a collector, or join an existing one.
  let mode = $state<'start' | 'join'>('start');
  let submitting = $state(false);

  let startForm = $state({
    phoneNumber:   '',
    groupName:     '',
    cycleAmount:   '',
    cycleInterval: 'weekly' as 'weekly' | 'monthly',
  });

  let joinForm = $state({
    phoneNumber: '',
    joinCode:    '',
  });

  // ─── Validation ──────────────────────────────────────────

  function validatePhone(phone: string): boolean {
    if (!phone.trim()) {
      addToast('Please enter your phone number', 'error');
      return false;
    }
    return true;
  }

  function startGroup(): void {
    if (!validatePhone(startForm.phoneNumber)) return;

    if (!startForm.groupName.trim()) {
      addToast('Please enter your group name', 'error');
      return;
    }

    const amount = Number(startForm.cycleAmount);
    if (!startForm.cycleAmount || !Number.isInteger(amount) || amount < 1) {
      addToast('Enter the contribution amount as a whole number of Naira (e.g. 5000)', 'error');
      return;
    }

    submitting = true;
    const params = new URLSearchParams({
      phoneNumber:   startForm.phoneNumber.trim(),
      groupName:     startForm.groupName.trim(),
      cycleAmount:   String(amount),
      cycleInterval: startForm.cycleInterval,
    });
    window.location.href = `${API_BASE_URL}/auth/google?${params.toString()}`;
  }

  function joinGroup(): void {
    if (!validatePhone(joinForm.phoneNumber)) return;

    const code = joinForm.joinCode.trim().toUpperCase();
    if (!code) {
      addToast('Please enter the group join code', 'error');
      return;
    }

    submitting = true;
    const params = new URLSearchParams({
      phoneNumber: joinForm.phoneNumber.trim(),
      joinCode:    code,
    });
    window.location.href = `${API_BASE_URL}/auth/google?${params.toString()}`;
  }

  function go(handler: () => void): void {
    if (submitting) return;
    handler();
  }
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
        Create your account
      </h1>
      <p class="text-sm mb-6" style="color: var(--text-muted)">
        Your identity comes from Google — we just need your group details.
      </p>

      <!-- Mode toggle -->
      <div class="grid grid-cols-2 gap-2 mb-6">
        <button
          onclick={() => mode = 'start'}
          class="py-2.5 rounded-xl text-sm font-medium transition-all border"
          style="
            background: {mode === 'start' ? 'var(--ink)' : 'var(--surface-2)'};
            color: {mode === 'start' ? 'var(--accent)' : 'var(--text-muted)'};
            border-color: {mode === 'start' ? 'var(--ink-muted)' : 'var(--border)'};
          "
        >
          Start a group
        </button>
        <button
          onclick={() => mode = 'join'}
          class="py-2.5 rounded-xl text-sm font-medium transition-all border"
          style="
            background: {mode === 'join' ? 'var(--ink)' : 'var(--surface-2)'};
            color: {mode === 'join' ? 'var(--accent)' : 'var(--text-muted)'};
            border-color: {mode === 'join' ? 'var(--ink-muted)' : 'var(--border)'};
          "
        >
          Join with code
        </button>
      </div>

      {#if mode === 'start'}
        <!-- ── Start a new savings group ── -->

        <div class="space-y-4">

          <div>
            <label for="reg-phone" class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                   style="font-family: 'DM Mono', monospace; color: var(--text-soft)">
              Phone Number *
            </label>
            <input
              id="reg-phone"
              type="tel"
              bind:value={startForm.phoneNumber}
              placeholder="08012345678"
              class="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
              style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
            />
            <p class="text-xs mt-1.5" style="color: var(--text-muted)">
              Used to link your account to contribution logging
            </p>
          </div>

          <div>
            <label for="reg-group-name" class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                   style="font-family: 'DM Mono', monospace; color: var(--text-soft)">
              Group Name *
            </label>
            <input
              id="reg-group-name"
              type="text"
              bind:value={startForm.groupName}
              placeholder="e.g. Mama Ngozi Savings"
              class="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
              style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
            />
          </div>

          <div>
            <label for="reg-amount" class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                   style="font-family: 'DM Mono', monospace; color: var(--text-soft)">
              Contribution Amount (₦) *
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm"
                    style="color: var(--text-muted)">₦</span>
              <input
                id="reg-amount"
                type="number"
                bind:value={startForm.cycleAmount}
                placeholder="5000"
                min="1"
                step="1"
                class="w-full pl-8 pr-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
              />
            </div>
            <p class="text-xs mt-1.5" style="color: var(--text-muted)">
              Whole Naira — how much each member pays per cycle
            </p>
          </div>

          <fieldset class="space-y-2">
            <legend class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                    style="font-family: 'DM Mono', monospace; color: var(--text-soft)">
              Cycle Interval *
            </legend>
            <div class="grid grid-cols-2 gap-2">
              {#each ['weekly', 'monthly'] as interval (interval)}
                <button
                  onclick={() => startForm.cycleInterval = interval as 'weekly' | 'monthly'}
                  class="py-3 rounded-xl text-sm font-medium transition-all border capitalize"
                  style="
                    background: {startForm.cycleInterval === interval ? 'var(--ink)' : 'var(--surface-2)'};
                    color: {startForm.cycleInterval === interval ? 'var(--accent)' : 'var(--text-muted)'};
                    border-color: {startForm.cycleInterval === interval ? 'var(--ink-muted)' : 'var(--border)'};
                  "
                >
                  {interval}
                </button>
              {/each}
            </div>
          </fieldset>

          <button
            onclick={() => go(startGroup)}
            disabled={submitting}
            class="w-full py-3 rounded-xl text-sm font-semibold transition-opacity
                   disabled:opacity-60 flex items-center justify-center gap-2"
            style="background: var(--accent); color: var(--ink)"
          >
            {#if submitting}
              <span class="w-4 h-4 rounded-full border-2 animate-spin"
                    style="border-color: var(--ink); border-top-color: transparent">
              </span>
              Redirecting to Google...
            {:else}
              Continue with Google
            {/if}
          </button>
        </div>

      {:else}
        <!-- ── Join an existing group ── -->

        <div class="space-y-4">

          <div>
            <label for="join-phone" class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                   style="font-family: 'DM Mono', monospace; color: var(--text-soft)">
              Phone Number *
            </label>
            <input
              id="join-phone"
              type="tel"
              bind:value={joinForm.phoneNumber}
              placeholder="08012345678"
              class="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
              style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
            />
          </div>

          <div>
            <label for="join-code" class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                   style="font-family: 'DM Mono', monospace; color: var(--text-soft)">
              Group Join Code *
            </label>
            <input
              id="join-code"
              type="text"
              bind:value={joinForm.joinCode}
              placeholder="e.g. ABC123"
              maxlength="6"
              class="w-full px-4 py-3 rounded-xl text-sm uppercase tracking-widest outline-none transition-colors"
              style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text); font-family: 'DM Mono', monospace"
            />
            <p class="text-xs mt-1.5" style="color: var(--text-muted)">
              Ask the group collector for their 6-character join code
            </p>
          </div>

          <button
            onclick={() => go(joinGroup)}
            disabled={submitting}
            class="w-full py-3 rounded-xl text-sm font-semibold transition-opacity
                   disabled:opacity-60 flex items-center justify-center gap-2"
            style="background: var(--accent); color: var(--ink)"
          >
            {#if submitting}
              <span class="w-4 h-4 rounded-full border-2 animate-spin"
                    style="border-color: var(--ink); border-top-color: transparent">
              </span>
              Redirecting to Google...
            {:else}
              Join with Google
            {/if}
          </button>
        </div>
      {/if}
    </div>

    <!-- Login link -->
    <p class="text-center text-xs mt-6" style="color: var(--text-muted)">
      Already have an account?
      <a href={resolve('/login')} class="font-medium" style="color: var(--accent)">
        Log in
      </a>
    </p>

  </div>
</div>