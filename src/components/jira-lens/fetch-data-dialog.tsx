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
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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

  const isBasicFetchDisabled = !projectKey.trim() && !issueTypes.trim() && !issueStatuses.trim() && !createdDate && !updatedDate;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
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
        <DialogFooter>
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
