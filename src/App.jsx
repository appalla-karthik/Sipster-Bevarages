import { Suspense, useLayoutEffect, useState } from 'react';
import Lenis from 'lenis';
import gsap, { Quad } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import FlavorLineup from './FlavorLineup';
import Viewer from './Viewer';
import './main.scss';

import modelUrl from '../assets/models/coke.glb';
import labelTextureUrl from '../assets/textures/sipster-classic-soda-v2.jpg';

gsap.registerPlugin(ScrollTrigger);

const brandName = 'Sipster';

const defaultCoordinates = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: 1,
};

const navItems = [
  { id: 'hero', label: 'Home' },
  { id: 'taste', label: 'Signature' },
  { id: 'craft', label: 'Craft' },
  { id: 'launch', label: 'Launch' },
  { id: 'flavor-zero', label: 'Flavors' },
];

const flavorMoments = [
  {
    id: 'zero',
    sectionId: 'flavor-zero',
    label: 'Arctic Zero',
    badge: 'Zero sugar',
    accent: '#f4f6ff',
    base: '#d9dfef',
    textColor: '#14161a',
    notes: ['Cold finish', 'Silver lift', 'No-sugar hit'],
  },
  {
    id: 'vanilla',
    sectionId: 'flavor-vanilla',
    label: 'Gold Vanilla',
    badge: 'Vanilla blend',
    accent: '#f0d39a',
    base: '#d0a25f',
    textColor: '#fff8ec',
    notes: ['Creamy nose', 'Warm cola', 'Soft sparkle'],
  },
  {
    id: 'original',
    sectionId: 'flavor-original',
    label: 'Red Classic',
    badge: 'Original taste',
    accent: '#ff5c57',
    base: '#d92722',
    textColor: '#fff5ef',
    notes: ['Bold body', 'Bright fizz', 'Iconic finish'],
  },
];

const encodeSvg = (svgMarkup) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;

const createLabelTexture = ({ label, badge, accent, base, textColor }) =>
  encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${accent}" />
          <stop offset="52%" stop-color="${base}" />
          <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" rx="96" fill="url(#bg)" />
      <rect width="1024" height="1024" rx="96" fill="rgba(255,255,255,0.08)" />
      <g fill="${textColor}" font-family="Arial, Helvetica, sans-serif">
        <text x="512" y="208" text-anchor="middle" font-size="46" letter-spacing="12" opacity="0.76">${badge.toUpperCase()}</text>
        <text x="512" y="552" text-anchor="middle" font-size="188" font-style="italic" font-weight="700">Sipster</text>
        <text x="512" y="684" text-anchor="middle" font-size="68" font-weight="700" letter-spacing="10">${label.toUpperCase()}</text>
        <text x="512" y="796" text-anchor="middle" font-size="36" letter-spacing="8" opacity="0.78">crafted soda expression</text>
      </g>
      <circle cx="512" cy="512" r="362" fill="none" stroke="${textColor}" stroke-opacity="0.16" stroke-width="20" />
    </svg>
  `);

const flavorTextureMap = Object.fromEntries(
  flavorMoments.map((flavor) => [flavor.sectionId, createLabelTexture(flavor)])
);

const sections = [
  {
    id: 'hero',
    className: 'section section--1',
    sequence: '01',
    scale: 1.14,
    position: { x: 0, y: 0, z: -0.1 },
    rotation: { x: 0.8, y: 0, z: 0 },
    label: 'Sipster Soda',
    strap: '',
    lines: ['The new', 'Sipster can.'],
  },
  {
    id: 'design',
    className: 'section section--2',
    sequence: '02',
    scale: 1,
    position: { x: 0, y: 0, z: -0.1 },
    rotation: { x: 0.8, y: 2, z: 0 },
    label: 'Signature Silhouette',
    strap: 'Minimal luxury with bold presence and polished detail.',
    lines: ['A refined form.', 'Unmistakable presence.'],
  },
  {
    id: 'taste',
    className: 'section section--3',
    sequence: '03',
    scale: 1,
    position: { x: 0, y: 0.05, z: 0 },
    rotation: { x: -1.2, y: 2.5, z: 0 },
    label: 'Masterblend Profile',
    strap: 'A balanced cola with warm vanilla and crisp finish.',
    lines: ['Smooth carbonation.', 'Deep cola richness.'],
  },
  {
    id: 'craft',
    className: 'section section--4',
    sequence: '04',
    scale: 1,
    position: { x: 0.08, y: 0.04, z: 0.1 },
    rotation: { x: -0.8, y: 4, z: 0 },
    label: 'Premium Craftsmanship',
    strap: 'Engineered with precision, from label to pour.',
    lines: ['Meticulous detail.', 'Bold beverage architecture.'],
  },
  {
    id: 'launch',
    className: 'section section--5',
    sequence: '05',
    scale: 1,
    position: { x: -0.1, y: 0, z: 0 },
    rotation: { x: 0.1, y: 0, z: 0.1 },
    label: 'Arrival Edition',
    strap: 'A brand experience crafted to own the moment.',
    lines: ['Ready for launch.', 'Built to inspire.'],
  },
  {
    id: 'flavor-zero',
    className: 'section section--6 section--flavor section--flavor-zero',
    sequence: '06',
    scale: 1,
    position: { x: 0.14, y: -0.03, z: 0.05 },
    rotation: { x: 0.18, y: 1.7, z: 0.16 },
    label: 'Arctic Zero',
    strap: 'A colder expression with silver energy and a clean no-sugar finish.',
    lines: ['Zero sugar.', 'Full attitude.'],
    flavorKey: 'zero',
  },
  {
    id: 'flavor-vanilla',
    className: 'section section--6 section--flavor section--flavor-vanilla',
    sequence: '07',
    scale: 1,
    position: { x: 0.08, y: -0.04, z: 0.05 },
    rotation: { x: -0.08, y: 3.55, z: -0.05 },
    label: 'Gold Vanilla',
    strap: 'The warmer variant, smoother on entry and richer through the middle.',
    lines: ['Velvet vanilla.', 'Golden cola.'],
    flavorKey: 'vanilla',
  },
  {
    id: 'flavor-original',
    className: 'section section--6 section--flavor section--flavor-original',
    sequence: '08',
    scale: 1,
    position: { x: 0.1, y: 0.07, z: 0.04 },
    rotation: { x: 0.14, y: 5.25, z: 0.11 },
    label: 'Red Classic',
    strap: 'The strongest presence in the lineup, built for that familiar cola punch.',
    lines: ['Pure original.', 'Maximum presence.'],
    flavorKey: 'original',
  },
  {
    id: 'lineup',
    className: 'section section--7',
    sequence: '09',
    scale: 1,
    position: { x: 0, y: 0.16, z: -0.02 },
    rotation: { x: 0.05, y: 6.28, z: -0.24 },
    label: 'Flavor Lineup',
    strap: '',
    lines: [],
    lineup: true,
  },
];

const getInterpolatedValue = (current, next, progress) =>
  gsap.utils.interpolate(current, next, progress);

function App() {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const activeLabelTextureUrl = flavorTextureMap[activeSection] || labelTextureUrl;

  useLayoutEffect(() => {
    const objectCoordinates = {
      position: { ...defaultCoordinates.position },
      rotation: { ...defaultCoordinates.rotation },
      scale: defaultCoordinates.scale,
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
    const getTriggerWindow = (index) => {
      if (index === 0) {
        return {
          start: 'center center',
          end: 'bottom center',
        };
      }

      if (index >= 4) {
        return {
          start: 'top 80%',
          end: index === pageSections.length - 1 ? 'bottom 46%' : 'bottom 50%',
        };
      }

      return {
        start: 'top center',
        end: index === pageSections.length - 1 ? 'center center' : 'bottom center',
      };
    };

    const triggers = pageSections.map((section, index) =>
      ScrollTrigger.create({
        trigger: section,
        start: getTriggerWindow(index).start,
        end: getTriggerWindow(index).end,
        scrub: 1,
        onToggle: (self) => {
          if (self.isActive) {
            setActiveSection(section.id);
          }
        },
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

          const currentScale =
            (index === 0
              ? defaultCoordinates.scale
              : parseFloat(previousSection.dataset.scale)) || defaultCoordinates.scale;

          const nextScale =
            parseFloat(section.dataset.scale) || defaultCoordinates.scale;

          gsap.to(objectCoordinates, {
            scale: getInterpolatedValue(currentScale, nextScale, progress),
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
              scale: objectCoordinates.scale,
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
      <div className={`viewer-shell ${activeSection === 'lineup' ? 'viewer-shell--hidden' : ''}`}>
        <Suspense fallback={null}>
          <Viewer
            glbUrl={modelUrl}
            defaultCoords={defaultCoordinates}
            labelTextureUrl={activeLabelTextureUrl}
          />
        </Suspense>
      </div>

      <div className="bubbles" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, index) => (
          <span key={index} className={`bubble bubble--${index + 1}`} />
        ))}
      </div>

      <div className="backdrop-noise" />
      <div className="ambient-glow ambient-glow--one" />
      <div className="ambient-glow ambient-glow--two" />
      <div className="frame-line frame-line--top" />
      <div className="frame-line frame-line--left" />
      <div className="frame-line frame-line--right" />
      <div className="scroll-badge">
        <span>Scroll Signal</span>
        <strong>{activeSection}</strong>
      </div>

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
            data-title={section.label}
            data-sequence={section.sequence}
            data-scale={section.scale}
            data-position-x={section.position.x}
            data-position-y={section.position.y}
            data-position-z={section.position.z}
            data-rotation-x={section.rotation.x}
            data-rotation-y={section.rotation.y}
            data-rotation-z={section.rotation.z}
          >
            {section.lineup ? (
              <FlavorLineup glbUrl={modelUrl} />
            ) : section.flavorKey ? (
              <div className="flavor-stage">
                <div className="flavor-stage__copy">
                  <div className="section-meta">
                    <span className="section-index">{section.sequence}</span>
                    <span className="section-rule" />
                  </div>
                  <span className="section-label">{section.label}</span>
                  <h1>
                    {section.lines.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </h1>
                  {section.strap && <p>{section.strap}</p>}
                </div>

                <div className="flavor-stage__rail" aria-label="Sipster flavors">
                  {flavorMoments.map((flavor) => (
                    <div
                      key={flavor.id}
                      className={`flavor-pill ${
                        section.flavorKey === flavor.id ? 'flavor-pill--active' : ''
                      }`}
                    >
                      <span className="flavor-pill__badge">{flavor.badge}</span>
                      <strong>{flavor.label}</strong>
                      <small>{flavor.notes.join(' / ')}</small>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`section-copy ${section.id === 'hero' ? 'section-copy--hero' : ''}`}>
                <span className="section-label">{section.label}</span>
                {section.id === 'hero' ? (
                  <>
                    <div className="hero-side hero-side--left">
                      <span>The new</span>
                      <span>Sipster can.</span>
                    </div>
                    <div className="hero-side hero-side--right">
                      <span>Way more than</span>
                      <span>a container.</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="section-meta">
                      <span className="section-index">{section.sequence}</span>
                      <span className="section-rule" />
                    </div>
                    <h1>
                      {section.lines.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </h1>
                    {section.strap && <p>{section.strap}</p>}
                  </>
                )}
              </div>
            )}
          </section>
        ))}
      </main>

      <footer className="site-footer">Sipster - a visionary beverage expression designed for memorable moments.</footer>
    </>
  );
}

export default App;
