'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getBatchWebsiteScrapeStatus } from '@/server/actions/ccba/website/websiteStatusAction';
import { getBatchSocialScrapeStatus } from '@/server/actions/ccba/social/socialStatusAction';
import { ScrapeStatusBadge } from './ScrapeStatusBadge';
import { isStatusProcessing } from '@/lib/utils';

type PollingStatusBadgeProps = {
    type: 'Website' | 'Social';
    initialStatus: string | null;
    initialError?: string | null;
    brandId: string;
    batchId: string;
    pollInterval?: number;
};

export function PollingStatusBadge({
    type,
    initialStatus,
    initialError,
    brandId,
    batchId,
    pollInterval = 15000
}: PollingStatusBadgeProps) {
    const router = useRouter();
    const [status, setStatus] = useState<string | null>(initialStatus);
    const [error, setError] = useState<string | null>(initialError || null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isPollingRef = useRef(isStatusProcessing(initialStatus));

    const checkStatus = useCallback(async () => {
        if (!isPollingRef.current) return;

        try {
            const fetchStatus = type === 'Website' 
                ? getBatchWebsiteScrapeStatus 
                : getBatchSocialScrapeStatus;
            
            const res = await fetchStatus(brandId, batchId);
            
            if (res?.status) {
                setStatus(res.status);
                if (res.error) setError(res.error);
                
                if (!isStatusProcessing(res.status)) {
                    isPollingRef.current = false;
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                    router.refresh();
                }
            }
        } catch (e) {
            console.error(`[PollingStatusBadge] ${type} status check error:`, e);
        }
    }, [type, brandId, batchId, router]);

    useEffect(() => {
        if (!isStatusProcessing(initialStatus)) {
            isPollingRef.current = false;
            return;
        }

        isPollingRef.current = true;
        intervalRef.current = setInterval(checkStatus, pollInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [initialStatus, checkStatus, pollInterval]);

    return (
        <ScrapeStatusBadge
            label={type}
            status={status}
            error={error}
        />
    );
}
