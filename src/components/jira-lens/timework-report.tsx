'use client';
import { type JiraIssue } from "@/lib/types";
import { useState, useMemo }from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


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

const UsersChart = () => (
    <Card>
        <CardHeader>
            <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
             <p className="text-muted-foreground h-full flex items-center justify-center">User chart placeholder</p>
        </CardContent>
    </Card>
);

const WorktimeChart = () => (
     <Card>
        <CardHeader>
            <CardTitle>Worktime</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
           <p className="text-muted-foreground h-full flex items-center justify-center">Worktime chart placeholder</p>
        </CardContent>
    </Card>
);

const TimeworkMatrixTable = () => (
     <Card>
        <CardHeader>
            <CardTitle>User Timework Report</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <p className="text-muted-foreground h-48 flex items-center justify-center">Hierarchical time-tracking table placeholder</p>
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
        const uniqueDays = new Set(issues.map(i => i.updated.split('T')[0])).size;
        const averageHours = uniqueDays > 0 ? totalHours / uniqueDays : 0;
        
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
       <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Filters Column */}
                <div className="md:col-span-1 lg:col-span-1 space-y-4">
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
                    <KpiCard title="Total Hours Worked" value={kpis.totalHoursWorked}/>
                    <KpiCard title="Average Hours per Day" value={kpis.averageHoursPerDay} />
                </div>
                
                {/* Charts Column */}
                <div className="md:col-span-3 lg:col-span-4 space-y-4">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                       <UsersChart />
                       <WorktimeChart />
                   </div>
                    <TimeworkMatrixTable />
                </div>

                {/* Period Column */}
                <div className="md:col-span-4 lg:col-span-1">
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
                </div>
            </div>
        </div>
    );
}
