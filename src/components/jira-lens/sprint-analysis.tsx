'use client';
import { type JiraIssue } from "@/lib/types";
import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Info } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const kpiCard = (title: string, value: any) => (
    <Card className="shadow-sm">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-2xl font-bold">{value}</p>
        </CardContent>
    </Card>
)

export function SprintAnalysis({ issues }: { issues: JiraIssue[] }) {
    const sprints = useMemo(() => {
        const sprintSet = new Set<string>();
        issues.forEach(issue => {
            issue.sprint_names?.forEach(sprint => sprintSet.add(sprint));
        });
        return Array.from(sprintSet);
    }, [issues]);

    const [selectedSprint, setSelectedSprint] = useState<string | null>(sprints.length > 0 ? sprints[0] : null);

    const sprintData = useMemo(() => {
        if (!selectedSprint) return null;
        
        const sprintIssues = issues.filter(issue => issue.sprint_names?.includes(selectedSprint));
        const committedStoryPoints = sprintIssues.reduce((sum, i) => sum + (i.story_points || 0), 0);
        const completedIssues = sprintIssues.filter(i => i.status_category === 'Done');
        const completedStoryPoints = completedIssues.reduce((sum, i) => sum + (i.story_points || 0), 0);

        return {
            totalIssues: sprintIssues.length,
            completedIssues: completedIssues.length,
            committedStoryPoints,
            completedStoryPoints,
            issues: sprintIssues,
        };
    }, [selectedSprint, issues]);


    const historicalVelocityData = useMemo(() => {
        const velocityBySprint: Record<string, number> = {};
        sprints.forEach(sprint => {
            const sprintIssues = issues.filter(issue => issue.sprint_names?.includes(sprint) && issue.status_category === 'Done');
            velocityBySprint[sprint] = sprintIssues.reduce((sum, i) => sum + (i.story_points || 0), 0);
        });
        const labels = Object.keys(velocityBySprint);
        return {
            labels,
            datasets: [{
                label: 'Completed Story Points',
                data: labels.map(l => velocityBySprint[l]),
                backgroundColor: '#3B82F6',
            }]
        }
    }, [issues, sprints]);
    
    const burndownData = useMemo(() => {
        if (!sprintData) return null;
        // This is a simplified burndown. A real one would track remaining points day-by-day.
        const totalPoints = sprintData.committedStoryPoints;
        const labels = ['Start', 'End'];
        const data = [totalPoints, totalPoints - sprintData.completedStoryPoints];
        
        return {
            labels,
            datasets: [
                {
                    label: 'Ideal Burndown',
                    data: [totalPoints, 0],
                    borderColor: '#F97066',
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.1,
                    type: 'line' as const
                },
                {
                    label: 'Actual Burndown',
                    data,
                    backgroundColor: '#3B82F6',
                    borderColor: '#3B82F6',
                    fill: false,
                    tension: 0.1,
                    type: 'line' as const
                },
            ]
        }
    }, [sprintData]);

    if(sprints.length === 0) {
        return (
            <div className="flex items-center justify-center h-full p-8 bg-card rounded-lg shadow-md border">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">No Sprint Data</h2>
                <p className="text-muted-foreground">The current issues do not contain any sprint information.</p>
              </div>
            </div>
        );
    }


    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Historical Sprint Velocity</CardTitle>
                    <Info className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent className="h-64">
                    <Bar data={historicalVelocityData} options={{ maintainAspectRatio: false, scales: {y: {beginAtZero: true}} }} />
                </CardContent>
            </Card>

            <div className="space-y-2">
                <label className="font-semibold">Select Sprint for Detailed Analysis</label>
                <Select onValueChange={setSelectedSprint} defaultValue={selectedSprint || undefined}>
                    <SelectTrigger><SelectValue placeholder="Select a sprint" /></SelectTrigger>
                    <SelectContent>
                        {sprints.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            
            {selectedSprint && sprintData && (
                <div className="space-y-6">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {kpiCard('Committed SPs', sprintData.committedStoryPoints)}
                        {kpiCard('Completed SPs', sprintData.completedStoryPoints)}
                        {kpiCard('Total Issues', sprintData.totalIssues)}
                        {kpiCard('Completed Issues', sprintData.completedIssues)}
                    </div>
                    
                    {burndownData && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Sprint Burndown Chart</CardTitle>
                                 <Info className="h-4 w-4 text-gray-400" />
                            </CardHeader>
                            <CardContent className="h-72">
                                <Line data={burndownData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}
