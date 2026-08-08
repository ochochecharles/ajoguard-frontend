<script lang="ts">
  import { onMount } from 'svelte';
  import { groups } from '$lib/api';
  import { getCollector } from '$lib/auth';
  import { naira, initials } from '$lib/utils';
  import { addToast } from '$lib/stores/toast.store';
  import Badge from '$lib/components/Badge.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';

  // ─── Types ───────────────────────────────────────────────

  type Summary = Awaited<ReturnType<typeof groups.summary>>;

  // ─── State ───────────────────────────────────────────────

  let loading = $state(true);
  let summary = $state<Summary | null>(null);

  // ─── Derived values ──────────────────────────────────────

  // Expected total = cycle amount × number of members
  let totalExpected = $derived(
    summary ? summary.cycleAmount * summary.totalMembers : 0
  );

  // How much has been collected vs expected
  let collectionPct = $derived(() => {
    if (!summary || totalExpected === 0) return 0;
    return Math.min(100, Math.round((summary.totalCollectedEver / totalExpected) * 100));
  });

  // Members who have not paid yet
  let missingMembers = $derived(
    summary?.members.filter(m => m.contributionCount === 0 && m.role === 'MEMBER') ?? []
  );

  // Members who have paid
  let paidMembers = $derived(
    summary?.members.filter(m => m.contributionCount > 0 && m.role === 'MEMBER') ?? []
  );

  // Overall group status
  let groupStatus = $derived(missingMembers.length === 0 ? 'HEALTHY' : 'DISCREPANCY');

  // Next payout recipient
  let nextRecipient = $derived(
    summary?.members.find(m => m.payoutOrder === summary?.currentPosition)
  );

  // ─── Load data ───────────────────────────────────────────

  onMount(async () => {
    const collector = getCollector();
    if (!collector) return;

    try {
      summary = await groups.summary(collector.groupId);
    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      loading = false;
    }
  });

  // ─── Helpers ─────────────────────────────────────────────

  function payoutVariant(received: boolean) {
    return received ? 'green' : 'yellow';
  }
</script>

<!-- ─── Loading ────────────────────────────────────────── -->

{#if loading}
  <div class="flex items-center justify-center h-64">
    <div class="w-8 h-8 rounded-full border-2 animate-spin"
         style="border-color: var(--border); border-top-color: var(--accent)">
    </div>
  </div>

<!-- ─── No data ────────────────────────────────────────── -->

{:else if !summary}
  <EmptyState
    icon="📊"
    title="Could not load reconciliation"
    sub="Check your connection and refresh the page"
  />

<!-- ─── Content ────────────────────────────────────────── -->

{:else}

  <!-- Stat cards -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

    <!-- Expected total -->
    <div class="rounded-2xl p-5 relative overflow-hidden"
         style="background: white; border: 1px solid var(--border)">
      <div class="absolute bottom-0 left-0 right-0 h-0.5"
           style="background: var(--accent)"></div>
      <div class="text-xs uppercase tracking-widest mb-3"
           style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
        Expected Total
      </div>
      <div class="text-2xl font-bold"
           style="font-family: 'Syne', sans-serif; letter-spacing: -0.5px">
        {naira(totalExpected)}
      </div>
      <div class="text-xs mt-1" style="color: var(--text-muted)">
        {summary.totalMembers} members × {naira(summary.cycleAmount)}
      </div>
    </div>

    <!-- Actually collected -->
    <div class="rounded-2xl p-5 relative overflow-hidden"
         style="background: white; border: 1px solid var(--border)">
      <div class="absolute bottom-0 left-0 right-0 h-0.5"
           style="background: var(--accent-2)"></div>
      <div class="text-xs uppercase tracking-widest mb-3"
           style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
        Actually Collected
      </div>
      <div class="text-2xl font-bold"
           style="font-family: 'Syne', sans-serif; letter-spacing: -0.5px">
        {naira(summary.totalCollectedEver)}
      </div>
      <div class="text-xs mt-1" style="color: var(--text-muted)">
        Processed contributions
      </div>
    </div>

    <!-- Compliance rate -->
    <div class="rounded-2xl p-5 relative overflow-hidden"
         style="background: white; border: 1px solid var(--border)">
      <div class="absolute bottom-0 left-0 right-0 h-0.5"
           style="background: var(--accent-3)"></div>
      <div class="text-xs uppercase tracking-widest mb-3"
           style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
        Compliance Rate
      </div>
      <div class="text-2xl font-bold"
           style="font-family: 'Syne', sans-serif; letter-spacing: -0.5px">
        {collectionPct()}%
      </div>
      <div class="text-xs mt-1" style="color: var(--text-muted)">
        {paidMembers.length} of {summary.totalMembers} paid
      </div>
    </div>

    <!-- Next payout -->
    <div class="rounded-2xl p-5 relative overflow-hidden"
         style="background: white; border: 1px solid var(--border)">
      <div class="absolute bottom-0 left-0 right-0 h-0.5"
           style="background: #c084fc"></div>
      <div class="text-xs uppercase tracking-widest mb-3"
           style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
        Next Payout
      </div>
      <div class="text-xl font-bold truncate"
           style="font-family: 'Syne', sans-serif; letter-spacing: -0.5px">
        {nextRecipient?.name ?? 'TBD'}
      </div>
      <div class="text-xs mt-1" style="color: var(--text-muted)">
        Position #{summary.currentPosition}
      </div>
    </div>

  </div>

  <!-- Group status + progress bar -->
  <div class="rounded-2xl p-6 mb-4"
       style="background: white; border: 1px solid var(--border)">

    <div class="flex items-center justify-between mb-4">
      <h2 class="font-bold text-sm" style="font-family: 'Syne', sans-serif">
        Collection Progress
      </h2>
      <Badge
        text={groupStatus}
        variant={groupStatus === 'HEALTHY' ? 'green' : 'red'}
      />
    </div>

    <!-- Progress bar -->
    <div class="h-3 rounded-full overflow-hidden mb-2"
         style="background: var(--surface-3)">
      <div class="h-full rounded-full transition-all duration-700"
           style="width: {collectionPct()}%;
                  background: {groupStatus === 'HEALTHY' ? 'var(--accent)' : 'var(--accent-3)'}">
      </div>
    </div>

    <div class="flex justify-between text-xs" style="color: var(--text-muted)">
      <span>₦0</span>
      <span>{collectionPct()}% collected</span>
      <span>{naira(totalExpected)} target</span>
    </div>

    <!-- Missing members alert -->
    {#if missingMembers.length > 0}
      <div class="mt-4 p-4 rounded-xl"
           style="background: #fff7ed; border: 1px solid #fed7aa">
        <div class="text-sm font-semibold mb-2" style="color: #9a3412">
          ⚠️ {missingMembers.length} member{missingMembers.length !== 1 ? 's have' : ' has'} not paid this cycle
        </div>
        <div class="flex flex-wrap gap-2">
          {#each missingMembers as m (m.id)}
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
                 style="background: #fee2e2; color: #dc2626">
              <div class="w-4 h-4 rounded-full flex items-center justify-center font-bold"
                   style="background: #dc2626; color: white; font-size: 8px">
                {initials(m.name)}
              </div>
              {m.name}
            </div>
          {/each}
        </div>
      </div>
    {/if}

  </div>

  <!-- Member payment status table -->
  <div class="rounded-2xl overflow-x-auto"
       style="background: white; border: 1px solid var(--border)">

    <div class="px-6 py-4" style="border-bottom: 1px solid var(--border)">
      <h2 class="font-bold text-sm" style="font-family: 'Syne', sans-serif">
        Member Payment Status
      </h2>
    </div>

    {#if summary.members.length === 0}
      <EmptyState icon="👥" sub="No members in this group yet" />
    {:else}
      <table class="w-full text-sm min-w-[600px]">
        <thead>
          <tr style="border-bottom: 1px solid var(--border)">
            <th class="text-left px-6 py-3 text-xs uppercase tracking-widest font-medium"
                style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
              Member
            </th>
            <th class="text-left px-6 py-3 text-xs uppercase tracking-widest font-medium"
                style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
              Total Contributed
            </th>
            <th class="text-left px-6 py-3 text-xs uppercase tracking-widest font-medium"
                style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
              Contributions
            </th>
            <th class="text-left px-6 py-3 text-xs uppercase tracking-widest font-medium"
                style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
              Payment
            </th>
            <th class="text-left px-6 py-3 text-xs uppercase tracking-widest font-medium"
                style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
              Payout Received
            </th>
            <th class="text-left px-6 py-3 text-xs uppercase tracking-widest font-medium"
                style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
              Position
            </th>
          </tr>
        </thead>
        <tbody>
          {#each summary.members as member (member.id)}
            <tr class="transition-colors hover:bg-gray-50"
                style="border-bottom: 1px solid var(--surface-2)">

              <!-- Member -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center
                              text-xs font-bold shrink-0"
                       style="background: var(--ink); color: var(--accent);
                              font-family: 'Syne', sans-serif">
                    {initials(member.name)}
                  </div>
                  <div>
                    <div class="font-medium">{member.name}</div>
                    <div class="text-xs" style="color: var(--text-muted)">
                      {member.role}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Total contributed -->
              <td class="px-6 py-4 font-semibold">
                {naira(member.totalContributed)}
              </td>

              <!-- Contribution count -->
              <td class="px-6 py-4" style="color: var(--text-muted)">
                {member.contributionCount}
              </td>

              <!-- Payment status -->
              <td class="px-6 py-4">
                {#if member.role === 'COLLECTOR'}
                  <span class="text-xs" style="color: var(--text-muted)">N/A</span>
                {:else if member.contributionCount > 0}
                  <Badge text="PAID" variant="green" />
                {:else}
                  <Badge text="MISSING" variant="red" />
                {/if}
              </td>

              <!-- Payout received -->
              <td class="px-6 py-4">
                <Badge
                  text={member.hasReceivedPayout ? 'RECEIVED' : 'PENDING'}
                  variant={payoutVariant(member.hasReceivedPayout)}
                />
              </td>

              <!-- Payout position -->
              <td class="px-6 py-4"
                  style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
                {member.payoutOrder ? `#${member.payoutOrder}` : '—'}
              </td>

            </tr>
          {/each}
        </tbody>
      </table>
    {/if}

  </div>

{/if}