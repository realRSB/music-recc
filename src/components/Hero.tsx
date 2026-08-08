import { useEffect, useRef, useState } from "react";
import RevealLayer from "./RevealLayer";
import { BG_IMAGE_1, BG_IMAGE_2 } from "../constants";

export default function Hero() {
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      mouse.current = { x: event.clientX, y: event.clientY };
    };

    window.addEventListener("mousemove", onMove);

    /* Ease toward the raw pointer so the spotlight trails rather than snaps.
       Once it has effectively caught up we stop pushing state, otherwise the
       lerp keeps producing new sub-pixel values and re-renders forever. */
    const tick = () => {
      const dx = mouse.current.x - smooth.current.x;
      const dy = mouse.current.y - smooth.current.y;

      if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
        smooth.current.x += dx * 0.1;
        smooth.current.y += dy * 0.1;
        setCursorPos({ x: smooth.current.x, y: smooth.current.y });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden h-screen bg-black" style={{ height: "100dvh" }}>
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-10 hero-zoom"
        style={{ backgroundImage: `url('${BG_IMAGE_1}')` }}
      />

      <RevealLayer image={BG_IMAGE_2} cursorX={cursorPos.x} cursorY={cursorPos.y} />

      <div className="absolute top-[14%] left-0 right-0 z-50 flex flex-col items-center text-center px-5 pointer-events-none">
        <h1 className="text-white leading-[0.95]">
          <span
            className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
            style={{ letterSpacing: "-0.05em", animationDelay: "0.25s" }}
          >
            Layers hold
          </span>
          <span
            className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
            style={{ letterSpacing: "-0.08em", animationDelay: "0.42s" }}
          >
            tales of time
          </span>
        </h1>
      </div>

      <div
        className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] z-50 hero-anim hero-fade"
        style={{ animationDelay: "0.7s" }}
      >
        <p className="text-sm text-white/80 leading-relaxed">
          Every layer of sediment records a chapter of our planet, from ancient seabeds to drifting
          ash, layered across millions of years beneath us.
        </p>
      </div>

      <div
        className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[260px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade"
        style={{ animationDelay: "0.85s" }}
      >
        <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
          Our interactive maps let you peel back the crust to trace how stones, fossils, and deep
          time combine to shape the ground beneath your feet.
        </p>
        <button className="bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30">
          Start Digging
        </button>
      </div>
    </section>
  );
}
