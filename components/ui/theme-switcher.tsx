"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { useTheme } from "next-themes";
import { Icons } from "../shared/icons";

const ThemeSwitcher = React.forwardRef<
    HTMLButtonElement,
    React.HTMLAttributes<HTMLButtonElement>
>((props, ref) => {
    const { className, ...rest } = props;
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <button
            ref={ref}
            {...rest}
            className={cn(
                "  hover:bg-accent  hover:text-accent-foreground relative flex size-[34px] items-center justify-center rounded-md p-2 transition-colors ",
                className,
            )}
            onClick={toggleTheme}
        >
            <Icons.toggletheme />
        </button>
    );
});

ThemeSwitcher.displayName = "ThemeSwitcher";

export { ThemeSwitcher };