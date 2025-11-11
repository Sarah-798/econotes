import { ReactNode } from "react";

export default function UnauthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background min-h-screen">
      {children}
    </div>
  )
}