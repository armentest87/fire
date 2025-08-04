'use client';
import { type JiraIssue } from "@/lib/types";
import { useState, useMemo }from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserWorkloadReport } from "./user-workload-report";
import { HoursByUserChart } from "./hours-by-user-chart";


const KpiCard = ({ title, value, description }: { title: string, value: string, description?: string }) => (
    <Card className="shadow-sm">
        <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-3xl font-bold">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </CardContent>
    </Card>
);

const WorktimeChart = () => (
     <Card>
        <CardHeader>
            <CardTitle>Worktime</CardTitle>
             <CardDescription>Total hours logged per day.</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
           <div className="text-muted-foreground h-full flex items-center justify-center rounded-lg bg-muted/20 border border-dashed">
            <p>Worktime by date bar chart</p>
           </div>
        </CardContent>
    </Card>
);

const TimeworkMatrixTable = () => (
     <Card>
        <CardHeader>
            <CardTitle>User Timework Report</CardTitle>
            <CardDescription>Detailed time breakdown per user per day.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                 <div className="text-muted-foreground h-48 flex items-center justify-center rounded-lg bg-muted/20 border border-dashed">
                    <p>Hierarchical time-tracking table</p>
                </div>
            </div>
        </CardContent>
    </Card>
)

const years = ['2023', '2022', '2021', '2020', '2019'];

export function TimeworkReport({ issues }: { issues: JiraIssue[] }) {
    const [selectedYears, setSelectedYears] = useState<Set<string>>(new Set(['2023']));

    const handleYearChange = (year: string) => {
        setSelectedYears(prev => {
            const newSet = new Set(prev);
            if(newSet.has(year)) {
                newSet.delete(year);
            } else {
                newSet.add(year);
            }
            return newSet;
        })
    }
    
    const kpis = useMemo(() => {
        const totalHours = issues.reduce((sum, issue) => sum + (issue.time_spent_hours || 0), 0);
        
        const uniqueDaysWithTime = new Set(
            issues.filter(i => (i.time_spent_hours || 0) > 0).map(i => i.updated.split('T')[0])
        ).size;

        const averageHours = uniqueDaysWithTime > 0 ? totalHours / uniqueDaysWithTime : 0;
        
        const formatHours = (h: number) => {
            const hours = Math.floor(h);
            const minutes = Math.round((h - hours) * 60);
            return `${hours}h ${minutes}m`
        }

        return {
            totalHoursWorked: formatHours(totalHours),
            averageHoursPerDay: formatHours(averageHours)
        }
    }, [issues]);

    return (
       <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
                
                {/* Filters & KPIs Column */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Choose Project</CardTitle></CardHeader>
                        <CardContent>
                             <Select defaultValue="all">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">BI Cloud apps</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Period</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                           {years.map(year => (
                               <div key={year} className="flex items-center space-x-2">
                                   <Checkbox 
                                        id={`year-${year}`} 
                                        checked={selectedYears.has(year)}
                                        onCheckedChange={() => handleYearChange(year)}
                                    />
                                   <Label htmlFor={`year-${year}`} className="font-normal">{year}</Label>
                               </div>
                           ))}
                        </CardContent>
                    </Card>
                     <KpiCard title="Total Hours Worked" value={kpis.totalHoursWorked}/>
                    <KpiCard title="Average Hours per Day" value={kpis.averageHoursPerDay} />
                </div>
                
                {/* Main Content Column */}
                <div className="lg:col-span-5 space-y-6">
                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                       <HoursByUserChart issues={issues} />
                       <WorktimeChart />
                   </div>
                    <TimeworkMatrixTable />
                    <UserWorkloadReport issues={issues} />
                </div>

            </div>
        </div>
    );
}
