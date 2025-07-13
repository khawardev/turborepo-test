import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appConfig } from "@/config/site";
import { AlertTriangle, FileDown, CheckCircle2, CircleSlash } from "lucide-react";
import { MdFileDownload, MdOutlineDownloading } from "react-icons/md";
import {
    Activity,
    Accessibility,
    ShieldCheck,
    SearchCheck,
} from "lucide-react";
import Link from "next/link";
interface AuditResultsProps {
    audit: any;
    user: any;
}
import { IoArrowBackOutline } from "react-icons/io5";
import { Separator } from "../ui/separator";

const ScoreWidget = ({
    title,
    score,
    icon,
}: {
    title: string;
    score: number;
    icon: React.ReactNode;
}) => {
    const getScoreColor = () => {
        if (score >= 90) return "text-primary";
        if (score >= 50) return "text-lime-green";
        return "text-red-500";
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor()}`}>{score}</div>
                <p className="text-xs text-muted-foreground">out of 100</p>
            </CardContent>
        </Card>
    );
};

export default function AuditResults({ audit, user }: AuditResultsProps) {
    const hasCredits = user?.auditCredits > 0;
    const hasReachedLimit = user?.auditCredits <= 0 && user?.auditCredits !== appConfig.audits.freeTierLimit;

    if (audit.status === 'failed') {
        return (
            <div className="container max-w-4xl mx-auto py-12 px-4">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Analysis Failed</AlertTitle>
                    <AlertDescription>
                        An error occurred during analysis for {audit.url}. Your free audit credit was not used. Please try again later or with a different URL.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (hasReachedLimit && audit.status !== 'completed') {
        return (
            <div className="container max-w-4xl mx-auto py-12 px-4 text-center">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">You've Used All Your Free Audits!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>Thank you for using our service. You have reached the limit of {appConfig.audits.freeTierLimit} free reports.</p>
                        <Button size="lg">Upgrade to Pro for More Audits</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container flex flex-col space-y-6 max-w-4xl mx-auto py-12 px-4">
            
            <Link href={'/audit'}>
                <Button className="rounded-full" variant="outline">
                    <IoArrowBackOutline /> back
                </Button>
            </Link>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-4 mb-8">
                <div>
                    <h1 className="text-3xl   tracking-tight font-bold font-heading">Website <span className=" text-primary"> Health Audit </span>  is ready</h1>
                    <p className="text-muted-foreground break-all">{audit.url}</p>
                </div>
                <Button size={'sm'} >
                    Save Report <MdOutlineDownloading />
                </Button>
            </div>
            <Separator className="mb-8" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <ScoreWidget
                    title="Performance"
                    score={audit.results.performanceScore}
                    icon={<Activity className="w-5 h-5" />}
                />
                <ScoreWidget
                    title="Accessibility"
                    score={audit.results.accessibilityScore}
                    icon={<Accessibility className="w-5 h-5" />}
                />
                <ScoreWidget
                    title="Best Practices"
                    score={audit.results.bestPracticesScore}
                    icon={<ShieldCheck className="w-5 h-5" />}
                />
                <ScoreWidget
                    title="SEO"
                    score={audit.results.seoScore}
                    icon={<SearchCheck className="w-5 h-5" />}
                />
            </div>


        
            {hasCredits && (
                <Alert className="mb-8 border-lime-green/50 text-lime-green">
                    <CheckCircle2 className="h-4 w-4 text-lime-green" />
                    <AlertTitle className="font-semibold">You're on the free plan</AlertTitle>
                    <AlertDescription className=" flex gap-1">
                        You have <span className="font-bold">{user?.auditCredits}</span> free reports remaining.
                    </AlertDescription>
                </Alert>
            )}

            {!hasCredits && user?.auditCredits !== appConfig.audits.freeTierLimit && (
                <Alert variant="destructive" className="mb-8">
                    <CircleSlash className="h-4 w-4" />
                    <AlertTitle className="font-semibold">Usage Limit Reached</AlertTitle>
                    <AlertDescription>
                        You have used all your free reports. Upgrade to generate more.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}