'use client';
import { type JiraIssue } from "@/lib/types";
import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { subDays, format, parseISO } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar as CalendarIcon, Clock, DollarSign, BarChart, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);


const KpiCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

const WorkloadByAssigneeChart = ({ issues }: { issues: JiraIssue[] }) => {
    const chartData = useMemo(() => {
        const openIssues = issues.filter(i => i.status_category !== 'Done' && i.assignee);
        const assigneeCounts = openIssues.reduce((acc, issue) => {
            acc[issue.assignee!] = (acc[issue.assignee!] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const labels = Object.keys(assigneeCounts).sort((a,b) => assigneeCounts[a] - assigneeCounts[b]);
        const data = labels.map(label => assigneeCounts[label]);

        return {
            labels,
            datasets: [{
                label: 'Open Tasks',
                data,
                backgroundColor: 'hsl(var(--primary))',
                borderColor: 'hsl(var(--primary))',
                borderWidth: 1,
                barThickness: 15,
            }]
        }
    }, [issues]);

    const options = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
        plugins: { legend: { display: false } }
    };
    
    return (
         <Card>
            <CardHeader>
                <CardTitle>Workload by Assignee</CardTitle>
                <CardDescription>Number of open tasks per user.</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
                 <Bar data={chartData} options={options} />
            </CardContent>
        </Card>
    )
}

const HoursByProjectChart = ({ issues }: { issues: JiraIssue[] }) => {
    const chartData = useMemo(() => {
        const hoursByProject = issues.reduce((acc, issue) => {
             if (issue.time_spent_hours) {
                const projectKey = issue.key.split('-')[0];
                acc[projectKey] = (acc[projectKey] || 0) + issue.time_spent_hours;
             }
             return acc;
        }, {} as Record<string, number>);

        const labels = Object.keys(hoursByProject);
        const data = Object.values(hoursByProject);
        
        return {
            labels,
            datasets: [{
                data,
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#34D399'],
            }]
        }
    }, [issues]);

     const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right' as const,
          },
        },
      };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Hours by Project</CardTitle>
                <CardDescription>Distribution of time spent across projects.</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
                <Pie data={chartData} options={options} />
            </CardContent>
        </Card>
    );
};


export function TimeworkReport({ issues }: { issues: JiraIssue[] }) {
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 90),
        to: new Date(),
    });

    const timeLogs = useMemo(() => {
        // This is a mock transformation. A real implementation might fetch this data differently.
        return issues
            .filter(issue => issue.time_spent_hours && issue.time_spent_hours > 0)
            .map(issue => ({
                user: issue.assignee,
                project: issue.key.split('-')[0],
                task: issue.key,
                date: issue.updated, // using updated date as a proxy for log date
                timeSpent: `${issue.time_spent_hours.toFixed(1)}h`,
                billable: 'Yes' // Placeholder
            }))
            .sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
    }, [issues]);

    const kpis = useMemo(() => {
        const totalHours = timeLogs.reduce((sum, log) => sum + parseFloat(log.timeSpent), 0);
        const billableHours = totalHours; // Assuming all hours are billable
        const totalTasks = new Set(timeLogs.map(log => log.task)).size;

        return {
            totalHours: `${totalHours.toFixed(1)}h`,
            billableHours: `${billableHours.toFixed(1)}h`,
            utilization: `85%`, // Placeholder
            avgTimePerTask: totalTasks > 0 ? `${(totalHours / totalTasks).toFixed(1)}h` : '0h'
        }
    }, [timeLogs]);


    return (
       <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex gap-4">
                     <Select defaultValue="all">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Project" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Projects</SelectItem>
                            <SelectItem value="proj">Project PROJ</SelectItem>
                        </SelectContent>
                    </Select>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                "w-[300px] justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                date.to ? (
                                    <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard title="Total Hours Logged" value={kpis.totalHours} icon={<Clock className="h-4 w-4 text-muted-foreground" />}/>
                <KpiCard title="Billable Hours" value={kpis.billableHours} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}/>
                <KpiCard title="Utilization Rate" value={kpis.utilization} icon={<BarChart className="h-4 w-4 text-muted-foreground" />}/>
                <KpiCard title="Avg. Time per Task" value={kpis.avgTimePerTask} icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />} />
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <WorkloadByAssigneeChart issues={issues} />
                </div>
                 <div className="lg:col-span-2">
                     <HoursByProjectChart issues={issues} />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Time Tracking</CardTitle>
                    <CardDescription>Detailed log of time spent on tasks.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Task</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Time Spent</TableHead>
                                <TableHead>Billable</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {timeLogs.slice(0, 10).map((log, index) => (
                                <TableRow key={index}>
                                    <TableCell>{log.user}</TableCell>
                                    <TableCell>{log.project}</TableCell>
                                    <TableCell>{log.task}</TableCell>
                                    <TableCell>{format(parseISO(log.date), 'PPP')}</TableCell>
                                    <TableCell>{log.timeSpent}</TableCell>
                                    <TableCell>{log.billable}</TableCell>
                                </TableRow>
                            ))}
                             {timeLogs.length === 0 && (
                               <TableRow>
                                   <TableCell colSpan={6} className="text-center h-24">
                                       No time tracking data available.
                                   </TableCell>
                               </TableRow>
                           )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
    );
}
