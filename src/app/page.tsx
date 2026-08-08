import { DeviceGate } from "@/components/DeviceGate";
import { Scene } from "@/components/Scene";

export default function Home() {
  return (
    <DeviceGate>
      <Scene />
    </DeviceGate>
  );
}
