// The line that follows the cursor: a thin stroke through the pointer's last positions,
// fading out within a third of a second. Mouse and pen only, never with reduced motion,
// and it draws only while the pointer moves, so a still page costs nothing.
(() => {
  const fine = window.matchMedia("(pointer: fine)");
  const still = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!fine.matches || still.matches) return;

  const canvas = document.createElement("canvas");
  canvas.className = "trail";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const LIFE = 320;            // ms a point stays on the line
  const pts = [];
  let raf = 0;
  let colour = "";

  const size = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    colour = getComputedStyle(document.documentElement).getPropertyValue("--trail").trim() || "rgba(31,58,95,0.55)";
  };

  const draw = () => {
    const now = performance.now();
    while (pts.length && now - pts[0].t > LIFE) pts.shift();
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (pts.length > 1) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = colour;
      // each segment thins and fades with its age: the newest end is the boldest
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const life = 1 - (now - b.t) / LIFE;
        ctx.globalAlpha = Math.max(0, life);
        ctx.lineWidth = 0.6 + 1.6 * life;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    raf = pts.length ? requestAnimationFrame(draw) : 0;
  };

  window.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    if (pts.length > 64) pts.shift();
    if (!raf) raf = requestAnimationFrame(draw);
  }, { passive: true });
  window.addEventListener("resize", size);
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", size);
  still.addEventListener("change", () => { if (still.matches) canvas.remove(); });
  size();
})();
