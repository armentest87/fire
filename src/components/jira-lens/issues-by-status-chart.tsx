'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const HIGH_CONTRAST_COLORS = [
    '#219ebc', '#fb8500', '#023047', '#ffb703', '#8ecae6', 
    '#a8dadc', '#d9ed92', '#e63946', '#f1faee', '#a8dadc', 
    '#457b9d', '#1d3557'
];

const getColor = (index: number) => HIGH_CONTRAST_COLORS[index % HIGH_CONTRAST_COLORS.length];

export function IssuesByStatusChart({ issues }: { issues: JiraIssue[] }) {
  const { chartData, statusList } = useMemo(() => {
    const statusCounts = issues.reduce((acc, issue) => {
      const statusName = issue.status?.name || 'No Status';
      acc[statusName] = (acc[statusName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(statusCounts).sort((a,b) => statusCounts[b] - statusCounts[a]);
    const data = labels.map(label => statusCounts[label]);
    const backgroundColor = labels.map((_, index) => getColor(index));

    const statusList = labels.map((label, index) => ({
        label,
        count: statusCounts[label],
        color: getColor(index),
    }));

    return {
      statusList,
      chartData: {
        labels,
        datasets: [{
          label: 'Issues by Status',
          data,
          backgroundColor,
          borderColor: 'hsl(var(--card))',
          borderWidth: 2,
          hoverOffset: 4
        }]
      }
    };
  }, [issues]);
  
  const totalIssues = issues.length;

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
                    if(value === null || totalIssues === 0) return '';
                    const percentage = ((value / totalIssues) * 100).toFixed(1);
                    return `${label} ${value} issues (${percentage}%)`;
                }
            }
       }
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Issues by Status</CardTitle>
        <CardDescription>A breakdown of issues by their current status.</CardDescription>
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
            {statusList.map(status => (
                <div key={status.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: status.color }}></span>
                        <span>{status.label}</span>
                    </div>
                    <span className="font-medium">{status.count}</span>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
