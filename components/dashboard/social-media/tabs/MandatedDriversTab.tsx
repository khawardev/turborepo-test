'use client'

import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomChartTooltipContent from "@/components/dashboard/shared/CustomChartTooltipContent";
import CustomLegend from "../../shared/Legend";

export default function MandatedDriversTab({ data }: any) {
    const { theme } = useTheme();
    const tickColor = theme === 'dark' ? '#888888' : '#333333';
    const gridColor = theme === 'dark' ? '#444444' : '#dddddd';

    const { platforms, colors } = data;
    const { DRIVER_COLORS } = colors;
    const platformKeys = Object.keys(platforms);

    return (
        <Tabs defaultValue="linkedin">
            <div className="w-full overflow-x-auto">
                <TabsList>
                    {platformKeys.map(key => <TabsTrigger key={key} value={key}>{platforms[key].name}</TabsTrigger>)}
                </TabsList>
            </div>
            <div className="mt-4">
                {platformKeys.map(key => {
                    const platform = platforms[key];
                    const chartData = Object.entries(platform.mandatedDrivers).map(([name, d]: any) => ({ name, value: d.percentage }));
                    return (
                        <TabsContent key={key} value={key} className="flex flex-col gap-6">
                            <Card>
                                <CardHeader><CardTitle>Mandated Drivers Coverage</CardTitle></CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Driver</TableHead>
                                                <TableHead>Posts</TableHead>
                                                <TableHead>Coverage</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Object.entries(platform.mandatedDrivers).map(([driver, d]: any) => (
                                                <TableRow key={driver}>
                                                    <TableCell className="font-medium capitalize">{driver}</TableCell>
                                                    <TableCell>{d.posts}</TableCell>
                                                    <TableCell>{d.percentage}%</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Coverage Distribution</CardTitle></CardHeader>
                                <CardContent className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart
                                            data={chartData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid horizontal={false} vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 14, fill: tickColor }}
                                            />
                                            <YAxis
                                                stroke={tickColor}
                                                unit="%"
                                                tick={{ fontSize: 14, fill: tickColor }}
                                            />
                                            <Tooltip content={<CustomChartTooltipContent />} />
                                            <Bar dataKey="value" name="Coverage" unit="%" radius={6}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={index} fill={DRIVER_COLORS[entry.name]} stroke={'none'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )
                })}
            </div>
        </Tabs>
    );
}