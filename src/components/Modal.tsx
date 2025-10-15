"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

type ModalProps = {
  children: React.ReactNode;
  title?: string;
};

export function Modal({ children, title }: ModalProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }, []);

  const handleClose = () => {
    router.back();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 backdrop:bg-black/50 bg-transparent p-4 m-0 max-w-none w-full h-full flex items-center justify-center"
      onClose={handleClose}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          <button
            onClick={handleClose}
            className="btn ml-auto"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-auto p-4">{children}</div>
      </div>
    </dialog>
  );
}
