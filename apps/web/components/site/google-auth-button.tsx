"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { env } from "~/env.js";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, string | number | boolean>,
          ) => void;
        };
      };
    };
  }
}

export function GoogleAuthButton({
  onCredential,
}: {
  onCredential: (credential: string) => Promise<void>;
}) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const clientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !buttonRef.current || !window.google?.accounts.id) {
      return;
    }

    const target = buttonRef.current;
    target.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        if (!response.credential) {
          return;
        }
        await onCredential(response.credential);
      },
    });

    window.google.accounts.id.renderButton(target, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      width: 320,
    });
  }, [clientId, onCredential]);

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      {clientId ? (
        <div ref={buttonRef} className="min-h-[44px]" />
      ) : (
        <p className="text-sm font-semibold text-[#8d1d23]">
          Google sign-in is unavailable until `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set.
        </p>
      )}
    </>
  );
}
