import { useEffect } from "react";
import { useDialog } from "./DialogContext";
import { useOnApproach } from "../hooks/useOnApproach";

const loadField = () => import("./bento/effects").then(module => module.mountEdgeField);

export function FinaleAtmosphere() {
  const view = useOnApproach(loadField);
  const { modal } = useDialog();

  useEffect(() => { view.current?.dispatchEvent(new Event("fieldvisibility")); }, [modal]);

  return <div className="finale-field" aria-hidden="true">
    <div ref={view} className="finale-field-view" data-obscured={modal ? "" : undefined}>
      <canvas /><canvas />
    </div>
  </div>;
}
