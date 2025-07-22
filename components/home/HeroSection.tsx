'use client';

import React, { useRef, useState } from 'react';
import UrlSubmissionForm from './UrlSubmissionForm';
import AuthModal from '../auth/AuthModal';
import { useRouter } from 'next/navigation';
import { createAudit } from '@/actions/auditActions';
import { toast } from 'sonner';
import WorldMap from '../ui/world-map';
import AuditProgress from '../layout/AuditProgress';

export default function HeroSection({ user }: { user: any }) {
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [submittedUrl, setSubmittedUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [progress, setProgress] = useState(0);
    const [progressTitle, setProgressTitle] = useState('');
    const router = useRouter();


    const stopProgress = () => {
        if (progressIntervalRef.current) {
            clearTimeout(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
    };

    const runProgressSimulation = () => {
        const stages = [
            { title: 'Initializing Audit...', progress: 10, duration: 20000 },
            { title: 'Analysing Website...', progress: 40, duration: 20000 },
            { title: 'Analyzing Content with AI...', progress: 80, duration: 20000 },
            { title: 'Finalizing Report...', progress: 95, duration: 3000 },
        ];

        let stageIndex = 0;

        const nextStage = () => {
            if (stageIndex >= stages.length) {
                stopProgress();
                return;
            }

            const stage = stages[stageIndex];
            setProgress(stage.progress);
            setProgressTitle(stage.title);

            stageIndex++;
            progressIntervalRef.current = setTimeout(nextStage, stage.duration);
        };

        nextStage();
    };

    const handleUrlSubmit = async (url: string) => {
        if (!user) {
            setSubmittedUrl(url);
            setAuthModalOpen(true);
            setIsLoading(false);
        } else {
            startAudit(url);
        }
    };

    const startAudit = async (url: string) => {
        runProgressSimulation();
        try {
            toast.info('Starting your free audit, this take a moment.');
            const result = await createAudit(url);
            stopProgress();

            if (result.error) {
                toast.error(result.error);
            } else if (result.auditId) {
                setProgress(100);
                setProgressTitle('Analysis Finished!');
                toast.success('Analysis finsihed! Redirecting to results...');
                router.push(`/audit/${result.auditId}`);
            }
        } catch (error) {
            stopProgress();
            toast.error('Something went wrong while starting audit.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthSuccess = () => {
        setAuthModalOpen(false);

        if (submittedUrl) {
            setIsLoading(true);
            startAudit(submittedUrl);
        }
    };

    return (
        <main className=' flex flex-col justify-between space-y-4'>
            <div className="relative">
                <div className="absolute inset-x-0 w-full md:scale-110 md:-top-30 top-20 overflow-hidden z-0 opacity-30 dark:opacity-60 pointer-events-none">
                    <WorldMap
                        dots={[
                            { start: { lat: 64.2, lng: -149.4 }, end: { lat: 34.0, lng: -118.2 } },
                            { start: { lat: 51.5, lng: -0.1 }, end: { lat: -15.7, lng: -47.8 } },
                            { start: { lat: -15.7, lng: -47.8 }, end: { lat: 38.7, lng: -9.1 } },
                            { start: { lat: 51.5, lng: -0.1 }, end: { lat: 28.6, lng: 77.2 } },
                            { start: { lat: 28.6, lng: 77.2 }, end: { lat: 43.1, lng: 131.9 } },
                            { start: { lat: 28.6, lng: 77.2 }, end: { lat: -1.2, lng: 36.8 } }
                        ]}
                    />
                </div>
                <div className="absolute md:-bottom-50 -bottom-40 w-full z-50">
                    {isLoading && <AuditProgress progress={progress} progressTitle={progressTitle} />}
                </div>
                <div className="relative z-10">
                    <UrlSubmissionForm setIsLoading={setIsLoading} isLoading={isLoading} onSubmit={handleUrlSubmit} />
                </div>
            </div>
            <AuthModal
                isOpen={isAuthModalOpen}
                onOpenChange={setAuthModalOpen}
                onAuthSuccess={handleAuthSuccess}
            />
        </main>
    );
}
