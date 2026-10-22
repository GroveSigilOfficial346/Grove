(() => {
  const canvas = document.querySelector(".horizon-particles");
  const ctx = canvas.getContext("2d");

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const colors = [
    [144, 24, 255],
    [103, 35, 255],
    [69, 60, 255],
    [17, 135, 255],
    [0, 201, 244],
    [226, 40, 255]
  ];

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let lastTime = 0;
  let elapsed = 0;

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();

    width = rect.width;
    height = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.round(
      Math.min(1000, Math.max(260, width * 0.62))
    );

    particles = Array.from({ length: count }, createParticle);
  }

  function createParticle(initial = true) {
    const color = colors[
      Math.floor(Math.random() * colors.length)
    ];

    return {
      x: random(-width * 0.1, width * 1.1),
      offset: random(-17, 17),
      speed: random(14, 115),
      size: random(0.35, 1.6),
      alpha: random(0.12, 0.8),
      phase: random(0, Math.PI * 2),
      wave: random(2, 16),
      color,
      direction: Math.random() < 0.5 ? 1 : -1,
      initial
    };
  }

  function horizonY() {
    return height * 0.855;
  }

  function drawHorizon(time) {
    const y = horizonY();
    const center = width * 0.5;

    const line = ctx.createLinearGradient(0, 0, width, 0);
    line.addColorStop(0, "rgba(82, 0, 255, 0)");
    line.addColorStop(0.2, "rgba(103, 20, 255, 0.10)");
    line.addColorStop(0.43, "rgba(121, 35, 255, 0.55)");
    line.addColorStop(0.5, "rgba(184, 90, 255, 0.95)");
    line.addColorStop(0.56, "rgba(0, 201, 255, 0.85)");
    line.addColorStop(0.76, "rgba(0, 96, 255, 0.24)");
    line.addColorStop(1, "rgba(0, 65, 255, 0)");

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(95, 47, 255, 0.8)";
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();

    const pulse = 0.8 + Math.sin(time * 0.0007) * 0.2;
    const glow = ctx.createRadialGradient(
      center, y, 0,
      center, y, width * 0.35
    );

    glow.addColorStop(0, `rgba(116, 42, 255, ${0.18 * pulse})`);
    glow.addColorStop(0.28, `rgba(37, 71, 255, ${0.08 * pulse})`);
    glow.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = glow;
    ctx.fillRect(0, y - 100, width, 200);

    const core = ctx.createRadialGradient(
      center, y, 0,
      center, y, width * 0.1
    );

    core.addColorStop(0, "rgba(240, 208, 255, 0.85)");
    core.addColorStop(0.08, "rgba(180, 64, 255, 0.65)");
    core.addColorStop(0.32, "rgba(55, 75, 255, 0.2)");
    core.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = core;
    ctx.fillRect(center - width * 0.1, y - 22, width * 0.2, 44);

    ctx.restore();
  }

  function drawParticle(p, dt, time) {
    const y = horizonY();

    p.x += p.speed * dt * p.direction;

    if (p.direction > 0 && p.x > width + 12) {
      Object.assign(p, createParticle(false), { x: -12 });
    } else if (p.direction < 0 && p.x < -12) {
      Object.assign(p, createParticle(false), { x: width + 12 });
    }

    const distance = (p.x - width / 2) / Math.max(width / 2, 1);
    const edgeFade = Math.max(0, 1 - Math.pow(Math.abs(distance), 2));
    const wave = Math.sin(time * 0.0012 + p.phase) * p.wave;
    const py = y + p.offset + wave * 0.22;
    const alpha = p.alpha * (0.18 + edgeFade * 0.82);
    const [r, g, b] = p.color;

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, py, p.size, 0, Math.PI * 2);
    ctx.fill();

    if (p.size > 1.1 && alpha > 0.35) {
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.35})`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(p.x - p.direction * p.speed * 0.08, py);
      ctx.lineTo(p.x, py);
      ctx.stroke();
    }
  }

  function drawReflections(time) {
    const y = horizonY();
    const center = width / 2;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (let i = 0; i < 34; i++) {
      const spread = i * (width * 0.004);
      const x = center + Math.sin(i * 1.7 + time * 0.0004) * spread;
      const length = random(0, 1); // overwritten below for stable-looking streaks
      const streakLength = 4 + ((i * 13) % 32);
      const opacity = 0.018 + (1 - i / 34) * 0.12;

      ctx.strokeStyle = i % 3 === 0
        ? `rgba(0, 175, 255, ${opacity})`
        : `rgba(137, 50, 255, ${opacity})`;

      ctx.lineWidth = 0.5 + (i % 3) * 0.25;
      ctx.beginPath();
      ctx.moveTo(x - streakLength / 2, y + 4 + i * 1.1);
      ctx.lineTo(x + streakLength / 2, y + 4 + i * 1.1);
      ctx.stroke();
    }

    ctx.restore();
  }

  function frame(time) {
    if (!canvas.isConnected) return;

    if (!lastTime) lastTime = time;

    const dt = Math.min((time - lastTime) / 1000, 0.04);
    lastTime = time;
    elapsed += dt;

    ctx.clearRect(0, 0, width, height);

    drawHorizon(time);

    if (!reducedMotion.matches) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      for (const particle of particles) {
        drawParticle(particle, dt, time);
      }

      ctx.restore();
    } else {
      for (const particle of particles) {
        const [r, g, b] = particle.color;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.alpha * 0.45})`;
        ctx.fillRect(particle.x, horizonY() + particle.offset, 1, 1);
      }
    }

    drawReflections(time);

    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize, { passive: true });

  resize();
  requestAnimationFrame(frame);
})();
