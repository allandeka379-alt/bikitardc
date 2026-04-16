// Wave/pulse spinner used on the payment processing
// page. Three concentric rings pulsing outward in
// sequence — matches the "Live" indicator rhythm
// used on the landing page stats strip.

export function AnimatedSpinner() {
  return (
    <div className="relative grid h-24 w-24 place-items-center" aria-hidden>
      {/* Outer pulse rings */}
      <span className="absolute inset-0 rounded-full border-2 border-brand-primary/40 animate-pulse-ring" />
      <span
        className="absolute inset-0 rounded-full border-2 border-brand-primary/30 animate-pulse-ring"
        style={{ animationDelay: '400ms' }}
      />
      <span
        className="absolute inset-0 rounded-full border-2 border-brand-primary/20 animate-pulse-ring"
        style={{ animationDelay: '800ms' }}
      />

      {/* Core */}
      <span className="relative grid h-16 w-16 place-items-center rounded-full bg-brand-primary">
        <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />
      </span>
    </div>
  );
}
