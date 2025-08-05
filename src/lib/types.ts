export interface JiraIssue {
  key: string;
  summary: string;
  issuetype: string;
  status: string;
  status_category: 'To Do' | 'In Progress' | 'Done';
  priority: string;
  reporter: string;
  assignee: string | null;
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
  
  // Advanced metrics & calculated fields
  lead_time_days?: number | null;
  cycle_time_days?: number | null;
  sla_met?: boolean | null;
  budget?: number | null;
  labor_cost?: number | null;
  other_expenses?: number | null;
  actual_cost?: number | null;
  revenue?: number | null;

  // The changelog is crucial for the Cumulative Flow Diagram.
  // It must be expanded in the Jira API call (e.g., ?expand=changelog).
  changelog: {
    histories: {
      created: string; // ISO string
      items: {
        field: string; // e.g., "status"
        fromString: string | null; // e.g., "To Do"
        toString: string | null; // e.g., "In Progress"
      }[];
    }[];
  };
}

export interface JiraCredentials {
    url: string;
    email: string;
    token: string;
}
