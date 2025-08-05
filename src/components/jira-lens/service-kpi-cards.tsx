'use client';
import { type JiraIssue } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { differenceInDays, parseISO } from 'date-fns';


interface KpiCardsProps {
  issues: JiraIssue[];
}

const KpiCard = ({ title, value, description }: { title: string; value: string | number; description?: string }) => (
    <Card className="shadow-sm">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-2xl font-bold">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
);


export function ServiceKpiCards({ issues }: KpiCardsProps) {
  const kpis = useMemo(() => {
    const totalCreated = issues.length;
    const totalClosed = issues.filter(i => i.status?.statusCategory?.name === 'Done').length;
    
    const issuesWithCreationDate = issues.filter(i => i.created);

    if (issuesWithCreationDate.length === 0) {
        return {
            totalCreated,
            totalClosed,
            avgCreatedPerDay: (0).toFixed(2),
        };
    }

    const dates = issuesWithCreationDate.map(i => parseISO(i.created!));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const totalDays = differenceInDays(maxDate, minDate) + 1;

    const avgCreatedPerDay = totalDays > 0 ? (totalCreated / totalDays).toFixed(2) : '0.00';

    return {
      totalCreated,
      totalClosed,
      avgCreatedPerDay,
    };
  }, [issues]);

  return (
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title="Total Created Issues" value={kpis.totalCreated} />
        <KpiCard title="Total Closed Issues" value={kpis.totalClosed} />
        <KpiCard title="Average Created by Day" value={`${kpis.avgCreatedPerDay}`} />
     </div>
  );
}
