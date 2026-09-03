// Decorative ambient mesh-gradient blobs for background depth behind main
// content. Purely cosmetic (aria-hidden, pointer-events-none) — render inside
// a `relative overflow-hidden` ancestor. Colors come straight from the
// existing accent/cyan tokens in index.css, so this re-themes for free.
export default function AmbientGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-32 -top-32 h-[440px] w-[440px] rounded-full bg-accent-200 opacity-40 blur-[120px]" />
      <div className="absolute -right-32 bottom-[-180px] h-[440px] w-[440px] rounded-full bg-cyan-bg opacity-70 blur-[120px]" />
    </div>
  );
}
