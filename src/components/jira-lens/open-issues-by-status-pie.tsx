'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useIsMobile } from "@/hooks/use-mobile";

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_COLORS: Record<string, string> = {
    'To Do': '#ffb703',
    'Done': '#8ecae6',
    'Open': '#ffb703',
    'In Progress': '#219ebc',
    'Implementing': '#023047',
    'Canceled': '#fb8500',
    'Waiting for customer': '#a8dadc',
    'Waiting for support': '#d9ed92',
    'No Category': '#B0BEC5'
};

export function OpenIssuesByStatusPie({ issues }: { issues: JiraIssue[] }) {
  const isMobile = useIsMobile();
  const openIssues = useMemo(() => issues.filter(i => i.status_category !== 'Done'), [issues]);

  const chartData = useMemo(() => {
    const statusCounts = openIssues.reduce((acc, issue) => {
      const status = issue.status || 'No Status';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(statusCounts).sort((a,b) => statusCounts[b] - statusCounts[a]);
    const data = labels.map(label => statusCounts[label]);
    const backgroundColor = labels.map(label => STATUS_COLORS[label] || '#9E9E9E');

    return {
      labels,
      datasets: [{
        label: 'Open Issues',
        data,
        backgroundColor,
        borderColor: 'hsl(var(--card))',
        borderWidth: 2,
        hoverOffset: 4
      }]
    };
  }, [openIssues]);
  
  const totalIssues = openIssues.length;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
         position: isMobile ? 'top' : 'right' as const,
         labels: {
             boxWidth: 12,
             padding: isMobile ? 8 : 15,
             font: { size: 12 },
         }
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
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Open Issues by Status</CardTitle>
        <CardDescription>Distribution of currently open issues.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow min-h-[250px] sm:min-h-[300px]">
         <Pie data={chartData} options={options as any} />
      </CardContent>
    </Card>
  );
}
