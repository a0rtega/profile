(function () {

  const CONFIG = {
    colors: ['#ff2244', '#00e676', '#ffcc00', '#00e5ff', '#ffffff'], // Crimson Red, Emerald Green, Cyber Gold, Ice Blue, Snow White
    startDate: { month: 11, day: 1 },  // December 1st (month is 0-indexed)
    endDate:   { month: 0,  day: 7  }  // January 7th
  };

  /* Characters for the matrix rain — binary, hex, katakana */
  const GLYPHS = '01アイウエオカキクケコサシスセソタチツテト0123456789ABCDEFabcdef#@$%';

  /* Christmas-themed matrix rain streams (Red, Green, Gold, Ice) */
  const RAIN_PALETTES = [
    { head: 'rgba(210,255,225,', body: '0,230,118' }, // Emerald Green
    { head: 'rgba(255,220,225,', body: '255,34,68' }, // Crimson Red
    { head: 'rgba(255,250,210,', body: '255,204,0' }, // Holiday Gold
    { head: 'rgba(230,250,255,', body: '0,229,255' }  // Ice Blue
  ];

  function isFestiveSeason() {
    const today = new Date();
    const month = today.getMonth();
    const day   = today.getDate();
    if (month === CONFIG.startDate.month && day >= CONFIG.startDate.day) return true;
    if (month === CONFIG.endDate.month   && day <= CONFIG.endDate.day)   return true;
    return false;
  }

  /* ── Styles ──────────────────────────────────────────────────── */
  let stylesInjected = false;
  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    const style = document.createElement('style');
    style.id = 'festive-styles';
    style.innerHTML = `
      #festive-canvas {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        pointer-events: none;
        z-index: 9998;
        opacity: 0.55;
      }
      /* PCB trace bar */
      #festive-lights-container {
        position: fixed;
        top: 0; left: 0;
        width: 100%;
        height: 14px;
        z-index: 9999;
        display: flex;
        justify-content: space-evenly;
        align-items: flex-start;
        pointer-events: none;
        background: #080a08;
        /* Subtle red/green/gold PCB trace lines */
        background-image:
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 16px,
            rgba(255,34,68,0.08) 16px,
            rgba(255,34,68,0.08) 17px,
            rgba(0,230,118,0.08) 17px,
            rgba(0,230,118,0.08) 18px,
            transparent 18px,
            transparent 22px
          );
        border-bottom: 1px solid rgba(255,204,0,0.3);
        box-shadow: 0 2px 10px rgba(255,34,68,0.15), 0 2px 6px rgba(0,230,118,0.15);
      }
      /* PCB via / connector pad */
      .festive-socket {
        position: relative;
        width: 8px;
        height: 8px;
        background: #111;
        border: 1px solid #333;
        border-radius: 1px;
        margin-top: 3px;
        display: flex;
        justify-content: center;
      }
      /* Square neon LED */
      .festive-bulb {
        position: absolute;
        top: 7px;
        width: 14px;
        height: 14px;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: "Lucida Console", "Courier New", monospace;
        font-size: 8px;
        font-weight: bold;
        color: #000;
        animation: cyber-flicker 3.5s infinite;
      }
      @keyframes cyber-flicker {
        0%,  89% { opacity: 1;   filter: brightness(1);   }
        90%       { opacity: 0.1; filter: brightness(0.3); }
        91%       { opacity: 1;   filter: brightness(2);   }
        92%       { opacity: 0.3; filter: brightness(0.4); }
        93%       { opacity: 1;   filter: brightness(1.6); }
        94%, 100% { opacity: 1;   filter: brightness(1);   }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── Matrix rain ─────────────────────────────────────────────── */
  let rainCanvas = null;
  let rainAnimId = null;
  let rainResizeHandler = null;

  function startMatrixRain() {
    if (rainCanvas) return;
    rainCanvas = document.createElement('canvas');
    rainCanvas.id = 'festive-canvas';
    document.body.appendChild(rainCanvas);
    const ctx = rainCanvas.getContext('2d');

    const CELL = 14; /* px per character cell */
    let W, H, cols;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      if (rainCanvas) {
        rainCanvas.width  = W;
        rainCanvas.height = H;
      }
      cols = Math.floor(W / CELL);
    }
    resize();
    rainResizeHandler = resize;
    window.addEventListener('resize', rainResizeHandler);

    /* Active drop streams */
    const drops = [];

    function spawnDrop() {
      if (!rainCanvas) return;
      const length = Math.floor(Math.random() * 10) + 5; /* 5-15 glyphs */
      const chars  = Array.from({ length: length + 4 },
        () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]);
      const palette = RAIN_PALETTES[Math.floor(Math.random() * RAIN_PALETTES.length)];
      drops.push({
        col:    Math.floor(Math.random() * cols),
        y:      -(length + 2),               /* start above viewport */
        length,
        chars,
        palette,
        speed:  0.25 + Math.random() * 0.45  /* cells per frame     */
      });
    }

    /* Seed ~28% of columns with staggered starts */
    const TARGET = Math.max(8, Math.floor(cols * 0.28));
    for (let i = 0; i < TARGET; i++) {
      setTimeout(spawnDrop, Math.random() * 4000);
    }

    function frame() {
      if (!rainCanvas) return;
      ctx.clearRect(0, 0, W, H);
      ctx.font = `${CELL - 1}px monospace`;

      for (let d = drops.length - 1; d >= 0; d--) {
        const drop = drops[d];
        drop.y += drop.speed;

        for (let j = 0; j < drop.length; j++) {
          const cy = Math.round((drop.y - j) * CELL);
          if (cy < -CELL || cy > H) continue;

          /* Randomly mutate a glyph in the trail */
          if (Math.random() < 0.04) {
            drop.chars[j] = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }

          /* Head: bright gleaming tint; tail fades in festive color */
          const alpha = Math.max(0, 1 - j / drop.length);
          if (j === 0) {
            ctx.fillStyle = `${drop.palette.head}${alpha})`;
          } else {
            ctx.fillStyle = `rgba(${drop.palette.body},${alpha * 0.85})`;
          }
          ctx.fillText(drop.chars[j], drop.col * CELL, cy);
        }

        /* Recycle when the whole trail has left the screen */
        if ((drop.y - drop.length) * CELL > H) {
          drops.splice(d, 1);
          setTimeout(spawnDrop, Math.random() * 2500);
        }
      }

      rainAnimId = requestAnimationFrame(frame);
    }

    rainAnimId = requestAnimationFrame(frame);
  }

  function stopMatrixRain() {
    if (rainAnimId) {
      cancelAnimationFrame(rainAnimId);
      rainAnimId = null;
    }
    if (rainResizeHandler) {
      window.removeEventListener('resize', rainResizeHandler);
      rainResizeHandler = null;
    }
    if (rainCanvas) {
      rainCanvas.remove();
      rainCanvas = null;
    }
  }

  /* ── Cyber LED strip ─────────────────────────────────────────── */
  let lightsResizeHandler = null;
  let lightsResizeTimer = null;

  function renderBulbs(container) {
    container.innerHTML = '';
    const count = Math.floor(window.innerWidth / 28);

    for (let i = 0; i < count; i++) {
      const socket = document.createElement('div');
      socket.className = 'festive-socket';

      const bulb = document.createElement('div');
      bulb.className = 'festive-bulb';

      const color = CONFIG.colors[i % CONFIG.colors.length];
      bulb.style.backgroundColor = color;
      bulb.style.boxShadow = `0 0 5px ${color}, 0 0 12px ${color}88`;
      bulb.textContent = Math.random() < 0.5 ? '0' : '1';
      bulb.style.animationDelay = `${(Math.random() * 3).toFixed(2)}s`;

      socket.appendChild(bulb);
      container.appendChild(socket);
    }
  }

  function startLights() {
    if (document.getElementById('festive-lights-container')) return;
    const container = document.createElement('div');
    container.id = 'festive-lights-container';
    renderBulbs(container);
    document.body.appendChild(container);

    lightsResizeHandler = () => {
      clearTimeout(lightsResizeTimer);
      lightsResizeTimer = setTimeout(() => {
        const c = document.getElementById('festive-lights-container');
        if (c) renderBulbs(c);
      }, 300);
    };
    window.addEventListener('resize', lightsResizeHandler);
  }

  function stopLights() {
    if (lightsResizeTimer) {
      clearTimeout(lightsResizeTimer);
      lightsResizeTimer = null;
    }
    if (lightsResizeHandler) {
      window.removeEventListener('resize', lightsResizeHandler);
      lightsResizeHandler = null;
    }
    const container = document.getElementById('festive-lights-container');
    if (container) {
      container.remove();
    }
  }

  /* ── State & Controller ──────────────────────────────────────── */
  let isFestiveActive = false;

  function enableFestive() {
    if (isFestiveActive) return;
    isFestiveActive = true;
    injectStyles();
    startMatrixRain();
    startLights();
  }

  function disableFestive() {
    if (!isFestiveActive) return;
    isFestiveActive = false;
    stopMatrixRain();
    stopLights();
  }

  function toggleFestive() {
    if (isFestiveActive) {
      disableFestive();
    } else {
      enableFestive();
    }
  }

  /* ── Keyboard shortcut ('C' key) ─────────────────────────────── */
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
    if (e.key === 'c' || e.key === 'C') {
      toggleFestive();
    }
  });

  /* ── Bootstrap ───────────────────────────────────────────────── */
  function init() {
    if (isFestiveSeason()) {
      enableFestive();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();


