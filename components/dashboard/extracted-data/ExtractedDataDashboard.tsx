'use client'

import { useMemo } from "react";
import AuditAndCorpusSummary from "./AuditAndCorpusSummary";
import VerbalIdentity from "./VerbalIdentity";
import NarrativeData from "./NarrativeData";
import BusinessStructures from "./BusinessStructures";
import RelationshipMatrix from "./RelationshipMatrix";
import AudienceAndSignals from "./AudienceAndSignals";

export default function ExtractedDataDashboard({ data }: any) {

    const extractedData = useMemo(() => {
        if (!data || !data[0] || !data[0].data) {
            return null;
        }
        return data[0].data;
    }, [data]);

    if (!extractedData) {
        return (
            <div className="mt-4 p-6 border rounded-lg text-center text-muted-foreground">
                No valid extracted data to display.
            </div>
        );
    }

    return (
        <div className="mt-4 space-y-6">
            <AuditAndCorpusSummary
                audit={extractedData.audit_metadata}
                corpus={extractedData.corpus_baseline}
            />
                <VerbalIdentity data={extractedData.verbal_identity_data_points} />
                <NarrativeData data={extractedData.narrative_data_points} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <BusinessStructures data={extractedData.emergent_business_structures} />
                <AudienceAndSignals
                    audience={extractedData.audience_data}
                    signals={extractedData.nuanced_signals}
                />
            </div>
            <RelationshipMatrix data={extractedData.relationship_matrix} themes={extractedData.emergent_business_structures.discovered_strategic_themes} />
        </div>
    );
}