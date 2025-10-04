import { FilterType } from "../brand";
import {
    attributes1to8,
    attributes9to12,
    attributes13to14,
    attributes15to18
} from "../utils";
import DeliverableSection from "./deliverable-section";

interface PlatformsViewProps {
    filter: FilterType;
    searchQuery: string;
    allExpanded: boolean;
}

export default function PlatformsView({ filter, searchQuery, allExpanded }: PlatformsViewProps) {
    const sections = [
        {
            id: "narrative",
            title: "Section I: Brand Narrative & Platform (Deliverables 1-8)",
            attributes: attributes1to8,
            show: filter === "all" || filter === "narrative"
        },
        {
            id: "verbal",
            title: "Section II: Verbal Identity (Deliverables 9-12)",
            attributes: attributes9to12,
            show: filter === "all" || filter === "verbal"
        },
        {
            id: "archetype",
            title: "Section III: Holistic Narrative & Archetype (Deliverables 13-14)",
            attributes: attributes13to14,
            show: filter === "all" || filter === "archetype"
        },
        {
            id: "strategic",
            title: "Section IV: Strategic Foundation (Deliverables 15-18)",
            attributes: attributes15to18,
            show: filter === "all" || filter === "strategic"
        }
    ];

    return (
        <div className="py-8 space-y-8">
            {sections.map((section) => (
                section.show && (
                    <DeliverableSection
                        key={section.id}
                        title={section.title}
                        attributes={section.attributes}
                        searchQuery={searchQuery}
                        allExpanded={allExpanded}
                    />
                )
            ))}
        </div>
    );
}