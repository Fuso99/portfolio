"use client";

import { MotionConfig } from "framer-motion";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "bg-night-2/90! backdrop-blur-xl! border! border-line-strong! text-ink! rounded-xl!",
            description: "text-muted!",
          },
        }}
      />
    </MotionConfig>
  );
}
