
export interface JiraIssue {
  key: string;
  summary: string;
  issuetype: {
    id: string;
    name: string;
  };
  status: {
    id: string;
    name: string;
    statusCategory: {
      name: 'To Do' | 'In Progress' | 'Done';
    };
  };
  priority: {
    name: string;
  } | null;
  reporter: {
    displayName: string;
  } | null;
  assignee: {
    displayName: string;
  } | null;
  created: string; // ISO string
  updated: string; // ISO string
  resolved: string | null; // ISO string
  components: { name: string }[];
  labels: string[];
  fix_versions: { name: string }[];
  
  // Standard custom fields (IDs can vary)
  story_points: number | null; // Example: Story Points
  sprint_names: string[];

  // Time tracking (in seconds)
  time_original_estimate_hours: number | null;
  time_spent_hours: number | null;

  // Advanced metrics & calculated fields (may not be direct from API)
  lead_time_days?: number | null;
  cycle_time_days?: number | null;
  sla_met?: boolean | null;
  budget?: number | null;
  labor_cost?: number | null;
  other_expenses?: number | null;
  actual_cost?: number | null;
  revenue?: number | null;
  
  // The changelog is crucial and must be expanded in the API call (e.g., ?expand=changelog).
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
}

export interface JiraCredentials {
    url: string;
    email: string;
    token: string;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
}


export interface JiraIssueType {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  subtask: boolean;
}

export interface JiraStatus {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  statusCategory: {
    name: string;
  }
}
