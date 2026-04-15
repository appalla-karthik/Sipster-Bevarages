import { Suspense, useLayoutEffect } from 'react';
import Lenis from 'lenis';
import gsap, { Quad } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Viewer from './Viewer';
import './main.scss';

import modelUrl from '../assets/models/coke.glb';
import labelTextureUrl from '../assets/textures/sipster-classic-soda-v2.jpg';

gsap.registerPlugin(ScrollTrigger);

const brandName = 'Sipster';

const defaultCoordinates = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
};

const navItems = [
  { id: 'hero', label: 'Home' },
  { id: 'taste', label: 'Taste' },
  { id: 'craft', label: 'Craft' },
  { id: 'launch', label: 'Launch' },
];

const sections = [
  {
    id: 'hero',
    className: 'section section--1 section--double-text',
    position: { x: 0, y: 0, z: -0.1 },
    rotation: { x: 0.8, y: 0, z: 0 },
    type: 'double',
    lines: [`The new ${brandName} can.`, 'Way more than a container.'],
  },
  {
    id: 'design',
    className: 'section section--2 section--double-text',
    position: { x: 0, y: 0, z: -0.1 },
    rotation: { x: 0.8, y: 2, z: 0 },
    type: 'double',
    lines: ['The same timeless design.', 'The same taste you know and love.'],
  },
  {
    id: 'taste',
    className: 'section section--3 section--single-text',
    position: { x: 0, y: 0.05, z: 0 },
    rotation: { x: -1.2, y: 2.5, z: 0 },
    type: 'single',
    lines: ['Bright fizz. Smooth cola finish.'],
  },
  {
    id: 'craft',
    className: 'section section--4 section--left-text',
    position: { x: 0.08, y: 0.04, z: 0.1 },
    rotation: { x: -0.8, y: 4, z: 0 },
    type: 'single',
    lines: ['A colder shell with richer depth.'],
  },
  {
    id: 'launch',
    className: 'section section--5 section--right-text',
    position: { x: -0.1, y: 0, z: 0 },
    rotation: { x: 0.1, y: 0, z: 0.1 },
    type: 'single',
    lines: ['A fictional brand that still feels shelf-ready.'],
  },
];

const getInterpolatedValue = (current, next, progress) =>
  gsap.utils.interpolate(current, next, progress);

const renderHeading = (section) => {
  if (section.type === 'double') {
    return (
      <h1>
        {section.lines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h1>
    );
  }

  return <h1>{section.lines[0]}</h1>;
};

function App() {
  useLayoutEffect(() => {
    const objectCoordinates = {
      position: { ...defaultCoordinates.position },
      rotation: { ...defaultCoordinates.rotation },
    };

    const mouse = {
      x: 0.5 * window.innerWidth,
      y: 0.5 * window.innerHeight,
    };
    const mouseTarget = { ...mouse };

    const addedRotation = { x: 0, y: 0, z: 0 };
    const addedPosition = { x: 0, y: 0, z: 0 };

    const lenis = new Lenis({
      smoothWheel: true,
      touchMultiplier: 1,
      wheelMultiplier: 0.5,
    });

    const pageSections = gsap.utils.toArray('.section');
    const triggers = pageSections.map((section, index) =>
      ScrollTrigger.create({
        trigger: section,
        start: index === 0 ? 'center center' : 'top center',
        end:
          index === pageSections.length - 1 ? 'center center' : 'bottom center',
        scrub: 1,
        onUpdate: (self) => {
          const progress = Quad.easeInOut(self.progress);
          const previousSection = pageSections[index - 1];

          const currentRotation = {
            x:
              (index === 0
                ? defaultCoordinates.rotation.x
                : parseFloat(previousSection.dataset.rotationX)) ||
              defaultCoordinates.rotation.x,
            y:
              (index === 0
                ? defaultCoordinates.rotation.y
                : parseFloat(previousSection.dataset.rotationY)) ||
              defaultCoordinates.rotation.y,
            z:
              (index === 0
                ? defaultCoordinates.rotation.z
                : parseFloat(previousSection.dataset.rotationZ)) ||
              defaultCoordinates.rotation.z,
          };

          const nextRotation = {
            x:
              parseFloat(section.dataset.rotationX) || defaultCoordinates.rotation.x,
            y:
              parseFloat(section.dataset.rotationY) || defaultCoordinates.rotation.y,
            z:
              parseFloat(section.dataset.rotationZ) || defaultCoordinates.rotation.z,
          };

          gsap.to(objectCoordinates.rotation, {
            x: getInterpolatedValue(currentRotation.x, nextRotation.x, progress),
            y: getInterpolatedValue(currentRotation.y, nextRotation.y, progress),
            z: getInterpolatedValue(currentRotation.z, nextRotation.z, progress),
            duration: 0,
          });

          const currentPosition = {
            x:
              (index === 0
                ? defaultCoordinates.position.x
                : parseFloat(previousSection.dataset.positionX)) ||
              defaultCoordinates.position.x,
            y:
              (index === 0
                ? defaultCoordinates.position.y
                : parseFloat(previousSection.dataset.positionY)) ||
              defaultCoordinates.position.y,
            z:
              (index === 0
                ? defaultCoordinates.position.z
                : parseFloat(previousSection.dataset.positionZ)) ||
              defaultCoordinates.position.z,
          };

          const nextPosition = {
            x:
              parseFloat(section.dataset.positionX) || defaultCoordinates.position.x,
            y:
              parseFloat(section.dataset.positionY) || defaultCoordinates.position.y,
            z:
              parseFloat(section.dataset.positionZ) || defaultCoordinates.position.z,
          };

          const responsiveFactor = window.innerWidth < 800 ? 0.5 : 1;

          gsap.to(objectCoordinates.position, {
            x:
              responsiveFactor *
              getInterpolatedValue(currentPosition.x, nextPosition.x, progress),
            y: getInterpolatedValue(currentPosition.y, nextPosition.y, progress),
            z: getInterpolatedValue(currentPosition.z, nextPosition.z, progress),
            duration: 0,
          });
        },
      })
    );

    let frameId = 0;

    const animate = (time) => {
      lenis.raf(time);
      ScrollTrigger.update();

      mouse.x += (mouseTarget.x - mouse.x) * 0.02;
      mouse.y += (mouseTarget.y - mouse.y) * 0.02;

      addedPosition.y = 0.006 * Math.sin(0.0006 * time);
      addedRotation.y += 0.001;
      addedRotation.z =
        0.1 * (0.5 - Math.sin(0.0002 * time)) +
        0.05 * (0.5 - Math.sin(0.00034 * time));

      window.dispatchEvent(
        new CustomEvent('coords', {
          detail: {
            objectCoordinates: {
              ...objectCoordinates,
              position: {
                ...objectCoordinates.position,
                x:
                  0.00001 * (mouse.x - 0.5 * window.innerWidth) +
                  objectCoordinates.position.x,
                y:
                  0.00001 * (mouse.y - 0.5 * window.innerHeight) +
                  objectCoordinates.position.y +
                  addedPosition.y,
              },
              rotation: {
                ...objectCoordinates.rotation,
                y:
                  -0.0015 * (mouse.x - 0.5 * window.innerWidth) +
                  objectCoordinates.rotation.y +
                  addedRotation.y,
                x:
                  -0.0015 * (mouse.y - 0.5 * window.innerHeight) +
                  objectCoordinates.rotation.x +
                  addedRotation.x,
                z: objectCoordinates.rotation.z + addedRotation.z,
              },
            },
          },
        })
      );

      frameId = window.requestAnimationFrame(animate);
    };

    const handleMouseMove = (event) => {
      mouseTarget.x = event.clientX;
      mouseTarget.y = event.clientY;
    };

    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    frameId = window.requestAnimationFrame(animate);
    ScrollTrigger.refresh();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      triggers.forEach((trigger) => trigger.kill());
      lenis.destroy();
    };
  }, []);

  const handleNavClick = (sectionId) => {
    const target = document.getElementById(sectionId);

    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <div className="viewer-shell">
        <Suspense fallback={null}>
          <Viewer
            glbUrl={modelUrl}
            defaultCoords={defaultCoordinates}
            labelTextureUrl={labelTextureUrl}
          />
        </Suspense>
      </div>

      <div className="backdrop-noise" />
      <div className="ambient-glow ambient-glow--one" />
      <div className="ambient-glow ambient-glow--two" />

      <header className="site-header">
        <span className="brand-mark" aria-label={brandName}>
          {brandName}
        </span>

        <nav className="page-nav" aria-label="Sipster navigation">
          {navItems.map((item) => (
            <button key={item.id} type="button" onClick={() => handleNavClick(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="experience">
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className={section.className}
            data-position-x={section.position.x}
            data-position-y={section.position.y}
            data-position-z={section.position.z}
            data-rotation-x={section.rotation.x}
            data-rotation-y={section.rotation.y}
            data-rotation-z={section.rotation.z}
          >
            {renderHeading(section)}
          </section>
        ))}
      </main>

      <footer className="site-footer">A fictional beverage concept for Sipster.</footer>
    </>
  );
}

export default App;
