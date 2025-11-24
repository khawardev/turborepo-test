import { Separator } from "@/components/ui/separator";

export default function DashboardHeader({ title, subtitle }: any) {
    return (
        <>
            <header className="flex flex-col gap-1 mb-6">
                <h1 className="text-3xl font-bold tracking-tight mb-1  capitalize">{title}</h1>
                <p className="text-muted-foreground text-xl">{subtitle}</p>
            </header>
            <Separator/>
        </>
    );
}