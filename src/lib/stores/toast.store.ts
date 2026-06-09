export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id:      number;
  message: string;
  type:    ToastType;
}

let toasts: ToastItem[] = [];
let nextId = 0;
let subscribers: Array<(t: ToastItem[]) => void> = [];

function notify(): void {
  subscribers.forEach(fn => fn([...toasts]));
}

export function addToast(message: string, type: ToastType = 'success'): void {
  const id = nextId++;
  toasts.push({ id, message, type });
  notify();

  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notify();
  }, 4000);
}

export function dismissToast(id: number): void {
  toasts = toasts.filter(t => t.id !== id);
  notify();
}

export function subscribeToasts(fn: (t: ToastItem[]) => void): () => void {
  subscribers.push(fn);
  fn([...toasts]);
  return () => {
    subscribers = subscribers.filter(s => s !== fn);
  };
}