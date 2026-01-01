
'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEngagementAction } from '@/server/brandos-v2.1/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayoutHeading } from '@/components/stages/ccba/dashboard/shared/DashboardComponents';
import { Rocket } from 'lucide-react';

export default function SetupDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [clientName, setClientName] = useState('Acme Corp');
    const [website, setWebsite] = useState('https://acme.com');

    const handleStart = async () => {
        setIsLoading(true);
        try {
            const result = await createEngagementAction({
                details: {
                    engagementName: `${clientName} Engagement`,
                    clientName,
                    clientWebsite: website,
                    clientSocials: {}
                },
                channels: { linkedin: true, x: true, instagram: true },
                competitors: []
            });
            if (result.success) {
                router.push(`/dashboard/brandos-v2.1/phase-0?engagementId=${result.engagementId}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Start New Engagement</h1>
                <p className="text-muted-foreground">Configure global parameters for the Brand OS run.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Engagement Details</CardTitle>
                    <CardDescription>Enter the primary brand details to begin the Outside-In Audit.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="clientName">Client Name</Label>
                        <Input
                            id="clientName"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="e.g. Acme Corp"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="website">Website URL</Label>
                        <Input
                            id="website"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleStart} disabled={isLoading}>
                        {isLoading ? 'Initializing...' : 'Launch Brand OS'}
                        {!isLoading && <Rocket className="ml-2 h-4 w-4" />}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
