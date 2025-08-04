'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, Calendar as CalendarIcon, Wand2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { visualizationSuggestion } from '@/ai/flows/visualization-suggestion';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface FetchDataDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFetch: (jql: string) => void;
  isFetching: boolean;
}

export function FetchDataDialog({ isOpen, onOpenChange, onFetch, isFetching }: FetchDataDialogProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'jql'>('basic');
  
  // State for Basic filters
  const [projectKey, setProjectKey] = useState('PROJ');
  const [issueTypes, setIssueTypes] = useState('');
  const [issueStatuses, setIssueStatuses] = useState('');
  const [createdDate, setCreatedDate] = useState<Date | undefined>();
  const [updatedDate, setUpdatedDate] = useState<Date | undefined>();

  // State for JQL
  const [jql, setJql] = useState('project = PROJ ORDER BY created DESC');

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();
  
  const constructJqlFromBasic = () => {
    const parts: string[] = [];
    if (projectKey) {
        parts.push(`project = "${projectKey.trim()}"`);
    }
    if (issueTypes) {
        const types = issueTypes.split(',').map(t => `"${t.trim()}"`).join(', ');
        parts.push(`issuetype IN (${types})`);
    }
    if (issueStatuses) {
        const statuses = issueStatuses.split(',').map(s => `"${s.trim()}"`).join(', ');
        parts.push(`status IN (${statuses})`);
    }
    if (createdDate) {
        parts.push(`created >= "${format(createdDate, 'yyyy-MM-dd')}"`);
    }
     if (updatedDate) {
        parts.push(`updated >= "${format(updatedDate, 'yyyy-MM-dd')}"`);
    }

    return parts.join(' AND ');
  };

  const handleFetchClick = () => {
    if (activeTab === 'basic') {
      const constructedJql = constructJqlFromBasic();
      onFetch(constructedJql);
    } else {
      onFetch(jql);
    }
  };

  const handleSuggest = async () => {
    setIsSuggesting(true);
    setSuggestions([]);
    try {
        const currentJql = activeTab === 'basic' ? constructJqlFromBasic() : jql;
        if(!currentJql) {
            toast({
                title: "Cannot suggest",
                description: "Please enter some filter criteria before asking for suggestions.",
                variant: "destructive",
            });
            return;
        }
        const result = await visualizationSuggestion({
            jqlQuery: currentJql,
            projectType: "Software" // This could be made dynamic in a real app
        });
        setSuggestions(result.suggestions);
    } catch(e) {
        toast({
            title: "Suggestion failed",
            description: "An error occurred while generating suggestions. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsSuggesting(false);
    }
  };

  const isBasicFetchDisabled = !projectKey.trim() && !issueTypes.trim() && !issueStatuses.trim() && !createdDate && !updatedDate;
  const currentJql = activeTab === 'basic' ? constructJqlFromBasic() : jql;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>Fetch Jira Data</DialogTitle>
          <DialogDescription>
            Choose to fetch by basic filters or use a custom JQL query.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'basic' | 'jql')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Filters</TabsTrigger>
            <TabsTrigger value="jql">JQL</TabsTrigger>
          </TabsList>
          <TabsContent value="basic">
            <div className="space-y-4 py-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="project-key">Project Key</Label>
                    <Input 
                      id="project-key" 
                      placeholder="E.g., PROJ" 
                      value={projectKey}
                      onChange={(e) => setProjectKey(e.target.value)}
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="issue-types">Issue Types</Label>
                    <Input 
                      id="issue-types" 
                      placeholder="Bug, Story, Task" 
                      value={issueTypes}
                      onChange={(e) => setIssueTypes(e.target.value)}
                    />
                  </div>
               </div>
               <div className="space-y-2">
                <Label htmlFor="issue-statuses">Issue Statuses</Label>
                <Input 
                  id="issue-statuses" 
                  placeholder="To Do, In Progress" 
                  value={issueStatuses}
                  onChange={(e) => setIssueStatuses(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
            </div>
          </TabsContent>
          <TabsContent value="jql">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="jql-query">JQL Query</Label>
                <Textarea
                  id="jql-query"
                  placeholder="project = PROJ AND status = 'In Progress'"
                  value={jql}
                  onChange={(e) => setJql(e.target.value)}
                  className="min-h-[100px] font-mono text-xs"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
         { (isSuggesting || suggestions.length > 0) && (
            <Alert>
                <Wand2 className="h-4 w-4" />
                <AlertTitle>Visualization Suggestions</AlertTitle>
                <AlertDescription>
                    {isSuggesting && <p className="text-sm text-muted-foreground">Generating ideas...</p>}
                    {suggestions.length > 0 && (
                        <ul className="list-disc space-y-1 pl-5 mt-2 text-sm">
                            {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    )}
                </AlertDescription>
            </Alert>
        )}
        <DialogFooter>
          <div className="flex-1 justify-start">
             <Button variant="ghost" onClick={handleSuggest} disabled={isSuggesting || !currentJql}>
               {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
               Suggest Visualizations
             </Button>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isFetching}>
            Cancel
          </Button>
          <Button onClick={handleFetchClick} disabled={isFetching || (activeTab === 'basic' && isBasicFetchDisabled) || (activeTab === 'jql' && !jql)}>
            {isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Fetch Issues
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
