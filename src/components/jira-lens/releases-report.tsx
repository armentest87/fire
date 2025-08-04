'use client';
import { type JiraIssue } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "../ui/table";
import { Badge } from "../ui/badge";

const PlaceholderCard = ({ title, description }: { title: string, description: string }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="h-64 bg-muted/50 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Chart placeholder</p>
            </div>
        </CardContent>
    </Card>
)

export function ReleasesReport({ issues }: { issues: JiraIssue[] }) {
    if (!issues || issues.length === 0) {
        return <p>No issue data to display for Releases Report.</p>;
    }
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                 <h2 className="text-xl font-bold">Releases Report</h2>
                <div className="flex flex-wrap gap-4">
                     <Select defaultValue="all-projects">
                        <SelectTrigger className="w-48"><SelectValue placeholder="Select Projects" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all-projects">BI Cloud & Server</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select defaultValue="all-versions">
                        <SelectTrigger className="w-48"><SelectValue placeholder="Select Version" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all-versions">All Versions</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="released">
                        <SelectTrigger className="w-48"><SelectValue placeholder="Release Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="released">Released</SelectItem>
                            <SelectItem value="unreleased">Unreleased</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select defaultValue="not-archived">
                        <SelectTrigger className="w-48"><SelectValue placeholder="Archived Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="not-archived">Not Archived</SelectItem>
                             <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <PlaceholderCard title="Issues by Type" description="Distribution of issues by type (Task vs. Bug)." />
                 <PlaceholderCard title="Issues Over Time" description="Daily breakdown of created issues by type." />
                 <PlaceholderCard title="Cumulative Issues Over Time" description="Cumulative growth of issues over time." />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                 <PlaceholderCard title="Issues and Versions Over Time" description="Monthly breakdown of issues and versions." />
                 <Card>
                    <CardHeader>
                        <CardTitle>Detailed Release Information</CardTitle>
                        <CardDescription>Granular details for each version and issue.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="border rounded-md overflow-hidden h-96">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Version</TableHead>
                                        <TableHead>Issue</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead className="text-right">Logged (h)</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-full text-center text-muted-foreground">
                                            Detailed release data will be shown here.
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                         </div>
                    </CardContent>
                 </Card>
            </div>
        </div>
    );
}