
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, Calendar as CalendarIcon, Check, ChevronsUpDown, X } from 'lucide-react';
import { format, sub } from 'date-fns';
import { cn } from '@/lib/utils';
import { type JiraProject, type JiraIssueType, type JiraStatus } from '@/lib/types';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';

interface FetchDataDialogProps {
  onFetch: (jql: string) => void;
  isFetching: boolean;
  projects: JiraProject[];
  issueTypes: JiraIssueType[];
  statuses: JiraStatus[];
  onProjectChange: (projectId: string) => void;
}

const MultiSelectItem = ({ label, isSelected, onToggle }: { label: string, isSelected: boolean, onToggle: () => void }) => (
    <CommandItem onSelect={(currentValue) => {
        // Stop propagation to prevent cmdk from closing the popover
        event?.preventDefault();
        event?.stopPropagation();
        onToggle();
    }} className="cursor-pointer" value={label}>
        <div className="flex items-center gap-2 w-full">
            <Checkbox checked={isSelected} />
            <span>{label}</span>
        </div>
    </CommandItem>
);


export function FetchDataDialog({ onFetch, isFetching, projects, issueTypes, statuses, onProjectChange }: FetchDataDialogProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'jql'>('basic');
  
  const [projectId, setProjectId] = useState('');
  const [selectedIssueTypes, setSelectedIssueTypes] = useState<Set<string>>(new Set());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
  const [createdDate, setCreatedDate] = useState<Date | undefined>();
  const [updatedDate, setUpdatedDate] = useState<Date | undefined>();
  const [projectPopoverOpen, setProjectPopoverOpen] = useState(false);
  
  const [jql, setJql] = useState('ORDER BY created DESC');

  useEffect(() => {
    if(projectId) {
      onProjectChange(projectId);
      setSelectedIssueTypes(new Set());
      setSelectedStatuses(new Set());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const constructJqlFromBasic = () => {
    const parts: string[] = [];
    if (projectId) {
        const projectKey = projects.find(p => p.id === projectId)?.key;
        if(projectKey) parts.push(`project = "${projectKey.trim()}"`);
    }
    if (selectedIssueTypes.size > 0) {
        const types = Array.from(selectedIssueTypes).map(t => `"${t}"`).join(', ');
        parts.push(`issuetype IN (${types})`);
    }
    if (selectedStatuses.size > 0) {
        const statusNames = Array.from(selectedStatuses).map(id => statuses.find(s => s.id === id)?.name).filter(Boolean);
        if(statusNames.length > 0) {
          const statusesJql = statusNames.map(s => `"${s}"`).join(', ');
          parts.push(`status IN (${statusesJql})`);
        }
    }
    if (createdDate) {
        parts.push(`created >= "${format(createdDate, 'yyyy-MM-dd')}"`);
    }
     if (updatedDate) {
        parts.push(`updated >= "${format(updatedDate, 'yyyy-MM-dd')}"`);
    }

    const query = parts.join(' AND ');
    return query ? `${query} ORDER BY created DESC` : 'ORDER BY created DESC';
  };

  const handleFetchClick = () => {
    if (activeTab === 'basic') {
      const constructedJql = constructJqlFromBasic();
      onFetch(constructedJql);
    } else {
      onFetch(jql);
    }
  };

  const setDateRange = (duration: Duration, dateSetter: React.Dispatch<React.SetStateAction<Date | undefined>>) => {
    const now = new Date();
    dateSetter(sub(now, duration));
  }

  const toggleSetItem = (set: Set<string>, item: string) => {
      const newSet = new Set(set);
      if (newSet.has(item)) {
          newSet.delete(item);
      } else {
          newSet.add(item);
      }
      return newSet;
  };

  const isBasicFetchDisabled = !projectId.trim();
  const selectedProjectName = projects.find(p => p.id === projectId)?.name;

  return (
    <>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'basic' | 'jql')} className="w-full pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Filters</TabsTrigger>
            <TabsTrigger value="jql">JQL</TabsTrigger>
          </TabsList>
          <TabsContent value="basic">
            <div className="space-y-4 py-4">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="project-key">Project *</Label>
                    <Popover open={projectPopoverOpen} onOpenChange={setProjectPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={projectPopoverOpen}
                            className="w-full justify-between"
                            >
                            {projectId && selectedProjectName
                                ? `${selectedProjectName}`
                                : "Select project..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                            <CommandInput placeholder="Search project..." />
                            <CommandList>
                                <CommandEmpty>No project found.</CommandEmpty>
                                <CommandGroup>
                                    {projects.map((project) => (
                                    <CommandItem
                                        key={project.id}
                                        value={project.name}
                                        onSelect={() => {
                                          setProjectId(project.id)
                                          setProjectPopoverOpen(false)
                                        }}
                                    >
                                        <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            projectId === project.id ? "opacity-100" : "opacity-0"
                                        )}
                                        />
                                        {project.name} ({project.key})
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="issue-types">Issue Types (optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                           <Button variant="outline" className="w-full justify-start font-normal" disabled={!projectId || issueTypes.length === 0}>
                              {selectedIssueTypes.size > 0 ? `${selectedIssueTypes.size} selected` : "Select issue types..."}
                           </Button>
                        </PopoverTrigger>
                         <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Filter types..." />
                                <CommandList>
                                    <CommandEmpty>No types found.</CommandEmpty>
                                    <CommandGroup>
                                        <ScrollArea className="h-48">
                                          {issueTypes.map(it => (
                                             <MultiSelectItem
                                                key={it.id}
                                                label={it.name}
                                                isSelected={selectedIssueTypes.has(it.name)}
                                                onToggle={() => setSelectedIssueTypes(s => toggleSetItem(s, it.name))}
                                              />
                                          ))}
                                        </ScrollArea>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                         </PopoverContent>
                      </Popover>
                  </div>
               </div>
               <div className="space-y-2">
                <Label htmlFor="issue-statuses">Issue Statuses (optional)</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                       <Button variant="outline" className="w-full justify-start font-normal" disabled={!projectId || statuses.length === 0}>
                          {selectedStatuses.size > 0 ? `${selectedStatuses.size} selected` : "Select statuses..."}
                       </Button>
                    </PopoverTrigger>
                     <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command>
                            <CommandInput placeholder="Filter statuses..." />
                            <CommandList>
                                <CommandEmpty>No statuses found.</CommandEmpty>
                                <CommandGroup>
                                    <ScrollArea className="h-48">
                                      {statuses.map(st => (
                                          <MultiSelectItem
                                            key={st.id}
                                            label={st.name}
                                            isSelected={selectedStatuses.has(st.id)}
                                            onToggle={() => setSelectedStatuses(s => toggleSetItem(s, st.id))}
                                          />
                                      ))}
                                    </ScrollArea>
                                </CommandGroup>
                            </CommandList>
                        </Command>
                     </PopoverContent>
                  </Popover>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label>Created After (optional)</Label>
                    <div className="flex gap-2">
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
                       {createdDate && <Button variant="ghost" size="icon" onClick={() => setCreatedDate(undefined)}><X className="h-4 w-4"/></Button>}
                    </div>
                    <div className="flex gap-1 pt-1 flex-wrap">
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setDateRange({ weeks: 1 }, setCreatedDate)}>1w</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setDateRange({ months: 1 }, setCreatedDate)}>1m</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setDateRange({ months: 3 }, setCreatedDate)}>3m</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setDateRange({ months: 6 }, setCreatedDate)}>6m</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setDateRange({ years: 1 }, setCreatedDate)}>1y</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setDateRange({ years: 2 }, setCreatedDate)}>2y</Button>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label>Updated After (optional)</Label>
                    <div className="flex gap-2">
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
                       {updatedDate && <Button variant="ghost" size="icon" onClick={() => setUpdatedDate(undefined)}><X className="h-4 w-4"/></Button>}
                    </div>
                    <div className="flex gap-1 pt-1 flex-wrap">
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setDateRange({ weeks: 1 }, setUpdatedDate)}>1w</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setDateRange({ months: 1 }, setUpdatedDate)}>1m</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setDateRange({ months: 3 }, setUpdatedDate)}>3m</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setDateRange({ months: 6 }, setUpdatedDate)}>6m</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setDateRange({ years: 1 }, setUpdatedDate)}>1y</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setDateRange({ years: 2 }, setUpdatedDate)}>2y</Button>
                    </div>
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
          <DialogClose asChild>
            <Button variant="outline" disabled={isFetching}>
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleFetchClick} disabled={isFetching || (activeTab === 'basic' && isBasicFetchDisabled) || (activeTab === 'jql' && !jql)}>
              {isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Fetch Issues
            </Button>
          </DialogClose>
        </DialogFooter>
      </>
  );
}
