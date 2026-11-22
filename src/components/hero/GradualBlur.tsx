/** Transparent optical blur only. Masks overlap smoothly, without color fills. */
export default function GradualBlur({ position }: { position: "top" | "bottom" }) {
  return <div className={`vr-edge-blur vr-edge-blur--${position}`} aria-hidden="true">
    {Array.from({length:8},(_,i)=> {
      const step=100/8, start=i*step;
      const mask=`linear-gradient(to ${position},transparent ${Math.max(0,start-step)}%,#000 ${start+step}%,#000 100%)`;
      const blur=`blur(${(0.25*Math.pow(2,i)).toFixed(3)}px)`;
      return <div key={i} style={{maskImage:mask,WebkitMaskImage:mask,backdropFilter:blur,WebkitBackdropFilter:blur}} />;
    })}
  </div>;
}
