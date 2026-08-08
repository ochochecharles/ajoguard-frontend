<script lang="ts">
  import { onMount } from 'svelte';
  import { members as membersApi, contributions as contribApi, type PublicMember } from '$lib/api';
  import { getCollector } from '$lib/auth';
  import { naira, fmtDate } from '$lib/utils';
  import { addToast } from '$lib/stores/toast.store';
  import EmptyState from '$lib/components/EmptyState.svelte';

  // ─── Types ───────────────────────────────────────────────

  interface RecentContrib {
    eventId:    string;
    amount:     number; // naira
    channel:    string;
    receivedAt: string;
    memberName: string;
  }

  let loading     = $state(true);
  let submitting  = $state(false);
  let memberList  = $state<PublicMember[]>([]);
  let recent      = $state<RecentContrib[]>([]);

  // Form fields — the web form always records through the WEB channel
  let form = $state({
    memberId: '',
    amount:   '',
  });

  // ─── Load data ───────────────────────────────────────────

  onMount(async () => {
    const collector = getCollector();
    if (!collector) return;

    try {
      // Load active regular members only.
      // Collectors cannot contribute to themselves.
      const all = await membersApi.byGroup(collector.groupId, 1, 100);
      memberList = all.data.filter(
        m => m.role === 'MEMBER' && m.status === 'ACTIVE'
      );
    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      loading = false;
    }
  });

  // ─── Submit contribution ─────────────────────────────────

  async function submitContribution(): Promise<void> {
    const collector = getCollector();
    if (!collector) return;

    // Validation
    if (!form.memberId) {
      addToast('Please select a member', 'error');
      return;
    }

    const amount = Number(form.amount);
    if (!form.amount || !Number.isInteger(amount) || amount < 1) {
      addToast('Enter the amount as a whole number of Naira (e.g. 5000)', 'error');
      return;
    }

    submitting = true;

    try {
      const result = await contribApi.ingestWeb({
        groupId:  collector.groupId,
        memberId: form.memberId,
        amount,        // integer naira — backend converts to kobo
        channel:  'WEB',
      });

      // Find member name for recent activity
      const member = memberList.find(m => m.id === form.memberId);

      // Add to recent activity list
      recent = [
        {
          eventId:    result.eventId,
          memberName: member?.name ?? 'Unknown',
          amount:     result.amount,
          channel:    result.channel,
          receivedAt: result.receivedAt,
        },
        ...recent,
      ].slice(0, 10); // keep last 10

      addToast(
        `${naira(result.amount)} recorded for ${member?.name}`,
        'success'
      );

      // Reset form
      form.memberId = '';
      form.amount   = '';

    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      submitting = false;
    }
  }
</script>

<!-- ─── 1 col on mobile, 2 on desktop ──────────────────────────────── -->

<div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

  <!-- Left — Contribution form -->
  <div class="rounded-2xl p-6" style="background: white; border: 1px solid var(--border)">

    <h2 class="font-bold mb-5 text-sm" style="font-family: 'Syne', sans-serif">
      Record Contribution
    </h2>

    {#if loading}
      <div class="flex items-center justify-center py-16">
        <div class="w-7 h-7 rounded-full border-2 animate-spin"
             style="border-color: var(--border); border-top-color: var(--accent)">
        </div>
      </div>

    {:else}

      <div class="space-y-4">

        <!-- Member select -->
        <div>
          <label for="memberId" class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                 style="font-family: 'DM Mono', monospace; color: var(--text-soft)">
            Member (who paid)
          </label>
          <select
            id="memberId"
            bind:value={form.memberId}
            class="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
            style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
          >
            <option value="" disabled>Select a member...</option>
            {#each memberList as member (member.id)}
              <option value={member.id}>
                {member.name}{member.phoneNumber ? ` — ${member.phoneNumber}` : ''}
              </option>
            {/each}
          </select>

          {#if memberList.length === 0}
            <p class="text-xs mt-1.5" style="color: var(--text-muted)">
              No active members found. Add members first.
            </p>
          {/if}
        </div>

        <!-- Amount -->
        <div>
          <label for="amount" class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                 style="font-family: 'DM Mono', monospace; color: var(--text-soft)">
            Amount (₦ Naira)
          </label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium"
                  style="color: var(--text-muted)">
              ₦
            </span>
            <input
              id="amount"
              type="number"
              bind:value={form.amount}
              placeholder="5000"
              min="1"
              step="1"
              class="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
              style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
              onkeydown={(e) => e.key === 'Enter' && submitContribution()}
            />
          </div>
          <p class="text-xs mt-1.5" style="color: var(--text-muted)">
            Whole Naira — defaults to the group cycle amount
          </p>
        </div>

        <!-- Channel (fixed — web form) -->
        <div>
          <span class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                style="font-family: 'DM Mono', monospace; color: var(--text-soft)">
            Channel
          </span>
          <div class="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
               style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text-soft)">
            <span class="w-2 h-2 rounded-full" style="background: var(--accent-2)"></span>
            WEB
          </div>
        </div>

        <!-- Submit button -->
        <button
          onclick={submitContribution}
          disabled={submitting || !form.memberId || !form.amount}
          class="w-full py-3 rounded-xl text-sm font-semibold transition-opacity
                 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          style="background: var(--accent); color: var(--ink)"
        >
          {#if submitting}
            <span class="w-4 h-4 rounded-full border-2 animate-spin"
                  style="border-color: var(--ink); border-top-color: transparent">
            </span>
            Recording...
          {:else}
            Record Contribution
          {/if}
        </button>

      </div>

    {/if}
  </div>

  <!-- Right — Recent activity -->
  <div class="rounded-2xl p-6" style="background: white; border: 1px solid var(--border)">

    <h2 class="font-bold mb-5 text-sm" style="font-family: 'Syne', sans-serif">
      Recent Activity
    </h2>

    {#if recent.length === 0}
      <EmptyState
        icon="📝"
        title="No activity yet"
        sub="Contributions you record will appear here"
      />
    {:else}
      <div class="space-y-1">
        {#each recent as item (item.eventId)}
          <div class="flex items-center justify-between py-3"
               style="border-bottom: 1px solid var(--surface-2)">
            <div class="flex items-center gap-3 min-w-0">
              <span class="text-xs font-medium"
                    style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
                WEB
              </span>
              <div class="min-w-0">
                <div class="text-sm font-medium truncate">{item.memberName}</div>
                <div class="text-xs" style="color: var(--text-muted)">
                  {fmtDate(item.receivedAt)}
                </div>
              </div>
            </div>
            <div class="text-sm font-bold shrink-0 ml-3">
              {naira(item.amount)}
            </div>
          </div>
        {/each}
      </div>
    {/if}

  </div>

</div>