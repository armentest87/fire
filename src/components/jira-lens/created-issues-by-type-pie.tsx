'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useIsMobile } from "@/hooks/use-mobile";

ChartJS.register(ArcElement, Tooltip, Legend);

const TYPE_COLORS: Record<string, string> = {
    'Support': '#219ebc',
    'Bug': '#fb8500',
    'New Feature': '#8ecae6',
    'Task': '#ffb703',
    'Story': '#023047',
};

export function CreatedIssuesByTypePie({ issues }: { issues: JiraIssue[] }) {
  const isMobile = useIsMobile();
  const chartData = useMemo(() => {
    const typeCounts = issues.reduce((acc, issue) => {
      const type = issue.issuetype?.name || 'No Type';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(typeCounts).sort((a,b) => typeCounts[b] - typeCounts[a]);
    const data = labels.map(label => typeCounts[label]);
    const backgroundColor = labels.map(label => TYPE_COLORS[label] || '#9E9E9E');

    return {
      labels,
      datasets: [{
        label: 'Issues',
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
    cutout: '70%',
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
        <CardTitle>Created Issues by Type</CardTitle>
        <CardDescription>Distribution of all created issues.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow min-h-[250px] sm:min-h-[300px]">
         <Doughnut data={chartData} options={options as any} />
      </CardContent>
    </Card>
  );
}
