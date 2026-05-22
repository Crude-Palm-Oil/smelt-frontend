"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-800 bg-[#0c0c0d] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* terminal header */}
        <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/80 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          {title && (
            <span className="ml-3 font-mono text-[11px] uppercase tracking-widest text-zinc-500">
              {title}
            </span>
          )}
          <button
            onClick={onClose}
            className="ml-auto text-zinc-500 transition hover:text-zinc-200"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
