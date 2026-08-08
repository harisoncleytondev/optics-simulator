"use client";

import type { ReactNode } from "react";
import { useIsDeviceSupported } from "@/hooks/useIsDeviceSupported";

type DeviceGateProps = {
  children: ReactNode;
};

export function DeviceGate({ children }: DeviceGateProps) {
  const supported = useIsDeviceSupported();

  if (supported === null) return null;

  if (!supported) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-slate-950 p-6 text-center text-slate-100">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-slate-600 text-2xl text-slate-400">
          X
        </div>
        <h1 className="text-xl font-semibold">
          Este app não roda em celular
        </h1>
        <p className="max-w-sm text-sm text-slate-400">
          O simulador 3D de reflexão de luz precisa de uma tela maior. Abra no
          tablet ou computador.
        </p>
      </div>
    );
  }

  return children;
}