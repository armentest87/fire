'use client';
import { type JiraIssue, type JiraProject } from "@/lib/types";
import { useState, useMemo, useEffect }from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HoursByUserChart } from "./hours-by-user-chart";
import { WorktimeByDateChart } from "./worktime-by-date-chart";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDate, getYear } from 'date-fns';


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

const TimeworkMatrixTable = ({issues}: {issues: JiraIssue[]}) => {
    const {daysInMonth, userDailyHours, totals} = useMemo(() => {
        const issuesWithTime = issues.filter(i => i.time_spent_hours && i.time_spent_hours > 0 && i.updated && i.assignee);

        if (issuesWithTime.length === 0) {
            return {daysInMonth: [], userDailyHours: [], totals: {hours: [], total: 0}};
        }

        const latestDate = issuesWithTime.reduce((max, i) => {
            if (!i.updated) return max;
            const updated = parseISO(i.updated);
            return updated > max ? updated : max;
        }, new Date(0));

        const monthStart = startOfMonth(latestDate);
        const monthEnd = endOfMonth(latestDate);
        const daysInMonth = eachDayOfInterval({start: monthStart, end: monthEnd});

        const dailyHoursMap: Record<string, Record<string, number>> = {};

        issuesWithTime.forEach(issue => {
            if (!issue.updated || !issue.assignee?.displayName) return;
            const updatedDate = format(parseISO(issue.updated), 'yyyy-MM-dd');
            const user = issue.assignee.displayName;
            
            if (!dailyHoursMap[user]) {
                dailyHoursMap[user] = {};
            }
            dailyHoursMap[user][updatedDate] = (dailyHoursMap[user][updatedDate] || 0) + (issue.time_spent_hours || 0);
        });
        
        const userDailyHours = Object.entries(dailyHoursMap).map(([user, dailyData]) => {
            const hours = daysInMonth.map(day => dailyData[format(day, 'yyyy-MM-dd')] || 0);
            const total = hours.reduce((sum, h) => sum + h, 0);
            return { user, hours, total };
        }).sort((a,b) => b.total - a.total);

        const dailyTotals = daysInMonth.map((day, i) => {
            return userDailyHours.reduce((sum, userRow) => sum + userRow.hours[i], 0);
        });
        const grandTotal = dailyTotals.reduce((sum, h) => sum + h, 0);


        return {daysInMonth, userDailyHours, totals: {hours: dailyTotals, total: grandTotal}};

    }, [issues]);

    const formatHours = (h: number) => {
        if (h === 0) return '-';
        return h.toFixed(1);
    }

    if (issues.length === 0 || userDailyHours.length === 0) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>User Timework Report</CardTitle>
                    <CardDescription>Detailed time breakdown per user per day.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-muted-foreground h-48 flex items-center justify-center rounded-lg bg-muted/20 border border-dashed">
                        <p>No time tracking data available to display.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }


    return (
     <Card>
        <CardHeader>
            <CardTitle>User Timework Report</CardTitle>
            <CardDescription>Detailed time breakdown for {daysInMonth.length > 0 ? format(daysInMonth[0], 'MMMM yyyy') : 'the selected period'}.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto border rounded-lg">
                <Table className="min-w-full">
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="sticky left-0 bg-muted/50 font-semibold w-48 z-10">User</TableHead>
                            {daysInMonth.map(day => (
                                <TableHead key={day.toISOString()} className="text-center w-20">
                                    <div className="text-xs text-muted-foreground">{format(day, 'eee')}</div>
                                    <div>{getDate(day)}</div>
                                </TableHead>
                            ))}
                            <TableHead className="text-right font-semibold w-24 sticky right-0 bg-muted/50 z-10">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="font-semibold bg-muted/20 hover:bg-muted/30">
                            <TableCell className="sticky left-0 bg-muted/20 z-10">Total</TableCell>
                            {totals.hours.map((total, i) => (
                                <TableCell key={i} className="text-center">{formatHours(total)}</TableCell>
                            ))}
                             <TableCell className="text-right sticky right-0 bg-muted/20 z-10">{formatHours(totals.total)}</TableCell>
                        </TableRow>
                        {userDailyHours.map(({ user, hours, total }) => (
                            <TableRow key={user}>
                                <TableCell className="sticky left-0 bg-background font-medium z-10">{user}</TableCell>
                                {hours.map((h, i) => (
                                    <TableCell key={i} className={`text-center text-xs ${h > 0 ? 'font-medium' : 'text-muted-foreground'}`}>{formatHours(h)}</TableCell>
                                ))}
                                <TableCell className="text-right font-medium sticky right-0 bg-background z-10">{formatHours(total)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
    )
}


export function TimeworkReport({ issues, projects, allIssues }: { issues: JiraIssue[], projects: JiraProject[], allIssues: JiraIssue[] }) {
    
    const years = useMemo(() => {
        const yearSet = new Set<string>();
        allIssues.forEach(i => {
            if (i.updated) {
                yearSet.add(getYear(parseISO(i.updated)).toString());
            }
        });
        return Array.from(yearSet).sort((a,b) => parseInt(b) - parseInt(a));
    }, [allIssues]);

    const availableProjects = useMemo(() => {
        const issueProjectKeys = [...new Set(issues.map(i => i.key.split('-')[0]))];
        return projects.filter(p => issueProjectKeys.includes(p.key));
    }, [issues, projects]);

    const [selectedYears, setSelectedYears] = useState<Set<string>>(new Set(years));
    const [selectedProject, setSelectedProject] = useState('all');

    useEffect(() => {
        setSelectedYears(new Set(years));
    }, [years]);


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
    
    const filteredIssues = useMemo(() => {
        let yearFiltered = issues.filter(i => {
            if (!i.updated) return false;
            const year = format(parseISO(i.updated), 'yyyy');
            return selectedYears.has(year);
        });
        
        if (selectedProject === 'all') {
            return yearFiltered;
        }

        const projectKey = projects.find(p => p.id === selectedProject)?.key;
        if (!projectKey) return yearFiltered;
        
        return yearFiltered.filter(i => i.key.startsWith(`${projectKey}-`));

    }, [issues, selectedProject, selectedYears, projects]);

    const kpis = useMemo(() => {
        const totalHours = filteredIssues.reduce((sum, issue) => sum + (issue.time_spent_hours || 0), 0);
        
        const uniqueDaysWithTime = new Set(
            filteredIssues.filter(i => (i.time_spent_hours || 0) > 0 && i.updated).map(i => i.updated!.split('T')[0])
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
    }, [filteredIssues]);

    return (
       <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* Filters & KPIs Column */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Choose Project</CardTitle></CardHeader>
                        <CardContent>
                             <Select value={selectedProject} onValueChange={setSelectedProject}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Projects</SelectItem>
                                    {availableProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
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
                <div className="lg:col-span-4 space-y-6">
                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                       <HoursByUserChart issues={filteredIssues} />
                       <WorktimeByDateChart issues={filteredIssues} />
                   </div>
                    <TimeworkMatrixTable issues={filteredIssues} />
                </div>

            </div>
        </div>
    );
}
