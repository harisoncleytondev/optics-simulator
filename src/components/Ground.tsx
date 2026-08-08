"use client";

export function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#202634" />
      </mesh>
      <gridHelper
        args={[46, 23, "#3d4a63", "#252f45"]}
        position={[0, 0.01, 0]}
      />
    </group>
  );
}