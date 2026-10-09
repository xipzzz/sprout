/* Google Identity Services button. The ID token is held in memory only.
   The Worker checks it; the app never treats a homemade token as sign-in. */

let scriptPromise: Promise<void> | null = null;

function loadGis(): Promise<void> {
  if (typeof document === 'undefined') return Promise.reject(new Error('google'));
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.dataset.gis = '1';
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('google'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

interface GoogleAccounts {
  accounts: {
    id: {
      initialize: (cfg: { client_id: string; callback: (resp: { credential?: string }) => void }) => void;
      renderButton: (el: HTMLElement, cfg: Record<string, string | number>) => void;
    };
  };
}

export async function renderGoogleButton(
  el: HTMLElement,
  clientId: string,
  onToken: (token: string) => void,
): Promise<void> {
  await loadGis();
  const google = (window as unknown as { google?: GoogleAccounts }).google;
  if (!google) throw new Error('google');
  google.accounts.id.initialize({
    client_id: clientId,
    callback: (resp) => {
      if (resp.credential) onToken(resp.credential);
    },
  });
  el.replaceChildren();
  google.accounts.id.renderButton(el, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    width: 280,
  });
}
