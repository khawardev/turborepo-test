"use client";

import { useTheme } from "next-themes";
import LightRays from "@/components/ui/react-bits/LightRays";

export default function page() {
    const { theme } = useTheme();
    const raysColor = theme === "dark" ? "#71EA01" : "#000000";

    return (
        <div className="h-screen relative flex justify-center items-center overflow-hidden">
            <h1 className="absolute z-10 font-bold tracking-tight text-primary/20 text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                Reports Page
            </h1>
            <LightRays
                raysOrigin="top-center"
                raysColor={raysColor}
                raysSpeed={1.5}
                lightSpread={1.4}
                rayLength={8}
                followMouse={false}
                mouseInfluence={0.1}
                noiseAmount={0.3}
                distortion={0.05}
                className="absolute inset-0 -z-10 h-full w-full"
            />
        </div>
    );
}