<script lang="ts">
  import { auth } from '$lib/api';
  import { saveAuth } from '$lib/auth';
  import { addToast } from '$lib/stores/toast.store';

  // ─── State ───────────────────────────────────────────────

  // Which step we are on
  let step = $state<'email' | 'otp'>('email');

  // Form values
  let email      = $state('');
  let otpDigits  = $state(['', '', '', '', '', '']);

  // Loading states
  let requesting = $state(false);
  let verifying  = $state(false);

  // Cooldown countdown for resend button
  let cooldown   = $state(0);
  let cooldownInterval: ReturnType<typeof setInterval> | null = null;

  // Derived — full OTP string joined from the 6 digit boxes
  let otp = $derived(otpDigits.join(''));

  // ─── Step 1 — Request OTP ────────────────────────────────

  async function requestOtp(): Promise<void> {
    if (!email.trim()) {
      addToast('Please enter your email address', 'error');
      return;
    }

    requesting = true;

    try {
      await auth.requestOtp(email.trim());
      // Move to step 2
      step = 'otp';
      startCooldown();
      // Focus first OTP box after transition
      setTimeout(() => {
        document.getElementById('otp-0')?.focus();
      }, 100);
    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      requesting = false;
    }
  }

  // ─── Step 2 — Verify OTP ─────────────────────────────────

  async function verifyOtp(): Promise<void> {
    if (otp.length !== 6) {
      addToast('Please enter all 6 digits', 'error');
      return;
    }

    verifying = true;

    try {
      const result = await auth.verifyOtp(email.trim(), otp);

      // Save token and collector to localStorage
      saveAuth(result.accessToken, result.collector);

      addToast(`Welcome back, ${result.collector.name}`, 'success');

      // Navigate to dashboard
      window.location.href = '/';

    } catch (error) {
      addToast((error as Error).message, 'error');
      // Clear OTP boxes so they can try again
      otpDigits = ['', '', '', '', '', ''];
      setTimeout(() => {
        document.getElementById('otp-0')?.focus();
      }, 100);
    } finally {
      verifying = false;
    }
  }

  // ─── OTP input handling ───────────────────────────────────

  function onOtpInput(index: number, e: Event): void {
    const input = e.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, ''); // digits only

    // Update this digit
    otpDigits[index] = value.slice(-1); // take last char if pasted multiple

    // Auto-focus next box
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    // Auto-submit when all 6 filled
    if (otpDigits.every(d => d !== '')) {
      verifyOtp();
    }
  }

  function onOtpKeydown(index: number, e: KeyboardEvent): void {
    // Backspace moves to previous box if current is empty
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  }

  function onOtpPaste(e: ClipboardEvent): void {
    // Handle pasting a full 6-digit code
    e.preventDefault();
    const pasted = e.clipboardData?.getData('text').replace(/\D/g, '') ?? '';
    if (pasted.length === 6) {
      otpDigits = pasted.split('');
      verifyOtp();
    }
  }

  // ─── Cooldown timer ───────────────────────────────────────

  function startCooldown(): void {
    cooldown = 60;
    cooldownInterval = setInterval(() => {
      cooldown--;
      if (cooldown <= 0) {
        clearInterval(cooldownInterval!);
        cooldownInterval = null;
      }
    }, 1000);
  }

  async function resendOtp(): Promise<void> {
    if (cooldown > 0) return;
    requesting = true;
    try {
      await auth.requestOtp(email.trim());
      addToast('New code sent', 'success');
      startCooldown();
      otpDigits = ['', '', '', '', '', ''];
    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      requesting = false;
    }
  }

  function goBack(): void {
    step = 'email';
    otpDigits = ['', '', '', '', '', ''];
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

      {#if step === 'email'}
        <!-- ── Step 1 — Email input ── -->

        <h1 class="text-xl font-bold mb-1"
            style="font-family: 'Syne', sans-serif">
          Collector Login
        </h1>
        <p class="text-sm mb-6" style="color: var(--text-muted)">
          Enter your email to receive a login code
        </p>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                   style="font-family: 'DM Mono', monospace; color: var(--text-soft)"
                   for="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              bind:value={email}
              placeholder="collector@gmail.com"
              class="w-full px-4 py-3 rounded-xl text-sm outline-none
                     transition-colors"
              style="background: var(--surface-2); border: 1px solid var(--border);
                     color: var(--text)"
              onkeydown={(e) => e.key === 'Enter' && requestOtp()}
            />
          </div>

          <button
            onclick={requestOtp}
            disabled={requesting}
            class="w-full py-3 rounded-xl text-sm font-semibold
                   transition-opacity disabled:opacity-60 flex items-center
                   justify-center gap-2"
            style="background: var(--accent); color: var(--ink)"
          >
            {#if requesting}
              <span class="w-4 h-4 border-2 rounded-full animate-spin"
                    style="border-color: var(--ink); border-top-color: transparent">
              </span>
              Sending...
            {:else}
              Send Login Code
            {/if}
          </button>
        </div>

      {:else}
        <!-- ── Step 2 — OTP input ── -->

        <button
          onclick={goBack}
          class="flex items-center gap-1 text-xs mb-5 transition-opacity hover:opacity-70"
          style="color: var(--text-muted)"
        >
          ← Back
        </button>

        <h1 class="text-xl font-bold mb-1"
            style="font-family: 'Syne', sans-serif">
          Check your email
        </h1>
        <p class="text-sm mb-1" style="color: var(--text-muted)">
          We sent a 6-digit code to
        </p>
        <p class="text-sm font-medium mb-6" style="color: var(--text)">
          {email}
        </p>

        <!-- 6 digit boxes -->
        <div class="flex gap-2 mb-6" onpaste={onOtpPaste}>
          {#each otpDigits as digit, i (i)}
            <input
              id="otp-{i}"
              type="text"
              inputmode="numeric"
              maxlength="1"
              value={digit}
              oninput={(e) => onOtpInput(i, e)}
              onkeydown={(e) => onOtpKeydown(i, e)}
              class="w-full aspect-square text-center text-xl font-bold
                     rounded-xl outline-none transition-all"
              style="background: var(--surface-2);
                     border: 2px solid {digit ? 'var(--accent)' : 'var(--border)'};
                     color: var(--text);
                     font-family: 'DM Mono', monospace"
            />
          {/each}
        </div>

        <!-- Verify button -->
        <button
          onclick={verifyOtp}
          disabled={verifying || otp.length !== 6}
          class="w-full py-3 rounded-xl text-sm font-semibold
                 transition-opacity disabled:opacity-60 flex items-center
                 justify-center gap-2 mb-4"
          style="background: var(--accent); color: var(--ink)"
        >
          {#if verifying}
            <span class="w-4 h-4 border-2 rounded-full animate-spin"
                  style="border-color: var(--ink); border-top-color: transparent">
            </span>
            Verifying...
          {:else}
            Verify Code
          {/if}
        </button>

        <!-- Resend -->
        <div class="text-center text-sm" style="color: var(--text-muted)">
          Did not receive it?
          {#if cooldown > 0}
            <span style="color: var(--text-muted)">
              Resend in {cooldown}s
            </span>
          {:else}
            <button
              onclick={resendOtp}
              class="font-medium underline transition-opacity hover:opacity-70"
              style="color: var(--text)"
            >
              Resend code
            </button>
          {/if}
        </div>

      {/if}
    </div>

    <!-- Footer note -->
    <p class="text-center text-xs mt-6" style="color: var(--text-muted)">
      {#if step === 'email'}
        Don't have an account?
        <a href="/register" class="font-medium" style="color: var(--accent)">
          Register here
        </a>
      {:else}
        <button
          onclick={goBack}
          class="font-medium"
          style="color: var(--accent); background: none; border: none; cursor: pointer"
        >
          Use a different email
        </button>
      {/if}
    </p>

  </div>
</div>