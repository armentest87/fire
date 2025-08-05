'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { differenceInDays, parseISO } from 'date-fns';


interface KpiCardsProps {
  issues: JiraIssue[];
}

const KpiCard = ({ title, value }: { title: string; value: string | number; }) => (
    <Card className="shadow-sm">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-3xl font-bold">{value}</p>
        </CardContent>
    </Card>
);


export function ItsmKpiCards({ issues }: KpiCardsProps) {
  const kpis = useMemo(() => {
    const totalIssues = issues.length;
    const issuesWithCreationDate = issues.filter(i => i.created);

    if (issuesWithCreationDate.length === 0) {
        return {
            totalIssues,
            avgIssuesPerDay: (0).toFixed(2),
        };
    }
    
    const dates = issuesWithCreationDate.map(i => parseISO(i.created!));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const totalDays = differenceInDays(maxDate, minDate) || 1; // Avoid division by zero

    const avgIssuesPerDay = (totalIssues / totalDays).toFixed(2);

    return {
      totalIssues,
      avgIssuesPerDay,
    };
  }, [issues]);

  return (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard title="Total Issues" value={kpis.totalIssues} />
        <KpiCard title="Average Issues per Day" value={kpis.avgIssuesPerDay} />
     </div>
  );
}
