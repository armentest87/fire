'use client';
import { type JiraIssue } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
} from 'chart.js';
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

const CHART_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#6366F1"];

interface ReleaseAnalysisProps {
  issues: JiraIssue[];
}

export function ReleaseAnalysis({ issues }: ReleaseAnalysisProps) {
    
  const allReleases = useMemo(() => {
    const releases = new Set<string>();
    issues.forEach(issue => {
      issue.fix_versions.forEach(v => releases.add(v));
    });
    return Array.from(releases).sort();
  }, [issues]);

  const [selectedRelease, setSelectedRelease] = useState<string>(allReleases[0] || '');

  const { releaseStatus, releaseTrend } = useMemo(() => {
    if (!selectedRelease) return { releaseStatus: null, releaseTrend: null };

    const releaseIssues = issues.filter(i => i.fix_versions.includes(selectedRelease));
    const statusCounts = releaseIssues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const resolvedInRelease = releaseIssues
        .filter(i => i.resolved)
        .sort((a,b) => new Date(a.resolved!).getTime() - new Date(b.resolved!).getTime());

    let remaining = releaseIssues.length;
    const trendData: Record<string, number> = { 'Start': remaining };
    resolvedInRelease.forEach(issue => {
        const date = format(new Date(issue.resolved!), 'yyyy-MM-dd');
        remaining--;
        trendData[date] = remaining;
    });

    return {
        releaseStatus: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: CHART_COLORS
            }]
        },
        releaseTrend: {
            labels: Object.keys(trendData).sort(),
            datasets: [{
                label: 'Remaining Issues',
                data: Object.keys(trendData).sort().map(d => trendData[d]),
                borderColor: CHART_COLORS[0],
                tension: 0.1
            }]
        }
    }

  }, [issues, selectedRelease]);

  const chartOptions = {
     responsive: true,
     maintainAspectRatio: false,
     plugins: { legend: { position: 'bottom' as const } },
  };

  if (allReleases.length === 0) {
    return <Card><CardHeader><CardTitle>Release Analysis</CardTitle></CardHeader><CardContent><p>No fix versions found in the fetched issues.</p></CardContent></Card>
  }


  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                 <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Release Analysis</CardTitle>
                        <CardDescription>Insights into the progress of your product releases.</CardDescription>
                    </div>
                    <Select value={selectedRelease} onValueChange={setSelectedRelease}>
                        <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select a release" /></SelectTrigger>
                        <SelectContent>{allReleases.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                 </div>
            </CardHeader>
        </Card>

        {selectedRelease && (
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Status of Issues in {selectedRelease}</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        {releaseStatus && <Pie data={releaseStatus} options={chartOptions as any} />}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Cumulative Trend for {selectedRelease}</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        {releaseTrend && <Line data={releaseTrend} options={{...chartOptions, plugins: {legend: {display: false}}}} />}
                    </CardContent>
                </Card>
            </div>
        )}
    </div>
  );
}
