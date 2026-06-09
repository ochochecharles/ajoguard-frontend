<script lang="ts">
  import { onMount } from 'svelte';
  import { contributions as contribApi, members as membersApi } from '$lib/api';
  import { getCollector } from '$lib/auth';
  import { naira, fmtDate, shortId } from '$lib/utils';
  import { addToast } from '$lib/stores/toast.store';
  import Badge from '$lib/components/Badge.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';

  // ─── Types ───────────────────────────────────────────────

  type Contribution = Awaited<ReturnType<typeof contribApi.byGroup>>[number];
  type Member = Awaited<ReturnType<typeof membersApi.byGroup>>[number];

  // ─── State ───────────────────────────────────────────────

  let loading      = $state(true);
  let contribList  = $state<Contribution[]>([]);
  let memberMap    = $state<Record<string, string>>({});
  let refreshing   = $state(false);

  // Filter state
  let filterStatus  = $state('ALL');
  let filterChannel = $state('ALL');

  // ─── Derived — filtered list ─────────────────────────────

  let filtered = $derived(contribList.filter(c => {
    const statusMatch  = filterStatus  === 'ALL' || c.status  === filterStatus;
    const channelMatch = filterChannel === 'ALL' || c.channel === filterChannel;
    return statusMatch && channelMatch;
  }));

  // ─── Load data ───────────────────────────────────────────

  async function loadData(): Promise<void> {
    const collector = getCollector();
    if (!collector) return;

    try {
      const [contribs, members] = await Promise.all([
        contribApi.byGroup(collector.groupId),
        membersApi.byGroup(collector.groupId),
      ]);

      contribList = contribs;

      // Build a map of memberId → memberName
      // so we can look up names quickly in the table
      memberMap = members.reduce((acc, m) => {
        acc[m.id] = m.name;
        return acc;
      }, {} as Record<string, string>);

    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      loading    = false;
      refreshing = false;
    }
  }

  onMount(loadData);

  async function refresh(): Promise<void> {
    refreshing = true;
    await loadData();
    addToast('Refreshed', 'success');
  }

  // ─── Badge helpers ───────────────────────────────────────

  function statusVariant(status: string) {
    const map: Record<string, 'green' | 'yellow' | 'red'> = {
      PROCESSED: 'green',
      PENDING:   'yellow',
      FAILED:    'red',
    };
    return map[status] ?? 'yellow';
  }

  function channelVariant(channel: string) {
    const map: Record<string, 'blue' | 'purple' | 'green'> = {
      WEB:      'blue',
      SMS:      'purple',
      WHATSAPP: 'green',
    };
    return map[channel] ?? 'blue';
  }
</script>

<!-- ─── Header ─────────────────────────────────────────── -->

<div class="flex items-center justify-between mb-6">
  <p class="text-sm" style="color: var(--text-muted)">
    {filtered.length} of {contribList.length} contribution{contribList.length !== 1 ? 's' : ''}
  </p>

  <div class="flex items-center gap-3">

    <!-- Status filter -->
    <select
      bind:value={filterStatus}
      class="px-3 py-2 rounded-xl text-xs outline-none"
      style="background: white; border: 1px solid var(--border); color: var(--text)"
    >
      <option value="ALL">All Statuses</option>
      <option value="PROCESSED">Processed</option>
      <option value="PENDING">Pending</option>
      <option value="FAILED">Failed</option>
    </select>

    <!-- Channel filter -->
    <select
      bind:value={filterChannel}
      class="px-3 py-2 rounded-xl text-xs outline-none"
      style="background: white; border: 1px solid var(--border); color: var(--text)"
    >
      <option value="ALL">All Channels</option>
      <option value="WEB">Web</option>
      <option value="SMS">SMS</option>
      <option value="WHATSAPP">WhatsApp</option>
    </select>

    <!-- Refresh button -->
    <button
      onclick={refresh}
      disabled={refreshing}
      class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
             font-medium transition-colors disabled:opacity-50"
      style="background: white; border: 1px solid var(--border); color: var(--text)"
    >
      {#if refreshing}
        <span class="w-3.5 h-3.5 rounded-full border-2 animate-spin"
              style="border-color: var(--border); border-top-color: var(--accent)">
        </span>
      {:else}
        ↻
      {/if}
      Refresh
    </button>

  </div>
</div>

<!-- ─── Table ──────────────────────────────────────────── -->

<div class="rounded-2xl overflow-x-auto"
     style="background: white; border: 1px solid var(--border)">

  {#if loading}
    <div class="flex items-center justify-center py-20">
      <div class="w-7 h-7 rounded-full border-2 animate-spin"
           style="border-color: var(--border); border-top-color: var(--accent)">
      </div>
    </div>

  {:else if filtered.length === 0}
    <EmptyState
      icon="📋"
      title={contribList.length === 0 ? 'No contributions yet' : 'No results'}
      sub={contribList.length === 0
        ? 'Contributions will appear here after they are recorded'
        : 'Try changing the filters'}
    />

  {:else}
    <table class="w-full text-sm min-w-150">
      <thead>
        <tr style="border-bottom: 1px solid var(--border)">
          <th class="text-left px-6 py-4 text-xs uppercase tracking-widest font-medium"
              style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
            Reference
          </th>
          <th class="text-left px-6 py-4 text-xs uppercase tracking-widest font-medium"
              style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
            Member
          </th>
          <th class="text-left px-6 py-4 text-xs uppercase tracking-widest font-medium"
              style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
            Amount
          </th>
          <th class="text-left px-6 py-4 text-xs uppercase tracking-widest font-medium"
              style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
            Channel
          </th>
          <th class="text-left px-6 py-4 text-xs uppercase tracking-widest font-medium"
              style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
            Status
          </th>
          <th class="text-left px-6 py-4 text-xs uppercase tracking-widest font-medium"
              style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
            Date
          </th>
        </tr>
      </thead>
      <tbody>
        {#each filtered as contrib (contrib.id)}
          <tr class="transition-colors hover:bg-gray-50"
              style="border-bottom: 1px solid var(--surface-2)">

            <!-- Reference -->
            <td class="px-6 py-4"
                style="font-family: 'DM Mono', monospace; font-size: 12px; color: var(--text-muted)">
              {shortId(contrib.id)}
            </td>

            <!-- Member name -->
            <td class="px-6 py-4 font-medium">
              {memberMap[contrib.memberId] ?? shortId(contrib.memberId)}
            </td>

            <!-- Amount -->
            <td class="px-6 py-4 font-semibold">
              {naira(contrib.amount)}
            </td>

            <!-- Channel -->
            <td class="px-6 py-4">
              <Badge text={contrib.channel} variant={channelVariant(contrib.channel)} />
            </td>

            <!-- Status -->
            <td class="px-6 py-4">
              <Badge text={contrib.status} variant={statusVariant(contrib.status)} />
            </td>

            <!-- Date -->
            <td class="px-6 py-4 text-sm" style="color: var(--text-muted)">
              {fmtDate(contrib.receivedAt)}
            </td>

          </tr>
        {/each}
      </tbody>
    </table>
  {/if}

</div>