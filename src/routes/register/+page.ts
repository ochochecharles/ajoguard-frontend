import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import { getToken } from '$lib/auth';

export function load() {
  if (browser) {
    if (getToken()) {
      redirect(302, '/');
    }
  }
}