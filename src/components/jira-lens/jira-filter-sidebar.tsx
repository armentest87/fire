'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fetchJiraData } from "@/lib/dummy-data";
import { type JiraIssue, type JiraCredentials } from "@/lib/types";
import { Rocket, Loader2, SlidersHorizontal, FileText, Eraser } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';


interface JiraFilterSidebarProps {
  credentials: JiraCredentials;
  jql: string;
  setJql: (jql: string) => void;
  setIssues: (issues: JiraIssue[] | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export function JiraFilterSidebar({ credentials, jql, setJql, setIssues, setIsLoading, setError }: JiraFilterSidebarProps) {
  const { toast } = useToast();
  const [localIsLoading, setLocalIsLoading] = useState(false);

  // States for basic filters
  const [project, setProject] = useState('');
  const [issueTypes, setIssueTypes] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [createdDate, setCreatedDate] = useState<Date | undefined>();
  const [updatedDate, setUpdatedDate] = useState<Date | undefined>();

  const handleClearBasicFilters = () => {
    setProject('');
    setIssueTypes([]);
    setStatuses([]);
    setCreatedDate(undefined);
    setUpdatedDate(undefined);
  };
  
  const handleFetch = async () => {
    setLocalIsLoading(true);
    setIsLoading(true);
    setError(null);
    setIssues(null);

    // TODO: Build JQL from basic filters if that tab is active
    let finalJql = jql;

    try {
      // We are not using the credentials here yet, but they are available.
      const data = await fetchJiraData(finalJql);
      if (data && data.length > 0) {
        setIssues(data);
        toast({
          title: "Success!",
          description: `Successfully fetched ${data.length} issues.`,
          variant: 'default',
        });
      } else {
        setIssues([]);
        toast({
          title: "No data",
          description: "Query returned no issues.",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      setIssues(null);
      toast({
        title: "Error fetching data",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLocalIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
       <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic"><SlidersHorizontal className="mr-2 h-4 w-4"/>Basic</TabsTrigger>
                <TabsTrigger value="jql"><FileText className="mr-2 h-4 w-4"/>JQL</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="space-y-2">
                    <Label>Project</Label>
                    <Select value={project} onValueChange={setProject}>
                        <SelectTrigger><SelectValue placeholder="Select project..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PROJ">Project Phoenix (PROJ)</SelectItem>
                            <SelectItem value="DATA">Data Platform (DATA)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>Issue Types</Label>
                    <Select>
                        <SelectTrigger><SelectValue placeholder="Any issue type" /></SelectTrigger>
                        <SelectContent><p className="p-4 text-sm text-muted-foreground">Connect to see options</p></SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>Issue Statuses</Label>
                     <Select>
                        <SelectTrigger><SelectValue placeholder="Any status" /></SelectTrigger>
                        <SelectContent><p className="p-4 text-sm text-muted-foreground">Connect to see options</p></SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Created after</Label>
                        <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !createdDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {createdDate ? format(createdDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={createdDate} onSelect={setCreatedDate} initialFocus/>
                        </PopoverContent>
                        </Popover>
                    </div>
                     <div className="space-y-2">
                        <Label>Updated after</Label>
                        <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !updatedDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {updatedDate ? format(updatedDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={updatedDate} onSelect={setUpdatedDate} initialFocus/>
                        </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <Button variant="ghost" onClick={handleClearBasicFilters} className="w-full text-muted-foreground">
                    <Eraser className="mr-2 h-4 w-4" /> Clear All Filters
                </Button>
            </TabsContent>
             <TabsContent value="jql" className="space-y-2 pt-4">
                <Label htmlFor="jql-query">JQL Query</Label>
                <Textarea 
                    id="jql-query"
                    value={jql}
                    onChange={(e) => setJql(e.target.value)}
                    className="min-h-[120px] font-mono text-sm"
                    placeholder="e.g., project = 'PROJ' and status = 'Done'"
                />
            </TabsContent>
        </Tabs>
      <Button onClick={handleFetch} disabled={localIsLoading} className="w-full" size="lg">
        {localIsLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
            <Rocket className="mr-2 h-4 w-4" />
        )}
        Fetch & Analyze
      </Button>
    </div>
  );
}
