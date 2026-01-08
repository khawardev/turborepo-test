import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SourceSelectorProps {
    sources: string[];
    selectedSource: string;
    onSelect: (source: string) => void;
    icon?: LucideIcon;
    label?: string;
}

export function SourceSelector({
    sources,
    selectedSource,
    onSelect,
    icon: Icon,
    label = "Source"
}: SourceSelectorProps) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium  text-muted-foreground uppercase tracking-wider">
                {label}:
            </span>
            {sources.map((source) => (
                <Button
                    key={source}
                    variant={selectedSource === source ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => onSelect(source)}
                    className={cn(selectedSource === source && "border-primary")}
                >
                    {Icon && <Icon className="w-3 h-3 " />}
                    {source}
                </Button>
            ))}
        </div>
    );
}
