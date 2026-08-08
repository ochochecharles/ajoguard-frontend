<script lang="ts">
  import type { Snippet } from 'svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { navSections, pageMeta } from '$lib/nav';
  import { getCollector, clearAuth } from '$lib/auth';
  import { initials } from '$lib/utils';

  let { children }: { children: Snippet } = $props();

  let collector   = $derived(browser ? getCollector() : null);
  let currentPath = $derived($page.url.pathname);
  let meta        = $derived(pageMeta[currentPath] ?? { title: 'AjoGuard', subtitle: '' });

  let sidebarOpen = $state(false);

  function logout(): void {
    clearAuth();
    window.location.href = '/login';
  }

  function closeSidebar(): void {
    sidebarOpen = false;
  }

  function navStyle(isActive: boolean): string {
    if (isActive) {
      return 'color: var(--accent); background: var(--ink-soft); border: 1px solid var(--ink-muted); font-weight: 500;';
    }
    return 'color: #8888aa; background: transparent; border: 1px solid transparent; font-weight: 400;';
  }

  // Sidebar class — the key fix
  // On mobile: -translate-x-full when closed, translate-x-0 when open
  // On desktop: lg:translate-x-0 always wins
  let sidebarClass = $derived(
    sidebarOpen
      ? 'translate-x-0'
      : '-translate-x-full lg:translate-x-0'
  );
</script>

<div class="flex h-screen overflow-hidden" style="background: var(--surface)">

  <!-- Mobile overlay -->
  {#if sidebarOpen}
    <div
      class="fixed inset-0 z-30 lg:hidden"
      style="background: rgba(0,0,0,0.5)"
      role="button"
      tabindex="0"
      onclick={closeSidebar}
      onkeydown={(e) => e.key === 'Enter' && closeSidebar()}
      aria-label="Close sidebar"
    ></div>
  {/if}

  <!-- Sidebar -->
  <aside
    class="fixed lg:relative z-40 lg:z-auto w-64 shrink-0 flex flex-col
           h-full overflow-y-auto transition-transform duration-300 {sidebarClass}"
    style="background: var(--ink)"
  >

    <!-- Logo -->
    <div class="px-5 pt-7 pb-8">
      <div class="text-xl font-black mb-1"
           style="font-family: 'Syne', sans-serif; color: var(--accent)">
        AjoGuard
      </div>
      <div class="text-xs tracking-widest uppercase"
           style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
        Savings Intelligence
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3">
      {#each navSections as section (section.title)}
        <div class="px-2 mb-2 mt-4 text-xs tracking-widest uppercase first:mt-0"
             style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
          {section.title}
        </div>

        {#each section.items as item (item.href)}
          {@const isActive = currentPath === item.href}
          <!-- eslint-disable svelte/no-navigation-without-resolve -->
          <a
            href={item.href}
            onclick={closeSidebar}
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-0.5
                   text-sm transition-all no-underline"
            style={navStyle(isActive)}
          >
            {item.label}
          </a>
          <!-- eslint-enable svelte/no-navigation-without-resolve -->
        {/each}
      {/each}
    </nav>

    <!-- Sidebar footer -->
    <!-- <div class="px-5 py-5 mt-auto"
         style="border-top: 1px solid var(--ink-muted)">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full shrink-0 animate-pulse"
              style="background: var(--accent-2)"></span>
        <span class="text-xs"
              style="font-family: 'DM Mono', monospace; color: var(--text-muted)">
          API Connected
        </span>
      </div>
    </div> -->

  </aside>

  <!-- Main area -->
  <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

    <!-- Topbar -->
    <header class="shrink-0 flex items-center justify-between px-4 lg:px-8 py-4 lg:py-5"
            style="border-bottom: 1px solid var(--border); background: var(--surface)">

      <div class="flex items-center gap-3">

        <!-- Hamburger — mobile only -->
        <button
          onclick={() => sidebarOpen = !sidebarOpen}
          class="lg:hidden flex flex-col gap-1.5 p-1.5 rounded-lg"
          aria-label="Toggle sidebar"
        >
          <span class="block w-5 h-0.5 rounded" style="background: var(--text)"></span>
          <span class="block w-5 h-0.5 rounded" style="background: var(--text)"></span>
          <span class="block w-5 h-0.5 rounded" style="background: var(--text)"></span>
        </button>

        <!-- Page title -->
        <div>
          <h1 class="font-bold leading-tight text-lg lg:text-2xl"
              style="font-family: 'Syne', sans-serif; letter-spacing: -0.5px">
            {meta.title}
          </h1>
          {#if meta.subtitle}
            <p class="text-xs lg:text-sm mt-0.5 hidden sm:block"
               style="color: var(--text-muted)">
              {meta.subtitle}
            </p>
          {/if}
        </div>

      </div>

      <!-- Collector info + logout -->
      {#if collector}
        <div class="flex items-center gap-2 lg:gap-3">

          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center
                        text-xs font-bold shrink-0"
                 style="background: var(--ink); color: var(--accent);
                        font-family: 'Syne', sans-serif">
              {initials(collector.name)}
            </div>
            <div class="hidden sm:block">
              <div class="text-sm font-medium leading-tight">{collector.name}</div>
              <div class="text-xs leading-tight capitalize" style="color: var(--text-muted)">
                {collector.role === 'COLLECTOR' ? 'Collector' : 'Member'}
              </div>
            </div>
          </div>

          <div class="w-px h-6 hidden sm:block" style="background: var(--border)"></div>

          <button
            onclick={logout}
            class="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg
                   text-xs font-medium transition-colors hover:bg-gray-50"
            style="color: var(--text-muted); border: 1px solid var(--border)"
          >
            <span class="hidden sm:inline">Logout</span>
            <span class="sm:hidden">↪</span>
          </button>

        </div>
      {/if}

    </header>

    <!-- Page content -->
    <main class="flex-1 overflow-y-auto px-4 lg:px-8 py-5 lg:py-7">
      {@render children()}
    </main>

  </div>

</div>