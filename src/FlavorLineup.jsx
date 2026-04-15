import { Suspense, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, useGLTF, useTexture } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

const metalMaterial = new THREE.MeshStandardMaterial({
  roughness: 0.3,
  metalness: 1,
  color: '#bbbbbb',
});

const lineupFlavors = {
  zero: {
    name: 'Sipster Coke Zero',
    badge: 'Zero Sugar',
    accent: '#f4f4f2',
    base: '#d8d8d4',
    text: '#e3312c',
  },
  vanilla: {
    name: 'Sipster Coke Vanilla',
    badge: 'Vanilla Blend',
    accent: '#e7c78b',
    base: '#cda25e',
    text: '#fff5e6',
  },
  original: {
    name: 'Sipster Coke Classic',
    badge: 'Original Taste',
    accent: '#ff5044',
    base: '#ce201d',
    text: '#fff4ef',
  },
};

const encodeSvg = (svgMarkup) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;

const createLabelTexture = ({ name, badge, accent, base, text }) =>
  encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
      <defs>
        <linearGradient id="can-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="48%" stop-color="${base}" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" rx="88" fill="url(#can-bg)" />
      <g fill="${text}" font-family="Arial, Helvetica, sans-serif">
        <text x="512" y="176" text-anchor="middle" font-size="42" letter-spacing="10" opacity="0.82">${badge.toUpperCase()}</text>
        <text x="512" y="510" text-anchor="middle" font-size="164" font-style="italic" font-weight="700">Sipster</text>
        <text x="512" y="638" text-anchor="middle" font-size="64" font-weight="700" letter-spacing="6">COKE</text>
        <text x="512" y="736" text-anchor="middle" font-size="54" font-weight="700" letter-spacing="5">${name.replace('Sipster Coke ', '').toUpperCase()}</text>
      </g>
    </svg>
  `);

function CokeCan({ taste }) {
  const { nodes } = useGLTF('/can/Soda-can.gltf');
  const labelUri = useMemo(() => createLabelTexture(lineupFlavors[taste]), [taste]);
  const label = useTexture(labelUri);

  label.flipY = false;

  return (
    <group dispose={null} scale={2.2} rotation={[0, -Math.PI, 0]}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.cylinder.geometry}
        material={metalMaterial}
      />
      <mesh castShadow receiveShadow geometry={nodes.cylinder_1.geometry}>
        <meshStandardMaterial roughness={0.25} metalness={0.7} map={label} />
      </mesh>
      <mesh castShadow receiveShadow geometry={nodes.Tab.geometry} material={metalMaterial} />
    </group>
  );
}

useGLTF.preload('/can/Soda-can.gltf');

function FloatingCan({ taste, canRef }) {
  return (
    <group ref={canRef}>
      <Float>
        <CokeCan taste={taste} />
      </Float>
    </group>
  );
}

function BubbleField({
  count = 160,
  speed = 2,
  bubbleSize = 0.03,
  opacity = 0.45,
}) {
  const meshRef = useRef(null);
  const bubbleObject = useMemo(() => new THREE.Object3D(), []);
  const bubbleSpeed = useRef(new Float32Array(count));

  const geometry = useMemo(() => new THREE.SphereGeometry(bubbleSize, 16, 16), [bubbleSize]);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        transparent: true,
        opacity,
      }),
    [opacity]
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;

    if (!mesh) {
      return undefined;
    }

    const minSpeed = speed * 0.001;
    const maxSpeed = speed * 0.005;

    for (let index = 0; index < count; index += 1) {
      bubbleObject.position.set(
        gsap.utils.random(-4, 4),
        gsap.utils.random(-4, 4),
        gsap.utils.random(-4, 4)
      );
      bubbleObject.updateMatrix();
      mesh.setMatrixAt(index, bubbleObject.matrix);
      bubbleSpeed.current[index] = gsap.utils.random(minSpeed, maxSpeed);
    }

    mesh.instanceMatrix.needsUpdate = true;

    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [bubbleObject, count, geometry, material, speed]);

  useFrame(() => {
    const mesh = meshRef.current;

    if (!mesh) {
      return;
    }

    material.color = new THREE.Color('#db4f41');

    for (let index = 0; index < count; index += 1) {
      mesh.getMatrixAt(index, bubbleObject.matrix);
      bubbleObject.position.setFromMatrixPosition(bubbleObject.matrix);
      bubbleObject.position.y += bubbleSpeed.current[index];

      if (bubbleObject.position.y > 4) {
        bubbleObject.position.y = -2;
        bubbleObject.position.x = gsap.utils.random(-4, 4);
        bubbleObject.position.z = gsap.utils.random(0, 8);
      }

      bubbleObject.updateMatrix();
      mesh.setMatrixAt(index, bubbleObject.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      position={[0, 0, 0]}
      material={material}
      geometry={geometry}
    />
  );
}

function LineupScene() {
  const canRef = useRef(null);
  const canTwoRef = useRef(null);
  const canThreeRef = useRef(null);
  const canGroupRef = useRef(null);

  useLayoutEffect(() => {
    if (!canRef.current || !canTwoRef.current || !canThreeRef.current || !canGroupRef.current) {
      return undefined;
    }

    const media = gsap.matchMedia();

    media.add('(max-width: 1240px)', () => {
      gsap.set(canRef.current.position, { z: 0.5 });
      gsap.set(canTwoRef.current.position, { y: -5 });
      gsap.set(canThreeRef.current.position, { y: -5 });

      const lastSectionMobileTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#fifth-section',
          start: 'top bottom',
          end: 'bottom -15%',
          scrub: 0.35,
        },
      });

      lastSectionMobileTimeline
        .to(canRef.current.position, { x: 0, y: 3.05, z: -1.85 }, 0)
        .to(canRef.current.rotation, { z: -0.24, y: 0.08 }, 0)
        .to(canTwoRef.current.position, { y: 2.95, x: 0.98, z: -2.2 }, 0)
        .to(canTwoRef.current.rotation, { z: -0.22, y: 0.22 }, 0)
        .to(canThreeRef.current.position, { y: 2.9, x: -0.98, z: -2.7 }, 0)
        .to(canThreeRef.current.rotation, { z: 0.22, y: -0.22 }, 0);
    });

    media.add('(min-width: 1241px)', () => {
      gsap.set(canRef.current.rotation, { z: -0.25 });
      gsap.set(canRef.current.position, { z: 0.5 });
      gsap.set(canTwoRef.current.position, { y: -5 });
      gsap.set(canThreeRef.current.position, { y: -5 });

      const reverseScrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#fifth-section',
          start: 'top bottom',
          end: 'bottom -35%',
          scrub: 0.35,
        },
      });

      reverseScrollTimeline
        .to(canGroupRef.current.rotation, { y: Math.PI }, 0)
        .to(canRef.current.rotation, { y: 0.08, z: -0.24 }, 0)
        .to(canRef.current.position, { x: 0, y: 0.55, z: -0.2 }, 0);

      const showSecondAndThirdCanTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#fifth-section',
          start: 'top bottom',
          end: 'bottom -15%',
          scrub: 0.35,
        },
      });

      showSecondAndThirdCanTimeline
        .to(canTwoRef.current.position, { y: 0.38, x: 2.15, z: -0.3 }, 0)
        .to(canTwoRef.current.rotation, { y: 0.26, z: -0.22 }, 0)
        .to(canThreeRef.current.position, { y: 0.34, x: -2.15, z: -0.7 }, 0)
        .to(canThreeRef.current.rotation, { y: -0.28, z: 0.22 }, 0);
    });

    return () => {
      media.revert();
    };
  }, []);

  return (
    <group ref={canGroupRef}>
      <FloatingCan canRef={canRef} taste="vanilla" />
      <FloatingCan canRef={canTwoRef} taste="original" />
      <FloatingCan canRef={canThreeRef} taste="zero" />
      <Environment files="/hdr/lebombo_1k.hdr" environmentIntensity={1.25} />
      <BubbleField />
    </group>
  );
}

function FlavorLineup() {
  return (
    <div id="fifth-section" className="flavor-lineup">
      <div className="flavor-lineup__scene" aria-hidden="true">
        <Canvas
          shadows
          dpr={[1, 1.5]}
          gl={{ antialias: true }}
          camera={{ fov: 30, position: [0, 0, 8] }}
        >
          <Suspense fallback={null}>
            <LineupScene />
          </Suspense>
        </Canvas>
      </div>

      <div className="flavor-lineup__desktop-actions">
        <p className="flavor-lineup__name">Sipster Coke Classic</p>
        <p className="flavor-lineup__name">Sipster Coke Vanilla</p>
        <p className="flavor-lineup__name">Sipster Coke Zero</p>
      </div>

      <div className="flavor-lineup__mobile-actions">
        <p className="flavor-lineup__name flavor-lineup__name--stacked">
          Sipster Coke Zero / Vanilla / Classic
        </p>
      </div>

      <div className="flavor-lineup__footer-copy">
        <h2>
          
        </h2>
        <h2></h2>
      </div>
    </div>
  );
}

export default FlavorLineup;
