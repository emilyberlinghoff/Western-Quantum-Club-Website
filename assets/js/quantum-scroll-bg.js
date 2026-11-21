/**
 * Western Quantum Club - Dynamic Background Canvas & Scroll Engine
 * Waterloo Defence-inspired full-page quantum particle lattice, wave interference,
 * and 3D parallax field that dynamically reacts to scroll velocity and cursor motion.
 */
(() => {
  const canvas = document.getElementById('quantum-scroll-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, dpr = 1;

  // Scroll tracking with smooth damping
  let scrollY = window.scrollY;
  let targetScrollY = scrollY;
  let scrollProgress = 0;
  let targetScrollProgress = 0;
  let scrollVelocity = 0;
  let lastScrollY = scrollY;

  // Mouse tracking
  let mouseX = -1000, mouseY = -1000;
  let targetMouseX = -1000, targetMouseY = -1000;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    targetScrollProgress = Math.min(1, Math.max(0, targetScrollY / maxScroll));
  }, { passive: true });

  window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  }, { passive: true });

  // Floating Quantum Particles & Qubit Nodes
  const PARTICLE_COUNT = 55;
  const particles = [];
  const symbols = ['|0⟩', '|1⟩', '|ψ⟩', '|+⟩', 'H', '⊕', 'ℏ', 'λ', 'φ', 'θ'];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      baseX: Math.random() * width,
      baseY: Math.random() * height,
      z: 0.3 + Math.random() * 0.7, // Depth layer for 3D parallax
      radius: 1.2 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      pulse: Math.random() * Math.PI * 2,
      symbol: i % 5 === 0 ? symbols[Math.floor(Math.random() * symbols.length)] : null,
      symbolAlpha: 0.15 + Math.random() * 0.25
    });
  }

  let time = 0;

  function render() {
    time += 0.016;

    // Smooth scroll interpolation
    scrollY += (targetScrollY - scrollY) * 0.08;
    scrollProgress += (targetScrollProgress - scrollProgress) * 0.08;
    scrollVelocity = (targetScrollY - lastScrollY);
    lastScrollY = targetScrollY;

    // Smooth mouse interpolation
    mouseX += (targetMouseX - mouseX) * 0.08;
    mouseY += (targetMouseY - mouseY) * 0.08;

    ctx.clearRect(0, 0, width, height);

    // 1. Dynamic Background Color Shift based on Scroll Progress
    // Top (Hero): Deep violet radial glow -> Mid: Quantum electric violet -> Bottom: Cosmic obsidian
    const p = scrollProgress;
    const gradX = width * (0.65 - p * 0.3);
    const gradY = height * (0.3 + p * 0.4);
    const bgGrad = ctx.createRadialGradient(gradX, gradY, width * 0.1, width * 0.5, height * 0.5, width * 0.9);

    // Color interpolation
    const r1 = Math.round(35 + Math.sin(p * Math.PI) * 15);
    const g1 = Math.round(14 + Math.sin(p * Math.PI * 1.5) * 8);
    const b1 = Math.round(62 + Math.cos(p * Math.PI) * 20);

    bgGrad.addColorStop(0, `rgba(${r1}, ${g1}, ${b1}, 0.85)`);
    bgGrad.addColorStop(0.5, `rgba(18, 7, 34, 0.95)`);
    bgGrad.addColorStop(1, `#090312`);

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Quantum Wavefunction Interference Ripples (Diffraction fringes that shift with scroll)
    const waveCount = 4;
    for (let w = 0; w < waveCount; w++) {
      ctx.beginPath();
      const waveY = height * (0.2 + w * 0.22) + Math.sin(time * 0.5 + w) * 30;
      const freq = 0.003 + w * 0.001;
      const phase = time * (0.8 + w * 0.2) + scrollProgress * Math.PI * 4;

      ctx.moveTo(0, waveY);
      for (let x = 0; x <= width; x += 16) {
        // Interference formula with mouse perturbation
        const distToMouse = Math.hypot(x - mouseX, waveY - mouseY);
        const mouseEffect = Math.max(0, 1 - distToMouse / 350) * Math.sin(distToMouse * 0.04 - time * 4) * 25;
        const amp = (18 + Math.abs(scrollVelocity) * 0.8) * Math.sin(x * 0.001 + w);
        const y = waveY + Math.sin(x * freq + phase) * amp + mouseEffect;
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = `rgba(188, 131, 255, ${0.05 + Math.sin(time + w) * 0.03})`;
      ctx.lineWidth = 1.2 + (w % 2);
      ctx.stroke();
    }

    // 3. Floating Qubit Particles & Entanglement Links
    // Apply 3D parallax scroll offset to particles
    const parallaxOffset = scrollY * 0.25;

    // Draw entangled links between nearby particles
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      const curY1 = ((p1.baseY - parallaxOffset * p1.z) % (height + 100) + (height + 100)) % (height + 100) - 50;

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const curY2 = ((p2.baseY - parallaxOffset * p2.z) % (height + 100) + (height + 100)) % (height + 100) - 50;

        const dx = p1.x - p2.x;
        const dy = curY1 - curY2;
        const dist = Math.hypot(dx, dy);

        const maxDist = 130 * ((p1.z + p2.z) / 2);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.2 * ((p1.z + p2.z) / 2);
          ctx.strokeStyle = `rgba(188, 131, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p1.x, curY1);
          ctx.lineTo(p2.x, curY2);
          ctx.stroke();
        }
      }
    }

    // Update & draw particles and floating Dirac bra-kets
    particles.forEach((pt) => {
      pt.pulse += 0.03;
      pt.x += pt.vx;
      if (pt.x < -20) pt.x = width + 20;
      if (pt.x > width + 20) pt.x = -20;

      // Parallax Y position
      const curY = ((pt.baseY - parallaxOffset * pt.z) % (height + 100) + (height + 100)) % (height + 100) - 50;

      // Mouse repulsion / attraction
      const dMouse = Math.hypot(pt.x - mouseX, curY - mouseY);
      if (dMouse < 180) {
        const force = (1 - dMouse / 180) * 8;
        pt.x += ((pt.x - mouseX) / dMouse) * force * 0.15;
      }

      // Draw particle core
      const pulseFactor = 0.7 + Math.sin(pt.pulse) * 0.3;
      const alpha = pt.z * 0.65 * pulseFactor;

      ctx.fillStyle = `rgba(188, 131, 255, ${alpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(pt.x, curY, pt.radius * 2.5 * pt.z, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(pt.x, curY, pt.radius * pt.z, 0, Math.PI * 2);
      ctx.fill();

      // Draw faint floating quantum Dirac symbols
      if (pt.symbol) {
        ctx.fillStyle = `rgba(212, 180, 245, ${pt.symbolAlpha * pt.z * (0.6 + pulseFactor * 0.4)})`;
        ctx.font = `${Math.round(10 * pt.z)}px ui-monospace, monospace`;
        ctx.fillText(pt.symbol, pt.x + 8, curY + 4);
      }
    });

    // 4. Subtle Waterloo Defence Tech Overlay: Corner crosshairs & scroll phase indicator
    drawTechHUD(scrollProgress);

    requestAnimationFrame(render);
  }

  function drawTechHUD(progress) {
    // Top right HUD phase meter
    ctx.fillStyle = 'rgba(188, 131, 255, 0.45)';
    ctx.font = '10px ui-monospace, monospace';
    ctx.textAlign = 'right';
    const phaseRad = (progress * Math.PI * 2).toFixed(2);
    ctx.fillText(`[SCROLL_PHASE: ${phaseRad} rad]`, width - 24, 28);
    ctx.fillText(`[Q-COHERENCE: ${(99.2 + Math.sin(progress * 10) * 0.7).toFixed(1)}%]`, width - 24, 42);
    ctx.textAlign = 'left';

    // Faint grid lines on edges
    ctx.strokeStyle = 'rgba(188, 131, 255, 0.08)';
    ctx.lineWidth = 1;
    // Left border line
    ctx.beginPath(); ctx.moveTo(24, 0); ctx.lineTo(24, height); ctx.stroke();
    // Right border line
    ctx.beginPath(); ctx.moveTo(width - 24, 0); ctx.lineTo(width - 24, height); ctx.stroke();
  }

  requestAnimationFrame(render);
})();
