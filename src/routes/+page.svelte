<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { isAuthenticated } from '$lib/auth';

	interface LandingCard {
		n: string;
		t: string;
		d: string;
	}

	interface ChainEntry {
		id: string;
		who: string;
		amt: string;
		ok: boolean;
	}

	const features: LandingCard[] = [
		{ n: '01', t: 'Contribution tracking', d: 'Record exactly who paid and who skipped, with kobo-safe amounts — weekly, bi-weekly or monthly cycles.' },
		{ n: '02', t: 'Simple join codes', d: 'Hand out a single join code. Members sign in with Google and are matched to the right group instantly.' },
		{ n: '03', t: 'Tamper-evident audit', d: 'Every entry is hashed into a chain — any alteration is immediately detectable and verifiable.' },
		{ n: '04', t: 'Reconciliation at a glance', d: 'Cycle balances, pools and payout readiness in one clean view. Spot gaps before they become arguments.' },
		{ n: '05', t: 'Verifiable exports', d: 'Publish PDF or CSV reports to the group. Members know the numbers match what the chain says.' },
		{ n: '06', t: 'Web & Telegram', d: 'Log from the dashboard or right inside Telegram — whichever the collectors in your group prefer.' },
	];

	const howSteps: LandingCard[] = [
		{ n: '1', t: 'Start or join a group', d: 'Create your group with a phone number and a cycle, or use a join code to be pulled in as a member.' },
		{ n: '2', t: 'Add members', d: 'Add each saver and share the group join code so they can sign in and see the same numbers.' },
		{ n: '3', t: 'Log contributions', d: 'Collectors record payments through the web form or Telegram. Amounts are stored in the exact kobo.' },
		{ n: '4', t: 'Payout & prove it', d: 'Allocate payouts, then export a verified PDF or CSV — every transaction chained and auditable.' },
	];

	const chainSample: ChainEntry[] = [
		{ id: '#a1f9', who: 'Member #12 · Afolabi', amt: '+ ₦5,000', ok: true },
		{ id: '#b3c7', who: 'Member #07 · Chioma', amt: '+ ₦5,000', ok: true },
		{ id: '#c2e0', who: 'Payout → Afolabi', amt: '− ₦200,000', ok: true },
	];

	onMount(() => {
		if (browser && isAuthenticated()) {
			window.location.href = '/app';
		}
	});
</script>

<svelte:head>
  <title>AjoGuard — Savings Intelligence for Ajo Groups</title>
  <meta
    name="description"
    content="Track contributions, manage payouts, and keep a tamper-evident audit trail for your ajo group. From your browser or any phone."
  />
</svelte:head>

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<div style="background: var(--ink); color: #eef0ff; font-family: 'DM Sans', sans-serif">

  <!-- ── NAV ─────────────────────────────────────────────── -->
  <header
    class="fixed top-0 inset-x-0 z-40 transition-all"
    style="background: rgba(10,10,15,0.78); backdrop-filter: blur(14px);
           border-bottom: 1px solid var(--ink-muted)"
  >
    <div class="max-w-6xl mx-auto flex items-center justify-between px-5 lg:px-8 py-4">
      <a href="/" class="flex items-center gap-2 no-underline">
        <span class="w-2.5 h-2.5 rounded-sm shrink-0" style="background: var(--accent)"></span>
        <span class="text-lg font-black" style="font-family: 'Syne', sans-serif; color: #fff">
          Ajo<span style="color: var(--accent)">Guard</span>
        </span>
      </a>

      <nav class="hidden md:flex items-center gap-8 text-sm">
        <a href="#features" class="no-underline transition-colors hover:opacity-60" style="color: #b9b9d1">Features</a>
        <a href="#how" class="no-underline transition-colors hover:opacity-60" style="color: #b9b9d1">How it works</a>
        <a href="#trust" class="no-underline transition-colors hover:opacity-60" style="color: #b9b9d1">Security</a>
      </nav>

      <div class="flex items-center gap-2.5">
        <a
          href="/login"
          class="px-4 py-2 rounded-lg text-sm font-medium no-underline transition-all"
          style="color: #e6e6f2; border: 1px solid var(--ink-muted)"
        >
          Log in
        </a>
        <a
          href="/register"
          class="px-4 py-2 rounded-lg text-sm font-semibold no-underline transition-all hover:brightness-105"
          style="background: var(--accent); color: var(--ink)"
        >
          Start free
        </a>
      </div>
    </div>
  </header>

  <!-- ================== HERO =============================== -->
  <section class="relative overflow-hidden">
    <div
      class="absolute inset-0 pointer-events-none"
      style="
        background-image:
          radial-gradient(600px 320px at 15% -5%, rgba(200,240,60,0.14), transparent 60%),
          radial-gradient(700px 420px at 85% 0%, rgba(60,240,160,0.12), transparent 60%),
          linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
        background-size: auto, auto, 56px 56px, 56px 56px;
        mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent);
      "
    ></div>

    <div class="relative max-w-6xl mx-auto px-5 lg:px-8 pt-36 lg:pt-44 pb-20 lg:pb-28 text-center">
      <div
        class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] tracking-[0.2em] uppercase mb-7"
        style="font-family: 'DM Mono', monospace; color: var(--accent);
               border: 1px solid rgba(199,240,60,0.35); background: rgba(199,240,60,0.08)"
      >
        <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background: var(--accent-2)"></span>
        Savings Intelligence
      </div>

      <h1
        class="max-w-4xl mx-auto text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.04] tracking-tight"
        style="font-family: 'Syne', sans-serif; letter-spacing: -1.5px"
      >
        Run your <em style="font-style: normal; background: linear-gradient(92deg, var(--accent), var(--accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent">ajo</em>
        with total<br class="hidden sm:block" /> transparency.
      </h1>

      <p class="max-w-2xl mx-auto mt-6 text-lg lg:text-xl leading-relaxed" style="color: #a6a6c2">
        Track contributions, manage payouts, and keep a tamper-evident audit
        trail for your savings group — from the browser or any phone.
        No spreadsheets. No doubt.
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
        <a
          href="/register"
          class="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-base no-underline
                 transition-all hover:-translate-y-0.5 shadow-lg"
          style="background: var(--accent); color: var(--ink);
                 box-shadow: 0 12px 40px -12px rgba(199,240,60,0.55)"
        >
          Start your group →
        </a>
        <a
          href="/login"
          class="w-full sm:w-auto px-7 py-3.5 rounded-xl font-medium text-base no-underline transition-all hover:-translate-y-0.5"
          style="color: #fff; border: 1px solid var(--ink-muted); background: var(--ink-soft)"
        >
          I already have a group
        </a>
      </div>

      <div class="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs" style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
        <span>1000 - exact contribution math</span>
        <span class="w-px h-3 hidden sm:block" style="background: var(--ink-muted)"></span>
        <span>Web + Telegram logging</span>
        <span class="w-px h-3 hidden sm:block" style="background: var(--ink-muted)"></span>
        <span>Verifiable audit chain</span>
      </div>
    </div>
  </section>

  <!-- ============== HERO CARD / MOCK ======================= -->
  <section class="relative z-10 -mt-4 pb-24 lg:pb-32">
    <div class="max-w-5xl mx-auto px-5 lg:px-8">
      <div class="rounded-2xl overflow-hidden shadow-2xl" style="border: 1px solid var(--ink-muted); background: var(--ink-soft)">
        <div class="flex items-center justify-between px-5 py-3.5" style="border-bottom: 1px solid var(--ink-muted)">
          <div class="flex items-center gap-2 text-xs" style="font-family: 'DM Mono', monospace; color: #8f8fae">
            <span class="w-2 h-2 rounded-full" style="background: var(--accent)"></span>
            Group · Madina Àjo (weekly)
          </div>
          <div class="flex items-center gap-1.5 text-xs" style="font-family: 'DM Mono', monospace; color: #8f8fae">
            <span class="font-medium" style="color: var(--accent-2)">● Online</span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3 p-5 lg:p-6">
          <div class="p-4 rounded-xl" style="background: var(--ink); border: 1px solid var(--ink-muted)">
            <div class="text-[10px] tracking-widest uppercase mb-1.5" style="font-family: 'DM Mono', monospace; color: var(--text-muted)">Cycle</div>
            <div class="text-lg lg:text-xl font-bold" style="color: #fff">Week 6</div>
            <div class="text-xs text-[#8f8fae]">weekly contributions</div>
          </div>
          <div class="p-4 rounded-xl" style="background: var(--ink); border: 1px solid var(--ink-muted)">
            <div class="text-[10px] tracking-widest uppercase mb-1.5" style="font-family: 'DM Mono', monospace; color: var(--text-muted)">Pool</div>
            <div class="text-lg lg:text-xl font-bold" style="color: var(--accent)">₦ 1,240,000</div>
            <div class="text-xs text-[#8fa08a]">across 40 members</div>
          </div>
          <div class="p-4 rounded-xl" style="background: var(--ink); border: 1px solid var(--ink-muted)">
            <div class="text-[10px] tracking-widest uppercase mb-1.5" style="font-family: 'DM Mono', monospace; color: var(--text-muted)">Next payout</div>
            <div class="text-lg lg:text-xl font-bold" style="color: var(--accent-2)">₦ 124,000</div>
            <div class="text-xs text-[#8faa8f]">in 2 days</div>
          </div>
        </div>

        <div class="px-5 lg:px-6 pb-5 lg:pb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="p-4 rounded-xl" style="background: var(--ink); border: 1px solid var(--ink-muted)">
            <div class="flex items-center justify-between mb-3">
              <div class="text-[10px] tracking-widest uppercase" style="font-family: 'DM Mono', monospace; color: var(--text-muted)">This week</div>
              <div class="text-[10px]" style="font-family: 'DM Mono', monospace; color: var(--accent-2)">+₦ 124,000</div>
            </div>
            <div class="flex items-end gap-1.5 h-16">
              <span class="flex-1 rounded-t" style="height: 34%; background: var(--ink-muted)"></span>
              <span class="flex-1 rounded-t" style="height: 52%; background: var(--ink-muted)"></span>
              <span class="flex-1 rounded-t" style="height: 44%; background: var(--ink-muted)"></span>
              <span class="flex-1 rounded-t" style="height: 70%; background: rgba(199,240,60,0.55)"></span>
              <span class="flex-1 rounded-t" style="height: 80%; background: var(--accent)"></span>
            </div>
          </div>

          <div class="rounded-xl flex flex-col justify-center" style="background: var(--ink); border: 1px solid var(--ink-muted)">
            <div class="px-4 pt-3 text-[10px] tracking-widest uppercase" style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
              Logged via
            </div>
            <div class="px-4 py-3 flex items-center justify-between">
              <div class="text-sm">Web form</div>
              <div class="text-xs" style="font-family: 'DM Mono', monospace; color: var(--accent)">36 txs</div>
            </div>
            <div class="mx-4" style="height: 1px; background: var(--ink-muted)"></div>
            <div class="px-4 py-3 flex items-center justify-between">
              <div class="text-sm">Telegram bot</div>
              <div class="text-xs" style="font-family: 'DM Mono', monospace; color: var(--accent-2)">4 txs</div>
            </div>
            <div class="px-4 pb-3 mt-auto">
              <div class="text-[11px]" style="color: var(--text-muted)">
                ← all entries cryptographically chained
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ================== FEATURES =========================== -->
  <section id="features" class="py-20 lg:py-28" style="background: var(--ink)">
    <div class="max-w-6xl mx-auto px-5 lg:px-8">
      <div class="max-w-2xl mb-14">
        <div class="text-xs tracking-[0.2em] uppercase mb-3" style="font-family: 'DM Mono', monospace; color: var(--accent)">
          01 — Features
        </div>
        <h2 class="text-3xl lg:text-5xl font-extrabold tracking-tight" style="font-family: 'Syne', sans-serif; letter-spacing: -0.5px">
          Everything an ajo needs. Nothing it doesn’t.
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
{#each features as item (item.n)}
          <div
            class="group p-6 rounded-2xl transition-all hover:-translate-y-1"
            style="background: var(--ink); border: 1px solid var(--ink-muted)"
          >
            <div class="flex items-baseline justify-between mb-4">
              <span class="text-xs" style="font-family: 'DM Mono', monospace; color: var(--accent)">{item.n}</span>
              <span class="h-px flex-1 mx-3 self-center" style="background: var(--ink-muted)"></span>
              <span class="text-lg transition-transform group-hover:scale-125" style="color: var(--accent-2)">↗</span>
            </div>
            <div class="text-lg font-bold mb-2" style="font-family: 'Syne', sans-serif; color: #fff">{item.t}</div>
            <div class="text-sm leading-relaxed" style="color: #a3a3c0">{item.d}</div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ================== HOW IT WORKS ======================= -->
  <section id="how" class="py-20 lg:py-28" style="background: var(--surface-2)">
    <div class="max-w-6xl mx-auto px-5 lg:px-8">
      <div class="max-w-2xl mb-14">
        <div class="text-[11px] tracking-[0.2em] uppercase mb-3" style="font-family: 'DM Mono', monospace; color: var(--accent)">
          — How it works
        </div>
        <h2 class="text-3xl lg:text-5xl font-extrabold tracking-tight" style="font-family: 'Syne', sans-serif; letter-spacing: -0.5px">
          Live in under five minutes.
        </h2>
      </div>

      <div class="relative grid grid-cols-1 md:grid-cols-4 gap-6">
        {#each howSteps as item (item.n)}
          <div class="relative">
            <div class="flex items-center gap-3 mb-4">
              <span
                class="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                style="font-family: 'Syne', sans-serif; background: var(--accent); color: var(--ink)"
              >
                {item.n}
              </span>
              {#if item.n !== '4'}
                <span class="hidden md:block h-px flex-1" style="background: var(--border)"></span>
              {/if}
            </div>
            <div class="text-base font-bold mb-1.5" style="font-family: 'Syne', sans-serif">{item.t}</div>
            <div class="text-sm leading-relaxed" style="color: #5b5b78">{item.d}</div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- ================== TRUST / AUDIT ====================== -->
  <section id="trust" class="py-20 lg:py-28" style="background: var(--ink)">
    <div class="max-w-6xl mx-auto px-5 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
      <div>
        <div class="text-[11px] tracking-[0.2em] uppercase mb-3" style="font-family: 'DM Mono', monospace; color: var(--accent)">
          — Trust by design
        </div>
        <h2 class="text-3xl lg:text-5xl font-extrabold tracking-tight leading-tight" style="font-family: 'Syne', sans-serif; letter-spacing: -0.5px">
          The audit trail doesn’t take anyone’s word for it.
        </h2>
        <p class="mt-5 text-lg leading-relaxed max-w-md" style="color: #a6a6c3">
          Every contribution and payout is appended to a chain of SHA-256 hashes.
          Any attempt to rewrite the past breaks the chain — and busters, not
          beliefs, are what keep groups together.
        </p>
        <div class="mt-7 flex flex-col gap-3 text-sm" style="font-family: 'DM Mono', monospace; color: var(--accent-2)">
          <span class="flex items-center gap-2.5"><span class="w-1.5 h-1.5 rounded-full" style="background: var(--accent-2)"></span> Tamper-evident SHA-256 chain</span>
          <span class="flex items-center gap-2.5"><span class="w-1.5 h-1.5 rounded-full" style="background: var(--accent-2)"></span> Restrained math — every naira & kobo accounted for</span>
          <span class="flex items-center gap-2.5"><span class="w-1.5 h-1.5 rounded-full" style="background: var(--accent-2)"></span> Read-only public chain verification</span>
        </div>
      </div>

      <div class="rounded-2xl p-6 lg:p-8" style="background: var(--ink-soft); border: 1px solid var(--ink-muted)">
        <div class="text-[10px] tracking-widest uppercase mb-5" style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
          Chain sample
        </div>
        <div class="space-y-2.5">
          {#each chainSample as entry (entry.id)}
            <div
              class="flex items-center justify-between gap-3 px-4 py-3 rounded-lg"
              style="background: var(--ink); border: 1px solid var(--ink-muted)"
            >
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-xs font-bold shrink-0" style="font-family: 'DM Mono', monospace; color: var(--accent)">{entry.id}</span>
                <span class="text-sm truncate" style="color: #e9e9f5">{entry.who}</span>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <span class="text-sm font-semibold" style="font-family: 'DM Mono', monospace; color: {entry.ok ? 'var(--accent-2)' : 'var(--danger)'}">{entry.amt}</span>
                <span class="w-2 h-2 rounded-full" style="background: {entry.ok ? 'var(--accent-2)' : 'var(--danger)'}"></span>
              </div>
            </div>
          {/each}
        </div>
        <div class="mt-4 px-4 py-3 rounded-xl flex items-center gap-2 text-xs" style="font-family: 'DM Mono', monospace; color: var(--text-muted); background: var(--ink); border: 1px dashed var(--accent)">
          <span style="color: var(--accent)">✓</span> 3 of 12,400 entries verified — chain intact
        </div>
      </div>
    </div>
  </section>

  <!-- ================== CTA ================================ -->
  <section class="py-20 lg:py-28" style="background: var(--surface)">
    <div class="max-w-5xl mx-auto px-5 lg:px-8">
      <div
        class="relative overflow-hidden rounded-3xl p-10 lg:p-16 text-center"
        style="background: linear-gradient(135deg, #1d3d12 0%, #0f2a0c 100%); border: 1px solid rgba(199,240,60,0.30)"
      >
        <div class="absolute inset-0 pointer-events-none" style="background-image: radial-gradient(400px 240px at 80% 0%, rgba(60,240,160,0.16), transparent 60%)"></div>
        <div class="relative">
          <div class="text-[11px] tracking-[0.2em] uppercase mb-4" style="font-family: 'DM Mono', monospace; color: var(--accent)">
            Your group, guarded
          </div>
          <h2 class="text-3xl lg:text-5xl font-extrabold tracking-tight" style="font-family: 'Syne', sans-serif; letter-spacing: -0.5px; color: #fff">
            Ready to run a cleaner ajo?
          </h2>
          <p class="mt-4 max-w-xl mx-auto text-base leading-relaxed" style="color: #c9d9bc">
            Start a group in the next few minutes — or join one with a code.
            Sign-in is just Google.
          </p>
          <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/register"
              class="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold no-underline transition-all hover:-translate-y-0.5"
              style="background: var(--accent); color: var(--ink)"
            >
              Get started →
            </a>
            <a
              href="/login"
              class="w-full sm:w-auto px-8 py-3.5 rounded-xl font-medium no-underline transition-all"
              style="color: #fff; border: 1px solid rgba(255,255,255,0.25)"
            >
              Log in
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ================== FOOTER ============================= -->
  <footer class="py-12 lg:py-16" style="background: var(--ink); border-top: 1px solid var(--ink-muted)">
    <div class="max-w-6xl mx-auto px-5 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background: var(--accent)"></span>
          <span class="text-base font-black" style="font-family: 'Syne', sans-serif; color: #fff">
            Ajo<span style="color: var(--accent)">Guard</span>
          </span>
        </div>
        <div class="mt-2 text-xs" style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
          Savings Intelligence — a record-keeping tool for contribution groups.
        </div>
      </div>

      <div class="flex items-center gap-6 text-sm">
        <a href="/login" class="no-underline hover:opacity-70" style="color: #b9b9d5">Log in</a>
        <a href="/register" class="no-underline hover:opacity-70" style="color: #b9b9d5">Start free</a>
      </div>

      <div class="text-xs" style="font-family: 'DM Mono', monospace; color: #565675">
        © {new Date().getFullYear()} AjoGuard — not a bank.
      </div>
    </div>
  </footer>
</div>
<!-- eslint-enable svelte/no-navigation-without-resolve -->