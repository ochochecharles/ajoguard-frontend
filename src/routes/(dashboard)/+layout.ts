import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';

export function load() {
  if (browser) {
    const token     = localStorage.getItem('ajoguard_token');
    const collector = localStorage.getItem('ajoguard_collector');

    // Redirect if either piece is missing
    if (!token || !collector) {
      redirect(302, '/login');
    }

    // Redirect if collector data is corrupted
    try {
      JSON.parse(collector);
    } catch {
      localStorage.clear();
      redirect(302, '/login');
    }
  }
}