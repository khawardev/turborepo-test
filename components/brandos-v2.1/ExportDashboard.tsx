
'use client'

import { useState } from 'react';
import { generateExportPackageAction } from '@/server/brandos-v2.1/actions';
import { DashboardLayoutHeading } from '@/components/stages/ccba/dashboard/shared/DashboardComponents';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, PackageOpen, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function ExportDashboard({ engagementId }: { engagementId: string }) {
    const [status, setStatus] = useState<'idle' | 'generating' | 'ready'>('idle');
    const [result, setResult] = useState<{ downloadUrl: string, files: string[] } | null>(null);

    const handleGenerate = async () => {
        setStatus('generating');
        const res = await generateExportPackageAction(engagementId);
        setResult(res);
        setStatus('ready');
    };

    return (
        <div>
            <DashboardLayoutHeading
                title="Flow F: Export & Handoff"
                subtitle="Generate BAM Input Pack and downloadable artifacts."
            />
            
            <div className="mt-8 flex justify-center">
                {status === 'idle' && (
                    <Button size="lg" onClick={handleGenerate} className="gap-2">
                        <PackageOpen className="w-5 h-5" />
                        Generate Final Deliverables
                    </Button>
                )}

                {status === 'generating' && (
                    <Button size="lg" disabled className="gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Running BRIDGE-01...
                    </Button>
                )}
            </div>

            {status === 'ready' && result && (
                <div className="mt-8 max-w-2xl mx-auto space-y-6 animate-in zoom-in-95">
                    <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900">
                        <CardContent className="pt-6 text-center space-y-4">
                            <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-green-900 dark:text-green-100">Package Ready</h3>
                                <p className="text-green-800 dark:text-green-200 opacity-90">All artifacts have been compiled and validated.</p>
                            </div>
                            
                            <Button size="lg" className="w-full gap-2 bg-green-600 hover:bg-green-700" onClick={() => window.open(result.downloadUrl, '_blank')}>
                                <Download className="w-4 h-4" />
                                Download ZIP Package
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                             <h4 className="font-semibold mb-4">Contents:</h4>
                             <ul className="space-y-2">
                                {result.files.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                                        <PackageOpen className="w-4 h-4 opacity-50" />
                                        {f}
                                    </li>
                                ))}
                             </ul>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
