<script lang="ts">
  import { onMount } from 'svelte';
  import { groups, contributions } from '$lib/api';
  import { getCollector } from '$lib/auth';
  import { naira, shortId, initials } from '$lib/utils';
  import { addToast } from '$lib/stores/toast.store';
  import Badge from '$lib/components/Badge.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';

  // ─── State ───────────────────────────────────────────────

  let loading = $state(true);
  let summary = $state<Awaited<ReturnType<typeof groups.summary>> | null>(null);
  let contribs = $state<Awaited<ReturnType<typeof contributions.byGroup>> | null>(null);

  // ─── Load data ───────────────────────────────────────────

  onMount(async () => {
    const collector = getCollector();
    if (!collector) return;

    try {
      // Fetch both at the same time using Promise.all
      // This is faster than fetching one after the other
      const [summaryData, contribData] = await Promise.all([
        groups.summary(collector.groupId),
        contributions.byGroup(collector.groupId),
      ]);

      summary = summaryData;
      contribs = contribData;
    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      loading = false;
    }
  });

  // ─── Derived values ──────────────────────────────────────

  // Total contribution count (uses server total, page-limited if not loaded)
  let contribCount = $derived(contribs ? (contribs.total ?? contribs.data.length) : 0);

  // Payment compliance percentage
  let compliancePct = $derived(() => {
    if (!summary) return 0;
    const paid = summary.members.filter(m => m.contributionCount > 0).length;
    const total = summary.totalMembers || 1;
    return Math.round((paid / total) * 100);
  });

  // Recent contributions — last 8 only
  let recentContribs = $derived(contribs?.data.slice(0, 8) ?? []);

  // Channel badge variant mapping
  function channelVariant(channel: string) {
    const map: Record<string, 'blue' | 'purple' | 'green'> = {
      WEB:       'blue',
      SMS:       'purple',
      WHATSAPP:  'green',
    };
    return map[channel] ?? 'blue';
  }

  // Status badge variant mapping
  function statusVariant(status: string) {
    const map: Record<string, 'green' | 'yellow' | 'red'> = {
      PROCESSED: 'green',
      PENDING:   'yellow',
      FAILED:    'red',
    };
    return map[status] ?? 'yellow';
  }

  // Resolve member name from summary members array
  function memberName(memberId: string): string {
    const member = summary?.members.find(m => m.id === memberId);
    return member?.name ?? shortId(memberId);
  }

  // Find next payout recipient
  let nextRecipient = $derived(
    summary?.members.find(m => m.payoutOrder === summary?.currentPosition)
  );
</script>

<!-- ─── Loading state ──────────────────────────────────── -->

{#if loading}
  <div class="flex items-center justify-center h-64">
    <div class="flex flex-col items-center gap-3">
      <div class="w-8 h-8 rounded-full border-2 animate-spin"
           style="border-color: var(--border); border-top-color: var(--accent)">
      </div>
      <p class="text-sm" style="color: var(--text-muted)">Loading dashboard...</p>
    </div>
  </div>

<!-- ─── No data ────────────────────────────────────────── -->

{:else if !summary}
  <EmptyState
    icon="📊"
    title="Could not load dashboard"
    sub="Check your connection and refresh the page"
  />

<!-- ─── Dashboard content ─────────────────────────────── -->

{:else}

  <!-- Stat cards: 2 cols on mobile, 4 on desktop -->
  <div class="grid grid-cols-4 lg:grid-cols-4 gap-4 mb-6">

    <!-- Total Collected -->
    <div class="rounded-2xl p-5 relative overflow-hidden"
         style="background: white; border: 1px solid var(--border)">
      <div class="absolute bottom-0 left-0 right-0 h-0.5"
           style="background: var(--accent)"></div>
      <div class="text-xs uppercase tracking-widest mb-3"
           style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
        Total Collected
      </div>
      <div class="text-2xl font-bold" style="font-family: 'Syne', sans-serif; letter-spacing: -0.5px">
        {naira(summary.totalCollectedEver)}
      </div>
      <div class="text-xs mt-1" style="color: var(--text-muted)">All time</div>
    </div>

    <!-- Current Balance -->
    <div class="rounded-2xl p-5 relative overflow-hidden"
         style="background: white; border: 1px solid var(--border)">
      <div class="absolute bottom-0 left-0 right-0 h-0.5"
           style="background: var(--accent-2)"></div>
      <div class="text-xs uppercase tracking-widest mb-3"
           style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
        Current Balance
      </div>
      <div class="text-2xl font-bold" style="font-family: 'Syne', sans-serif; letter-spacing: -0.5px">
        {naira(summary.balance)}
      </div>
      <div class="text-xs mt-1" style="color: var(--text-muted)">After payouts</div>
    </div>

    <!-- Active Members -->
    <div class="rounded-2xl p-5 relative overflow-hidden"
         style="background: white; border: 1px solid var(--border)">
      <div class="absolute bottom-0 left-0 right-0 h-0.5"
           style="background: var(--accent-3)"></div>
      <div class="text-xs uppercase tracking-widest mb-3"
           style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
        Active Members
      </div>
      <div class="text-2xl font-bold" style="font-family: 'Syne', sans-serif; letter-spacing: -0.5px">
        {summary.totalMembers}
      </div>
      <div class="text-xs mt-1" style="color: var(--text-muted)">In this group</div>
    </div>

    <!-- Contributions -->
    <div class="rounded-2xl p-5 relative overflow-hidden"
         style="background: white; border: 1px solid var(--border)">
      <div class="absolute bottom-0 left-0 right-0 h-0.5"
           style="background: #c084fc"></div>
      <div class="text-xs uppercase tracking-widest mb-3"
           style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
        Contributions
      </div>
      <div class="text-2xl font-bold" style="font-family: 'Syne', sans-serif; letter-spacing: -0.5px">
        {contribCount}
      </div>
      <div class="text-xs mt-1" style="color: var(--text-muted)">Processed</div>
    </div>

  </div>

  <!-- Two column section: 1 col on mobile, 2 on desktop -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

    <!-- Recent contributions -->
    <div class="rounded-2xl p-6" style="background: white; border: 1px solid var(--border)">
      <h2 class="font-bold mb-4 text-sm"
          style="font-family: 'Syne', sans-serif">
        Recent Contributions
      </h2>

      {#if recentContribs.length === 0}
        <EmptyState icon="📋" sub="No contributions yet" />
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr>
                <th class="text-left pb-3 text-xs uppercase tracking-widest"
                    style="font-family: 'DM Mono', monospace; color: var(--text-muted);
                           border-bottom: 1px solid var(--border)">
                  Member
                </th>
                <th class="text-left pb-3 text-xs uppercase tracking-widest"
                    style="font-family: 'DM Mono', monospace; color: var(--text-muted);
                           border-bottom: 1px solid var(--border)">
                  Amount
                </th>
                <th class="text-left pb-3 text-xs uppercase tracking-widest"
                    style="font-family: 'DM Mono', monospace; color: var(--text-muted);
                           border-bottom: 1px solid var(--border)">
                  Channel
                </th>
                <th class="text-left pb-3 text-xs uppercase tracking-widest"
                    style="font-family: 'DM Mono', monospace; color: var(--text-muted);
                           border-bottom: 1px solid var(--border)">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {#each recentContribs as contrib (contrib.id)}
                <tr style="border-bottom: 1px solid var(--surface-2)">
                  <td class="py-3 pr-4">
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded-full flex items-center justify-center
                                  text-xs font-bold shrink-0"
                           style="background: var(--ink); color: var(--accent);
                                  font-family: 'Syne', sans-serif; font-size: 9px">
                        {initials(memberName(contrib.memberId))}
                      </div>
                      <span class="truncate max-w-24">
                        {memberName(contrib.memberId)}
                      </span>
                    </div>
                  </td>
                  <td class="py-3 pr-4 font-semibold">
                    {naira(contrib.amount)}
                  </td>
                  <td class="py-3 pr-4">
                    <Badge text={contrib.channel} variant={channelVariant(contrib.channel)} />
                  </td>
                  <td class="py-3">
                    <Badge text={contrib.status} variant={statusVariant(contrib.status)} />
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>

    <!-- Member overview -->
    <div class="rounded-2xl p-6" style="background: white; border: 1px solid var(--border)">
      <h2 class="font-bold mb-4 text-sm" style="font-family: 'Syne', sans-serif">
        Member Overview
      </h2>

      {#if summary.members.length === 0}
        <EmptyState icon="👥" sub="No members yet" />
      {:else}
        <div class="space-y-1 overflow-y-auto max-h-64">
          {#each summary.members as member (member.id)}
            <div class="flex items-center gap-3 py-2.5 px-1"
                 style="border-bottom: 1px solid var(--surface-2)">
              <!-- Avatar -->
              <div class="w-8 h-8 rounded-full flex items-center justify-center
                          text-xs font-bold shrink-0"
                   style="background: var(--ink); color: var(--accent);
                          font-family: 'Syne', sans-serif">
                {initials(member.name)}
              </div>
              <!-- Name and role -->
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{member.name}</div>
                <div class="text-xs" style="color: var(--text-muted)">{member.role}</div>
              </div>
              <!-- Total contributed -->
              <div class="text-right shrink-0">
                <div class="text-sm font-semibold">{naira(member.totalContributed)}</div>
                <div class="text-xs" style="color: var(--text-muted)">
                  {member.contributionCount} contributions
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

  </div>

  <!-- Group health card -->
  <div class="rounded-2xl p-6" style="background: white; border: 1px solid var(--border)">
    <h2 class="font-bold mb-4 text-sm" style="font-family: 'Syne', sans-serif">
      Group Health
    </h2>

    <!-- Progress bar -->
    <div class="mb-4">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm font-medium">Payment compliance</span>
        <span class="text-sm" style="font-family: 'DM Mono', monospace">
          {summary.members.filter(m => m.contributionCount > 0).length}/{summary.totalMembers} members
        </span>
      </div>
      <div class="h-2 rounded-full overflow-hidden" style="background: var(--surface-3)">
        <div class="h-full rounded-full transition-all duration-700"
             style="width: {compliancePct()}%; background: var(--accent)">
        </div>
      </div>
      <div class="text-xs mt-1.5" style="color: var(--text-muted)">
        {compliancePct()}% of members have contributed
      </div>
    </div>

    <!-- Stats row -->
    <div class="flex gap-8 pt-4" style="border-top: 1px solid var(--surface-2)">
      <div>
        <div class="text-xs uppercase tracking-widest mb-1"
             style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
          Cycle
        </div>
        <div class="text-sm font-semibold capitalize">{summary.cycleInterval}</div>
      </div>
      <div>
        <div class="text-xs uppercase tracking-widest mb-1"
             style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
          Per Member
        </div>
        <div class="text-sm font-semibold">{naira(summary.cycleAmount)}</div>
      </div>
      <div>
        <div class="text-xs uppercase tracking-widest mb-1"
             style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
          Total Paid Out
        </div>
        <div class="text-sm font-semibold">{naira(summary.totalPaidOut)}</div>
      </div>
      <div>
        <div class="text-xs uppercase tracking-widest mb-1"
             style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
          Next Payout
        </div>
        <div class="text-sm font-semibold">
          {nextRecipient?.name ?? 'TBD'}
        </div>
      </div>
    </div>

  </div>

{/if}