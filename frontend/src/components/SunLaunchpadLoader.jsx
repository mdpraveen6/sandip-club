import React, { useEffect, useRef, useState } from 'react';
import './SunLaunchpadLoader.css';

// Persistent in-memory flag: ONE FULL PAGE LOAD = ONE LOADER.
// Internal React navigation NEVER resets this state.
let initialLoaderPlayed = false;

export const SunLaunchpadLoader = () => {
  // If the initial loader has already completed in this session/page load, stay hidden.
  if (initialLoaderPlayed) {
    return null;
  }

  return <LoaderInner />;
};

const LoaderInner = () => {
  const loaderRef = useRef(null);
  const fillRef = useRef(null);
  const pctRef = useRef(null);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (initialLoaderPlayed) {
      setIsDone(true);
      return;
    }

    const DURATION = 3800; // Exact loading time in ms from sun-launchpad-loader.html
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    const loader = loaderRef.current;
    const fill = fillRef.current;
    const pct = pctRef.current;

    if (!loader || !fill || !pct) return;

    // Prevent background scrolling while loader is active
    document.body.style.overflow = 'hidden';

    let animId;
    let t1, t2;
    const t0 = performance.now();

    function finish() {
      if (loader) {
        loader.classList.add('done');
      }

      // Smooth fade-out and scale transition
      t1 = setTimeout(() => {
        if (loader) {
          loader.classList.add('hide');
        }
      }, 1100);

      // Once the fade transition finishes, hide completely and unlock
      t2 = setTimeout(() => {
        initialLoaderPlayed = true;
        document.body.style.overflow = '';
        if (loader) {
          loader.style.display = 'none';
        }
        setIsDone(true);
      }, 2000);
    }

    function tick(now) {
      const p = Math.min(1, (now - t0) / DURATION);
      const v = Math.round(ease(p) * 100);
      if (fill) fill.style.width = v + '%';
      if (pct) pct.textContent = v + '%';

      if (p < 1) {
        animId = requestAnimationFrame(tick);
      } else {
        finish();
      }
    }

    animId = requestAnimationFrame(tick);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      document.body.style.overflow = '';
    };
  }, []);

  if (isDone) {
    return null;
  }

  return (
    <div id="loader" ref={loaderRef} aria-label="Loading">
      <div className="badge">
        <svg className="outer" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="49" pathLength="1" />
        </svg>
        <div className="disc">
          <div className="ly ring"></div>
          <div className="ly bulb"></div>
          <div className="ly t sun"></div>
          <div className="ly t club"></div>
          <div className="ly t tag"></div>
        </div>
      </div>
      <div className="name">SANDIP UNIVERSITY, NASHIK</div>
      <div className="bar">
        <i ref={fillRef} id="fill"></i>
      </div>
      <div className="pct" ref={pctRef} id="pct">
        0%
      </div>
    </div>
  );
};
