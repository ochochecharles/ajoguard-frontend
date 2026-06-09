<script lang="ts">
  import { onMount } from 'svelte';
  import { groups } from '$lib/api';
  import { getCollector } from '$lib/auth';
  import { naira, fmtDate, shortId } from '$lib/utils';
  import { addToast } from '$lib/stores/toast.store';
  import EmptyState from '$lib/components/EmptyState.svelte';

  // ─── Types ───────────────────────────────────────────────

  type AuditEntry  = Awaited<ReturnType<typeof groups.auditHistory>>[number];
  type ChainResult = Awaited<ReturnType<typeof groups.verifyChain>>;

  // ─── State ───────────────────────────────────────────────

  let loading    = $state(true);
  let verifying  = $state(false);
  let entries    = $state<AuditEntry[]>([]);
  let chainResult = $state<ChainResult | null>(null);

  // ─── Load audit history ──────────────────────────────────

  onMount(async () => {
    const collector = getCollector();
    if (!collector) return;

    try {
      entries = await groups.auditHistory(collector.groupId);
    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      loading = false;
    }
  });

  // ─── Verify chain ────────────────────────────────────────

  async function verifyChain(): Promise<void> {
    const collector = getCollector();
    if (!collector) return;

    verifying = true;
    chainResult = null;

    try {
      chainResult = await groups.verifyChain(collector.groupId);

      if (chainResult.valid) {
        addToast('Audit chain verified — no tampering detected', 'success');
      } else {
        addToast('Chain integrity compromised', 'error');
      }
    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      verifying = false;
    }
  }
</script>

<!-- ─── Loading ────────────────────────────────────────── -->

{#if loading}
  <div class="flex items-center justify-center h-64">
    <div class="w-8 h-8 rounded-full border-2 animate-spin"
         style="border-color: var(--border); border-top-color: var(--accent)">
    </div>
  </div>

{:else}

  <!-- Two column layout -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

    <!-- Chain integrity card -->
    <div class="rounded-2xl p-6"
         style="background: white; border: 1px solid var(--border)">

      <h2 class="font-bold mb-4 text-sm" style="font-family: 'Syne', sans-serif">
        Chain Integrity
      </h2>

      <!-- Result display -->
      {#if !chainResult && !verifying}
        <div class="flex flex-col items-center py-8 text-center">
          <div class="text-4xl mb-3">🔐</div>
          <p class="text-sm mb-1 font-medium" style="color: var(--text-soft)">
            Not verified yet
          </p>
          <p class="text-xs" style="color: var(--text-muted)">
            Click the button below to verify the audit chain
          </p>
        </div>

      {:else if verifying}
        <div class="flex flex-col items-center py-8">
          <div class="w-8 h-8 rounded-full border-2 animate-spin mb-3"
               style="border-color: var(--border); border-top-color: var(--accent)">
          </div>
          <p class="text-sm" style="color: var(--text-muted)">
            Verifying {entries.length} entries...
          </p>
        </div>

      {:else if chainResult}
        <div class="flex flex-col items-center py-6 text-center">

          <!-- Result icon -->
          <div class="text-5xl mb-4">
            {chainResult.valid ? '✅' : '❌'}
          </div>

          <!-- Result title -->
          <div class="text-lg font-bold mb-1"
               style="font-family: 'Syne', sans-serif;
                      color: {chainResult.valid ? '#16a34a' : '#dc2626'}">
            {chainResult.valid ? 'Chain Verified' : 'Chain Compromised'}
          </div>

          <!-- Entry count -->
          <div class="text-sm mb-3" style="color: var(--text-muted)">
            {chainResult.totalEntries} entries verified · {fmtDate(new Date())}
          </div>

          <!-- Error detail if broken -->
          {#if !chainResult.valid && chainResult.brokenAt}
            <div class="w-full p-3 rounded-xl text-xs text-left"
                 style="background: #fee2e2; color: #dc2626">
              <div class="font-semibold mb-1">
                Chain broken at entry #{chainResult.brokenAt}
              </div>
              <div>{chainResult.reason}</div>
            </div>
          {/if}

        </div>
      {/if}

      <!-- Verify button -->
      <button
        onclick={verifyChain}
        disabled={verifying}
        class="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity
               disabled:opacity-60 flex items-center justify-center gap-2"
        style="background: var(--ink); color: var(--accent)"
      >
        {#if verifying}
          <span class="w-4 h-4 rounded-full border-2 animate-spin"
                style="border-color: var(--accent); border-top-color: transparent">
          </span>
          Verifying...
        {:else}
          {chainResult ? 'Verify Again' : 'Verify Chain Now'}
        {/if}
      </button>

    </div>

    <!-- About card -->
    <div class="rounded-2xl p-6"
         style="background: white; border: 1px solid var(--border)">

      <h2 class="font-bold mb-4 text-sm" style="font-family: 'Syne', sans-serif">
        About the Audit Log
      </h2>

      <div class="space-y-4 text-sm" style="color: var(--text-muted); line-height: 1.7">

        <p>
          Every contribution is recorded as a tamper-evident entry using
          <strong style="color: var(--text)">SHA256 hash chaining</strong>
          and
          <strong style="color: var(--text)">HMAC signatures</strong>.
        </p>

        <p>
          Each entry contains the hash of the previous entry — linking
          all records into an unbreakable chain. Modifying, deleting,
          or inserting any record breaks the chain immediately.
        </p>

        <div class="rounded-xl p-4 space-y-2"
             style="background: var(--surface-2); font-size: 12px">
          <div class="flex items-start gap-2">
            <span style="color: var(--accent)">✓</span>
            <span>Modified record → hash mismatch detected</span>
          </div>
          <div class="flex items-start gap-2">
            <span style="color: var(--accent)">✓</span>
            <span>Deleted record → chain break detected</span>
          </div>
          <div class="flex items-start gap-2">
            <span style="color: var(--accent)">✓</span>
            <span>Fake record → invalid signature detected</span>
          </div>
          <div class="flex items-start gap-2">
            <span style="color: var(--accent)">✓</span>
            <span>Reordered records → chain break detected</span>
          </div>
        </div>

        <p>
          Use the verification button regularly to confirm all
          records in this group are genuine and unmodified.
        </p>

      </div>
    </div>

  </div>

  <!-- Audit history -->
  <div class="rounded-2xl overflow-hidden"
       style="background: white; border: 1px solid var(--border)">

    <div class="flex items-center justify-between px-6 py-4"
         style="border-bottom: 1px solid var(--border)">
      <h2 class="font-bold text-sm" style="font-family: 'Syne', sans-serif">
        Audit History
      </h2>
      <span class="text-xs" style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
        {entries.length} entries
      </span>
    </div>

    {#if entries.length === 0}
      <EmptyState
        icon="📜"
        title="No audit entries yet"
        sub="Entries appear after contributions are processed"
      />
    {:else}
      <div class="p-6">

        <!-- Chain visual -->
        {#each entries as entry, i (entry.sequenceNum)}
          <div class="flex gap-4">

            <!-- Chain line + dot -->
            <div class="flex flex-col items-center">
              <div class="w-3 h-3 rounded-full shrink-0 mt-1"
                   style="background: var(--accent)">
              </div>
              {#if i < entries.length - 1}
                <div class="w-px flex-1 my-1" style="background: var(--border)"></div>
              {/if}
            </div>

            <!-- Entry content -->
            <div class="flex-1 pb-4">
              <div class="rounded-xl p-4"
                   style="background: var(--surface); border: 1px solid var(--border)">

                <!-- Entry header -->
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-semibold">
                    Entry #{entry.sequenceNum}
                  </span>
                  <span class="text-xs" style="color: var(--text-muted)">
                    {fmtDate(entry.createdAt)}
                  </span>
                </div>

                <!-- Hash -->
                <div class="text-xs mb-2 break-all"
                     style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
                  Hash: {entry.entryHash}
                </div>

                <!-- Entry details -->
                <div class="flex items-center gap-4 text-xs"
                     style="color: var(--text-muted)">
                  <span>
                    Event: <span style="font-family: 'DM Mono', monospace">
                      {shortId(entry.eventId)}
                    </span>
                  </span>
                  {#if entry.entryData && typeof entry.entryData === 'object'}
                    <span>
                      Amount: <strong style="color: var(--text)">
                        {naira((entry.entryData as { amount: number }).amount ?? 0)}
                      </strong>
                    </span>
                    <span>
                      Channel: <strong style="color: var(--text)">
                        {(entry.entryData as { channel: string }).channel ?? '—'}
                      </strong>
                    </span>
                  {/if}
                </div>

              </div>
            </div>

          </div>
        {/each}

      </div>
    {/if}

  </div>

{/if}