"use client"

import { useEffect, useState } from "react"
import { FilterType, AttributeKey } from "../brand"
import { getAttributesByFilter, getAttributeLabel } from "../utils"
import ImplicationCard from "./implication-card"
import Synthesis from "./synthesis"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

interface ImplicationsViewProps {
    filter: FilterType
    searchQuery: string
    allExpanded: boolean
}

export default function ImplicationsView({
    filter,
    searchQuery,
    allExpanded,
}: ImplicationsViewProps) {
    const [expandedValues, setExpandedValues] = useState<string[]>([])
    const attributes = getAttributesByFilter(filter)

    useEffect(() => {
        if (allExpanded) {
            setExpandedValues(attributes)
        } else {
            setExpandedValues([attributes[0]])
        }
    }, [allExpanded, filter])

    return (
        <Accordion
            type="multiple"
            value={expandedValues}
            onValueChange={setExpandedValues}
            className="w-full space-y-4"
        >
            {attributes.map((attr) => (
                <AccordionItem
                    key={attr}
                    value={attr}
                    className="shadow-sm rounded-xl bg-linear-to-t  to-background/30 from-muted dark:from-muted/50 dark:border-border border border-zinc-300 shadow-zinc-950/10 duration-200"
                >
                    <AccordionTrigger className="px-5 py-3 font-semibold">
                        {getAttributeLabel(attr)} - Strategic Implications
                    </AccordionTrigger>

                    <AccordionContent className="space-y-6 px-5 py-6">
                        <ImplicationCard attribute={attr} searchQuery={searchQuery} />
                        <Synthesis attribute={attr} searchQuery={searchQuery} />
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}