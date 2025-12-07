import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Cloud as DreiCloud, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      instancedMesh: any;
      icosahedronGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      fog: any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      instancedMesh: any;
      icosahedronGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      fog: any;
    }
  }
}

const FloatingParticles = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 80;
  const dummy = new THREE.Object3D();

  const particles = React.useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    if (!meshRef.current) return;

    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = (particle.t += speed / 2);
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);

      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10,
      );
      dummy.scale.setScalar(s * 0.5 + 0.8);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <icosahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial
        color="#fbbf24"
        transparent
        opacity={0.5}
        roughness={0.2}
        metalness={0.8}
        emissive="#fbbf24"
        emissiveIntensity={0.5}
      />
    </instancedMesh>
  );
};

const AtmosphericScene = () => {
  const Cloud = DreiCloud as unknown as React.ComponentType<any>;
  return (
    <>
      <ambientLight intensity={1.2} color="#fff7ed" />
      <directionalLight position={[10, 10, 5]} intensity={1.5} color="#fffbeb" />
      <pointLight position={[-10, -10, -5]} intensity={1} color="#fbbf24" />
      <pointLight position={[10, 5, 0]} intensity={0.8} color="#f59e0b" />

      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.4}>
        <Cloud opacity={0.5} speed={0.2} width={25} depth={5} segments={20} color="#fef3c7" position={[0, 0, -12]} />
        <Cloud opacity={0.4} speed={0.2} width={15} depth={2} segments={10} color="#fffbeb" position={[-12, 6, -15]} />
        <Cloud opacity={0.3} speed={0.2} width={18} depth={2} segments={12} color="#fde68a" position={[12, -6, -14]} />
      </Float>

      <FloatingParticles />

      <Stars radius={100} depth={50} count={1000} factor={4} saturation={1} fade speed={0.5} />
    </>
  );
};

export const Background3D: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <fog attach="fog" args={['#fffbeb', 5, 35]} />
        <AtmosphericScene />
      </Canvas>
    </div>
  );
};
