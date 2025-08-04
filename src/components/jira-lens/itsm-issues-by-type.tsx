'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

ChartJS.register(ArcElement, Tooltip, Legend);

const TYPE_COLORS: Record<string, string> = {
    'Support': '#5D9CEC',
    'Bug': '#DA4453',
    'New Feature': '#8CC152',
    'Task': '#F6BB42',
    'Story': '#37BC9B',
};

export function ItsmIssuesByType({ issues }: { issues: JiraIssue[] }) {
  const { chartData, typeList, totalIssues } = useMemo(() => {
    const typeCounts = issues.reduce((acc, issue) => {
      const type = issue.issuetype || 'No Type';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = issues.length;
    const labels = Object.keys(typeCounts).sort((a,b) => typeCounts[b] - typeCounts[a]);
    const data = labels.map(label => typeCounts[label]);
    const backgroundColor = labels.map(label => TYPE_COLORS[label] || '#9E9E9E');

    const typeList = labels.map(label => ({
        label,
        count: typeCounts[label],
        percentage: total > 0 ? ((typeCounts[label] / total) * 100).toFixed(2) : 0,
    }));

    return {
      totalIssues: total,
      typeList,
      chartData: {
        labels,
        datasets: [{
          label: 'Issues by Type',
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
        display: false
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
                    const percentage = ((value / totalIssues) * 100).toFixed(2);
                    return `${label} ${value} issues (${percentage}%)`;
                }
            }
       }
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Issues by Type</CardTitle>
        <CardDescription>A breakdown of issues by their type.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center gap-4">
        <div className="w-full h-52 relative">
             <Doughnut data={chartData} options={options as any} />
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                    <p className="text-3xl font-bold">{totalIssues}</p>
                    <p className="text-sm text-muted-foreground">Total Issues</p>
                </div>
             </div>
        </div>
        <div className="w-full border rounded-md overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Issue Type</TableHead>
                        <TableHead className="text-right"># of Created Issues</TableHead>
                        <TableHead className="text-right">% of Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {typeList.map(type => (
                        <TableRow key={type.label}>
                            <TableCell className="font-medium">{type.label}</TableCell>
                            <TableCell className="text-right">{type.count}</TableCell>
                            <TableCell className="text-right">{type.percentage}%</TableCell>
                        </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted/50">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">{totalIssues}</TableCell>
                        <TableCell className="text-right">100.00%</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
