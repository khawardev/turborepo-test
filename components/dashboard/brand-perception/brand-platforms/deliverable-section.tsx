import { AttributeKey } from "../brand";
import BrandTable from "./brand-table";

interface DeliverableSectionProps {
    title: string;
    attributes: AttributeKey[];
    searchQuery: string;
    allExpanded: boolean;
}

export default function DeliverableSection({
    title,
    attributes,
    searchQuery,
    allExpanded,
}: DeliverableSectionProps) {
    return (
        <div className="space-y-4">
            <h3 className=" text-lg font-semibold tracking-tight">
                {title}
            </h3>
            <BrandTable
                attributes={attributes}
                searchQuery={searchQuery}
                allExpanded={allExpanded}
            />
        </div>
    );
}