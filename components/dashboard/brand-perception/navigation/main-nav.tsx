import { ViewType } from "../brand";
import ViewToggle from "./view-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileDown, Maximize2, Minimize2 } from "lucide-react";

interface MainNavProps {
    currentView: ViewType;
    setCurrentView: (view: ViewType) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    allExpanded: boolean;
    toggleAllSections: () => void;
    handleExport: () => void;
}
export default function MainNav({
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    allExpanded,
    toggleAllSections,
    handleExport,
}: MainNavProps) {
    return (
        <nav>
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 sm:gap-6">
                <ViewToggle
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                />

                <div className="flex-1 w-full sm:max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Search across all brand data..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-7.5 w-full"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button
                        size="sm"
                        className="h-7 w-full sm:w-auto"
                        onClick={toggleAllSections}
                        variant="outline"
                    >
                        {allExpanded ? (
                            <>
                                Collapse All
                            </>
                        ) : (
                            <>
                                Expand All
                            </>
                        )}
                    </Button>

                    <Button
                        size="sm"
                        className="h-7 w-full sm:w-auto"
                        onClick={handleExport}
                    >
                        Export Data
                    </Button>
                </div>
            </div>
        </nav>
    );
}
