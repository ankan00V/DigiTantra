'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, Torus } from '@react-three/drei';
import * as THREE from 'three';

function Model() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Glowing Core */}
      <Icosahedron args={[1, 1]}>
        <meshStandardMaterial
          color="hsl(var(--primary))"
          emissive="hsl(var(--primary))"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </Icosahedron>

      {/* Inner Ring */}
      <Torus args={[1.5, 0.03, 16, 100]} rotation-x={Math.PI / 2}>
        <meshStandardMaterial
          color="hsl(var(--secondary))"
          emissive="hsl(var(--secondary))"
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </Torus>
      
      {/* Outer Ring */}
      <Torus args={[2.2, 0.05, 16, 100]} rotation-x={Math.PI / 2}>
        <meshStandardMaterial
           color="hsl(var(--foreground))"
           emissive="hsl(var(--foreground))"
           emissiveIntensity={0.2}
           toneMapped={false}
        />
      </Torus>

      {/* Floating Particles */}
       <Icosahedron args={[2.8, 1]} >
         <meshStandardMaterial 
            wireframe 
            color="hsl(var(--muted-foreground))"
            transparent
            opacity={0.3}
          />
       </Icosahedron>
    </group>
  );
}

export function Abstract3DModel() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} color="hsl(var(--primary))" intensity={150} />
      <pointLight position={[-10, -10, -10]} color="hsl(var(--secondary))" intensity={150} />
      <Model />
    </Canvas>
  );
}
