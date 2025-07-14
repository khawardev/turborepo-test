import { getCurrentUser } from "@/actions/userActions";
import UserMenu from "./UserMenu";
import { appConfig } from "@/config/site";
import AuthButtons from "./AuthButtons";
import { Button } from "../ui/button";
import Link from "next/link";

export const revalidate = 0;

const ConfigTray = async () => {
    const user = await getCurrentUser();

    return (
        <div className="flex items-center gap-1 bg-background/50 backdrop-blur border p-1 rounded-full">
            <Button className="rounded-full border border-transparent hover:border-border hover:border" variant="ghost" size="sm" asChild>
                <Link href="/">Home</Link>
            </Button>
            {user && (
                <Button className="rounded-full border border-transparent hover:border-border hover:border" variant="ghost" size="sm" asChild>
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
    );
};

export default ConfigTray;