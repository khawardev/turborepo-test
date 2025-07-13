"use client";

import { useMemo, useRef } from "react";
import { motion } from "motion/react";
import DottedMap from "dotted-map";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
}

export default function WorldMap({ dots = [] }: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const map = new DottedMap({ height: 100, grid: "diagonal" });

  const svgMap = map.getSVG({
    radius: 0.35,
    color: "currentColor",
    shape: "circle",
    backgroundColor: "transparent",
  });

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  const animatedDots = useMemo(() => {
    return dots.map(dot => ({
      ...dot,
      // Longer initial delay before a line starts drawing (0 to 5 seconds)
      initialDelay: Math.random() * 18,
      // Very slow drawing duration for each line (5 to 9 seconds)
      animationDuration: 18 + Math.random() * 4,
      // Slower "marching ants" speed (6 to 10 seconds per loop)
      marchDuration: `${18 + Math.random() * 4}s`,
    }));
  }, [dots]);

  return (
    <div className="w-full aspect-[2/1] relative text-accent">
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
        alt="world map background"
        height="495"
        width="1056"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-none select-none text-primary"
      >
        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="5%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="95%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {animatedDots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);

          return (
            <g key={`group-${i}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                initial={{
                  pathLength: 0,
                }}
                animate={{
                  pathLength: 1,
                }}
                transition={{
                  duration: dot.animationDuration,
                  delay: dot.initialDelay,
                  ease: "easeInOut",
                }}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="12"
                  dur={dot.marchDuration}
                  repeatCount="indefinite"
                />
              </motion.path>

              <g key={`start-point-${i}`}>
                <circle cx={startPoint.x} cy={startPoint.y} r="2" fill="currentColor" />
                <circle cx={startPoint.x} cy={startPoint.y} r="2" fill="currentColor" opacity="0.5">
                  <animate
                    attributeName="r" from="2" to="8" dur="5s"
                    begin={`${dot.initialDelay}s`} repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity" from="0.5" to="0" dur="5s"
                    begin={`${dot.initialDelay}s`} repeatCount="indefinite"
                  />
                </circle>
              </g>

              <g key={`end-point-${i}`}>
                <circle cx={endPoint.x} cy={endPoint.y} r="2" fill="currentColor" />
                <circle cx={endPoint.x} cy={endPoint.y} r="2" fill="currentColor" opacity="0.5">
                  <animate
                    attributeName="r" from="2" to="8" dur="5s"
                    begin={`${dot.initialDelay}s`} repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity" from="0.5" to="0" dur="5s"
                    begin={`${dot.initialDelay}s`} repeatCount="indefinite"
                  />
                </circle>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
}