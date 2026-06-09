import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';

export function load() {
  if (browser) {
    const token = localStorage.getItem('ajoguard_token');
    if (token) {
      redirect(302, '/');
    }
  }
}