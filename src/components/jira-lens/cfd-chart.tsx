'use client';
import { type JiraIssue } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { useMemo } from "react";
import { eachDayOfInterval, format, startOfDay } from 'date-fns';

interface CfdChartProps {
  issues: JiraIssue[];
}

const STATUS_ORDER: ('To Do' | 'In Progress' | 'Done')[] = ['To Do', 'In Progress', 'Done'];

export function CfdChart({ issues }: CfdChartProps) {

  const cfdData = useMemo(() => {
    if (!issues || issues.length === 0) return [];

    let allChanges: { date: Date; key: string; status_category: 'To Do' | 'In Progress' | 'Done' }[] = [];
    
    issues.forEach(issue => {
      issue.changelog.histories.forEach(history => {
        history.items.forEach(item => {
          if (item.field === 'status') {
             const statusCategory = item.toString === 'Done' || item.toString === 'Closed' ? 'Done' : (item.toString === 'In Progress' || item.toString === 'In Review' ? 'In Progress' : 'To Do');
             allChanges.push({
               date: startOfDay(new Date(history.created)),
               key: issue.key,
               status_category: statusCategory,
             });
          }
        });
      });
    });

    if (allChanges.length === 0) return [];
    
    allChanges.sort((a, b) => a.date.getTime() - b.date.getTime());

    const minDate = allChanges[0].date;
    const maxDate = startOfDay(new Date());
    const dateRange = eachDayOfInterval({ start: minDate, end: maxDate });

    const dailySnapshots: Record<string, Record<string, 'To Do' | 'In Progress' | 'Done'>> = {};

    for (const issue of issues) {
      const issueChanges = allChanges.filter(c => c.key === issue.key);
      if(issueChanges.length === 0) continue;

      let currentStatus = issueChanges[0].status_category;
      let changeIndex = 0;
      
      for(const day of dateRange) {
        if (!dailySnapshots[issue.key]) dailySnapshots[issue.key] = {};
        while(changeIndex < issueChanges.length - 1 && issueChanges[changeIndex + 1].date <= day) {
          changeIndex++;
          currentStatus = issueChanges[changeIndex].status_category;
        }
        if (issueChanges[0].date <= day) {
          dailySnapshots[issue.key][format(day, 'yyyy-MM-dd')] = currentStatus;
        }
      }
    }

    return dateRange.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const counts = { 'To Do': 0, 'In Progress': 0, 'Done': 0 };
      Object.keys(dailySnapshots).forEach(key => {
        const status = dailySnapshots[key][dayStr];
        if (status) {
          counts[status]++;
        }
      });
      return {
        date: dayStr,
        ...counts,
      };
    });
  }, [issues]);

  const chartConfig: ChartConfig = {
    'To Do': { label: 'To Do', color: 'hsl(var(--accent))' },
    'In Progress': { label: 'In Progress', color: 'hsl(var(--primary))' },
    'Done': { label: 'Done', color: '#81C784' },
  };

  if (cfdData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cumulative Flow Diagram (CFD)</CardTitle>
          <CardDescription>Visualizes workflow health and helps identify bottlenecks over time.</CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center">
            <p className="text-muted-foreground">Not enough changelog data to generate the CFD.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cumulative Flow Diagram (CFD)</CardTitle>
        <CardDescription>Visualizes workflow health and helps identify bottlenecks over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cfdData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => format(new Date(value), 'MMM d')} />
              <YAxis tickLine={false} axisLine={false} />
              <RechartsTooltip content={<ChartTooltipContent indicator="dot" />} />
              {STATUS_ORDER.map(status => (
                <Area key={status} type="monotone" dataKey={status} stackId="1" stroke={`var(--color-${status.toLowerCase().replace(' ', '-')})`} fill={`var(--color-${status.toLowerCase().replace(' ', '-')})`} fillOpacity={0.8} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
