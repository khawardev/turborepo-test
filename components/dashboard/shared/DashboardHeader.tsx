export default function DashboardHeader({ title, subtitle }: any) {
    return (
        <header className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
        </header>
    );
}