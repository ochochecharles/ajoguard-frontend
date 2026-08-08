<script lang="ts">
  import { onMount } from 'svelte';
  import { members as membersApi, groups as groupsApi, type PublicMember } from '$lib/api';
  import { getCollector } from '$lib/auth';
  import { initials } from '$lib/utils';
  import { addToast } from '$lib/stores/toast.store';
  import Badge from '$lib/components/Badge.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import Pagination from '$lib/components/Pagination.svelte';

  // ─── State ───────────────────────────────────────────────

  let loading      = $state(true);
  let memberList   = $state<PublicMember[]>([]);
  let page         = $state(1);
  let totalPages   = $state(1);
  let total        = $state(0);
  let joinCode     = $state<string | null>(null);
  let showModal    = $state(false);
  let submitting   = $state(false);
  let deactivating = $state<string | null>(null); // stores id being deactivated

  // Form fields
  let form = $state({
    name:        '',
    phoneNumber: '',
    email:       '',
    role:        'MEMBER' as 'MEMBER' | 'COLLECTOR',
  });

  // ─── Load members ────────────────────────────────────────

  async function loadMembers(): Promise<void> {
    const collector = getCollector();
    if (!collector) return;

    try {
      const res = await membersApi.byGroup(collector.groupId, page, 50);
      memberList = res.data;
      totalPages = res.totalPages;
      total      = res.total;

      // Fetch the join code once (short-circuits because joinCode is set)
      if (!joinCode) {
        try {
          const { joinCode: code } = await groupsApi.joinCode(collector.groupId);
          joinCode = code;
        } catch {
          joinCode = null;
        }
      }
    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      loading = false;
    }
  }

  onMount(loadMembers);

  function changePage(next: number): void {
    page = next;
    loading = true;
    loadMembers();
  }

  async function copyJoinCode(): Promise<void> {
    if (!joinCode) return;
    try {
      await navigator.clipboard.writeText(joinCode);
      addToast(`Join code ${joinCode} copied`, 'success');
    } catch {
      addToast(`Your join code is ${joinCode}`, 'info');
    }
  }

  // ─── Add member ──────────────────────────────────────────

  async function addMember(): Promise<void> {
    const collector = getCollector();
    if (!collector) return;

    if (!form.name.trim()) {
      addToast('Name is required', 'error');
      return;
    }

    if (form.role === 'COLLECTOR' && !form.email.trim()) {
      addToast('Email is required for collectors', 'error');
      return;
    }

    submitting = true;

    try {
      await membersApi.create({
        name:        form.name.trim(),
        phoneNumber: form.phoneNumber.trim() || undefined,
        email:       form.email.trim() || undefined,
        groupId:     collector.groupId,
        role:        form.role,
      });

      addToast(`${form.name} added successfully`, 'success');
      showModal = false;

      // Reset form
      form = { name: '', phoneNumber: '', email: '', role: 'MEMBER' };

      // Reload list
      await loadMembers();

    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      submitting = false;
    }
  }

  // ─── Deactivate member ───────────────────────────────────

  async function deactivateMember(member: PublicMember): Promise<void> {
    if (!confirm(`Deactivate ${member.name}? They will no longer be able to make contributions.`)) {
      return;
    }

    deactivating = member.id;

    try {
      await membersApi.deactivate(member.id);
      addToast(`${member.name} deactivated`, 'success');
      await loadMembers();
    } catch (error) {
      addToast((error as Error).message, 'error');
    } finally {
      deactivating = null;
    }
  }

  // ─── Badge helpers ───────────────────────────────────────

  function roleVariant(role: string) {
    return role === 'COLLECTOR' ? 'purple' : 'blue';
  }

  function statusVariant(status: string) {
    return status === 'ACTIVE' ? 'green' : 'red';
  }
</script>

<!-- ─── Header ─────────────────────────────────────────── -->

<div class="flex items-center justify-between mb-6 flex-wrap gap-3">
  <div>
    <p class="text-sm" style="color: var(--text-muted)">
      {total} member{total !== 1 ? 's' : ''} in your group
    </p>
    {#if joinCode}
      <button
        onclick={copyJoinCode}
        class="mt-1.5 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs
               font-medium transition-opacity hover:opacity-80"
        style="background: var(--ink); color: var(--accent)"
        title="Click to copy the invite code"
      >
        <span class="tracking-widest" style="font-family: 'DM Mono', monospace">
          {joinCode}
        </span>
        <span>· Share join code</span>
      </button>
    {/if}
  </div>
  <button
    onclick={() => showModal = true}
    class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
           transition-opacity hover:opacity-90"
    style="background: var(--ink); color: var(--accent)"
  >
    + Add Member
  </button>
</div>

<!-- ─── Table ──────────────────────────────────────────── -->

<div class="rounded-2xl overflow-x-auto" style="background: white; border: 1px solid var(--border)">

  {#if loading}
    <div class="flex items-center justify-center py-20">
      <div class="w-7 h-7 rounded-full border-2 animate-spin"
           style="border-color: var(--border); border-top-color: var(--accent)">
      </div>
    </div>

  {:else if memberList.length === 0}
    <EmptyState
      icon="👤"
      title="No members yet"
      sub="Add your first member to get started"
    />

  {:else}
    <table class="w-full text-sm min-w-[600px]">
      <thead>
        <tr style="border-bottom: 1px solid var(--border)">
          <th class="text-left px-6 py-4 text-xs uppercase tracking-widest font-medium"
              style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
            Member
          </th>
          <th class="text-left px-6 py-4 text-xs uppercase tracking-widest font-medium"
              style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
            Phone
          </th>
          <th class="text-left px-6 py-4 text-xs uppercase tracking-widest font-medium"
              style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
            Email
          </th>
          <th class="text-left px-6 py-4 text-xs uppercase tracking-widest font-medium"
              style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
            Role
          </th>
          <th class="text-left px-6 py-4 text-xs uppercase tracking-widest font-medium"
              style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
            Status
          </th>
          <th class="px-6 py-4"></th>
        </tr>
      </thead>
      <tbody>
        {#each memberList as member (member.id)}
          <tr class="transition-colors hover:bg-gray-50"
              style="border-bottom: 1px solid var(--surface-2)">

            <!-- Name + avatar -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center
                            text-xs font-bold shrink-0"
                     style="background: var(--ink); color: var(--accent);
                            font-family: 'Syne', sans-serif">
                  {initials(member.name)}
                </div>
                <span class="font-medium">{member.name}</span>
              </div>
            </td>

            <!-- Phone -->
            <td class="px-6 py-4" style="font-family: 'DM Mono', monospace; font-size: 12px; color: var(--text-soft)">
              {member.phoneNumber ?? '—'}
            </td>

            <!-- Email -->
            <td class="px-6 py-4" style="font-size: 12px; color: var(--text-soft)">
              {member.email ?? '—'}
            </td>

            <!-- Role -->
            <td class="px-6 py-4">
              <Badge text={member.role} variant={roleVariant(member.role)} />
            </td>

            <!-- Status -->
            <td class="px-6 py-4">
              <Badge text={member.status} variant={statusVariant(member.status)} />
            </td>

            <!-- Actions -->
            <td class="px-6 py-4">
              {#if member.status === 'ACTIVE'}
                <button
                  onclick={() => deactivateMember(member)}
                  disabled={deactivating === member.id}
                  class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                         disabled:opacity-50"
                  style="background: #fee2e2; color: #dc2626"
                >
                  {deactivating === member.id ? 'Deactivating...' : 'Deactivate'}
                </button>
              {:else}
                <span class="text-xs" style="color: var(--text-muted)">Inactive</span>
              {/if}
            </td>

          </tr>
        {/each}
      </tbody>
    </table>
  {/if}

  <Pagination {page} {totalPages} {total} onchange={changePage} />
</div>

<!-- ─── Add Member Modal ────────────────────────────────── -->

<Modal bind:open={showModal} title="Add Member">

  <div class="space-y-4">

    <!-- Name -->
    <div>
      <label for="add-member-name" class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
             style="font-family: 'DM Mono', monospace; color: var(--text-soft)">
        Full Name *
      </label>
      <input
        id="add-member-name"
        type="text"
        bind:value={form.name}
        placeholder="e.g. Amaka Okonkwo"
        class="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
        style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
      />
    </div>

    <!-- Phone -->
    <div>
      <label for="add-member-phone" class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
             style="font-family: 'DM Mono', monospace; color: var(--text-soft)">
        Phone Number
      </label>
      <input
        id="add-member-phone"
        type="text"
        bind:value={form.phoneNumber}
        placeholder="e.g. 08012345678"
        class="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
        style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
      />
    </div>

    <!-- Email -->
    <div>
      <label for="add-member-email" class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
             style="font-family: 'DM Mono', monospace; color: var(--text-soft)">
        Email {form.role === 'COLLECTOR' ? '*' : ''}
      </label>
      <input
        id="add-member-email"
        type="email"
        bind:value={form.email}
        placeholder="e.g. amaka@gmail.com"
        class="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
        style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
      />
      {#if form.role === 'COLLECTOR'}
        <p class="text-xs mt-1" style="color: var(--text-muted)">
          Used for Google sign-in
        </p>
      {/if}
    </div>

    <!-- Role -->
    <div>
      <label for="add-member-role" class="block text-xs font-medium mb-1.5 uppercase tracking-wide"
             style="font-family: 'DM Mono', monospace; color: var(--text-soft)">
        Role
      </label>
      <select
        id="add-member-role"
        bind:value={form.role}
        class="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
        style="background: var(--surface-2); border: 1px solid var(--border); color: var(--text)"
      >
        <option value="MEMBER">Member</option>
        <option value="COLLECTOR">Collector</option>
      </select>
    </div>

  </div>

  {#snippet footer()}
    <button
      onclick={() => showModal = false}
      class="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
      style="color: var(--text-muted); border: 1px solid var(--border)"
    >
      Cancel
    </button>
    <button
      onclick={addMember}
      disabled={submitting}
      class="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity
             disabled:opacity-60 flex items-center gap-2"
      style="background: var(--ink); color: var(--accent)"
    >
      {#if submitting}
        <span class="w-3.5 h-3.5 rounded-full border-2 animate-spin"
              style="border-color: var(--accent); border-top-color: transparent">
        </span>
        Adding...
      {:else}
        Add Member
      {/if}
    </button>
  {/snippet}

</Modal>