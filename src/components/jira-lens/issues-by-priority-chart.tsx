'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useIsMobile } from "@/hooks/use-mobile";

ChartJS.register(ArcElement, Tooltip, Legend);

const PRIORITY_COLORS: Record<string, string> = {
    'Highest': '#fb8500',
    'High': '#ffb703',
    'Medium': '#219ebc',
    'Low': '#8ecae6',
    'Lowest': '#a8dadc',
};

export function IssuesByPriorityChart({ issues }: { issues: JiraIssue[] }) {
  const isMobile = useIsMobile();
  const chartData = useMemo(() => {
    const priorityCounts = issues.reduce((acc, issue) => {
      const priority = issue.priority || 'No Priority';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(priorityCounts).sort((a,b) => Object.keys(PRIORITY_COLORS).indexOf(a) - Object.keys(PRIORITY_COLORS).indexOf(b));
    const data = labels.map(label => priorityCounts[label]);
    const backgroundColor = labels.map(label => PRIORITY_COLORS[label] || '#9E9E9E');

    return {
      labels,
      datasets: [{
        label: 'Issues by Priority',
        data,
        backgroundColor,
        borderColor: 'hsl(var(--card))',
        borderWidth: 2,
        hoverOffset: 4
      }]
    };
  }, [issues]);
  
  const totalIssues = issues.length;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
         position: isMobile ? 'top' : 'right' as const,
         labels: {
             boxWidth: 12,
             padding: isMobile ? 8 : 20,
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
        <CardTitle>Issues by Priority</CardTitle>
        <CardDescription>Distribution of issues across different priority levels.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow min-h-[250px] sm:min-h-[300px]">
         <Pie data={chartData} options={options as any} />
      </CardContent>
    </Card>
  );
}
