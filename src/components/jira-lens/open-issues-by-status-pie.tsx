'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useIsMobile } from "@/hooks/use-mobile";

ChartJS.register(ArcElement, Tooltip, Legend);

const HIGH_CONTRAST_COLORS = [
    '#219ebc', '#fb8500', '#023047', '#ffb703', '#8ecae6', 
    '#a8dadc', '#d9ed92', '#e63946', '#f1faee', '#a8dadc', 
    '#457b9d', '#1d3557'
];

const getColor = (index: number) => HIGH_CONTRAST_COLORS[index % HIGH_CONTRAST_COLORS.length];

export function OpenIssuesByStatusPie({ issues }: { issues: JiraIssue[] }) {
  const isMobile = useIsMobile();
  const openIssues = useMemo(() => issues.filter(i => i.status?.statusCategory?.name !== 'Done'), [issues]);

  const chartData = useMemo(() => {
    const statusCounts = openIssues.reduce((acc, issue) => {
      const status = issue.status?.name || 'No Status';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(statusCounts).sort((a,b) => statusCounts[b] - statusCounts[a]);
    const data = labels.map(label => statusCounts[label]);
    const backgroundColor = labels.map((_, index) => getColor(index));

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
        <CardTitle>Open Issues by Status</CardTitle>
        <CardDescription>Distribution of currently open issues.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow min-h-[250px] sm:min-h-[300px]">
         <Doughnut data={chartData} options={options as any} />
      </CardContent>
    </Card>
  );
}
