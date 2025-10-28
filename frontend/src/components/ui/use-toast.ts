// Minimal toast utility for the app

type ToastVariant = 'default' | 'destructive' | 'success' | 'warning';

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

function ensureContainer() {
  let container = document.getElementById('app-toast-container') as HTMLDivElement | null;
  if (!container) {
    container = document.createElement('div');
    container.id = 'app-toast-container';
    container.style.position = 'fixed';
    container.style.top = '16px';
    container.style.right = '16px';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';
    document.body.appendChild(container);
  }
  return container;
}

function getColors(variant: ToastVariant | undefined) {
  switch (variant) {
    case 'destructive':
      return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' };
    case 'success':
      return { bg: '#dcfce7', border: '#22c55e', text: '#14532d' };
    case 'warning':
      return { bg: '#fef3c7', border: '#f59e0b', text: '#7c2d12' };
    default:
      return { bg: '#e5e7eb', border: '#6b7280', text: '#111827' };
  }
}

function showToast(opts: ToastOptions) {
  const { title, description, variant, durationMs = 3000 } = opts;
  const container = ensureContainer();
  const colors = getColors(variant);

  const toast = document.createElement('div');
  toast.style.background = colors.bg;
  toast.style.border = `1px solid ${colors.border}`;
  toast.style.color = colors.text;
  toast.style.padding = '10px 12px';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
  toast.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
  toast.style.maxWidth = '320px';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(-6px)';
  toast.style.transition = 'opacity 180ms ease, transform 180ms ease';

  const titleEl = document.createElement('div');
  titleEl.style.fontWeight = '600';
  titleEl.style.marginBottom = description ? '4px' : '0';
  titleEl.innerText = title || (variant === 'destructive' ? 'Error' : variant === 'success' ? 'Berhasil' : variant === 'warning' ? 'Perhatian' : 'Informasi');

  const descEl = document.createElement('div');
  descEl.style.fontSize = '0.9rem';
  descEl.innerText = description || '';

  toast.appendChild(titleEl);
  if (description) toast.appendChild(descEl);
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  // Auto remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-6px)';
    setTimeout(() => {
      container.removeChild(toast);
    }, 200);
  }, durationMs);
}

export function useToast() {
  return {
    toast: showToast,
  };
}