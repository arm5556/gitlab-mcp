// Tool definitions for the 17 exposed GitLab MCP tools
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  GetMergeRequestSchema,
  ListMergeRequestDiscussionsSchema,
  ReplyToThreadSchema,
  UpdateMergeRequestSchema,
  GetVulnerabilitiesByIdsSchema,
  GetFailedTestReportSchema,
  CreateIssueSchema,
  GetIssueSchema,
  UpdateIssueSchema,
  ListIssuesSchema,
  CreateMergeRequestSchema,
  CreateMergeRequestNoteSchema,
  GetMergeRequestDiffsSchema,
  ListLabelsSchema,
  CreateLabelSchema,
  UpdateLabelSchema,
  DeleteLabelSchema
} from '../schemas/index.js';

// Define all available tools - Complete version (17 tools)
export const allTools = [
  {
    name: "get_merge_request",
    description: "Get MR metadata - details of a merge request (Either mergeRequestIid or branchName must be provided)",
    inputSchema: zodToJsonSchema(GetMergeRequestSchema),
  },
  {
    name: "get_merge_request_diffs",
    description: "Get MR code changes - retrieve the actual file changes/diffs in a merge request for code review (Either mergeRequestIid or branchName must be provided)",
    inputSchema: zodToJsonSchema(GetMergeRequestDiffsSchema),
  },
  {
    name: "get_mr_discussions",
    description: "Get code review comments from merge request discussions - Lists discussion threads on specific code lines. Use only_unresolved_comments=true (default) to get unresolved comments needing responses, or only_unresolved_comments=false to get all comments for comprehensive review.",
    inputSchema: zodToJsonSchema(ListMergeRequestDiscussionsSchema),
  },
  {
    name: "reply_to_thread",
    description: "Reply to an existing merge request discussion thread",
    inputSchema: zodToJsonSchema(ReplyToThreadSchema),
  },
  {
    name: "update_merge_request",
    description: "Append label in MR - Update a merge request including adding labels (Either mergeRequestIid or branchName must be provided)",
    inputSchema: zodToJsonSchema(UpdateMergeRequestSchema),
  },
  {
    name: "get_vulnerabilities_by_ids",
    description: "Get vulnerabilities by IDs - Fetch detailed information about multiple vulnerabilities using GraphQL",
    inputSchema: zodToJsonSchema(GetVulnerabilitiesByIdsSchema),
  },
  {
    name: "get_failed_test_cases",
    description: "Get failed test cases from a pipeline's test report (requires project_id and pipeline_id)",
    inputSchema: zodToJsonSchema(GetFailedTestReportSchema),
  },
  {
    name: "create_issue",
    description: "Create a new issue in a GitLab project with title, description, assignees, labels, and milestone",
    inputSchema: zodToJsonSchema(CreateIssueSchema),
  },
  {
    name: "get_issue",
    description: "Get details of a specific issue by its IID (internal ID)",
    inputSchema: zodToJsonSchema(GetIssueSchema),
  },
  {
    name: "update_issue",
    description: "Update an existing issue - modify title, description, assignees, labels, state, etc.",
    inputSchema: zodToJsonSchema(UpdateIssueSchema),
  },
  {
    name: "list_issues",
    description: "List issues in a GitLab project with filtering support - Filter by labels, state, assignee, author, milestone, and more. Perfect for finding issues by specific labels or other criteria.",
    inputSchema: zodToJsonSchema(ListIssuesSchema),
  },
  {
    name: "create_merge_request",
    description: "Create a new merge request in a GitLab project",
    inputSchema: zodToJsonSchema(CreateMergeRequestSchema),
  },
  {
    name: "create_merge_request_note",
    description: "Create a new note on a merge request (resolvable=false, optionally on specific diff lines)",
    inputSchema: zodToJsonSchema(CreateMergeRequestNoteSchema),
  },
  {
    name: "list_labels",
    description: "List labels for a project - Get all available labels with optional filtering by search term",
    inputSchema: zodToJsonSchema(ListLabelsSchema),
  },
  {
    name: "create_label",
    description: "Create a new label in a project - Add a new label with name, color, and optional description",
    inputSchema: zodToJsonSchema(CreateLabelSchema),
  },
  {
    name: "update_label",
    description: "Update an existing label - modify name, color, and optional description",
    inputSchema: zodToJsonSchema(UpdateLabelSchema),
  },
  {
    name: "delete_label",
    description: "Delete a label from a project - Remove a label by ID or name",
    inputSchema: zodToJsonSchema(DeleteLabelSchema),
  },
];


// Define which tools are related to wiki and can be toggled by USE_GITLAB_WIKI - Extended version (no wiki tools)
export const wikiToolNames: string[] = []; 