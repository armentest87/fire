'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon, Filter, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface JiraFilterSidebarProps {
    onFetch: (jql: string) => void;
    isLoading: boolean;
    onLogout: () => void;
}

export function JiraFilterSidebar({ onFetch, isLoading }: JiraFilterSidebarProps) {
    const [jql, setJql] = useState('');
    const [project, setProject] = useState('');
    const [issueTypes, setIssueTypes] = useState<string[]>([]);
    const [statuess, setStatuses] = useState<string[]>([]);
    const [createdDate, setCreatedDate] = useState<Date | undefined>();
    const [updatedDate, setUpdatedDate] = useState<Date | undefined>();

    const [localIsLoading, setLocalIsLoading] = useState(false);

    const constructJql = () => {
        let queryParts: string[] = [];

        if (project) {
            queryParts.push(`project = "${project}"`);
        }
        if (issueTypes.length > 0) {
            queryParts.push(`issuetype in (${issueTypes.map(t => `"${t}"`).join(', ')})`);
        }
        if (statuess.length > 0) {
            queryParts.push(`status in (${statuess.map(s => `"${s}"`).join(', ')})`);
        }
        if (createdDate) {
            queryParts.push(`created >= "${format(createdDate, 'yyyy-MM-dd')}"`);
        }
        if (updatedDate) {
            queryParts.push(`updated >= "${format(updatedDate, 'yyyy-MM-dd')}"`);
        }

        return queryParts.join(' AND ');
    };

    const handleFetch = () => {
        const finalJql = constructJql();
        onFetch(finalJql);
    };

    const handleJqlFetch = () => {
        onFetch(jql);
    }
    
    const handleClear = () => {
        setProject('');
        setIssueTypes([]);
        setStatuses([]);
        setCreatedDate(undefined);
        setUpdatedDate(undefined);
        setJql('');
    };

    return (
        <div className="flex flex-col h-full">
            <Tabs defaultValue="basic" className="flex-grow flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="jql">JQL</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="flex-grow space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Project</Label>
                        <Select onValueChange={setProject} value={project}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Project" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PROJ">Project Phoenix</SelectItem>
                                <SelectItem value="DATA">Data Platform</SelectItem>
                                <SelectItem value="ITSAM">ITSM Sample</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Issue Types</Label>
                        {/* This would be a multi-select component in a real app */}
                        <Select onValueChange={(v) => setIssueTypes(v ? [v] : [])}>
                            <SelectTrigger>
                                <SelectValue placeholder="Any issue type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Story">Story</SelectItem>
                                <SelectItem value="Bug">Bug</SelectItem>
                                <SelectItem value="Task">Task</SelectItem>
                                <SelectItem value="Epic">Epic</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Issue Statuses</Label>
                         {/* This would be a multi-select component in a real app */}
                        <Select onValueChange={(v) => setStatuses(v ? [v] : [])}>
                            <SelectTrigger>
                                <SelectValue placeholder="Any status" />
                            </SelectTrigger>
                             <SelectContent>
                                <SelectItem value="To Do">To Do</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Done">Done</SelectItem>
                                <SelectItem value="Backlog">Backlog</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Created After</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !createdDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {createdDate ? format(createdDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={createdDate}
                                    onSelect={setCreatedDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                     <div className="space-y-2">
                        <Label>Updated After</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !updatedDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {updatedDate ? format(updatedDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={updatedDate}
                                    onSelect={setUpdatedDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                     <Button variant="ghost" onClick={handleClear} className="w-full justify-start">
                        <X className="mr-2 h-4 w-4"/> Clear All Filters
                    </Button>
                </TabsContent>

                <TabsContent value="jql" className="flex-grow space-y-4 py-4">
                     <div className="space-y-2 h-full flex flex-col">
                        <Label htmlFor="jql-query">JQL Query</Label>
                        <Textarea 
                            id="jql-query"
                            placeholder='project = "PROJ" AND status = "Done"'
                            value={jql}
                            onChange={(e) => setJql(e.target.value)}
                            className="flex-grow"
                        />
                    </div>
                </TabsContent>
            </Tabs>
             <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={handleJqlFetch} disabled={isLoading} className="w-full" size="lg">
                 {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Filter className="mr-2 h-4 w-4" />
                )}
                 Fetch & Analyze
                </Button>
             </div>
        </div>
    );
}
