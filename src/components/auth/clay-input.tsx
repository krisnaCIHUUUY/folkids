"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ClayInputProps = React.ComponentProps<"input"> & {
  trailing?: React.ReactNode;
};

export const ClayInput = React.forwardRef<HTMLInputElement, ClayInputProps>(
  ({ className, trailing, "aria-invalid": ariaInvalid, ...props }, ref) => {
    const invalid = ariaInvalid === true || ariaInvalid === "true";

    return (
      <div className="relative">
        <input
          ref={ref}
          aria-invalid={ariaInvalid}
          className={cn(
            "clay-inset w-full bg-clay-cream px-5 py-3.5 text-base font-semibold text-clay-ink",
            "outline-none placeholder:font-medium placeholder:text-clay-ink/40",
            "transition focus:ring-2 focus:ring-clay-rose/60",
            trailing && "pr-14",
            invalid && "ring-2 ring-clay-coral focus:ring-clay-coral",
            className,
          )}
          {...props}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {trailing}
          </div>
        )}
      </div>
    );
  },
);
ClayInput.displayName = "ClayInput";
