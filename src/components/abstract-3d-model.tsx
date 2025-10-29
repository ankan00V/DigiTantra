'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, Torus, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function Atom() {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      const scale = 1 + 0.05 * Math.sin(time * 2);
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <Icosahedron ref={meshRef} args={[1, 4]}>
      <meshStandardMaterial
        color="hsl(var(--primary))"
        emissive="hsl(var(--primary))"
        emissiveIntensity={1.5}
        toneMapped={false}
        roughness={0.2}
        metalness={0.8}
      />
    </Icosahedron>
  );
}

function Electron({ radius = 2.5, speed = 1, initialAngle = 0 }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      const angle = initialAngle + time * speed;
      meshRef.current.position.x = radius * Math.cos(angle);
      meshRef.current.position.z = radius * Math.sin(angle);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshStandardMaterial 
        color="hsl(var(--secondary))"
        emissive="hsl(var(--secondary))"
        emissiveIntensity={2}
        toneMapped={false}
      />
    </mesh>
  );
}

function Stars(props: any) {
  const ref = useRef<any>()
  const [sphere] = useState(() => {
    // Generate random points in a sphere
    const_ts-ignore
    const positions = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      const r = 4 + Math.random() * 4;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      positions.set([x, y, z], i * 3);
    }
    return positions;
  });

  useFrame((state, delta) => {
    if(ref.current) {
        ref.current.rotation.x -= delta / 20
        ref.current.rotation.y -= delta / 25
    }
  })

  return (
    <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
      <PointMaterial transparent color="hsl(var(--muted-foreground))" size={0.015} sizeAttenuation={true} depthWrite={false} />
    </Points>
  )
}

function Rings() {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((state, delta) => {
    if(groupRef.current) {
        groupRef.current.rotation.x = -Math.PI / 2;
        groupRef.current.rotation.z += delta * 0.1;
    }
  });
  return (
    <group ref={groupRef}>
        <Torus args={[2.5, 0.01, 16, 100]}>
            <meshStandardMaterial 
              color="hsl(var(--secondary) / 0.5)"
              emissive="hsl(var(--secondary))"
              emissiveIntensity={0.5}
              toneMapped={false}
            />
        </Torus>
         <Torus args={[3.2, 0.01, 16, 100]}>
            <meshStandardMaterial 
                color="hsl(var(--primary) / 0.5)"
                emissive="hsl(var(--primary))"
                emissiveIntensity={0.5}
                toneMapped={false}
            />
        </Torus>
    </group>
  )
}


function Model() {
  return (
    <group>
      <Atom />
      <Electron radius={2.5} speed={0.8} initialAngle={0} />
      <Electron radius={2.5} speed={0.8} initialAngle={Math.PI} />
      <Electron radius={3.2} speed={0.5} initialAngle={Math.PI / 2} />
      <Stars />
      <Rings />
    </group>
  );
}

export function Abstract3DModel() {
  return (
    <Canvas camera={{ position: [0, 0, 7] }}>
      <ambientLight intensity={0.2} />
      <directionalLight position={[3, 2, 5]} intensity={1} color="hsl(var(--primary))" />
      <directionalLight position={[-3, -2, -5]} intensity={1} color="hsl(var(--secondary))" />
      <Model />
    </Canvas>
  );
}
