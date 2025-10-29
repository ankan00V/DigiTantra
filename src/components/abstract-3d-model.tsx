'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

function Model() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <Icosahedron ref={meshRef} args={[2, 1]}>
      <meshStandardMaterial
        color="hsl(var(--primary))"
        wireframe={true}
        emissive="hsl(var(--primary))"
        emissiveIntensity={0.5}
      />
    </Icosahedron>
  );
}

export function Abstract3DModel() {
  return (
    <Canvas>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} color="hsl(var(--primary))" intensity={2} />
      <pointLight position={[-10, -10, -10]} color="hsl(var(--secondary))" intensity={2} />
      <Model />
    </Canvas>
  );
}
