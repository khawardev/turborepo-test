"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FilterType } from "../brand"

interface SubNavProps {
    currentFilter: FilterType
    setCurrentFilter: (filter: FilterType) => void
}

export default function SubNav({ currentFilter, setCurrentFilter }: SubNavProps) {
    const filters: { value: FilterType; label: string }[] = [
        { value: "all", label: "All Deliverables" },
        { value: "narrative", label: "Narrative" },
        { value: "verbal", label: "Verbal Identity" },
        { value: "archetype", label: "Archetype" },
        { value: "strategic", label: "Strategic Foundation" },
    ]

    return (
        <Tabs
            value={currentFilter}
            onValueChange={(value) => setCurrentFilter(value as FilterType)}
        >
            <TabsList >
                {filters.map((filter) => (
                    <TabsTrigger
                        key={filter.value}
                        value={filter.value}
                    >
                        {filter.label}
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    )
}
