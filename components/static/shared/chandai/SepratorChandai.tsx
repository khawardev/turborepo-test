import { cn } from "@/lib/utils";

export function PatternedSeparator({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "relative flex h-8 w-full shrink-0 overflow-hidden border-x border-border",
                // The pattern layer
                "before:absolute before:inset-0 before:h-full before:w-full",
                // REQUIRED: content property is needed for pseudo-elements to show
                "before:content-['']",
                // Pattern: Diagonal stripes using the standard border color
                "before:bg-[repeating-linear-gradient(315deg,transparent,transparent_5px,hsl(var(--border))_5px,hsl(var(--border))_6px)]",
                // Opacity to make it subtle like a texture
                "before:opacity-50",
                className
            )}
        />
    );
}