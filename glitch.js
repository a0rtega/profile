/* ── Glitch transition ────────────────────────────────────── */
function runGlitch(callback) {
	var W = window.innerWidth, H = window.innerHeight;
	var canvas = document.createElement('canvas');
	canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10001;';
	canvas.width = W;
	canvas.height = H;
	document.body.appendChild(canvas);
	var ctx = canvas.getContext('2d');

	var DURATION = 950; /* ms */
	var start = performance.now();
	var applied = false;
	var strobed = false;

	function rnd(lo, hi)    { return Math.random() * (hi - lo) + lo; }
	function rndInt(lo, hi) { return Math.floor(rnd(lo, hi)); }

	function frame(now) {
		var t = Math.min((now - start) / DURATION, 1);
		ctx.clearRect(0, 0, W, H);

		/* Bell-curve intensity: rises to peak at t=0.5 then falls */
		var intensity = t < 0.5 ? t * 2 : (1 - t) * 2;

		/* ── Full-screen strobe at the exact switch moment ── */
		if (!applied && t >= 0.45) {
			applied = true;
			if (typeof callback === 'function') callback();
		}
		if (applied && !strobed) {
			strobed = true;
			ctx.fillStyle = 'rgba(255,255,255,0.82)';
			ctx.fillRect(0, 0, W, H);
			requestAnimationFrame(frame);
			return; /* dedicate this frame entirely to the flash */
		}

		if (Math.random() < 0.88) { /* Sporadic frames give a stutter feel */
			var i, y, bh, r, g, b, nx, ny, bright;

			/* ── Big block displacement ───────────────────────────
			   Shifts a large horizontal slab far sideways — the most
			   recognisable real-monitor glitch artefact               */
			if (Math.random() < 0.55 * intensity) {
				var blockY  = rndInt(0, H - H * 0.3);
				var blockH  = rndInt(H * 0.08, H * 0.35);
				var shift   = rnd(0.3, 1) * (Math.random() < 0.5 ? 1 : -1) * 120 * intensity;
				ctx.fillStyle = 'rgba(200,200,200,' + (0.22 * intensity) + ')';
				ctx.fillRect(shift, blockY, W, blockH);
			}

			/* ── Horizontal tear bands ───────────────────────────── */
			var bands = rndInt(6, 14);
			for (i = 0; i < bands; i++) {
				y  = rndInt(0, H);
				bh = rndInt(2, Math.max(4, Math.floor(H * 0.10 * intensity)));
				r  = Math.random() < 0.5 ? 255 : 0;
				g  = Math.random() < 0.5 ? 255 : 0;
				b  = Math.random() < 0.5 ? 255 : 0;
				ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (0.18 * intensity) + ')';
				ctx.fillRect(rnd(-90, 90) * intensity, y, W, bh);
			}

			/* ── Chromatic aberration ghost lines ────────────────── */
			var ghosts = rndInt(4, 10);
			for (i = 0; i < ghosts; i++) {
				y = rndInt(0, H);
				bh = rndInt(3, 12);
				ctx.fillStyle = 'rgba(255,0,60,'  + (0.40 * intensity) + ')';
				ctx.fillRect(rnd(-50, -6) * intensity, y,      W, bh);
				ctx.fillStyle = 'rgba(0,255,220,' + (0.40 * intensity) + ')';
				ctx.fillRect(rnd(6,   50) * intensity, y + bh, W, bh);
			}

			/* ── Noise pixels ────────────────────────────────────── */
			var noise = Math.floor(W * H * 0.006 * intensity);
			for (i = 0; i < noise; i++) {
				nx = rndInt(0, W);
				ny = rndInt(0, H);
				bright = Math.random() < 0.5 ? 255 : 0;
				ctx.fillStyle = 'rgba(' + bright + ',' + bright + ',' + bright + ',0.75)';
				ctx.fillRect(nx, ny, rndInt(1, 3), 1);
			}

			/* ── Bright flash lines ───────────────────────────────── */
			var flashCount = Math.random() < 0.55 * intensity ? rndInt(1, 4) : 0;
			for (i = 0; i < flashCount; i++) {
				ctx.fillStyle = 'rgba(255,255,255,' + (0.75 * intensity) + ')';
				ctx.fillRect(0, rndInt(0, H), W, rndInt(2, 8));
			}
		}

		if (t < 1) {
			requestAnimationFrame(frame);
		} else {
			canvas.remove();
		}
	}

	requestAnimationFrame(frame);
}
