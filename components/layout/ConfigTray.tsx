import { getCurrentUser } from "@/actions/userActions";
import UserMenu from "./UserMenu";
import { appConfig } from "@/config/site";
import AuthButtons from "./AuthButtons";
import { Button } from "../ui/button";
import Link from "next/link";

export const revalidate = 0

const ConfigTray = async () => {
    const user = await getCurrentUser();

    return (
        <div className="w-full px-4">
            <div className="flex w-full justify-between items-center gap-2 backdrop-blur border p-1 rounded-full">
                <Link href={'/'}>
                    <Button className="border-none bg-transparent rounded-full" variant="outline">
                        Home
                    </Button>
                </Link>
                
                {user && <Link href={'/audit'}>
                    <Button className="border-none bg-transparent rounded-full" variant="outline">
                        Audits
                    </Button>
                </Link>
                }

                {user &&
                    <div className="flex items-center  justify-center space-x-4  bg-transparent  shadow-xs rounded-full dark:bg-input/30   px-1 py-1">
                        <div className="text-sm select-none text-muted-foreground pl-3">
                            <span className="font-semibold text-foreground">{user.auditCredits}</span> / {appConfig.audits.freeTierLimit} Credits
                        </div>
                        <UserMenu user={user} />
                    </div>
                }
                {!user && <AuthButtons />}
            </div>
        </div>

    );
};

export default ConfigTray;