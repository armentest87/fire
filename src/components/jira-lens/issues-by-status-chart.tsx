'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Info } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_COLORS: Record<string, string> = {
    'To Do': '#F28B50',
    'Done': '#8CC152',
    'Open': '#F6BB42',
    'In Progress': '#5D9CEC',
    'Implementing': '#4A89DC',
    'Canceled': '#DA4453',
    // Add other statuses from your data if needed
};

export function IssuesByStatusChart({ issues }: { issues: JiraIssue[] }) {
  const chartData = useMemo(() => {
    const statusCounts = issues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);
    const backgroundColor = labels.map(label => STATUS_COLORS[label] || '#967ADC'); // Default color

    return {
      labels,
      datasets: [{
        label: 'Issues by Status',
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
    cutout: '60%',
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
            boxWidth: 12,
            padding: 15,
            font: { size: 12 },
            formatter: (label: string, context: any) => {
                 const ds = context.chart.data.datasets[0];
                 const index = context.dataIndex;
                 const value = ds.data[index];
                 const percentage = ((value / totalIssues) * 100).toFixed(2);
                 return `${label}: ${percentage}%`;
            }
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
        <CardTitle>Issues by Status</CardTitle>
        <Info className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent className="h-64 relative">
         <Doughnut data={chartData} options={options as any} />
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
                <p className="text-2xl font-bold">{totalIssues}</p>
                <p className="text-sm text-gray-500">Total</p>
            </div>
         </div>
      </CardContent>
    </Card>
  );
}
