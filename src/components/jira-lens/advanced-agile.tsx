'use client';
import { type JiraIssue } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useMemo } from "react";
import { subWeeks, getWeek } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const CHART_COLORS = ["#6366F1", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

interface AdvancedAgileProps {
  issues: JiraIssue[];
}

// Helper to create distribution data for time-based metrics
const createDistribution = (data: number[], buckets: number[], labels: string[]) => {
  const distribution = Array(buckets.length).fill(0);
  data.forEach(value => {
    for (let i = 0; i < buckets.length - 1; i++) {
      if (value >= buckets[i] && value < buckets[i+1]) {
        distribution[i]++;
        return;
      }
    }
    if (value >= buckets[buckets.length - 1]) {
      distribution[buckets.length-1]++;
    }
  });
  return {
    labels,
    datasets: [{
      label: 'Number of Issues',
      data: distribution,
      backgroundColor: CHART_COLORS,
    }]
  };
};

// Helper to calculate rolling average
const calculateRollingAverage = (data: {name: string, value: number}[], window: number) => {
    const rollingAvg = [];
    for (let i = 0; i < data.length; i++) {
        const slice = data.slice(Math.max(0, i - window + 1), i + 1);
        const avg = slice.reduce((acc, v) => acc + v.value, 0) / slice.length;
        rollingAvg.push(avg);
    }
    return rollingAvg;
}

export function AdvancedAgile({ issues }: AdvancedAgileProps) {
  const { stats, weeklyThroughput, timeDistribution, velocityForecast } = useMemo(() => {
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

    // Time Distribution data
    const timeBuckets = [0, 2, 4, 8, 15, 31];
    const timeLabels = ['0-1d', '2-3d', '4-7d', '8-14d', '15-30d', '30+d'];
    const leadTimeDistribution = createDistribution(leadTime, timeBuckets, timeLabels);
    const cycleTimeDistribution = createDistribution(cycleTime, timeBuckets, timeLabels);

    // Velocity & Forecast data
    const sprints = new Set<string>();
    issues.forEach(issue => issue.sprint_names.forEach(sprint => sprints.add(sprint)));
    const sortedSprints = Array.from(sprints).sort((a,b) => parseInt(a.match(/\d+/)?.[0] || '0') - parseInt(b.match(/\d+/)?.[0] || '0'));
    
    const velocityData = sortedSprints.map(sprintName => {
        const sprintIssues = issues.filter(i => i.sprint_names.includes(sprintName) && i.status_category === 'Done');
        const value = sprintIssues.reduce((acc, i) => acc + (i.story_points || 0), 0);
        return { name: sprintName, value };
    });

    const rollingAvg = calculateRollingAverage(velocityData, 3);
    const forecast = rollingAvg.length > 0 ? Array(3).fill(rollingAvg[rollingAvg.length - 1]) : [];
    const forecastLabels = rollingAvg.length > 0 ? [`Sprint ${velocityData.length+1} (F)`, `Sprint ${velocityData.length+2} (F)`, `Sprint ${velocityData.length+3} (F)`] : [];

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
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: '#3B82F6',
          tension: 0.3,
          fill: true
        }]
      },
      timeDistribution: {
        lead: leadTimeDistribution,
        cycle: cycleTimeDistribution
      },
      velocityForecast: {
          labels: [...velocityData.map(d => d.name), ...forecastLabels],
          datasets: [
            {
                label: 'Actual Velocity',
                data: velocityData.map(d => d.value),
                borderColor: '#10B981',
                backgroundColor: '#10B981',
            },
            {
                label: '3-Sprint Rolling Avg.',
                data: rollingAvg,
                borderColor: '#F59E0B',
                tension: 0.2
            },
            {
                label: 'Forecast',
                data: [...Array(rollingAvg.length-1).fill(null), ...rollingAvg.slice(-1), ...forecast],
                borderColor: '#F59E0B',
                borderDash: [5, 5],
            }
          ]
      }
    };
  }, [issues]);

  const chartOptions = {
     responsive: true,
     maintainAspectRatio: false,
     plugins: { legend: { display: false } },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: { y: { beginAtZero: true } }
  }

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
          <Line data={weeklyThroughput} options={chartOptions as any} />
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lead & Cycle Time Distribution</CardTitle>
            <CardDescription>How long issues spend in the workflow.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
              <Bar data={timeDistribution.lead} options={barChartOptions as any}/>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Rolling Velocity & Forecast</CardTitle>
            <CardDescription>3-sprint rolling average velocity and a simple forecast.</CardDescription>
          </CardHeader>
           <CardContent className="h-[300px]">
              <Line data={velocityForecast} options={chartOptions as any} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
