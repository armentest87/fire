'use client';
import { type JiraIssue } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { useMemo } from "react";

const COLORS = ['#2563EB', '#0D9488', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

interface OverviewProps {
  issues: JiraIssue[];
}

export function Overview({ issues }: OverviewProps) {
  const { stats, statusDist, typeDist } = useMemo(() => {
    const totalIssues = issues.length;
    const doneIssues = issues.filter(i => i.status_category === 'Done').length;
    const completionRate = totalIssues > 0 ? (doneIssues / totalIssues) * 100 : 0;
    const resolvedIssues = issues.filter(i => i.resolved);
    const avgResolutionTime = resolvedIssues.length > 0 
      ? resolvedIssues.reduce((acc, i) => acc + (new Date(i.resolved!).getTime() - new Date(i.created).getTime()), 0) / resolvedIssues.length / (1000 * 60 * 60 * 24)
      : 0;

    const statusCounts = issues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeCounts = issues.reduce((acc, issue) => {
      acc[issue.issuetype] = (acc[issue.issuetype] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      stats: {
        totalIssues,
        doneIssues,
        completionRate,
        avgResolutionTime,
      },
      statusDist: Object.entries(statusCounts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
      typeDist: Object.entries(typeCounts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value),
    };
  }, [issues]);

  const barChartConfig: ChartConfig = {
    value: { label: 'Issues', color: 'hsl(var(--chart-1))' },
  };
  
  const statusChartConfig: ChartConfig = statusDist.reduce((acc, cur, i) => {
    acc[cur.name] = { label: cur.name, color: COLORS[i % COLORS.length] };
    return acc;
  }, {} as ChartConfig);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">{stats.totalIssues}</p>
            </CardContent>
        </Card>
        <div className="metric-card bg-blue-50 border-l-4 border-blue-500">
            <h3 className="text-blue-800">Completed Issues</h3>
            <p className="text-3xl font-bold text-blue-900">{stats.doneIssues}</p>
        </div>
        <div className="metric-card bg-green-50 border-l-4 border-green-500">
            <h3 className="text-green-800">Completion Rate</h3>
            <p className="text-3xl font-bold text-green-900">{stats.completionRate.toFixed(1)}%</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Resolution (Days)</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">{stats.avgResolutionTime > 0 ? stats.avgResolutionTime.toFixed(1) : 'N/A'}</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Issues by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusChartConfig} className="min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <RechartsTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                  <Pie data={statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                      const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                      return (percent > 0.05) ? <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-semibold">
                          {`${(percent * 100).toFixed(0)}%`}
                        </text> : null;
                    }}>
                    {statusDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issues by Type</CardTitle>
          </CardHeader>
          <CardContent>
             <ChartContainer config={barChartConfig} className="min-h-[300px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeDist} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <RechartsTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="value" name="Issues" fill="var(--color-value)" radius={8} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
