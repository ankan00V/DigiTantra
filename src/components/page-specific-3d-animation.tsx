'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Icosahedron, Sphere, Torus, TorusKnot, Box, Dodecahedron, Octahedron, Plane, Text, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

type AnimationType = 'home' | 'about' | 'features' | 'analytics' | 'contact' | 'social' | 'blog';

const Starfield = () => {
    const starsRef = useRef<THREE.Points>(null!);

    const starGeo = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const vertices = [];
        for (let i = 0; i < 6000; i++) {
            vertices.push(
                Math.random() * 600 - 300,
                Math.random() * 600 - 300,
                Math.random() * 600 - 300
            );
        }
        geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        return geo;
    }, []);

    useFrame((state, delta) => {
        if (starsRef.current) {
            const positions = starsRef.current.geometry.attributes.position.array as number[];
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] -= delta * 20; 
                if (positions[i + 1] < -200) {
                    positions[i + 1] = 200; 
                }
            }
            starsRef.current.geometry.attributes.position.needsUpdate = true;
            starsRef.current.rotation.y += delta * 0.02;
        }
    });

    return (
        <points ref={starsRef} geometry={starGeo}>
             <pointsMaterial
                color="hsl(var(--primary))"
                size={0.7}
                sizeAttenuation
                transparent
                opacity={0.8}
             />
        </points>
    );
};

const FallingObject = ({ children, position }: { children: React.ReactNode; position: [number, number, number] }) => {
    const ref = useRef<any>(null!);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.position.y -= delta * (0.5 + Math.random() * 0.5);
            ref.current.rotation.x += delta * 0.2;
            ref.current.rotation.y += delta * 0.1;
            if (ref.current.position.y < -25) {
                ref.current.position.y = 25;
            }
        }
    });

    return <group ref={ref} position={position}>{children}</group>
};

const DataFallingObjects = () => {
    const objects = useMemo(() => {
        const items = [];
        const objectTypes = [Icosahedron, Sphere, Box, Octahedron, TorusKnot];
        for (let i = 0; i < 70; i++) {
            items.push({
                type: objectTypes[Math.floor(Math.random() * objectTypes.length)],
                position: [
                    (Math.random() - 0.5) * 50,
                    (Math.random() - 0.5) * 50,
                    (Math.random() - 0.5) * 20 - 5,
                ] as [number, number, number],
                scale: Math.random() * 0.2 + 0.1,
            });
        }
        return items;
    }, []);

    const material = <meshStandardMaterial color="hsl(var(--primary))" wireframe emissive="hsl(var(--primary))" emissiveIntensity={0.4} />;

    return (
        <group>
            {objects.map((data, i) => (
                <FallingObject key={i} position={data.position}>
                    <data.type args={[data.scale * 4]}>
                       {material}
                    </data.type>
                </FallingObject>
            ))}
        </group>
    );
};


const AcademicFallingObjects = () => {
    const objects = useMemo(() => {
        const items = [];
        const motivationalWords = ['Learn', 'Grow', 'Imagine', 'Create', 'Innovate', 'Succeed', 'Inspire', 'Dream'];
        const objectTypes = ['word', 'book', 'pen'];
        
        for (let i = 0; i < 70; i++) { // Increased object count for variety
            const type = objectTypes[Math.floor(Math.random() * objectTypes.length)];
            items.push({
                type: type,
                content: type === 'word' ? motivationalWords[Math.floor(Math.random() * motivationalWords.length)] : '',
                position: [
                    (Math.random() - 0.5) * 50,
                    (Math.random() - 0.5) * 50,
                    (Math.random() - 0.5) * 20 - 5,
                ] as [number, number, number],
            });
        }

        return items;
    }, []);

    const bookMaterial = <meshStandardMaterial color="hsl(var(--primary))" roughness={0.6} />;
    const penMaterial = <meshStandardMaterial color="hsl(var(--secondary))" metalness={0.5} roughness={0.4} />;

    return (
        <group>
            {objects.map((data, i) => (
                <FallingObject key={i} position={data.position}>
                    {data.type === 'word' && (
                        <Text
                            fontSize={0.8 + Math.random() * 0.5} // Made words smaller
                            color="hsl(var(--primary))"
                            anchorX="center"
                            anchorY="middle"
                            font="/fonts/SpaceGrotesk-Bold.ttf"
                            material-toneMapped={false}
                        >
                            {data.content}
                        </Text>
                    )}
                    {data.type === 'book' && (
                        <Box args={[1.2, 1.6, 0.2]}>
                           {bookMaterial}
                        </Box>
                    )}
                    {data.type === 'pen' && (
                        <Cylinder args={[0.05, 0.05, 1.5, 8]}>
                           {penMaterial}
                        </Cylinder>
                    )}
                </FallingObject>
            ))}
        </group>
    );
};


const AnimatedShape = ({ type }: { type: AnimationType }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
        groupRef.current.rotation.y += delta * 0.1;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.x += delta * 0.2;
      if (type === 'home' && meshRef.current.material instanceof THREE.ShaderMaterial) {
        meshRef.current.material.uniforms.uTime.value = time;
      }
    }
  });

  const sharedMaterial = <meshStandardMaterial color="hsl(var(--primary))" wireframe emissive="hsl(var(--primary))" emissiveIntensity={0.5} />;
  
  const homeVertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const homeFragmentShader = `
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv;
      float cb = floor(uv.x * 20.) + floor(uv.y * 20.);
      vec3 color = vec3(mod(cb, 2.0));
      float strength = (sin(uTime * 2.0 + uv.x * 10.0) + cos(uTime * 1.5 + uv.y * 10.0)) * 0.1 + 0.9;
      color = mix(vec3(0.0), vec3(0.8, 0.3, 1.0) * strength, color.r);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const homeMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: homeVertexShader,
    fragmentShader: homeFragmentShader,
    side: THREE.DoubleSide
  });

  switch (type) {
    case 'home':
        return (
            <group ref={groupRef} scale={1.8}>
                <Plane ref={meshRef} args={[15, 15, 128, 128]} material={homeMaterial} rotation-x={-Math.PI * 0.2} position={[0, -1, 0]}/>
                 <TorusKnot args={[4, 0.4, 400, 44]} position={[0,0.5,0]}>
                    <meshStandardMaterial color="hsl(var(--primary))" wireframe emissive="hsl(var(--primary))" emissiveIntensity={0.7} />
                </TorusKnot>
            </group>
        )
    case 'about':
        return <AcademicFallingObjects />;
    case 'features':
       return (
        <Dodecahedron ref={meshRef} args={[1.5, 0]}>
            {sharedMaterial}
        </Dodecahedron>
       )
    case 'analytics':
        return <Starfield />;
    case 'contact':
        return (
            <Octahedron ref={meshRef} args={[1.5, 0]}>
                {sharedMaterial}
            </Octahedron>
        )
    case 'social':
        return (
            <TorusKnot ref={meshRef} args={[1.2, 0.2, 128, 16]}>
                {sharedMaterial}
            </TorusKnot>
        )
    case 'blog':
        return (
            <Sphere ref={meshRef} args={[1.4, 32, 32]}>
                {sharedMaterial}
            </Sphere>
        )
    default:
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
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 30;
            const y = (Math.random() - 0.5) * 30;
            const z = (Math.random() - 0.5) * 30;
            temp.push({ x, y, z });
        }
        return temp;
    }, [count]);
    
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        particles.forEach((particle, i) => {
            const { x, y, z } = particle;
            dummy.position.set(
                x + Math.sin(time * 0.1 + i) * 0.5,
                y + Math.cos(time * 0.1 + i) * 0.5,
                z
            );
            dummy.updateMatrix();
            if(meshRef.current) {
                (meshRef.current as any).setMatrixAt(i, dummy.matrix);
            }
        });
        if(meshRef.current) {
             (meshRef.current as any).instanceMatrix.needsUpdate = true;
        }
    });

    return (
        <instancedMesh ref={meshRef as any} args={[undefined as any, undefined as any, count]}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshStandardMaterial color="hsl(var(--foreground))" emissive="hsl(var(--foreground))" emissiveIntensity={0.2} roughness={0.9} />
        </instancedMesh>
    );
}

export function PageSpecific3DAnimation({ type }: { type: AnimationType }) {
  return (
    <div className="absolute top-0 left-0 w-full h-full z-0 opacity-20">
      <Canvas camera={{ position: [0, 0, 15], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="hsl(var(--primary))" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="hsl(var(--foreground))" />
        <AnimatedShape type={type} />
        {type !== 'about' && type !== 'analytics' && <Particles />}
      </Canvas>
    </div>
  );
}
