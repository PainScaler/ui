import { useEffect, useRef } from "react";

export function useRainCanvas() {
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = document.getElementById("rain-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const DROP_COUNT = 55;
    const DROP_LEN_MIN = 6;
    const DROP_LEN_RANGE = 14;
    const DROP_SPEED_MIN = 2;
    const DROP_SPEED_RANGE = 3;
    const DROP_OPACITY_MIN = 0.08;
    const DROP_OPACITY_RANGE = 0.25;

    const drops = Array.from({ length: DROP_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      len: Math.random() * DROP_LEN_RANGE + DROP_LEN_MIN,
      speed: Math.random() * DROP_SPEED_RANGE + DROP_SPEED_MIN,
      opacity: Math.random() * DROP_OPACITY_RANGE + DROP_OPACITY_MIN,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drops.forEach((d) => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 1, d.y + d.len);
        ctx.strokeStyle = `rgba(160,40,20,${d.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        d.y += d.speed;
        if (d.y > canvas.height) {
          d.y = -d.len;
          d.x = Math.random() * canvas.width;
        }
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);
}
