import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
export type ModalState =
  | { kind: "allergens"; name: string; codes: string }
  | { kind: "legal"; slug: "privacy" | "cookie" | "note-legali" };
const DialogContext = createContext<{
  modal: ModalState | null;
  open: (value: ModalState) => void;
  close: () => void;
  update: (value: ModalState) => void;
}>({ modal: null, open: () => {}, close: () => {}, update: () => {} });
export function DialogProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const open = useCallback((value: ModalState) => {
    opener.current = document.activeElement as HTMLElement;
    setModal(value);
  }, []);
  const close = useCallback(() => {
    setModal(null);
  }, []);
  useLayoutEffect(() => {
    if (modal !== null) return;
    // Restore focus in the close commit, after the modal has left the DOM.
    // A queued animation frame can run before unmount or after another dialog opens.
    const target = opener.current;
    opener.current = null;
    if (target?.isConnected) target.focus({ preventScroll: true });
  }, [modal]);
  return (
    <DialogContext.Provider value={{ modal, open, close, update: setModal }}>
      {children}
    </DialogContext.Provider>
  );
}
export const useDialog = () => useContext(DialogContext);
