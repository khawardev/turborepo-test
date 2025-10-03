"use client"

import { ReactNode } from "react"
import LightRays from "@/components/ui/react-bits/LightRays"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface LightRaysWrapperProps {
    children: ReactNode
    className?: string
    raysColor?: string
    raysOrigin?: "top-left" | "top-center" | "top-right" | "center" | "bottom-left" | "bottom-center" | "bottom-right"
    raysSpeed?: number
    lightSpread?: number
    rayLength?: number
    followMouse?: boolean
    mouseInfluence?: number
    noiseAmount?: number
    distortion?: number
}

export default function LightRaysWrapper({
    children,
    className,
    raysOrigin = "top-center",
    raysSpeed = 1.5,
    lightSpread = 1.4,
    rayLength = 8,
    followMouse = false,
    mouseInfluence = 0.1,
    noiseAmount = 0.3,
    distortion = 0.05,
}: LightRaysWrapperProps) {
    const { theme } = useTheme();
    const raysColor = theme === "dark" ? "#71EA01" : "#000000";
    return (
        <div className={cn("relative h-screen", className)}>
            <div className="absolute z-10 w-full h-full overflow-y-auto">
                {children}
            </div>
            <LightRays
                raysOrigin={"top-center"}
                raysColor={raysColor}
                raysSpeed={raysSpeed}
                lightSpread={lightSpread}
                rayLength={rayLength}
                followMouse={followMouse}
                mouseInfluence={mouseInfluence}
                noiseAmount={noiseAmount}
                distortion={distortion}
                className="absolute inset-0 -z-10 h-full w-full"
            />
        </div>
    )
}