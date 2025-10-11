export default function DashboardHeader({ title, subtitle }: any) {
    return (
        <header className="mb-6">
            <h1 className="text-2xl mb-2 font-bold tracking-tight capitalize">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
        </header>
    );
}