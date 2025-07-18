// Merge Request API functions for GitLab MCP
import fetch from 'node-fetch';
import * as z from 'zod';
import { 
  GITLAB_API_URL, 
  DEFAULT_FETCH_CONFIG 
} from '../config/gitlab.js';
import { 
  handleGitLabError, 
  validateGitLabToken,
  fetchAllPages
} from '../utils/index.js';
import {
  GitLabMergeRequestSchema,
  OptimizedGitLabMergeRequestSchema,
  streamlineMergeRequest,
  GitLabDiscussionSchema,
  OptimizedGitLabDiscussionSchema,
  streamlineDiscussion,
  GitLabDiscussionNoteSchema,
  OptimizedCreatedNoteSchema,
  streamlineCreatedNote,
  PaginatedDiscussionResponseSchema,
  GetMergeRequestSchema,
  ListMergeRequestDiscussionsSchema,
  ReplyToThreadSchema,
  UpdateMergeRequestSchema,
  CreateMergeRequestSchema,
  CreateMergeRequestNoteSchema,
  GitLabMergeRequestDiffSchema,
  OptimizedGitLabMergeRequestDiffSchema,
  streamlineMergeRequestDiff,
  GetMergeRequestDiffsSchema,
  type GitLabMergeRequest,
  type OptimizedGitLabMergeRequest,
  type GitLabDiscussion,
  type OptimizedGitLabDiscussion,
  type GitLabDiscussionNote,
  type OptimizedCreatedNote,
  type PaginatedDiscussionResponse,
  type CreateMergeRequestOptions,
  type CreateMergeRequestNoteOptions,
  type GitLabMergeRequestDiff,
  type OptimizedGitLabMergeRequestDiff
} from '../schemas/index.js';

/**
 * Get merge request details by IID or branch name
 * (for get_merge_request tool)
 */
export async function getMergeRequest(
  projectId: string,
  mergeRequestIid?: number,
  branchName?: string
): Promise<OptimizedGitLabMergeRequest> {
  validateGitLabToken();
  projectId = decodeURIComponent(projectId);

  let url: string;
  if (mergeRequestIid) {
    url = `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/merge_requests/${mergeRequestIid}`;
  } else if (branchName) {
    url = `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/merge_requests?source_branch=${encodeURIComponent(branchName)}&state=opened`;
  } else {
    throw new Error("Either mergeRequestIid or branchName must be provided");
  }

  const response = await fetch(url, DEFAULT_FETCH_CONFIG);
  await handleGitLabError(response);
  const data = await response.json();

  if (branchName) {
    if (Array.isArray(data) && data.length > 0) {
      const fullMR = GitLabMergeRequestSchema.parse(data[0]);
      return streamlineMergeRequest(fullMR);
    } else {
      throw new Error(`No open merge request found for branch: ${branchName}`);
    }
  }

  const fullMR = GitLabMergeRequestSchema.parse(data);
  return streamlineMergeRequest(fullMR);
}

/**
 * List unresolved diff discussions for a merge request with pagination
 * (for get_mr_discussions tool)
 */
export async function listMergeRequestDiscussions(
  projectId: string,
  mergeRequestIid: number,
  page: number = 1,
  perPage: number = 20,
  onlyUnresolvedComments: boolean = true
): Promise<PaginatedDiscussionResponse> {
  validateGitLabToken();
  projectId = decodeURIComponent(projectId);
  
  // Validate parameters
  const validPage = Math.max(page, 1);
  const validPerPage = Math.min(Math.max(perPage, 1), 50); // Cap at 50 for token efficiency

  const baseUrl = `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/merge_requests/${mergeRequestIid}/discussions`;
  
  // Fetch ALL discussions (single API call)
  const allDiscussions = await fetchAllPages(
    baseUrl,
    (data) => z.array(GitLabDiscussionSchema).parse(data),
    50 // Reasonable limit for discussions (50 pages * 100 per page = 5000 discussions max)
  );
  
  // Filter discussions based on onlyUnresolvedComments parameter
  const filteredDiscussions = onlyUnresolvedComments 
    ? allDiscussions.filter(discussion => {
        const hasUnresolvedDiffNotes = discussion.notes?.some(note => 
          note.type === 'DiffNote' && 
          note.resolvable === true && 
          note.resolved === false
        );
        return hasUnresolvedDiffNotes;
      })
    : allDiscussions; // Return all discussions when onlyUnresolvedComments is false

  // Calculate pagination
  const totalDiscussions = filteredDiscussions.length;
  const totalPages = Math.ceil(totalDiscussions / validPerPage);
  const startIndex = (validPage - 1) * validPerPage;
  const endIndex = startIndex + validPerPage;
  
  // Get discussions for current page
  const pageDiscussions = filteredDiscussions
    .slice(startIndex, endIndex)
    .map(discussion => streamlineDiscussion(discussion));

  return {
    total_unresolved: onlyUnresolvedComments ? totalDiscussions : allDiscussions.filter(discussion => {
      const hasUnresolvedDiffNotes = discussion.notes?.some(note => 
        note.type === 'DiffNote' && 
        note.resolvable === true && 
        note.resolved === false
      );
      return hasUnresolvedDiffNotes;
    }).length,
    total_pages: totalPages,
    current_page: validPage,
    per_page: validPerPage,
    discussions: pageDiscussions,
  };
}

/**
 * Reply to an existing merge request thread
 * (for reply_to_thread tool)
 */
export async function replyToThread(
  projectId: string,
  mergeRequestIid: number,
  discussionId: string,
  body: string
): Promise<OptimizedCreatedNote> {
  validateGitLabToken();
  projectId = decodeURIComponent(projectId);

  const url = `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/merge_requests/${mergeRequestIid}/discussions/${discussionId}/notes`;

  const requestBody = { body };

  const response = await fetch(url, {
    ...DEFAULT_FETCH_CONFIG,
    method: "POST",
    body: JSON.stringify(requestBody),
  });

  await handleGitLabError(response);
  const data = await response.json();
  const fullNote = GitLabDiscussionNoteSchema.parse(data);
  return streamlineCreatedNote(fullNote);
}

/**
 * Update a merge request (including adding labels)
 * (for update_merge_request tool)
 */
export async function updateMergeRequest(
  projectId: string,
  options: Omit<
    z.infer<typeof UpdateMergeRequestSchema>,
    "project_id" | "merge_request_iid" | "source_branch"
  >,
  mergeRequestIid?: number,
  branchName?: string
): Promise<OptimizedGitLabMergeRequest> {
  validateGitLabToken();
  projectId = decodeURIComponent(projectId);

  let finalMergeRequestIid = mergeRequestIid;
  
  // If no IID provided but branch name is provided, get the MR IID
  if (!finalMergeRequestIid && branchName) {
    const mr = await getMergeRequest(projectId, undefined, branchName);
    finalMergeRequestIid = mr.iid;
  }

  if (!finalMergeRequestIid) {
    throw new Error("Either mergeRequestIid or branchName must be provided");
  }

  const url = `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/merge_requests/${finalMergeRequestIid}`;

  const response = await fetch(url, {
    ...DEFAULT_FETCH_CONFIG,
    method: "PUT",
    body: JSON.stringify(options),
  });

  await handleGitLabError(response);
  const data = await response.json();
  const fullMR = GitLabMergeRequestSchema.parse(data);
  return streamlineMergeRequest(fullMR);
}

/**
 * Create a new merge request
 * (for create_merge_request tool)
 */
export async function createMergeRequest(
  projectId: string,
  options: Omit<CreateMergeRequestOptions, "project_id">
): Promise<OptimizedGitLabMergeRequest> {
  validateGitLabToken();
  projectId = decodeURIComponent(projectId);

  const url = `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/merge_requests`;

  const response = await fetch(url, {
    ...DEFAULT_FETCH_CONFIG,
    method: "POST",
    body: JSON.stringify(options),
  });

  await handleGitLabError(response);
  const data = await response.json();
  const fullMR = GitLabMergeRequestSchema.parse(data);
  return streamlineMergeRequest(fullMR);
}

/**
 * Create a new note on a merge request (resolvable = false)
 * (for create_merge_request_note tool)
 */
export async function createMergeRequestNote(
  projectId: string,
  mergeRequestIid: number,
  body: string,
  position?: CreateMergeRequestNoteOptions['position'],
  createdAt?: string
): Promise<OptimizedCreatedNote> {
  validateGitLabToken();
  projectId = decodeURIComponent(projectId);

  const url = `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/merge_requests/${mergeRequestIid}/notes`;

  const requestBody: any = { body };
  if (position) {
    requestBody.position = position;
  }
  if (createdAt) {
    requestBody.created_at = createdAt;
  }

  const response = await fetch(url, {
    ...DEFAULT_FETCH_CONFIG,
    method: "POST",
    body: JSON.stringify(requestBody),
  });

  await handleGitLabError(response);
  const data = await response.json();
  const fullNote = GitLabDiscussionNoteSchema.parse(data);
  return streamlineCreatedNote(fullNote);
} 

/**
 * Get merge request changes/diffs by IID or branch name
 * (for get_merge_request_diffs tool)
 */
export async function getMergeRequestDiffs(
  projectId: string,
  mergeRequestIid?: number,
  branchName?: string,
  view?: "inline" | "parallel"
): Promise<OptimizedGitLabMergeRequestDiff[]> {
  validateGitLabToken();
  projectId = decodeURIComponent(projectId);
  
  if (!mergeRequestIid && !branchName) {
    throw new Error("Either mergeRequestIid or branchName must be provided");
  }

  // If branch name is provided, get the MR IID first
  if (branchName && !mergeRequestIid) {
    const mergeRequest = await getMergeRequest(projectId, undefined, branchName);
    mergeRequestIid = mergeRequest.iid;
  }

  const url = new URL(
    `${GITLAB_API_URL}/projects/${encodeURIComponent(projectId)}/merge_requests/${mergeRequestIid}/changes`
  );

  if (view) {
    url.searchParams.append("view", view);
  }

  const response = await fetch(url, DEFAULT_FETCH_CONFIG);
  await handleGitLabError(response);
  
  const data = await response.json() as { changes: unknown };
  const fullDiffs = z.array(GitLabMergeRequestDiffSchema).parse(data.changes);
  
  // Transform to optimized format for AI agents
  return fullDiffs.map(streamlineMergeRequestDiff);
} 