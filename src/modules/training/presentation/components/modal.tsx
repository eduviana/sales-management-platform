"use client";

import { useState, useRef, useEffect } from "react";

interface ModalProps {
  trigger: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export function Modal({ trigger, title, children }: ModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <>
      <span onClick={() => setIsOpen(true)} className="cursor-pointer">
        {trigger}
      </span>
      <dialog
        ref={dialogRef}
        onClose={() => setIsOpen(false)}
        className="backdrop:bg-black/50 bg-transparent rounded-xl p-0 max-w-lg w-full"
      >
        <div className="bg-surface rounded-xl shadow-xl border border-outline-variant">
          <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
            <h2 className="text-title-md font-semibold text-on-surface">{title}</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-on-surface-variant hover:text-on-surface transition-colors text-lg"
            >
              ✕
            </button>
          </div>
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </dialog>
    </>
  );
}
