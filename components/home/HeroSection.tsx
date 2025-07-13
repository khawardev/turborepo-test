'use client';

import React, { useState } from 'react';
import UrlSubmissionForm from './UrlSubmissionForm';
import AuthModal from '../auth/AuthModal';
import { useRouter } from 'next/navigation';
import { createAudit } from '@/actions/auditActions';
import { toast } from 'sonner';
import WorldMap from '../ui/world-map';

export default function HeroSection({ user }: { user: any }) {
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [submittedUrl, setSubmittedUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleUrlSubmit = async (url: string) => {
        if (!user) {
            setSubmittedUrl(url);
            setAuthModalOpen(true);
        } else {
            await startAudit(url);
        }
    };

    const startAudit = async (url: string) => {
        setIsLoading(true);
        toast.info("Starting your free audit... Please wait.");
        const result = await createAudit(url);
        if (result.error) {
            toast.error(result.error);
            setIsLoading(false);
        } else if (result.auditId) {
            toast.success("Analysis started! Redirecting to results...");
            router.push(`/audit/${result.auditId}`);
        }
    };

    const handleAuthSuccess = () => {
        setAuthModalOpen(false);
        if (submittedUrl) {
            startAudit(submittedUrl);
        }
    };

    return (
        <>
            <div className="relative">
                <div className="absolute inset-x-0 md:-top-40 top-20 overflow-hidden  z-0 opacity-30 dark:opacity-60 pointer-events-none">
                    <WorldMap
                        dots={[
                            { start: { lat: 64.2, lng: -149.4 }, end: { lat: 34.0, lng: -118.2 } },
                            { start: { lat: 51.5, lng: -0.1 }, end: { lat: -15.7, lng: -47.8 } },
                            { start: { lat: -15.7, lng: -47.8 }, end: { lat: 38.7, lng: -9.1 } },
                            { start: { lat: 51.5, lng: -0.1 }, end: { lat: 28.6, lng: 77.2 } },
                            { start: { lat: 28.6, lng: 77.2 }, end: { lat: 43.1, lng: 131.9 } },
                            { start: { lat: 28.6, lng: 77.2 }, end: { lat: -1.2, lng: 36.8 } },
                        ]}
                    />
                </div>
                <div className="relative z-10">
                    <UrlSubmissionForm onSubmit={handleUrlSubmit} isLoading={isLoading} />
                </div>
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onOpenChange={setAuthModalOpen}
                onAuthSuccess={handleAuthSuccess}
            />
        </>
    );
}