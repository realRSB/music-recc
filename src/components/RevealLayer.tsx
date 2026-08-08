import { useEffect, useRef, useState } from "react";
import { SPOTLIGHT_R } from "../constants.ts";

type RevealLayerProps = {
  image: string;
  cursorX: number;
  cursorY: number;
};

/**
 * Paints a soft radial spotlight into an offscreen canvas, then uses that
 * canvas as a CSS mask on the reveal image. Only the pixels under the glow
 * are visible, so the second image appears to be uncovered by the cursor.
 */
export default function RevealLayer({ image, cursorX, cursorY }: RevealLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setSize({ w: window.innerWidth, h: window.innerHeight });
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, SPOTLIGHT_R);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.4, "rgba(255,255,255,1)");
    gradient.addColorStop(0.6, "rgba(255,255,255,0.75)");
    gradient.addColorStop(0.75, "rgba(255,255,255,0.4)");
    gradient.addColorStop(0.88, "rgba(255,255,255,0.12)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
    ctx.fill();

    /* Written straight to the node rather than through state: this runs once
       per animation frame, and a setState here would queue a second render
       every frame and trip React's max-update-depth guard. */
    const layer = layerRef.current;
    if (!layer) return;

    const url = canvas.toDataURL();
    layer.style.setProperty("mask-image", `url(${url})`);
    layer.style.setProperty("-webkit-mask-image", `url(${url})`);
  }, [cursorX, cursorY, size.w, size.h]);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ display: "none" }} />
      <div
        ref={layerRef}
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
        style={{
          backgroundImage: `url('${image}')`,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
        }}
      />
    </>
  );
}
