import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'admin-privacy-hidden';

type AdminPrivacyContextValue = {
  hidden: boolean;
  toggle: () => void;
  maskMoney: (value: number) => string;
  maskCount: (count: number) => string;
};

const AdminPrivacyContext = createContext<AdminPrivacyContextValue | null>(null);

function readInitialHidden(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function AdminPrivacyProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(readInitialHidden);

  const toggle = useCallback(() => {
    setHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        // ignore storage failures
      }
      return next;
    });
  }, []);

  const value = useMemo<AdminPrivacyContextValue>(
    () => ({
      hidden,
      toggle,
      maskMoney: (amount: number) => {
        if (hidden) return 'R$ ***';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
      },
      maskCount: (count: number) => (hidden ? '***' : String(count)),
    }),
    [hidden, toggle]
  );

  return <AdminPrivacyContext.Provider value={value}>{children}</AdminPrivacyContext.Provider>;
}

export function useAdminPrivacy() {
  const ctx = useContext(AdminPrivacyContext);
  if (!ctx) {
    throw new Error('useAdminPrivacy must be used within AdminPrivacyProvider');
  }
  return ctx;
}
