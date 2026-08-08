"use client";

import { useEffect, useState } from "react";

const SUPPORTED_QUERY = "(min-width: 768px)";

export function useIsDeviceSupported(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(SUPPORTED_QUERY);
    const update = () => setSupported(mql.matches);

    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return supported;
}