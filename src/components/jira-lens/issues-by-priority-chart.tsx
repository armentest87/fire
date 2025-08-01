'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Info } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

const PRIORITY_COLORS: Record<string, string> = {
    'Highest': '#DA4453',
    'High': '#E9573F',
    'Medium': '#F6BB42',
    'Low': '#8CC152',
    'Lowest': '#37BC9B',
};

export function IssuesByPriorityChart({ issues }: { issues: JiraIssue[] }) {
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
        borderColor: '#fff',
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
         position: 'bottom' as const,
         labels: {
             boxWidth: 12,
             padding: 10,
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
                    const percentage = ((value / totalIssues) * 100).toFixed(2);
                    return `${label} ${value} issues (${percentage}%)`;
                }
            }
       }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues by Priority</CardTitle>
        <Info className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent className="h-64">
         <Pie data={chartData} options={options as any} />
      </CardContent>
    </Card>
  );
}
