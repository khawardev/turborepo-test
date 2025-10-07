"use client";

import { useState } from "react";
import { exportToCSV } from "./utils";
import { FilterType, ViewType } from "./brand";
import MainNav from "./navigation/main-nav";
import SubNav from "./navigation/sub-nav";
import PlatformsView from "./brand-platforms/platforms-view";
import ImplicationsView from "./strategic-implications/implications-view";
import DashboardHeader from "../shared/DashboardHeader";
import { brandData } from "@/data/brands/brand_perception";

export default function BrandPerceptionDashboard() {
    const [currentView, setCurrentView] = useState<ViewType>("platforms");
    const [currentFilter, setCurrentFilter] = useState<FilterType>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [allExpanded, setAllExpanded] = useState(false);

    const handleExport = () => {
        exportToCSV(brandData);
    };

    const toggleAllSections = () => {
        setAllExpanded(!allExpanded);
    };

    return (
        <div className="flex flex-col space-y-6">
            <MainNav
                currentView={currentView}
                setCurrentView={setCurrentView}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                allExpanded={allExpanded}
                toggleAllSections={toggleAllSections}
                handleExport={handleExport}
            />
            <SubNav
                currentFilter={currentFilter}
                setCurrentFilter={setCurrentFilter}
            />
            <main >
                {currentView === "platforms" ? (
                    <PlatformsView
                        filter={currentFilter}
                        searchQuery={searchQuery}
                        allExpanded={allExpanded}
                    />
                ) : (
                    <ImplicationsView
                        filter={currentFilter}
                        searchQuery={searchQuery}
                        allExpanded={allExpanded}
                    />
                )}
            </main>
        </div>
    );
}