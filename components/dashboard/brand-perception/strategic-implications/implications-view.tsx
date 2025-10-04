"use client";

import { useState, useEffect } from "react";
import { FilterType, AttributeKey } from "../brand";
import { getAttributesByFilter, getAttributeLabel } from "../utils";
import ImplicationCard from "./implication-card";
import Synthesis from "./synthesis";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImplicationsViewProps {
    filter: FilterType;
    searchQuery: string;
    allExpanded: boolean;
}

export default function ImplicationsView({ filter, searchQuery, allExpanded }: ImplicationsViewProps) {
    const [expandedSections, setExpandedSections] = useState<Set<AttributeKey>>(new Set());
    const attributes = getAttributesByFilter(filter);

    useEffect(() => {
        if (allExpanded) {
            setExpandedSections(new Set(attributes));
        } else {
            setExpandedSections(new Set([attributes[0]]));
        }
    }, [allExpanded, filter]);

    const toggleSection = (attr: AttributeKey) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(attr)) {
            newExpanded.delete(attr);
        } else {
            newExpanded.add(attr);
        }
        setExpandedSections(newExpanded);
    };

    return (
        <div className="py-8 space-y-6">
            {attributes.map((attr) => {
                const isExpanded = expandedSections.has(attr);

                return (
                    <div
                        key={attr}
                    >
                        <button
                            onClick={() => toggleSection(attr)}
                            className="w-full bg-accent/40 rounded-md  brand-gradient py-3 p-5 border-b-2  flex justify-between items-center hover:opacity-95 transition-opacity"
                        >
                            <h3 className=" font-semibold ">
                                {getAttributeLabel(attr)} - Strategic Implications
                            </h3>
                            {isExpanded ? (
                                <ChevronUp className="h-6 w-6 " />
                            ) : (
                                <ChevronDown className="h-6 w-6 " />
                            )}
                        </button>

                        {isExpanded && (
                            <div className="py-6 bg-background/50 space-y-6">
                                <ImplicationCard
                                    attribute={attr}
                                    searchQuery={searchQuery}
                                />
                                <Synthesis
                                    attribute={attr}
                                    searchQuery={searchQuery}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}