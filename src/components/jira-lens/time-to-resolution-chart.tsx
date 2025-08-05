'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TARGET_HOURS = {
    'Highest': 12,
    'High': 24,
    'Medium': 72,
    'Low': 168,
    'Lowest': 336,
    'Bug': 24,
    'New Feature': 48,
    'Default': 48,
}

const getData = (issues: JiraIssue[], groupBy: 'priority' | 'issuetype' | 'assignee') => {
    const resolvedIssues = issues.filter(i => i.resolved && i.created);
    const grouped = resolvedIssues.reduce((acc, issue) => {
        const key = issue[groupBy] || `Unassigned`;
        if (!acc[key]) {
            acc[key] = { totalHours: 0, count: 0 };
        }
        const resolutionHours = (parseISO(issue.resolved!).getTime() - parseISO(issue.created).getTime()) / (1000 * 3600);
        acc[key].totalHours += resolutionHours;
        acc[key].count++;
        return acc;
    }, {} as Record<string, { totalHours: number, count: number }>);

    return Object.entries(grouped).map(([key, data]) => ({
        key,
        avgHours: data.totalHours / data.count,
    })).sort((a,b) => b.avgHours - a.avgHours).slice(0, 5);
}

export function TimeToResolutionChart({ issues }: { issues: JiraIssue[] }) {
    
  const chartData = useMemo(() => {
    const byPriority = getData(issues, 'priority');
    const byType = getData(issues, 'issuetype');
    const byAssignee = getData(issues, 'assignee');
    
    const allKeys = [...new Set([...byPriority.map(d => d.key), ...byType.map(d => `Type: ${d.key}`), ...byAssignee.map(d => `Assignee: ${d.key}`.substring(0, 15))])];

    const actualData = [...byPriority, ...byType, ...byAssignee].map(d => d.avgHours);
    const targetData = [...byPriority, ...byType, ...byAssignee].map(d => (TARGET_HOURS as any)[d.key] || TARGET_HOURS.Default);


    return {
      labels: [...byPriority.map(d => d.key), ...byType.map(d => d.key), ...byAssignee.map(d => d.key.substring(0,15))],
      datasets: [
        {
          label: 'Actual Hours',
          data: actualData,
          backgroundColor: '#fb8500',
          barThickness: 15,
        },
        {
          label: 'Target Hours',
          data: targetData,
          backgroundColor: '#219ebc',
          barThickness: 15,
        }
      ],
    };
  }, [issues]);

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: 'Average Hours to Resolution'},
        grid: { display: false }
      },
      y: {
        grid: { display: false }
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Average Time to Resolution</CardTitle>
            <CardDescription>Actual vs. target resolution times by different groups.</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
           <Bar data={chartData} options={options} />
        </CardContent>
    </Card>
  );
}

function parseISO(arg0: string): Date {
    return new Date(arg0);
}
