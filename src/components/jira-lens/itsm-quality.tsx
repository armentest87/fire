'use client';
import { type JiraIssue } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
} from 'chart.js';
import { useMemo } from "react";
import { format } from "date-fns";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

const CHART_COLORS = ["#10B981", "#EF4444", "#3B82F6", "#F59E0B", "#8B5CF6", "#6366F1"];


interface ItsmQualityProps {
  issues: JiraIssue[];
}

export function ItsmQuality({ issues }: ItsmQualityProps) {

  const { slaData, resolutionByPriority, creationTrends } = useMemo(() => {
    const slaIssues = issues.filter(i => i.sla_met !== null && i.sla_met !== undefined);
    const slaMetCount = slaIssues.filter(i => i.sla_met).length;
    const slaBreachedCount = slaIssues.length - slaMetCount;

    const resolutionTimes: Record<string, number[]> = {};
    issues.forEach(issue => {
        if (issue.priority && issue.lead_time_days) {
            if (!resolutionTimes[issue.priority]) {
                resolutionTimes[issue.priority] = [];
            }
            resolutionTimes[issue.priority].push(issue.lead_time_days);
        }
    });
    
    const avgResolutionByPriority = Object.entries(resolutionTimes).map(([priority, times]) => ({
        priority,
        avgTime: times.reduce((a,b) => a+b, 0) / times.length
    }));

    const dailyCreation: Record<string, number> = {};
    issues.forEach(issue => {
        const date = format(new Date(issue.created), 'yyyy-MM-dd');
        dailyCreation[date] = (dailyCreation[date] || 0) + 1;
    });

    const sortedDates = Object.keys(dailyCreation).sort();
    
    return {
        slaData: {
            labels: ['Met', 'Breached'],
            datasets: [{ data: [slaMetCount, slaBreachedCount], backgroundColor: [CHART_COLORS[0], CHART_COLORS[1]] }]
        },
        resolutionByPriority: {
            labels: avgResolutionByPriority.map(p => p.priority),
            datasets: [{
                label: 'Avg. Resolution Days',
                data: avgResolutionByPriority.map(p => p.avgTime),
                backgroundColor: CHART_COLORS[2]
            }]
        },
        creationTrends: {
            labels: sortedDates,
            datasets: [{
                label: 'Issues Created',
                data: sortedDates.map(date => dailyCreation[date]),
                borderColor: CHART_COLORS[3],
                tension: 0.2
            }]
        }
    }
  }, [issues]);

  const chartOptions = {
     responsive: true,
     maintainAspectRatio: false,
     plugins: { legend: { position: 'bottom' as const } },
  };


  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>SLA Performance</CardTitle>
                    <CardDescription>Percentage of tickets that met or breached their SLA.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <Pie data={slaData} options={chartOptions as any} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Avg. Time to Resolution by Priority</CardTitle>
                    <CardDescription>How long it takes to resolve issues of different priorities.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <Bar data={resolutionByPriority} options={{...chartOptions, plugins: { legend: { display: false }}}} />
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Daily Issue Creation Trend</CardTitle>
                <CardDescription>Number of new issues created over time.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <Line data={creationTrends} options={{...chartOptions, plugins: { legend: { display: false }}}}/>
            </CardContent>
        </Card>
    </div>
  );
}
