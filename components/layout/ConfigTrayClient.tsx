"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";
import UserMenu from "./UserMenu";
import AuthButtons from "./AuthButtons";
import Image from "next/image";

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

    const isActive = (url: string) =>
        pathname === url ? "bg-input/50 border border-input" : "";

    return (
        <section className="flex items-center w-[90%] justify-between gap-2">
            <Image src={'https://i.postimg.cc/5ythqc3x/HB-Green-Halflogo-name-mark-side-green-1.png'} width={42} height={42} alt="logo" />
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
