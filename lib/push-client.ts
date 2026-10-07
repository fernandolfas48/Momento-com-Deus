function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  return Uint8Array.from(Array.from(raw).map((c) => c.charCodeAt(0)));
}

export type PushResult = { ok: boolean; message: string };

export async function enablePush(): Promise<PushResult> {
  if (typeof window === 'undefined') return { ok: false, message: 'Indisponível.' };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;

  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    if (isIOS && !standalone) {
      return {
        ok: false,
        message: 'No iPhone, toque em Compartilhar › Adicionar à Tela de Início e abra o app por lá para ativar.',
      };
    }
    return { ok: false, message: 'Seu navegador não suporta notificações.' };
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return { ok: false, message: 'Notificações ainda não configuradas.' };

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return { ok: false, message: 'Permissão de notificações negada.' };

  const reg = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));

  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub.toJSON()),
  });
  if (!res.ok) return { ok: false, message: 'Não foi possível ativar. Tente novamente.' };
  return { ok: true, message: 'Lembretes diários ativados!' };
}
