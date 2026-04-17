import { useEffect } from "react";

export function useCloseOnOutsideClick(
  isOpen: boolean,
  onClose: () => void,
  selector = ".pf-v6-c-modal-box",
) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest(selector)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose, selector]);
}
