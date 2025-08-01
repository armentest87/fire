'use client';
import { type JiraIssue } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const CHART_COLORS = ["#8B5CF6", "#EF4444", "#3B82F6", "#10B981"];

interface FinancialReportProps {
  issues: JiraIssue[];
}

export function FinancialReport({ issues }: FinancialReportProps) {

  const { stats, costBreakdown, revenueByType, topCostIssues } = useMemo(() => {
    const financialIssues = issues.filter(i => i.budget || i.actual_cost || i.revenue);
    
    const totalBudget = financialIssues.reduce((acc, i) => acc + (i.budget || 0), 0);
    const totalActualCost = financialIssues.reduce((acc, i) => acc + (i.actual_cost || 0), 0);
    const totalLaborCost = financialIssues.reduce((acc, i) => acc + (i.labor_cost || 0), 0);
    const totalOtherExpenses = financialIssues.reduce((acc, i) => acc + (i.other_expenses || 0), 0);
    const totalRevenue = financialIssues.reduce((acc, i) => acc + (i.revenue || 0), 0);
    
    const revenueByIssueType: Record<string, number> = {};
    financialIssues.forEach(issue => {
        if(issue.revenue) {
            revenueByIssueType[issue.issuetype] = (revenueByIssueType[issue.issuetype] || 0) + issue.revenue;
        }
    });

    return {
      stats: {
        totalBudget,
        totalActualCost,
        totalLaborCost,
        totalRevenue,
      },
      costBreakdown: {
        labels: ['Labor Cost', 'Other Expenses'],
        datasets: [{
            data: [totalLaborCost, totalOtherExpenses],
            backgroundColor: [CHART_COLORS[0], CHART_COLORS[1]]
        }]
      },
      revenueByType: {
        labels: Object.keys(revenueByIssueType),
        datasets: [{
            label: 'Revenue',
            data: Object.values(revenueByIssueType),
            backgroundColor: CHART_COLORS[2]
        }]
      },
      topCostIssues: financialIssues.sort((a,b) => (b.actual_cost || 0) - (a.actual_cost || 0)).slice(0, 10),
    };
  }, [issues]);

  const chartOptions = {
     responsive: true,
     maintainAspectRatio: false,
     plugins: { legend: { position: 'bottom' as const } },
  };

  return (
    <div className="space-y-6">
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><CardTitle>Total Budget</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">${stats.totalBudget.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Total Actual Cost</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">${stats.totalActualCost.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Total Labor Cost</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">${stats.totalLaborCost.toLocaleString()}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Total Revenue</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p></CardContent></Card>
      </div>

       <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader><CardTitle>Cost Breakdown</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                    <Pie data={costBreakdown} options={chartOptions as any} />
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Revenue by Issue Type</CardTitle></CardHeader>
                <CardContent className="h-[300px]">
                    <Bar data={revenueByType} options={{...chartOptions, plugins: { legend: { display: false }}}} />
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader><CardTitle>Top 10 Issues by Total Cost</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Key</TableHead>
                            <TableHead>Summary</TableHead>
                            <TableHead className="text-right">Budget</TableHead>
                            <TableHead className="text-right">Actual Cost</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topCostIssues.map(issue => (
                            <TableRow key={issue.key}>
                                <TableCell>{issue.key}</TableCell>
                                <TableCell>{issue.summary}</TableCell>
                                <TableCell className="text-right">${(issue.budget || 0).toLocaleString()}</TableCell>
                                <TableCell className="text-right">${(issue.actual_cost || 0).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
