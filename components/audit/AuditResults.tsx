'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appConfig } from "@/config/site";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { MdOutlineDownloading, MdOutlineRemoveCircleOutline } from "react-icons/md";
import Link from "next/link";

import { IoArrowBackOutline } from "react-icons/io5";
import { Separator } from "../ui/separator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ContentActions } from "./ContentActions";
import { toast } from "sonner";
import { useState } from "react";
import { cleanAndFlattenBullets } from "@/lib/cleanMarkdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateQuestionnairePdf } from "@/lib/genrate-pdfs/questionare";

interface AuditResultsProps {
    audit: any;
    user: any;
    generateQuestionnaire: (auditContent: string) => Promise<{ generatedText: string | null; errorReason: string | null; }>;
}

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
        if (score >= 80) return "text-primary";
        if (score >= 40) return "text-lime-green";
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
                <p className="text-xs text-muted-foreground/60">out of 100</p>
            </CardContent>
        </Card>
    );
};

export default function AuditResults({ audit, user, generateQuestionnaire }: AuditResultsProps) {
    const hasCredits = user?.auditCredits > 0;
    const hasReachedLimit = user?.auditCredits <= 0 && user?.auditCredits !== appConfig.audits.freeTierLimit;
    const [isDownloadingReport, setIsDownloadingReport] = useState(false);
    const [isDownloadingQuestionnaire, setIsDownloadingQuestionnaire] = useState(false);
    const [isGeneratingQuestionnaire, setIsGeneratingQuestionnaire] = useState(false);
    const [questionnaire, setQuestionnaire] = useState<string | null>(null);
    const [questionnaireError, setQuestionnaireError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("report");
    const currentDate = new Date().toISOString().split("T")[0];

    if (audit.status === 'failed') {
        return (
            <div className="container max-w-4xl mx-auto md:py-30 py-28 px-4">
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
            <div className="container max-w-4xl mx-auto md:py-30 py-28 px-4 text-center">
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

    const handleDownloadReportPdf = async (content: string, fileName: string) => {
        setIsDownloadingReport(true);
        if (!content) {
            toast.error("No content available to download.");
            setIsDownloadingReport(false);
            return;
        }
        try {
            const { generateReportPdfFromMarkdown } = await import('@/lib/genrate-pdfs/report');
            generateReportPdfFromMarkdown(content, fileName);
            toast.info("Report PDF Generated");
        } catch (error) {
            console.error("PDF generation failed:", error);
            toast.error("Failed to generate PDF report.");
        } finally {
            setIsDownloadingReport(false);
        }
    };

    const handleGenerateQuestionnaire = async () => {
        setIsGeneratingQuestionnaire(true);
        setQuestionnaire(null);
        setQuestionnaireError(null);
        try {
            toast.info("Generating your questionnaire...");
            const result = await generateQuestionnaire(audit.auditGenratedContent);
            if (result.generatedText) {
                setQuestionnaire(result.generatedText);
                toast.success("Questionnaire generated successfully.");
                setActiveTab("questionnaire");
            } else {
                setQuestionnaireError(result.errorReason || "An unknown error occurred.");
                toast.error(result.errorReason || "Failed to generate questionnaire.");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
            setQuestionnaireError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsGeneratingQuestionnaire(false);
        }
    };

    const handleDownloadQuestionnairePdf = () => {
        if (!questionnaire) {
            toast.error("Questionnaire content is not available.");
            return;
        }

        setIsDownloadingQuestionnaire(true);
        try {
            const fileName = `${audit.url}_humanbrandai_questionnaire_${currentDate}.pdf`;
            generateQuestionnairePdf({ markdownContent: questionnaire }, fileName);
            toast.info("Questionnaire PDF Generated");
        } catch (error) {
            console.error("Questionnaire PDF generation failed:", error);
            toast.error("Failed to generate questionnaire PDF.");
        } finally {
            setIsDownloadingQuestionnaire(false);
        }
    };

    return (
        <div className="container flex flex-col space-y-6 max-w-5xl mx-auto md:py-30 py-28 px-4">
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
                    <MdOutlineRemoveCircleOutline className="h-4 w-4" />
                    <AlertTitle className="font-semibold">Usage Limit Reached</AlertTitle>
                    <AlertDescription>
                        You have used all your free reports.
                    </AlertDescription>
                </Alert>
            )}

            <Button className="w-fit rounded-full" variant="outline" asChild>
                <Link href="/audit">
                    <IoArrowBackOutline /> back
                </Link>
            </Button>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-4 mb-8">
                <div>
                    <h1 className="text-3xl mb-2 tracking-tight font-bold font-heading">Website <span className=" text-primary">Brand Health Audit </span>  is ready</h1>
                    <Link href={audit.url} target='_blank' className="text-muted-foreground break-all">{audit.url}</Link>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="report">Audit Report</TabsTrigger>
                    <TabsTrigger value="questionnaire" disabled={!questionnaire}>Questionnaire</TabsTrigger>
                </TabsList>
                <TabsContent value="report">
                    {audit.crawledContent &&
                        <section>
                            <div className={"flex flex-col md:flex-row md:items-center items-end justify-between mb-4 gap-4"}>
                                {!questionnaire && (
                                    <Button
                                        onClick={handleGenerateQuestionnaire}
                                        disabled={isGeneratingQuestionnaire}
                                    >
                                        {isGeneratingQuestionnaire ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                                        ) : (
                                            'Generate Questionnaire'
                                        )}
                                    </Button>
                                )}
                                <div className="flex justify-end w-full">
                                    <ContentActions
                                        content={audit.auditGenratedContent}
                                        auditURL={audit.url}
                                        handleDownloadPdf={() => handleDownloadReportPdf(audit.auditGenratedContent, `${audit.url}_humanbrandai_report_${currentDate}.pdf`)}
                                        isDownloading={isDownloadingReport}
                                    />
                                </div>
                            </div>
                            <Separator className="mb-4" />
                            <div className="prose prose-neutral max-w-none markdown-body space-y-6 dark:prose-invert">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanAndFlattenBullets(audit.auditGenratedContent)}</ReactMarkdown>
                            </div>
                        </section>
                    }
                </TabsContent>
                <TabsContent value="questionnaire">
                    {questionnaireError && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Error Generating Questionnaire</AlertTitle>
                            <AlertDescription>{questionnaireError}</AlertDescription>
                        </Alert>
                    )}

                    {questionnaire && (
                        <section>
                            <div className="flex justify-end mb-4">
                                <ContentActions
                                    content={questionnaire}
                                    auditURL={audit.url}
                                    handleDownloadPdf={handleDownloadQuestionnairePdf}
                                    isDownloading={isDownloadingQuestionnaire}
                                />
                            </div>
                            <Separator className="mb-4" />
                            <div className="prose prose-neutral max-w-none markdown-body space-y-6 dark:prose-invert">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{questionnaire}</ReactMarkdown>
                            </div>
                        </section>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}