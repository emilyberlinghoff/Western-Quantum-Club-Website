/**
 * Western Quantum Club - Interactive 3D Bloch Sphere Canvas Engine
 * High-performance, zero-dependency canvas renderer with smooth 3D projection,
 * touch/drag rotation, state presets, and real-time quantum telemetry.
 */
(() => {
  const canvas = document.getElementById('bloch-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = 0, height = 0, dpr = 1;

  // 3D rotation state
  let rotX = 0.35;
  let rotY = 0.65;
  let targetRotX = rotX;
  let targetRotY = rotY;
  let velX = 0;
  let velY = 0;
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let autoRotate = true;

  // Quantum State Vector: theta (polar angle from +Z), phi (azimuthal angle from +X)
  let currentTheta = Math.PI / 3; // 60 deg
  let currentPhi = Math.PI / 4;   // 45 deg
  let targetTheta = currentTheta;
  let targetPhi = currentPhi;
  let animVector = true;
  let time = 0;

  // Trajectory trail points on the sphere
  const trailPoints = [];
  const MAX_TRAIL = 45;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize);
  resize();

  // 3D Projection math
  function project(x, y, z, R) {
    const cx = width / 2;
    const cy = height / 2;

    // Rotate around X axis
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;

    // Rotate around Y axis
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const x2 = x * cosY + z1 * sinY;
    const z2 = -x * sinY + z1 * cosY;

    // Perspective factor
    const fov = 3.2;
    const scale = fov / (fov + z2 * 0.4);

    return {
      x: cx + x2 * R * scale,
      y: cy - y1 * R * scale, // invert Y for screen coords
      z: z2,
      scale: scale
    };
  }

  // Pointer event listeners
  function onPointerDown(clientX, clientY) {
    isDragging = true;
    autoRotate = false;
    lastMouseX = clientX;
    lastMouseY = clientY;
    velX = 0;
    velY = 0;
  }

  function onPointerMove(clientX, clientY) {
    if (!isDragging) return;
    const dx = clientX - lastMouseX;
    const dy = clientY - lastMouseY;
    velY = dx * 0.007;
    velX = dy * 0.007;
    targetRotY += velY;
    targetRotX += velX;
    lastMouseX = clientX;
    lastMouseY = clientY;
  }

  function onPointerUp() {
    isDragging = false;
  }

  canvas.addEventListener('mousedown', (e) => onPointerDown(e.clientX, e.clientY));
  window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', onPointerUp);

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchend', onPointerUp);

  // Preset Buttons Handling
  const presets = {
    'zero': { theta: 0.01, phi: 0, label: '|0⟩ (Ground State)' },
    'one': { theta: Math.PI - 0.01, phi: 0, label: '|1⟩ (Excited State)' },
    'plus': { theta: Math.PI / 2, phi: 0, label: '|+⟩ (Hadamard Superposition)' },
    'minus': { theta: Math.PI / 2, phi: Math.PI, label: '|-⟩ (Superposition -)' },
    'super': { theta: Math.PI / 3, phi: Math.PI / 4, label: '|ψ⟩ = α|0⟩ + β|1⟩' }
  };

  document.querySelectorAll('[data-bloch-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = presets[btn.dataset.blochPreset];
      if (p) {
        targetTheta = p.theta;
        targetPhi = p.phi;
        animVector = false; // User took manual control
        document.querySelectorAll('[data-bloch-preset]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const stateTag = document.getElementById('bloch-state-text');
        if (stateTag) stateTag.textContent = p.label;
      }
    });
  });

  const resetBtn = document.getElementById('bloch-resume-anim');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      animVector = true;
      autoRotate = true;
      document.querySelectorAll('[data-bloch-preset]').forEach(b => b.classList.remove('is-active'));
      const stateTag = document.getElementById('bloch-state-text');
      if (stateTag) stateTag.textContent = '|ψ⟩ Precessing Dynamic State';
    });
  }

  // Draw Function
  function render() {
    time += 0.015;

    // Smooth inertia for rotation
    if (!isDragging) {
      if (autoRotate) {
        targetRotY += 0.0035;
      }
      velX *= 0.92;
      velY *= 0.92;
      targetRotX += velX;
      targetRotY += velY;
    }
    rotX += (targetRotX - rotX) * 0.12;
    rotY += (targetRotY - rotY) * 0.12;

    // Keep angles within bounds
    rotX = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotX));

    // Dynamic state vector animation when active
    if (animVector) {
      targetTheta = Math.PI / 3 + Math.sin(time * 0.7) * (Math.PI / 6);
      targetPhi = (time * 0.6) % (Math.PI * 2);
    }
    currentTheta += (targetTheta - currentTheta) * 0.08;
    currentPhi += (targetPhi - currentPhi) * 0.08;

    const R = Math.min(width, height) * 0.35;
    const cx = width / 2;
    const cy = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Subtle background grid
    ctx.strokeStyle = 'rgba(188, 131, 255, 0.07)';
    ctx.lineWidth = 1;
    const gridStep = 32;
    for (let x = 0; x < width; x += gridStep) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += gridStep) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Radial aura behind sphere
    const glow = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.3);
    glow.addColorStop(0, 'rgba(125, 59, 189, 0.3)');
    glow.addColorStop(0.6, 'rgba(79, 38, 131, 0.12)');
    glow.addColorStop(1, 'rgba(18, 8, 34, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // 1. Latitude Rings (horizontal slices)
    const lats = [-0.65, -0.35, 0, 0.35, 0.65];
    lats.forEach(lat => {
      const rLat = Math.cos(lat);
      const zLat = Math.sin(lat);
      const isEquator = lat === 0;

      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.12) {
        const pt = project(Math.cos(a) * rLat, zLat, Math.sin(a) * rLat, R);
        if (a === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = isEquator ? 'rgba(188, 131, 255, 0.75)' : 'rgba(163, 90, 232, 0.22)';
      ctx.lineWidth = isEquator ? 1.6 : 0.9;
      if (!isEquator) ctx.setLineDash([3, 4]);
      else ctx.setLineDash([]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // 2. Longitude Rings (meridians)
    const longitudes = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4];
    longitudes.forEach(lon => {
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.12) {
        const pt = project(Math.cos(lon) * Math.sin(a), Math.cos(a), Math.sin(lon) * Math.sin(a), R);
        if (a === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = 'rgba(163, 90, 232, 0.2)';
      ctx.lineWidth = 0.9;
      ctx.setLineDash([2, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // 3. Coordinate Axes with Dirac bra-ket notations
    // Z axis: |0⟩ (top), |1⟩ (bottom)
    // X axis: |+⟩ (front), |-⟩ (back)
    // Y axis: |i⟩ (right), |-i⟩ (left)
    const axes = [
      { from: [0, -1.25, 0], to: [0, 1.25, 0], posLabel: '|0⟩', negLabel: '|1⟩', color: '#ffffff', dash: false },
      { from: [-1.22, 0, 0], to: [1.22, 0, 0], posLabel: '|+⟩', negLabel: '|-⟩', color: 'rgba(188, 131, 255, 0.65)', dash: true },
      { from: [0, 0, -1.22], to: [0, 0, 1.22], posLabel: '|i⟩', negLabel: '|-i⟩', color: 'rgba(188, 131, 255, 0.65)', dash: true }
    ];

    axes.forEach(ax => {
      const p1 = project(ax.from[0], ax.from[1], ax.from[2], R);
      const p2 = project(ax.to[0], ax.to[1], ax.to[2], R);

      ctx.strokeStyle = ax.color;
      ctx.lineWidth = ax.dash ? 1 : 1.5;
      if (ax.dash) ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label at positive pole
      ctx.fillStyle = ax.color;
      ctx.font = 'bold 12px ui-monospace, monospace';
      ctx.fillText(ax.posLabel, p2.x + 8, p2.y + 4);
      ctx.fillText(ax.negLabel, p1.x + 8, p1.y + 4);
    });

    // 4. Calculate State Vector Point on sphere:
    // x = sin(theta) * cos(phi)
    // y = cos(theta) (vertical axis Z in physics, Y in 3D projection)
    // z = sin(theta) * sin(phi)
    const vx = Math.sin(currentTheta) * Math.cos(currentPhi);
    const vy = Math.cos(currentTheta);
    const vz = Math.sin(currentTheta) * Math.sin(currentPhi);

    const tip = project(vx, vy, vz, R);
    const center = project(0, 0, 0, R);

    // Save trail point
    trailPoints.push({ x: tip.x, y: tip.y });
    if (trailPoints.length > MAX_TRAIL) trailPoints.shift();

    // Draw fading trajectory trail
    if (trailPoints.length > 2) {
      for (let i = 1; i < trailPoints.length; i++) {
        const alpha = (i / trailPoints.length) * 0.45;
        ctx.strokeStyle = `rgba(188, 131, 255, ${alpha})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(trailPoints[i - 1].x, trailPoints[i - 1].y);
        ctx.lineTo(trailPoints[i].x, trailPoints[i].y);
        ctx.stroke();
      }
    }

    // Measurement projection lines down to Z-axis and XY plane
    const projZ = project(0, vy, 0, R);
    ctx.strokeStyle = 'rgba(212, 180, 245, 0.45)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(projZ.x, projZ.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glowing State Vector Arrow
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.8;
    ctx.shadowColor = '#bc83ff';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Glowing Vector Tip
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#bc83ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 10, 0, Math.PI * 2);
    ctx.stroke();

    // State Vector Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px ui-monospace, monospace';
    ctx.fillText('|ψ⟩', tip.x + 12, tip.y - 8);

    // 5. Update Telemetry HUD in DOM
    const prob0 = Math.cos(currentTheta / 2) ** 2;
    const prob1 = Math.sin(currentTheta / 2) ** 2;

    const elTheta = document.getElementById('bloch-theta-val');
    const elPhi = document.getElementById('bloch-phi-val');
    const elP0 = document.getElementById('bloch-p0-val');
    const elP1 = document.getElementById('bloch-p1-val');
    const barP0 = document.getElementById('bloch-p0-bar');
    const barP1 = document.getElementById('bloch-p1-bar');

    if (elTheta) elTheta.textContent = `${currentTheta.toFixed(2)} rad (${Math.round((currentTheta * 180) / Math.PI)}°)`;
    if (elPhi) elPhi.textContent = `${(currentPhi % (Math.PI * 2)).toFixed(2)} rad (${Math.round(((currentPhi % (Math.PI * 2)) * 180) / Math.PI)}°)`;
    if (elP0) elP0.textContent = `${(prob0 * 100).toFixed(1)}%`;
    if (elP1) elP1.textContent = `${(prob1 * 100).toFixed(1)}%`;
    if (barP0) barP0.style.width = `${(prob0 * 100).toFixed(1)}%`;
    if (barP1) barP1.style.width = `${(prob1 * 100).toFixed(1)}%`;

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
