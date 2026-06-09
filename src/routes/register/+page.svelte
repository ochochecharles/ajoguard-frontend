<script lang="ts">
  import { auth } from '$lib/api';
  import { addToast } from '$lib/stores/toast.store';

  // ─── State ───────────────────────────────────────────────

  let step      = $state<'details' | 'group' | 'success'>('details');
  let submitting = $state(false);

  // Form fields split into two steps
  let details = $state({
    name:        '',
    email:       '',
    phoneNumber: '',
  });

  let groupInfo = $state({
    groupName:     '',
    cycleAmount:   '',
    cycleInterval: 'weekly',
  });

  // ─── Step 1 — Validate personal details ──────────────────

  function goToGroup(): void {
    if (!details.name.trim()) {
      addToast('Please enter your full name', 'error');
      return;
    }
    if (!details.email.trim()) {
      addToast('Please enter your email address', 'error');
      return;
    }
    if (!details.email.includes('@')) {
      addToast('Please enter a valid email address', 'error');
      return;
    }
    step = 'group';
  }

  // ─── Step 2 — Submit registration ────────────────────────

  async function register(): Promise<void> {
    if (!groupInfo.groupName.trim()) {
      addToast('Please enter your group name', 'error');
      return;
    }

    const amount = parseFloat(groupInfo.cycleAmount);
    if (!groupInfo.cycleAmount || isNaN(amount) || amount <= 0) {
      addToast('Please enter a valid contribution amount', 'error');
      return;
    }

    submitting = true;

    try {
      await auth.register({
        name:          details.name.trim(),
        email:         details.email.trim(),
        phoneNumber:   details.phoneNumber.trim() || undefined,
        groupName:     groupInfo.groupName.trim(),
        cycleAmount:   amount,
        cycleInterval: groupInfo.cycleInterval,
      });

      step = 'success';

    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      submitting = false;
    }
  }
</script>

<!-- ─── Page ─────────────────────────────────────────────── -->

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

      {#if step === 'details'}
        <!-- ── Step 1 — Personal details ── -->

        <div class="flex items-center gap-2 mb-6">
          <div class="flex gap-1.5">
            <div class="w-2 h-2 rounded-full" style="background: var(--accent)"></div>
            <div class="w-2 h-2 rounded-full" style="background: var(--border)"></div>
          </div>
          <span class="text-xs" style="color: var(--text-muted)">Step 1 of 2</span>
        </div>

        <h1 class="text-xl font-bold mb-1"
            style="font-family: 'Syne', sans-serif">
          Create your account
        </h1>
        <p class="text-sm mb-6" style="color: var(--text-muted)">
          Set up your collector profile
        </p>

        <div class="space-y-4">

          <div>
            <label class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                   style="font-family: 'DM Mono', monospace; color: var(--text-soft)">
              Full Name *
            </label>
            <input
              type="text"
              bind:value={details.name}
              placeholder="e.g. Mama Ngozi"
              class="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
              style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
            />
          </div>

          <div>
            <label class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                   style="font-family: 'DM Mono', monospace; color: var(--text-soft)">
              Email Address *
            </label>
            <input
              type="email"
              bind:value={details.email}
              placeholder="collector@gmail.com"
              class="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
              style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
            />
            <p class="text-xs mt-1.5" style="color: var(--text-muted)">
              Used to receive your login code
            </p>
          </div>

          <div>
            <label class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                   style="font-family: 'DM Mono', monospace; color: var(--text-soft)">
              Phone Number
            </label>
            <input
              type="text"
              bind:value={details.phoneNumber}
              placeholder="08012345678 (optional)"
              class="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
              style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
            />
            <p class="text-xs mt-1.5" style="color: var(--text-muted)">
              Used for SMS contribution logging
            </p>
          </div>

          <button
            onclick={goToGroup}
            class="w-full py-3 rounded-xl text-sm font-semibold transition-opacity"
            style="background: var(--accent); color: var(--ink)"
          >
            Continue →
          </button>

        </div>

      {:else if step === 'group'}
        <!-- ── Step 2 — Group details ── -->

        <div class="flex items-center gap-2 mb-6">
          <div class="flex gap-1.5">
            <div class="w-2 h-2 rounded-full" style="background: var(--accent)"></div>
            <div class="w-2 h-2 rounded-full" style="background: var(--accent)"></div>
          </div>
          <span class="text-xs" style="color: var(--text-muted)">Step 2 of 2</span>
        </div>

        <button
          onclick={() => step = 'details'}
          class="flex items-center gap-1 text-xs mb-5 transition-opacity hover:opacity-70"
          style="color: var(--text-muted)"
        >
          ← Back
        </button>

        <h1 class="text-xl font-bold mb-1"
            style="font-family: 'Syne', sans-serif">
          Set up your group
        </h1>
        <p class="text-sm mb-6" style="color: var(--text-muted)">
          Configure your savings group details
        </p>

        <div class="space-y-4">

          <div>
            <label class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                   style="font-family: 'DM Mono', monospace; color: var(--text-soft)">
              Group Name *
            </label>
            <input
              type="text"
              bind:value={groupInfo.groupName}
              placeholder="e.g. Mama Ngozi Savings"
              class="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors"
              style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
            />
          </div>

          <div>
            <label class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                   style="font-family: 'DM Mono', monospace; color: var(--text-soft)">
              Contribution Amount (₦) *
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm"
                    style="color: var(--text-muted)">₦</span>
              <input
                type="number"
                bind:value={groupInfo.cycleAmount}
                placeholder="0.00"
                min="1"
                class="w-full pl-8 pr-4 py-3 rounded-xl text-sm outline-none transition-colors"
                style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
              />
            </div>
            <p class="text-xs mt-1.5" style="color: var(--text-muted)">
              How much each member contributes per cycle
            </p>
          </div>

          <div>
            <label class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                   style="font-family: 'DM Mono', monospace; color: var(--text-soft)">
              Cycle Interval *
            </label>
            <div class="grid grid-cols-2 gap-2">
              {#each ['weekly', 'monthly'] as interval}
                <button
                  onclick={() => groupInfo.cycleInterval = interval}
                  class="py-3 rounded-xl text-sm font-medium transition-all border capitalize"
                  style="
                    background: {groupInfo.cycleInterval === interval ? 'var(--ink)' : 'var(--surface-2)'};
                    color: {groupInfo.cycleInterval === interval ? 'var(--accent)' : 'var(--text-muted)'};
                    border-color: {groupInfo.cycleInterval === interval ? 'var(--ink-muted)' : 'var(--border)'};
                  "
                >
                  {interval}
                </button>
              {/each}
            </div>
          </div>

          <!-- Summary box -->
          {#if groupInfo.groupName && groupInfo.cycleAmount}
            <div class="rounded-xl p-4"
                 style="background: var(--surface-2); border: 1px solid var(--border)">
              <div class="text-xs uppercase tracking-wide mb-2 font-medium"
                   style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
                Summary
              </div>
              <div class="text-sm space-y-1" style="color: var(--text-soft)">
                <div>Group: <strong style="color: var(--text)">{groupInfo.groupName}</strong></div>
                <div>Each member pays: <strong style="color: var(--text)">₦{parseFloat(groupInfo.cycleAmount || '0').toLocaleString()}</strong></div>
                <div>Frequency: <strong style="color: var(--text)">{groupInfo.cycleInterval}</strong></div>
              </div>
            </div>
          {/if}

          <button
            onclick={register}
            disabled={submitting}
            class="w-full py-3 rounded-xl text-sm font-semibold transition-opacity
                   disabled:opacity-60 flex items-center justify-center gap-2"
            style="background: var(--accent); color: var(--ink)"
          >
            {#if submitting}
              <span class="w-4 h-4 rounded-full border-2 animate-spin"
                    style="border-color: var(--ink); border-top-color: transparent">
              </span>
              Creating account...
            {:else}
              Create Account
            {/if}
          </button>

        </div>

      {:else}
        <!-- ── Step 3 — Success ── -->

        <div class="text-center py-4">
          <div class="text-5xl mb-4">🎉</div>
          <h1 class="text-xl font-bold mb-2"
              style="font-family: 'Syne', sans-serif">
            Account created!
          </h1>
          <p class="text-sm mb-2" style="color: var(--text-muted)">
            Your group has been set up successfully.
          </p>
          <p class="text-sm mb-8" style="color: var(--text-muted)">
            Log in with your email address to access your dashboard.
          </p>
          <a
            href="/login"
            class="block w-full py-3 rounded-xl text-sm font-semibold
                   text-center no-underline"
            style="background: var(--accent); color: var(--ink)"
          >
            Go to Login
          </a>
        </div>

      {/if}

    </div>

    <!-- Login link -->
    {#if step !== 'success'}
      <p class="text-center text-xs mt-6" style="color: var(--text-muted)">
        Already have an account?
        <a href="/login" class="font-medium" style="color: var(--accent)">
          Log in
        </a>
      </p>
    {/if}

  </div>

</div>