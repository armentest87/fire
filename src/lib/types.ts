export interface JiraIssue {
  key: string;
  summary: string;
  issuetype: string;
  status: string;
  status_category: 'To Do' | 'In Progress' | 'Done';
  priority: string;
  reporter: string;
  assignee: string;
  created: string; // ISO string
  updated: string; // ISO string
  resolved: string | null; // ISO string
  components: string[];
  labels: string[];
  fix_versions: string[];
  story_points: number | null;
  sprint_names: string[];
  time_original_estimate_hours: number | null;
  time_spent_hours: number | null;
  changelog: {
    histories: {
      created: string; // ISO string
      items: {
        field: string;
        fromString: string | null;
        toString: string | null;
      }[];
    }[];
  };
  // New fields for advanced analytics
  lead_time_days?: number | null;
  cycle_time_days?: number | null;
  sla_met?: boolean | null;
  budget?: number | null;
  actual_cost?: number | null;
  revenue?: number | null;
  other_expenses?: number | null;
  labor_cost?: number | null;
}


export interface JiraCredentials {
    url: string;
    email: string;
    token: string;
}
