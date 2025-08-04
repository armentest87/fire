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
import { Loader2 } from 'lucide-react';

interface FetchDataDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFetch: (jql: string) => void;
  isFetching: boolean;
}

export function FetchDataDialog({ isOpen, onOpenChange, onFetch, isFetching }: FetchDataDialogProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'jql'>('basic');
  const [projectKey, setProjectKey] = useState('PROJ');
  const [jql, setJql] = useState('project = PROJ ORDER BY created DESC');

  const handleFetchClick = () => {
    if (activeTab === 'basic') {
      onFetch(`project = ${projectKey.trim()}`);
    } else {
      onFetch(jql);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Fetch Jira Data</DialogTitle>
          <DialogDescription>
            Choose to fetch by project key or use a custom JQL query.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'basic' | 'jql')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="jql">JQL</TabsTrigger>
          </TabsList>
          <TabsContent value="basic">
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project-key">Project Key</Label>
                <Input 
                  id="project-key" 
                  placeholder="E.g., PROJ, TEST" 
                  value={projectKey}
                  onChange={(e) => setProjectKey(e.target.value)}
                />
              </div>
               <p className="text-xs text-muted-foreground">More basic filters coming soon!</p>
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
                  className="min-h-[100px] font-code"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isFetching}>
            Cancel
          </Button>
          <Button onClick={handleFetchClick} disabled={isFetching || (activeTab === 'basic' && !projectKey) || (activeTab === 'jql' && !jql)}>
            {isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Fetch Issues
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
