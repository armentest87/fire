'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { type JiraIssue } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Calendar as CalendarIcon, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';

interface JiraFilterPopoverProps {
    allIssues: JiraIssue[];
    onFilterChange: (filteredIssues: JiraIssue[]) => void;
    assignees: string[];
    statuses: string[];
}

interface Filters {
    date: Date | undefined;
    assignees: Set<string>;
    statuses: Set<string>;
    issueKey: string;
}

const initialFilters: Filters = {
    date: undefined,
    assignees: new Set(),
    statuses: new Set(),
    issueKey: '',
};

export function JiraFilterPopover({ allIssues, onFilterChange, assignees, statuses }: JiraFilterPopoverProps) {
    const [filters, setFilters] = useState<Filters>(initialFilters);
    const [open, setOpen] = useState(false);
    
    const applyFilters = useCallback(() => {
        let filtered = allIssues;

        if (filters.date) {
            filtered = filtered.filter(issue => parseISO(issue.created) >= filters.date!);
        }
        if (filters.assignees.size > 0) {
            filtered = filtered.filter(issue => issue.assignee && filters.assignees.has(issue.assignee));
        }
        if (filters.statuses.size > 0) {
            filtered = filtered.filter(issue => filters.statuses.has(issue.status));
        }
        if (filters.issueKey) {
            filtered = filtered.filter(issue => issue.key.toLowerCase().includes(filters.issueKey.toLowerCase()));
        }
        
        onFilterChange(filtered);

    }, [filters, allIssues, onFilterChange]);

    useEffect(() => {
        applyFilters();
    }, [filters, applyFilters]);

    // When the underlying issue set changes (e.g., a new fetch), reset filters.
    useEffect(() => {
        setFilters(initialFilters);
    }, [allIssues]);

    
    const handleClear = () => {
        setFilters(initialFilters);
    };
    
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if(filters.date) count++;
        if(filters.assignees.size > 0) count++;
        if(filters.statuses.size > 0) count++;
        if(filters.issueKey) count++;
        return count;
    }, [filters]);

    const toggleSetItem = (set: Set<string>, item: string) => {
        const newSet = new Set(set);
        if (newSet.has(item)) {
            newSet.delete(item);
        } else {
            newSet.add(item);
        }
        return newSet;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2 rounded-full">{activeFilterCount}</Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                         <div className="space-y-1">
                            <h4 className="font-medium leading-none">Filters</h4>
                            <p className="text-sm text-muted-foreground">
                                Refine the issues shown on the dashboard.
                            </p>
                        </div>
                         {activeFilterCount > 0 && (
                           <Button variant="ghost" size="sm" onClick={handleClear}><X className="mr-2 h-4 w-4"/>Clear</Button>
                         )}
                    </div>
                    <ScrollArea className="h-96">
                        <div className="grid gap-4 p-1">
                            <div className="space-y-2">
                                <Label>Created After</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !filters.date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {filters.date ? format(filters.date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={filters.date}
                                            onSelect={(d) => setFilters(f => ({...f, date: d}))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="issue-key">Issue Key</Label>
                                <Input id="issue-key" placeholder="PROJ-123" value={filters.issueKey} onChange={e => setFilters(f => ({...f, issueKey: e.target.value}))}/>
                            </div>
                            <div className="space-y-2">
                                <Label>Assignee</Label>
                                 <Command>
                                    <CommandInput placeholder="Filter assignees..." />
                                    <CommandList>
                                        <CommandEmpty>No results found.</CommandEmpty>
                                        <CommandGroup>
                                            {assignees.map(assignee => (
                                                <CommandItem key={assignee} onSelect={() => setFilters(f => ({ ...f, assignees: toggleSetItem(f.assignees, assignee)}))}>
                                                     <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", filters.assignees.has(assignee) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                                        <Check className={cn("h-4 w-4")} />
                                                    </div>
                                                    {assignee}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Command>
                                    <CommandInput placeholder="Filter statuses..." />
                                    <CommandList>
                                        <CommandEmpty>No results found.</CommandEmpty>
                                        <CommandGroup>
                                            {statuses.map(status => (
                                                <CommandItem key={status} onSelect={() => setFilters(f => ({ ...f, statuses: toggleSetItem(f.statuses, status)}))}>
                                                    <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", filters.statuses.has(status) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                                        <Check className={cn("h-4 w-4")} />
                                                    </div>
                                                    {status}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </div>
                        </div>
                     </ScrollArea>
                </div>
            </PopoverContent>
        </Popover>
    );
}
