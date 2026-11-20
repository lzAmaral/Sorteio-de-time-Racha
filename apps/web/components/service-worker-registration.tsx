"use client";

import { useEffect } from "react";

/**
 * Registra o service worker (`public/sw.js`) depois que a página carrega.
 * Não renderiza nada — só existe para o app abrir offline.
 *
 * Em desenvolvimento ele faz o contrário: remove qualquer registro antigo, para
 * um SW de um build de produção rodado no mesmo localhost não servir bundle
 * velho durante o `npm run dev`.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister())),
        )
        .catch(() => {});
      return;
    }

    // Na primeira instalação o `clients.claim()` também dispara controllerchange;
    // só queremos recarregar quando é uma versão NOVA assumindo o controle.
    const hadController = Boolean(navigator.serviceWorker.controller);
    let reloading = false;

    const onControllerChange = () => {
      if (!hadController || reloading) return;
      reloading = true;
      window.location.reload();
    };

    const register = () => {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register);
    }

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      window.removeEventListener("load", register);
    };
  }, []);

  return null;
}
