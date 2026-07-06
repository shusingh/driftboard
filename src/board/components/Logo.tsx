/** Driftboard mark: three descending bars in a primary tile. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-[8px] bg-primary"
      style={{ width: size, height: size }}
    >
      <svg fill="none" height={size * 0.62} viewBox="0 0 24 24" width={size * 0.62}>
        <rect fill="#fff" height="13" rx="1.6" width="6" x="3" y="3" />
        <rect fill="#fff" height="9" opacity=".78" rx="1.6" width="6" x="11" y="3" />
        <rect fill="#fff" height="18" opacity=".5" rx="1" width="2" x="19" y="3" />
      </svg>
    </div>
  );
}
