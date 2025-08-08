'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PRIORITY_COLORS: Record<string, string> = {
    'Highest': '#d90429',
    'High': '#fb8500',
    'Medium': '#ffb703',
    'Low': '#8ecae6',
    'Lowest': '#219ebc',
    'Critical': '#d90429',
    'Major': '#fb8500',
    'Minor': '#8ecae6',
    'Trivial': '#a8dadc',
};

const PRIORITY_ORDER = ['Highest', 'High', 'Medium', 'Low', 'Lowest', 'Critical', 'Major', 'Minor', 'Trivial'];

export function IssuesByPriorityChart({ issues }: { issues: JiraIssue[] }) {
  const { chartData, priorityList, totalIssues } = useMemo(() => {
    const priorityCounts = issues.reduce((acc, issue) => {
      const priority = issue.priority?.name || 'No Priority';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(priorityCounts).sort((a,b) => PRIORITY_ORDER.indexOf(a) - PRIORITY_ORDER.indexOf(b));
    const data = labels.map(label => priorityCounts[label]);
    const backgroundColor = labels.map(label => PRIORITY_COLORS[label] || '#9E9E9E');

    const total = issues.length;

    const priorityList = labels.map(label => ({
        label,
        count: priorityCounts[label],
        color: PRIORITY_COLORS[label] || '#9E9E9E',
    }));

    return {
      totalIssues: total,
      priorityList,
      chartData: {
        labels,
        datasets: [{
          label: 'Issues by Priority',
          data,
          backgroundColor,
          borderColor: 'hsl(var(--card))',
          borderWidth: 2,
          hoverOffset: 4
        }]
      }
    };
  }, [issues]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
         display: false,
      },
       tooltip: {
            callbacks: {
                label: function(context: any) {
                    let label = context.label || '';
                    if (label) {
                        label += ': ';
                    }
                    const value = context.parsed;
                    if (value === null) return '';
                    const percentage = totalIssues > 0 ? ((value / totalIssues) * 100).toFixed(1) : 0;
                    return `${label} ${value} issues (${percentage}%)`;
                }
            }
       }
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Issues by Priority</CardTitle>
        <CardDescription>Distribution of issues across different priority levels.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-1/2 h-64 relative">
             <Doughnut data={chartData} options={options as any} />
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <p className="text-3xl font-bold">{totalIssues}</p>
                    <p className="text-sm text-muted-foreground">Total Issues</p>
                </div>
             </div>
        </div>
        <div className="w-full sm:w-1/2 space-y-2">
            {priorityList.map(priority => (
                <div key={priority.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: priority.color }}></span>
                        <span>{priority.label}</span>
                    </div>
                    <span className="font-medium">{priority.count}</span>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
