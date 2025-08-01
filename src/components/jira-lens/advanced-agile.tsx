'use client';
import { type JiraIssue } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useMemo } from "react";
import { subWeeks, getWeek, format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const CHART_COLORS = ["#6366F1", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

interface AdvancedAgileProps {
  issues: JiraIssue[];
}

export function AdvancedAgile({ issues }: AdvancedAgileProps) {
  const { stats, weeklyThroughput } = useMemo(() => {
    const doneIssues = issues.filter(i => i.status_category === 'Done' && i.resolved);
    const inProgressIssues = issues.filter(i => i.status_category === 'In Progress');

    const leadTime = doneIssues.map(i => i.lead_time_days).filter(t => t !== null && t !== undefined) as number[];
    const cycleTime = doneIssues.map(i => i.cycle_time_days).filter(t => t !== null && t !== undefined) as number[];
    
    const avgLeadTime = leadTime.length > 0 ? leadTime.reduce((a, b) => a + b, 0) / leadTime.length : 0;
    const avgCycleTime = cycleTime.length > 0 ? cycleTime.reduce((a, b) => a + b, 0) / cycleTime.length : 0;

    const now = new Date();
    const throughput = Array(8).fill(0);
    doneIssues.forEach(issue => {
        const resolvedDate = new Date(issue.resolved!);
        const weekIndex = 7 - Math.floor((now.getTime() - resolvedDate.getTime()) / (1000 * 3600 * 24 * 7));
        if (weekIndex >= 0 && weekIndex < 8) {
            throughput[weekIndex]++;
        }
    });

    const weeklyLabels = Array(8).fill(0).map((_, i) => `Week ${getWeek(subWeeks(now, 7 - i))}`);

    return {
      stats: {
        avgLeadTime,
        avgCycleTime,
        avgWeeklyThroughput: throughput.reduce((a, b) => a + b, 0) / 8,
        wip: inProgressIssues.length,
      },
      weeklyThroughput: {
        labels: weeklyLabels,
        datasets: [{
          label: 'Issues Completed',
          data: throughput,
          backgroundColor: CHART_COLORS[1],
          borderColor: CHART_COLORS[0],
          tension: 0.3,
          fill: true
        }]
      },
    };
  }, [issues]);

  const chartOptions = {
     responsive: true,
     maintainAspectRatio: false,
     plugins: { legend: { display: false } },
  };

  return (
    <div className="space-y-6">
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><CardTitle>Avg. Lead Time</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.avgLeadTime.toFixed(1)} days</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Avg. Cycle Time</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.avgCycleTime.toFixed(1)} days</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Avg. Weekly Throughput</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.avgWeeklyThroughput.toFixed(1)}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Current WIP</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{stats.wip}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Throughput</CardTitle>
          <CardDescription>Number of issues completed per week over the last 8 weeks.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <Line data={weeklyThroughput} options={chartOptions} />
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Lead & Cycle Time Distribution</CardTitle></CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
              <p>Box plot visualizations for Lead and Cycle Time are not yet implemented.</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader><CardTitle>Rolling Velocity & Forecast</CardTitle></CardHeader>
           <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
              <p>Velocity forecasting is not yet implemented.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
