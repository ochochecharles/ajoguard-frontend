<script lang="ts">
  import { onMount } from 'svelte';
  import { exports as exportApi, members as membersApi, type PublicMember } from '$lib/api';
  import { getCollector } from '$lib/auth';
  import { addToast } from '$lib/stores/toast.store';
  import EmptyState from '$lib/components/EmptyState.svelte';

  // ─── State ───────────────────────────────────────────────

  let loading         = $state(true);
  let memberList      = $state<PublicMember[]>([]);
  let selectedMember  = $state('');

  // Track which download is in progress
  // Format: "group-pdf" | "member-json" | null
  let downloading = $state<string | null>(null);

  // ─── Load members ────────────────────────────────────────

  onMount(async () => {
    const collector = getCollector();
    if (!collector) return;

    try {
      const res = await membersApi.byGroup(collector.groupId, 1, 100);
      memberList = res.data;
    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      loading = false;
    }
  });

  // ─── Download handlers ───────────────────────────────────

  async function downloadGroup(format: 'json' | 'pdf' | 'csv'): Promise<void> {
    const collector = getCollector();
    if (!collector) return;

    const key = `group-${format}`;
    downloading = key;

    try {
      if (format === 'json') await exportApi.groupJson(collector.groupId);
      if (format === 'pdf')  await exportApi.groupPdf(collector.groupId);
      if (format === 'csv')  await exportApi.groupCsv(collector.groupId);
      addToast(`Group report downloaded as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      downloading = null;
    }
  }

  async function downloadMember(format: 'json' | 'pdf' | 'csv'): Promise<void> {
    if (!selectedMember) {
      addToast('Please select a member first', 'error');
      return;
    }

    const key = `member-${format}`;
    downloading = key;

    try {
      if (format === 'json') await exportApi.memberJson(selectedMember);
      if (format === 'pdf')  await exportApi.memberPdf(selectedMember);
      if (format === 'csv')  await exportApi.memberCsv(selectedMember);
      addToast(`Member report downloaded as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      downloading = null;
    }
  }

  // ─── Helper ──────────────────────────────────────────────

  function isDownloading(key: string): boolean {
    return downloading === key;
  }
</script>

<!-- ─── Info banner ────────────────────────────────────── -->

<div class="rounded-2xl p-4 mb-6 flex items-center gap-3"
     style="background: var(--ink); border: 1px solid var(--ink-muted)">
  <span style="color: var(--accent); font-size: 18px">ℹ</span>
  <p class="text-sm" style="color: #8888aa">
    All reports include a tamper-evident audit integrity proof.
    The audit chain is verified fresh at the time of each download.
  </p>
</div>

<!-- ─── Group reports ──────────────────────────────────── -->

<div class="mb-2">
  <h2 class="font-bold mb-1" style="font-family: 'Syne', sans-serif; font-size: 15px">
    Group Reports
  </h2>
  <p class="text-sm mb-4" style="color: var(--text-muted)">
    Complete financial history for your entire group
  </p>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">

  <!-- JSON -->
  <div class="rounded-2xl p-6 flex flex-col gap-4"
       style="background: white; border: 1px solid var(--border)">
    <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
         style="background: #dcfce7">
      📄
    </div>
    <div>
      <div class="font-bold mb-1" style="font-family: 'Syne', sans-serif">
        JSON Report
      </div>
      <div class="text-xs leading-relaxed" style="color: var(--text-muted)">
        Machine-readable format. Ideal for data integration,
        technical audits, and developers.
      </div>
    </div>
    <button
      onclick={() => downloadGroup('json')}
      disabled={downloading !== null}
      class="flex items-center justify-center gap-2 py-2.5 rounded-xl
             text-sm font-semibold transition-opacity disabled:opacity-50"
      style="background: var(--ink); color: var(--accent)"
    >
      {#if isDownloading('group-json')}
        <span class="w-3.5 h-3.5 rounded-full border-2 animate-spin"
              style="border-color: var(--accent); border-top-color: transparent">
        </span>
        Preparing...
      {:else}
        ↓ Download JSON
      {/if}
    </button>
  </div>

  <!-- PDF -->
  <div class="rounded-2xl p-6 flex flex-col gap-4"
       style="background: white; border: 1px solid var(--border)">
    <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
         style="background: #fee2e2">
      📑
    </div>
    <div>
      <div class="font-bold mb-1" style="font-family: 'Syne', sans-serif">
        PDF Report
      </div>
      <div class="text-xs leading-relaxed" style="color: var(--text-muted)">
        Formatted document with full audit chain verification.
        For regulators, disputes, and formal submissions.
      </div>
    </div>
    <button
      onclick={() => downloadGroup('pdf')}
      disabled={downloading !== null}
      class="flex items-center justify-center gap-2 py-2.5 rounded-xl
             text-sm font-semibold transition-opacity disabled:opacity-50"
      style="background: var(--ink); color: var(--accent)"
    >
      {#if isDownloading('group-pdf')}
        <span class="w-3.5 h-3.5 rounded-full border-2 animate-spin"
              style="border-color: var(--accent); border-top-color: transparent">
        </span>
        Preparing...
      {:else}
        ↓ Download PDF
      {/if}
    </button>
  </div>

  <!-- CSV -->
  <div class="rounded-2xl p-6 flex flex-col gap-4"
       style="background: white; border: 1px solid var(--border)">
    <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
         style="background: #dbeafe">
      📊
    </div>
    <div>
      <div class="font-bold mb-1" style="font-family: 'Syne', sans-serif">
        CSV Report
      </div>
      <div class="text-xs leading-relaxed" style="color: var(--text-muted)">
        Spreadsheet-ready contribution records. Open directly
        in Excel or Google Sheets for analysis.
      </div>
    </div>
    <button
      onclick={() => downloadGroup('csv')}
      disabled={downloading !== null}
      class="flex items-center justify-center gap-2 py-2.5 rounded-xl
             text-sm font-semibold transition-opacity disabled:opacity-50"
      style="background: var(--ink); color: var(--accent)"
    >
      {#if isDownloading('group-csv')}
        <span class="w-3.5 h-3.5 rounded-full border-2 animate-spin"
              style="border-color: var(--accent); border-top-color: transparent">
        </span>
        Preparing...
      {:else}
        ↓ Download CSV
      {/if}
    </button>
  </div>

</div>

<!-- Divider -->
<div class="mb-6" style="height: 1px; background: var(--border)"></div>

<!-- ─── Member reports ─────────────────────────────────── -->

<div class="mb-4">
  <h2 class="font-bold mb-1" style="font-family: 'Syne', sans-serif; font-size: 15px">
    Member Reports
  </h2>
  <p class="text-sm" style="color: var(--text-muted)">
    Individual contribution history — ideal for loan applications
  </p>
</div>

<div class="rounded-2xl p-6" style="background: white; border: 1px solid var(--border)">

  {#if loading}
    <div class="flex items-center justify-center py-8">
      <div class="w-6 h-6 rounded-full border-2 animate-spin"
           style="border-color: var(--border); border-top-color: var(--accent)">
      </div>
    </div>

  {:else if memberList.length === 0}
    <EmptyState
      icon="👤"
      sub="No members found. Add members to generate individual reports."
    />

  {:else}

    <div class="mb-4">
      <label for="member-select" class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
             style="font-family: 'DM Mono', monospace; color: var(--text-soft)">
        Select Member
      </label>
      <select
        id="member-select"
        bind:value={selectedMember}
        class="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
        style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
      >
        <option value="" disabled>Choose a member...</option>
        {#each memberList as member (member.id)}
          <option value={member.id}>
            {member.name} ({member.role})
          </option>
        {/each}
      </select>
    </div>

    <!-- Download buttons -->
    <div class="flex gap-3">

      <button
        onclick={() => downloadMember('json')}
        disabled={downloading !== null || !selectedMember}
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
               font-medium transition-opacity disabled:opacity-50"
        style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
      >
        {#if isDownloading('member-json')}
          <span class="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                style="border-color: var(--text); border-top-color: transparent">
          </span>
        {:else}
          ↓
        {/if}
        JSON
      </button>

      <button
        onclick={() => downloadMember('pdf')}
        disabled={downloading !== null || !selectedMember}
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
               font-medium transition-opacity disabled:opacity-50"
        style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
      >
        {#if isDownloading('member-pdf')}
          <span class="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                style="border-color: var(--text); border-top-color: transparent">
          </span>
        {:else}
          ↓
        {/if}
        PDF
      </button>

      <button
        onclick={() => downloadMember('csv')}
        disabled={downloading !== null || !selectedMember}
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
               font-medium transition-opacity disabled:opacity-50"
        style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
      >
        {#if isDownloading('member-csv')}
          <span class="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                style="border-color: var(--text); border-top-color: transparent">
          </span>
        {:else}
          ↓
        {/if}
        CSV
      </button>

    </div>

    {#if selectedMember}
      <p class="text-xs mt-3" style="color: var(--text-muted)">
        Report will include full contribution history, financial summary,
        and audit chain verification for the selected member.
      </p>
    {/if}

  {/if}

</div>