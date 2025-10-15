// components/brands/detail/reports/Report-Display.tsx

'use client'

import ExtractedDataDashboard from "@/components/dashboard/extracted-data/ExtractedDataDashboard";
import SynthesizedReportsDashboard from "@/components/dashboard/synthesized-reports/SynthesizedReportsDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseJsonFromMarkdown } from "@/lib/jsonParser";
import { useMemo } from "react";

export default function ReportDisplay({ standardizedReportData, title }: any) {

    const { extractorReport, synthesizerReport } = useMemo(() => {
        const rawExtractionResponse = standardizedReportData?.extraction?.response;
        const rawSynthesisResponse = standardizedReportData?.synthesis?.response;

        return {
            extractorReport: parseJsonFromMarkdown(rawExtractionResponse),
            synthesizerReport: rawSynthesisResponse
        };
    }, [standardizedReportData]);

    return (
        <div className="flex flex-col">
            <Tabs defaultValue="extracted_data" className=" flex flex-col">
                <div className="shrink-0">
                    <TabsList>
                        <TabsTrigger value="extracted_data">Extracted Data</TabsTrigger>
                        <TabsTrigger value="synthesized_reports">Synthesized Report</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="extracted_data" >
                    <ExtractedDataDashboard extractorReport={extractorReport} title={title} />
                </TabsContent>

                <TabsContent value="synthesized_reports" >
                    <SynthesizedReportsDashboard synthesizerReport={synthesizerReport} title={title} />
                </TabsContent>
            </Tabs>
        </div>
    );
}