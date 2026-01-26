'use client';

import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Globe, Share2, CheckCircle2, AlertCircle, Loader2, Clock } from 'lucide-react';

type BatchItem = {
    batch_id: string;
    created_at: string;
    status: string;
};

type BatchSelectorProps = {
    type: 'website' | 'social';
    batches: BatchItem[];
    selectedBatchId: string | null;
    onBatchChange: (batchId: string) => void;
    disabled?: boolean;
};

function formatBatchTime(createdAt: string): string {
    try {
        const date = parseISO(createdAt);
        return format(date, 'MMM d, yyyy h:mm a');
    } catch {
        return createdAt;
    }
}

function getStatusIcon(status: string) {
    const normalized = status?.toLowerCase() || '';
    if (normalized === 'completed') {
        return <CheckCircle2 className="w-3 h-3 text-green-500" />;
    }
    if (normalized === 'completedwitherrors') {
        return <AlertCircle className="w-3 h-3 text-yellow-500" />;
    }
    if (normalized === 'failed') {
        return <AlertCircle className="w-3 h-3 text-destructive" />;
    }
    if (normalized === 'processing' || normalized === 'initializing') {
        return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />;
    }
    return <Clock className="w-3 h-3 text-muted-foreground" />;
}

function getStatusText(status: string): string {
    const normalized = status?.toLowerCase() || '';
    if (normalized === 'completed') return 'Completed';
    if (normalized === 'completedwitherrors') return 'Completed with Errors';
    if (normalized === 'failed') return 'Failed';
    if (normalized === 'processing') return 'Processing';
    if (normalized === 'initializing') return 'Initializing';
    return 'Pending';
}

export function BatchSelector({
    type,
    batches,
    selectedBatchId,
    onBatchChange,
    disabled = false
}: BatchSelectorProps) {
    const Icon = type === 'website' ? Globe : Share2;
    const label = type === 'website' ? 'Website Batch' : 'Social Batch';

    const sortedBatches = useMemo(() => {
        return [...batches].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }, [batches]);

    const selectedBatch = useMemo(() => 
        batches.find(b => b.batch_id === selectedBatchId),
        [batches, selectedBatchId]
    );

    if (sortedBatches.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <Select
                value={selectedBatchId || ''}
                onValueChange={onBatchChange}
                disabled={disabled}
            >
                <SelectTrigger className="w-[260px]">
                    <SelectValue placeholder={`Select ${label}`}>
                        {selectedBatch && (
                            <div className="flex items-center gap-2">
                                {getStatusIcon(selectedBatch.status)}
                                <span className="truncate">{formatBatchTime(selectedBatch.created_at)}</span>
                            </div>
                        )}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {sortedBatches.map((batch, index) => (
                        <SelectItem key={batch.batch_id} value={batch.batch_id}>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(batch.status)}
                                <span>{formatBatchTime(batch.created_at)}</span>
                                <span className="text-xs text-muted-foreground">
                                    ({getStatusText(batch.status)})
                                </span>
                                {index === 0 && (
                                    <span className="text-xs font-medium text-primary">(Latest)</span>
                                )}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
