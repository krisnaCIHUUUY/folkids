import * as React from "react";

import { cn } from "@/lib/utils";

// Pemutar video standar aplikasi: bingkai clay-inset 16:9, pesan fallback
// seragam, dan playsInline agar iPhone memutar di tempat (tanpa playsinline,
// WebKit iPhone memaksa pemutar fullscreen native).
export function VideoPlayer({
  className,
  children,
  ...props
}: React.ComponentProps<"video">) {
  return (
    <video
      controls
      playsInline
      className={cn("clay-inset aspect-video w-full bg-black", className)}
      {...props}
    >
      {children ?? "Browser-mu tidak mendukung pemutar video."}
    </video>
  );
}
