
'use client'

import { useEffect, useState } from 'react';
import { PositioningLandscape } from '@/lib/brandos-v2.1/types';
import { getComparativeDataAction } from '@/server/brandos-v2.1/actions';
import { DashboardLayoutHeading } from '@/components/stages/ccba/dashboard/shared/DashboardComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ComparativeDashboard({ engagementId }: { engagementId: string }) {
    const [data, setData] = useState<PositioningLandscape | null>(null);

    useEffect(() => {
        if (engagementId) {
            getComparativeDataAction(engagementId).then(setData);
        }
    }, [engagementId]);

    return (
        <div>
            <DashboardLayoutHeading
                title="Flow E: Comparative Exploration"
                subtitle="Analyze client positioning relative to competitors."
            />
            
            {data && (
                <div className="grid gap-6 mt-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Market Positioning Matrix</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-4">
                                {data.matrix.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0">
                                        <div>
                                            <p className="font-bold">{item.entity}</p>
                                            <p className="text-sm text-muted-foreground">{item.positioning}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono text-lg">{(item.market_share_proxy * 100).toFixed(0)}%</p>
                                            <p className="text-xs text-muted-foreground">Share Proxy</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </CardContent>
                    </Card>

                    <Card>
                         <CardHeader>
                            <CardTitle>Share of Voice Estimation</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.matrix}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="entity" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="market_share_proxy" fill="#8884d8" name="Market Share" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
