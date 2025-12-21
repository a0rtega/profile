(function() {
  const CONFIG = {
    snowParticleCount: 100,
    snowSpeed: 1,
    colors: ['#ff4444', '#44ff77', '#ffeb3b', '#44aaff'], // Red, Green, Gold, Blue
    startDate: { month: 11, day: 1 }, // December 1st (Month is 0-indexed)
    endDate: { month: 0, day: 7 } // January 7th
  };
  function isFestiveSeason() {
    const today = new Date();
    const month = today.getMonth();
    const day = today.getDate();
    if (month === CONFIG.startDate.month && day >= CONFIG.startDate.day) return true;
    if (month === CONFIG.endDate.month && day <= CONFIG.endDate.day) return true;
    return false;
  }
  function injectStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
      #festive-canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9998;
      }
      /* The Main Cord */
      #festive-lights-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 12px; /* Height of the main cable wire */
        z-index: 9999;
        display: flex;
        justify-content: space-evenly;
        pointer-events: none;
        /* Dark green twisted wire texture */
        background: repeating-linear-gradient(
          45deg,
          #0f3d0f,
          #0f3d0f 2px,
          #1a521a 2px,
          #1a521a 4px
        );
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
      /* The socket holding the bulb to the wire */
      .festive-socket {
        position: relative;
        width: 10px;
        height: 10px;
        background: #0f3d0f; /* Dark green socket */
        margin-top: 4px; /* Offset from the main wire */
        border-radius: 2px;
        display: flex;
        justify-content: center;
      }
      /* The discrete bulb */
      .festive-bulb {
        position: absolute;
        top: 8px; /* Hang below the socket */
        width: 8px;
        height: 13px;
        /* Pear/Christmas light shape */
        border-radius: 50% 50% 40% 40% / 60% 60% 30% 30%;
        opacity: 0.8;
        /* Subtler, slower animation */
        animation: festive-glow-discrete 4s infinite alternate ease-in-out;
      }
      @keyframes festive-glow-discrete {
        0% { opacity: 0.6; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        100% { opacity: 1.0; box-shadow: 0 3px 15px currentColor; }
      }
    `;
    document.head.appendChild(style);
  }
  function initSnow() {
    const canvas = document.createElement('canvas');
    canvas.id = 'festive-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    const adjustedParticleCount = width < 600 ? CONFIG.snowParticleCount / 2 : CONFIG.snowParticleCount;
    const particles = [];
    for (let i = 0; i < adjustedParticleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.5 + 0.5,
        d: Math.random() * adjustedParticleCount,
      });
    }
    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.beginPath();
      for (let i = 0; i < adjustedParticleCount; i++) {
        const p = particles[i];
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, true);
      }
      ctx.fill();
      update();
      requestAnimationFrame(draw);
    }
    function update() {
      for (let i = 0; i < adjustedParticleCount; i++) {
        const p = particles[i];
        p.y += Math.cos(p.d) + 0.5 + p.r / 2;
        p.x += Math.sin(p.d) * 0.5;

        if (p.x > width + 5 || p.x < -5 || p.y > height) {
          particles[i].x = Math.random() * width;
          particles[i].y = -10;
        }
      }
    }
    window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });

    draw();
  }
  function initLights() {
    const container = document.createElement('div');
    container.id = 'festive-lights-container';
    const bulbCount = Math.floor(window.innerWidth / 30);
    for (let i = 0; i < bulbCount; i++) {
      const socket = document.createElement('div');
      socket.className = 'festive-socket';
      const bulb = document.createElement('div');
      bulb.className = 'festive-bulb';
      const color = CONFIG.colors[i % CONFIG.colors.length];
      bulb.style.backgroundColor = color;
      bulb.style.color = color;
      bulb.style.animationDelay = `${Math.random() * 4}s`;
      socket.appendChild(bulb);
      container.appendChild(socket);
    }
    document.body.appendChild(container);
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
             document.getElementById('festive-lights-container').remove();
             initLights();
        }, 300);
    });
  }
  function init() {
    if (isFestiveSeason()) {
      injectStyles();
      initSnow();
      initLights();
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
