"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { ClayInput } from "@/components/auth/clay-input";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type">;

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [show, setShow] = React.useState(false);

    return (
      <ClayInput
        ref={ref}
        type={show ? "text" : "password"}
        trailing={
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
            className="clay-sm grid size-9 place-items-center bg-white text-clay-ink transition hover:[transform:translateY(-1px)]"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
        {...props}
      />
    );
  },
);
PasswordInput.displayName = "PasswordInput";
