'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, Sphere, Torus, TorusKnot, Box, Dodecahedron, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

type AnimationType = 'home' | 'about' | 'features' | 'analytics' | 'contact' | 'social' | 'blog';

const AnimatedShape = ({ type }: { type: AnimationType }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.1;
      meshRef.current.rotation.y += delta * 0.15;
    }
    if (groupRef.current) {
        groupRef.current.rotation.y += delta * 0.05;
    }
  });

  const sharedMaterial = <meshStandardMaterial color="hsl(var(--primary))" wireframe emissive="hsl(var(--primary))" emissiveIntensity={0.5} />;
  const secondaryMaterial = <meshStandardMaterial color="hsl(var(--foreground))" wireframe emissive="hsl(var(--foreground))" emissiveIntensity={0.2} roughness={0.8} />;


  switch (type) {
    case 'home':
        return (
            <group ref={groupRef}>
                <TorusKnot ref={meshRef} args={[1, 0.3, 200, 22]}>
                    {sharedMaterial}
                </TorusKnot>
                <Sphere args={[0.4, 16, 16]} >
                    <meshStandardMaterial color="hsl(var(--primary))" emissive="hsl(var(--primary))" emissiveIntensity={0.8} roughness={0.2} />
                </Sphere>
                 <Torus args={[1.8, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
                    {secondaryMaterial}
                </Torus>
                <Torus args={[2.2, 0.02, 16, 100]} rotation={[Math.PI / 2, Math.PI / 3, 0]}>
                    {secondaryMaterial}
                </Torus>
                 <Torus args={[2.6, 0.02, 16, 100]} rotation={[Math.PI / 2, Math.PI / 1.5, 0]}>
                    {secondaryMaterial}
                </Torus>
            </group>
        )
    case 'about':
      // Simple, foundational shape
      return (
        <Box ref={meshRef} args={[1.8, 1.8, 1.8]}>
          {sharedMaterial}
        </Box>
      );
    case 'features':
        // A shape with multiple faces, representing different features
       return (
        <Dodecahedron ref={meshRef} args={[1.5, 0]}>
            {sharedMaterial}
        </Dodecahedron>
       )
    case 'analytics':
        // A more complex, data-like structure
        return (
            <group ref={groupRef}>
                <Octahedron ref={meshRef} args={[1.2, 0]}>{sharedMaterial}</Octahedron>
                <Torus args={[1.8, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>{secondaryMaterial}</Torus>
            </group>
        )
    case 'social':
        // Interconnected shape, like a network
        return (
            <TorusKnot ref={meshRef} args={[1.2, 0.2, 128, 16]}>
                {sharedMaterial}
            </TorusKnot>
        )
    case 'blog':
        // A classic sphere, representing a world of ideas
        return (
            <Sphere ref={meshRef} args={[1.4, 32, 32]}>
                {sharedMaterial}
            </Sphere>
        )
    default:
        // Default shape for any other page, e.g., Contact
      return (
        <Icosahedron ref={meshRef} args={[1.5, 0]}>
          {sharedMaterial}
        </Icosahedron>
      );
  }
};

const Particles = () => {
    const count = 3000;
    const meshRef = useRef<THREE.Points>(null!);
    
    const particles = useMemo(() => {
        const temp = [];
        const t = Math.random() * 100;
        for (let i = 0; i < count; i++) {
            const factor = 10 + Math.random() * 15;
            const speed = 0.01 + Math.random() / 200;
            const x = (Math.random() - 0.5) * 25;
            const y = (Math.random() - 0.5) * 25;
            const z = (Math.random() - 0.5) * 25;
    
            temp.push({ t, factor, speed, x, y, z });
        }
        return temp;
    }, [count]);
    
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame(() => {
        particles.forEach((particle, i) => {
            let { factor, speed, x, y, z } = particle;
            
            particle.t += speed;
    
            dummy.position.set(
                x + Math.cos(particle.t) * factor,
                y + Math.sin(particle.t) * factor,
                z + Math.sin(particle.t / 2) * factor
            );
            
            dummy.updateMatrix();
            (meshRef.current as any).setMatrixAt(i, dummy.matrix);
        });
        if(meshRef.current) {
             (meshRef.current as any).instanceMatrix.needsUpdate = true;
        }
    });

    return (
        <instancedMesh ref={meshRef as any} args={[undefined as any, undefined as any, count]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="hsl(var(--foreground))" emissive="hsl(var(--foreground))" emissiveIntensity={0.3} roughness={0.9} />
        </instancedMesh>
    );
}

export function PageSpecific3DAnimation({ type }: { type: AnimationType }) {
  return (
    <div className="absolute top-0 left-0 w-full h-full z-0 opacity-10">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="hsl(var(--primary))" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="hsl(var(--foreground))" />
        <AnimatedShape type={type} />
        <Particles />
      </Canvas>
    </div>
  );
}
