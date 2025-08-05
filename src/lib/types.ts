
export interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    issuetype: {
      name: string;
    };
    status: {
      name: string;
      statusCategory: {
        name: 'To Do' | 'In Progress' | 'Done';
      };
    };
    priority: {
      name: string;
    };
    reporter: {
      displayName: string;
    };
    assignee: {
      displayName: string;
    } | null;
    created: string; // ISO string
    updated: string; // ISO string
    resolutiondate: string | null; // ISO string
    components: { name: string }[];
    labels: string[];
    fixVersions: { name: string }[];
    
    // Standard custom fields (IDs can vary)
    customfield_10016: number | null; // Example: Story Points
    sprint: {
      id: number;
      name: string;
      state: 'active' | 'closed' | 'future';
    }[] | null;

    // Time tracking (in seconds)
    timeoriginalestimate: number | null;
    timespent: number | null;

    // Advanced metrics & calculated fields (may not be direct from API)
    lead_time_days?: number | null;
    cycle_time_days?: number | null;
    sla_met?: boolean | null;
    budget?: number | null;
    labor_cost?: number | null;
    other_expenses?: number | null;
    actual_cost?: number | null;
    revenue?: number | null;
  };
  
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
