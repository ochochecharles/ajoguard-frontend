import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { isAuthenticated, getCollector } from '$lib/auth';

export function load() {
  if (browser) {
    // Redirect if either the token or the profile is missing
    if (!isAuthenticated()) {
      redirect(302, '/login');
    }

    // Redirect if collector data is corrupted
    try {
      getCollector();
    } catch {
      clearStored();
      redirect(302, '/login');
    }
  }
}

function clearStored(): void {
  sessionStorage.removeItem('ajoguard_access_token');
  sessionStorage.removeItem('ajoguard_refresh_token');
  sessionStorage.removeItem('ajoguard_collector');
}