document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('ripple-container');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'water-canvas';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize() {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  function drawFrame(time) {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    // Base vertical gradient (close to the provided image)
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0.0, '#6be3ff');
    g.addColorStop(0.35, '#25c7e8');
    g.addColorStop(0.7, '#0fa7cf');
    g.addColorStop(1.0, '#08799f');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Light caustic-like wave highlights
    ctx.globalCompositeOperation = 'lighter';
    const t = time * 0.001;
    for (let i = 0; i < 7; i++) {
      const amp = 8 + i * 2.5;
      const freq = 0.0025 + i * 0.0007;
      const speed = 0.8 + i * 0.25;
      const y0 = h * 0.22 + i * (h * 0.07);
      ctx.beginPath();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      for (let x = 0; x <= w; x += 3) {
        const y =
          y0 +
          amp *
            Math.sin(x * freq + t * speed + i) +
          (amp * 0.4) *
            Math.sin(x * (freq * 1.6) + t * (speed * 1.3) + i * 2.3);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';

    // Subtle vignette and depth darkening near bottom
    const vignette = ctx.createRadialGradient(
      w / 2,
      h * 0.15,
      h * 0.05,
      w / 2,
      h * 0.9,
      h
    );
    vignette.addColorStop(0, 'rgba(255,255,255,0)');
    vignette.addColorStop(1, 'rgba(0,60,90,0.28)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    requestAnimationFrame(drawFrame);
  }
  requestAnimationFrame(drawFrame);
});
