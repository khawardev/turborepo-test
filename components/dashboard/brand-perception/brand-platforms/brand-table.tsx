"use client";

import { useState, useEffect } from "react";
import { AttributeKey, BrandName } from "../brand";
import { getAttributeLabel, cn } from "../utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { brandData } from "@/data/brands/brand_perception";

interface BrandTableProps {
    attributes: AttributeKey[];
    searchQuery: string;
    allExpanded: boolean;
}

const brands: BrandName[] = ['MAGNA', 'APTIV', 'BOSCH MOBILITY', 'CONTINENTAL', 'DENSO', 'FORVIA', 'GENTEX', 'LEAR', 'VALEO', 'ZF'];

export default function BrandTable({ attributes, searchQuery, allExpanded }: BrandTableProps) {
    const [expandedCells, setExpandedCells] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (allExpanded) {
            const allCells = new Set<string>();
            attributes.forEach(attr => {
                brands.forEach(brand => {
                    allCells.add(`${attr}-${brand}`);
                });
            });
            setExpandedCells(allCells);
        } else {
            setExpandedCells(new Set());
        }
    }, [allExpanded, attributes]);

    const toggleCell = (cellId: string) => {
        const newExpanded = new Set(expandedCells);
        if (newExpanded.has(cellId)) {
            newExpanded.delete(cellId);
        } else {
            newExpanded.add(cellId);
        }
        setExpandedCells(newExpanded);
    };

    const highlightText = (text: string) => {
        if (!searchQuery) return text;

        const regex = new RegExp(`(${searchQuery})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) =>
            regex.test(part) ? (
                <span key={index} className="bg-primary/30 font-semibold">
                    {part}
                </span>
            ) : (
                part
            )
        );
    };

    const renderCellContent = (data: any, attr: AttributeKey, brand: BrandName) => {
        const cellId = `${attr}-${brand}`;
        const isExpanded = expandedCells.has(cellId);
        const content = data?.text;

        if (!content) return <span className="text-muted-foreground">Data not available</span>;

        if (Array.isArray(content)) {
            return (
                <div>
                    <button
                        onClick={() => toggleCell(cellId)}
                        className="flex items-center gap-1 mb-2"
                    >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <span className="text-sm font-medium">View {content.length} items</span>
                    </button>
                    {isExpanded && (
                        <ul className="space-y-2 mt-2">
                            {content.map((item, index) => (
                                <li key={index} className="pl-4 relative before:content-['•'] before:absolute before:left-0 ">
                                    <span className="text-sm">{highlightText(item)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            );
        }

        return (
            <div
                className={cn(
                    "cursor-pointer transition-all",
                    isExpanded ? "" : "line-clamp-3"
                )}
                onClick={() => toggleCell(cellId)}
            >
                <span className="text-sm">{highlightText(content)}</span>
            </div>
        );
    };

    return (
        <div className="bg-accent/40 text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm  border-border ring-border/70 ring-offset-background ring-1 ring-offset-3">
                <Table>
                    <TableHeader>
                        <TableRow className=" ">
                            <TableHead >
                                Attribute
                            </TableHead>
                            {brands.map((brand) => (
                                <TableHead
                                    key={brand}
                                    className={cn(
                                        "font-semibold min-w-[200px]",
                                        brand === 'MAGNA' && "text-red-500 bg-red-500/10"
                                    )}
                                >
                                    {brand}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attributes.map((attr) => (
                            <TableRow key={attr} className="">
                                <TableCell className="sticky left-0 backdrop-blur-md font-medium ">
                                    {getAttributeLabel(attr)}
                                </TableCell>
                                {brands.map((brand) => (
                                    <TableCell
                                        key={`${attr}-${brand}`}
                                        className={cn(
                                            "align-top",
                                            brand === 'MAGNA' && "bg-red-500/5"
                                        )}
                                    >
                                        {renderCellContent(brandData[brand][attr], attr, brand)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
        </div>
    );
}