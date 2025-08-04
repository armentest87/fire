'use client';
import { type JiraIssue } from "@/lib/types";
import { useState, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { subDays, format, parseISO } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, DollarSign, BarChart, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UserWorkloadReport } from "./user-workload-report";
import { OpenIssuesReport } from "./open-issues-report";


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

export function TimeworkReport({ issues }: { issues: JiraIssue[] }) {
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 90),
        to: new Date(),
    });

    const filteredIssues = useMemo(() => {
        if (!date?.from) return issues;
        return issues.filter(issue => {
            const issueDate = parseISO(issue.updated);
            const from = date.from!;
            const to = date.to ?? new Date(); // Default to now if 'to' is not set
            return issueDate >= from && issueDate <= to;
        });
    }, [issues, date]);

    const kpis = useMemo(() => {
        const timeLogs = filteredIssues.filter(i => i.time_spent_hours && i.time_spent_hours > 0);
        const totalHours = timeLogs.reduce((sum, issue) => sum + (issue.time_spent_hours || 0), 0);
        const billableHours = totalHours; // Assuming all hours are billable
        const totalTasks = new Set(timeLogs.map(log => log.key)).size;

        return {
            totalHours: `${totalHours.toFixed(1)}h`,
            billableHours: `${billableHours.toFixed(1)}h`,
            utilization: `85%`, // Placeholder
            avgTimePerTask: totalTasks > 0 ? `${(totalHours / totalTasks).toFixed(1)}h` : '0h'
        }
    }, [filteredIssues]);


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
            
            <UserWorkloadReport issues={filteredIssues} />
            <OpenIssuesReport issues={filteredIssues} />

        </div>
    );
}
