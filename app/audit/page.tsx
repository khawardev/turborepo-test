import { getUserWithAudits } from "@/actions/userActions";
import AuditCard from "@/components/audit/AuditCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AuditsListPage() {
    const userWithAudits = await getUserWithAudits();

    if (!userWithAudits) {
        redirect("/");
    }

    const { audits } = userWithAudits;

    return (
        <div className="container max-w-5xl mx-auto md:py-30 py-28 px-4">
            <div className="mb-6">
                <h1 className="text-3xl mb-2 tracking-tight font-bold font-heading">My Websites <span className=" text-primary">Audits</span></h1>
                <p className="text-muted-foreground">
                    View and access all your previously generated websites audits.
                </p>
            </div>
            <Separator className="mb-8" />
            {audits.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h2 className="font-semibold text-medium">No Audits Found</h2>
                    <p className="text-muted-foreground mt-1 mb-4">You haven't generated any audits yet.</p>
                    <Button  size={'sm'} asChild>
                        <Link href="/">Start your First Audit</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {audits.map((audit: any) => (
                        <AuditCard key={audit.id} audit={audit} />
                    ))}
                </div>
            )}
        </div>
    );
}