'use client'

import { useState, useMemo, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import ReportDisplay from './ReportDisplay'
import DashboardHeader from '@/components/dashboard/shared/DashboardHeader'
import { timeAgo } from '@/lib/date-utils'

export default function ReportDataViewer({ allReportsData, brandName, competitors }: any) {
    const [selectedReportBatchId, setSelectedReportBatchId] = useState<string | null>(null)
    const [selectedSource, setSelectedSource] = useState<any>(null)

    const sortedReports = useMemo(() => {
        if (!allReportsData || allReportsData.length === 0) return []
        return [...allReportsData].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
    }, [allReportsData])

    const selectedReport = useMemo(() => {
        if (!selectedReportBatchId) return null
        return sortedReports.find((report: any) => report.report_batch_id === selectedReportBatchId)
    }, [selectedReportBatchId, sortedReports])

    const dataSources = useMemo(() => {
        if (!selectedReport) return []

        const sources = []
        sources.push({
            name: brandName,
            data: {
                extraction: selectedReport.brand_extraction,
                synthesis: selectedReport.brand_synthesizer
            }
        })

        if (selectedReport.competitor_reports && Array.isArray(selectedReport.competitor_reports)) {
            selectedReport.competitor_reports.forEach((comp: any) => {
                const matchedCompetitor = competitors?.find(
                    (c: any) => c.competitor_id === comp.competitor_id
                )
                sources.push({
                    name: matchedCompetitor?.name || "Unknown Competitor",
                    data: {
                        extraction: comp.extraction_report,
                        synthesis: comp.synthesizer_report
                    }
                })
            })
        }

        return sources
    }, [selectedReport, brandName, competitors])

    useEffect(() => {
        if (sortedReports.length > 0 && !selectedReportBatchId) {
            setSelectedReportBatchId(sortedReports[0].report_batch_id)
        }
        if (dataSources.length > 0) {
            const currentSelection = dataSources.find(s => s.name === selectedSource?.name) || dataSources[0]
            setSelectedSource(currentSelection)
        } else {
            setSelectedSource(null)
        }
    }, [dataSources, sortedReports, selectedReportBatchId])

    if (sortedReports.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground h-[75vh] flex items-center justify-center">
                No report data available.
            </div>
        )
    }

    if (!selectedSource) {
        return (
            <div className="text-center p-8 text-muted-foreground h-[75vh] flex items-center justify-center">
                Loading report data...
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-8">
            <DashboardHeader
                title="Brand Reports"
                subtitle="View all generated reports and competitor insights"
            />

            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    {dataSources.map(source => (
                        <Button
                            className="capitalize"
                            key={source.name}
                            variant={selectedSource?.name === source.name ? "outline" : "ghost"}
                            onClick={() => setSelectedSource(source)}
                        >
                            {source.name}
                        </Button>
                    ))}
                </div>

                <Select onValueChange={setSelectedReportBatchId} value={selectedReportBatchId ?? ''}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select report run" />
                    </SelectTrigger>
                    <SelectContent>
                        {sortedReports.map((report: any, index: number) => (
                            <SelectItem key={report.report_batch_id} value={report.report_batch_id}>
                                {`${timeAgo(report.created_at)}`}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <ReportDisplay standardizedReportData={selectedSource.data} title={selectedSource.name} />
        </div>
    )
}