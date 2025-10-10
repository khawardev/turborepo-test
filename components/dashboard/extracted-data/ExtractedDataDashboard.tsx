'use client'

import { useMemo } from "react";
import AuditAndCorpusSummary from "./AuditAndCorpusSummary";
import VerbalIdentity from "./VerbalIdentity";
import NarrativeData from "./NarrativeData";
import BusinessStructures from "./BusinessStructures";
import RelationshipMatrix from "./RelationshipMatrix";
import AudienceAndSignals from "./AudienceAndSignals";

export default function ExtractedDataDashboard({ extractorReport, title }: any) {


    if (!extractorReport) {
        return (
            <div className="mt-4 p-6  text-center text-muted-foreground">
                No valid extracted data to display.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl tracking-tighter font-semibold">
                {title.charAt(0).toUpperCase() + title.slice(1)} Extractor Report
            </h2>
            <AuditAndCorpusSummary
                audit={extractorReport.audit_metadata}
                corpus={extractorReport.corpus_baseline}
            />
            <VerbalIdentity data={extractorReport.verbal_identity_data_points} />
            <NarrativeData data={extractorReport.narrative_data_points} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <BusinessStructures data={extractorReport.emergent_business_structures} />
                <AudienceAndSignals
                    audience={extractorReport.audience_data}
                    signals={extractorReport.nuanced_signals}
                />
            </div>
            <RelationshipMatrix data={extractorReport.relationship_matrix} themes={extractorReport.emergent_business_structures.discovered_strategic_themes} />
        </div>
    );
}