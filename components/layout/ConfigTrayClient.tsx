"use client";

import { useState, useEffect, useRef } from "react"; 
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";
import UserMenu from "./UserMenu";
import AuthButtons from "./AuthButtons";

type Props = {
    user: any;
    appConfig: {
        audits: {
            freeTierLimit: number;
        };
    };
};

const ConfigTrayClient = ({ user, appConfig }: Props) => {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            scrollTimeout.current = setTimeout(() => {
                setIsVisible(true);
            }, 200); 
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }
        };
    }, [lastScrollY]);

    const isActive = (url: string) =>
        pathname === url ? "bg-input/50 border border-input" : "";

    return (
        <section
            className={`
                fixed top-4 left-1/2 -translate-x-1/2 z-50 
                flex items-center max-w-5xl w-full px-4 justify-between gap-1 
                transition-transform duration-300 ease-in-out
                ${isVisible ? "translate-y-0" : "-translate-y-[150%]"}
            `}
        >
            <div>
                <Link href="/" className="block relative">
                    <img
                        src="https://i.postimg.cc/c1jwNRnH/HB-logo-name-mark-side-green-1.png"
                        alt="Full Logo"
                        className="hidden md:block w-[150px] h-auto"
                    />
                    <img
                        src="https://i.postimg.cc/5ythqc3x/HB-Green-Halflogo-name-mark-side-green-1.png"
                        alt="Half Logo"
                        className="block md:hidden w-[45px] h-auto"
                    />
                </Link>
            </div>

            <div className="flex items-center gap-1 bg-background/50 backdrop-blur border p-1 rounded-full">
                <Button
                    className={`rounded-full border border-transparent hover:border-border hover:border ${isActive("/")}`}
                    variant="ghost"
                    size="sm"
                    asChild
                >
                    <Link href="/">Home</Link>
                </Button>

                {user && (
                    <Button
                        className={`rounded-full border border-transparent hover:border-border hover:border ${isActive("/audit")}`}
                        variant="ghost"
                        size="sm"
                        asChild
                    >
                        <Link href="/audit">Audits</Link>
                    </Button>
                )}

                {user && (
                    <div className="flex items-center justify-center space-x-2 bg-transparent shadow-xs rounded-full dark:bg-input/30 px-1 py-0.5">
                        <div className="text-xs select-none text-muted-foreground pl-2">
                            <span className="font-semibold text-foreground">{user.auditCredits}</span> / {appConfig.audits.freeTierLimit} Credits
                        </div>
                        <UserMenu user={user} />
                    </div>
                )}

                {!user && <AuthButtons />}
            </div>
        </section>
    );
};

export default ConfigTrayClient;