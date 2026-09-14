export function MetalSheenPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="metal-sheen relative w-full overflow-hidden border-y border-line">
      {children}
    </div>
  )
}