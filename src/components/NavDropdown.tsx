import { useState } from 'react';
import type { ReactNode } from 'react';

interface NavDropdownProps {
  label: string;
  children: (close: () => void) => ReactNode;
}

export function NavDropdown({ label, children }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="rounded px-3 py-1.5 text-sm text-white hover:bg-white/10"
        onClick={() => {
          setIsOpen((open) => !open);
        }}
      >
        {label} ▾
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={close} />
          <div className="absolute right-0 z-30 mt-1 w-60 rounded border border-line-strong bg-panel p-3 text-sm text-ink shadow">
            {children(close)}
          </div>
        </>
      )}
    </div>
  );
}
