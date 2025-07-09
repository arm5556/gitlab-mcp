// API function exports for GitLab MCP tools

// Merge Request APIs (4 tools: get_merge_request, get_mr_discussions, reply_to_thread, update_merge_request)
export {
  getMergeRequest,
  listMergeRequestDiscussions,
  replyToThread,
  updateMergeRequest
} from './merge-requests.js';

// Vulnerability APIs (1 tool: get_vulnerabilities_by_ids)
export {
  getVulnerabilitiesByIds
} from './vulnerabilities.js';

// Pipeline APIs (1 tool: get_failed_test_cases)
export {
  getFailedTestCases
} from './pipelines.js';

// Issue APIs (4 tools: create_issue, get_issue, update_issue, list_issues)
export {
  createIssue,
  getIssue,
  updateIssue,
  listIssues
} from './issues.js';

// Merge Request Note APIs (2 tools: create_merge_request, create_merge_request_note)
export {
  createMergeRequest,
  createMergeRequestNote
} from './merge-requests.js'; 