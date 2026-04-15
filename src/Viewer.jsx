import { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import { MathUtils, SRGBColorSpace } from 'three';

const Model = ({ url, coords, labelTextureUrl }) => {
  const { scene } = useGLTF(url);
  const labelTexture = useTexture(labelTextureUrl);
  const modelScale = MathUtils.clamp(coords.scale ?? 1, 1, 1.14);

  const modelScene = useMemo(() => {
    const clonedScene = scene.clone(true);

    clonedScene.traverse((child) => {
      if (!child.isMesh || !child.material) {
        return;
      }

      if (Array.isArray(child.material)) {
        child.material = child.material.map((material) => material.clone());
        return;
      }

      child.material = child.material.clone();
    });

    return clonedScene;
  }, [scene]);

  useEffect(() => {
    labelTexture.flipY = false;
    labelTexture.colorSpace = SRGBColorSpace;
    labelTexture.needsUpdate = true;

    modelScene.traverse((child) => {
      if (!child.isMesh || !child.material) {
        return;
      }

      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      materials.forEach((material) => {
        if (material.name === 'Body') {
          material.map = labelTexture;
          material.needsUpdate = true;
        }
      });
    });
  }, [labelTexture, modelScene]);

  const points = useMemo(() => {
    const numPoints = 1200;
    const positions = new Float32Array(numPoints * 3);

    for (let index = 0; index < numPoints; index += 1) {
      const randomSeed = Math.random() * Math.PI * 2;

      const x = -0.1 + Math.sin(randomSeed) * 0.3 + (Math.random() - 0.5) * 0.12;
      const z =
        0.05 + Math.cos(randomSeed) * 0.3 + (Math.random() - 0.5) * 0.1;

      positions[index * 3] = x;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 0.5 + 0.074;
      positions[index * 3 + 2] = z;
    }

    return positions;
  }, []);

  return (
    <>
      <group
        position={[coords.position.x, coords.position.y, coords.position.z]}
        rotation={[coords.rotation.x, coords.rotation.y, coords.rotation.z]}
        scale={modelScale}
      >
        <primitive object={modelScene} />
      </group>

      <group
        position={[
          -0.1 * coords.position.y,
          0.2 * coords.position.z,
          -0.2 * coords.position.x,
        ]}
        rotation={[
          0.25 * coords.rotation.x + 0.125 * coords.rotation.y,
          0.125 * coords.rotation.y,
          0.25 * coords.rotation.z - 0.125 * coords.rotation.x,
        ]}
      >
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={points.length / 3}
              array={points}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            color="white"
            size={0.001}
            transparent
            opacity={0.6}
          />
        </points>
      </group>
    </>
  );
};

const Viewer = ({ glbUrl, defaultCoords, labelTextureUrl }) => {
  const [coords, setCoords] = useState(defaultCoords);

  useEffect(() => {
    useGLTF.preload(glbUrl);
  }, [glbUrl]);

  useEffect(() => {
    const handleCoords = (event) => {
      const { objectCoordinates } = event.detail;
      setCoords(objectCoordinates);
    };

    window.addEventListener('coords', handleCoords);

    return () => {
      window.removeEventListener('coords', handleCoords);
    };
  }, []);

  return (
    <Canvas
      camera={{
        position: [0, 0.085, 0.3],
        rotation: [0, 0, 0],
        fov: 50,
        near: 0.1,
        far: 10,
      }}
      dpr={[1, 2]}
      gl={{ antialias: true, toneMappingExposure: 1.4 }}
      style={{ width: '100vw', height: '100vh' }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[0, 5, -5]} intensity={4.2} />
      <directionalLight position={[0, -3, 5]} intensity={1.5} />
      <pointLight position={[0, 2, 0.5]} intensity={1.2} />
      <spotLight
        position={[-5, 5, 5]}
        angle={0.3}
        penumbra={1}
        intensity={1.5}
        castShadow
      />
      <spotLight
        position={[5, 5, -5]}
        angle={0.3}
        penumbra={1}
        intensity={1.2}
        castShadow
      />

      <Suspense fallback={null}>
        <Model
          coords={coords}
          labelTextureUrl={labelTextureUrl}
          url={glbUrl}
        />
      </Suspense>
    </Canvas>
  );
};

export default Viewer;
