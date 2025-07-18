import { z } from "zod";
import { GitLabUserSchema, GitLabHeadPipelineSchema, GitLabMergeRequestDiffRefSchema, ProjectParamsSchema } from "./base.js";

// Merge Request Diff schemas
export const GitLabMergeRequestDiffSchema = z.object({
  old_path: z.string(),
  new_path: z.string(),
  a_mode: z.string().optional(),
  b_mode: z.string().optional(),
  new_file: z.boolean(),
  renamed_file: z.boolean(),
  deleted_file: z.boolean(),
  diff: z.string(),
});

// Optimized Merge Request Diff schema - minimal fields for AI agents
export const OptimizedGitLabMergeRequestDiffSchema = z.object({
  old_path: z.string(),
  new_path: z.string(), 
  new_file: z.boolean(),
  renamed_file: z.boolean(),
  deleted_file: z.boolean(),
  diff: z.string(),
});

// Optimized Merge Request schema - only essential fields for AI agents
export const OptimizedGitLabMergeRequestSchema = z.object({
  iid: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  state: z.string(),
  merged: z.boolean().optional(),
  draft: z.boolean().optional(),
  author: z.object({
    username: z.string(),
  }),
  assignees: z.array(z.object({
    username: z.string(),
  })).optional(),
  source_branch: z.string(),
  target_branch: z.string(),
  head_pipeline: z.object({
    id: z.number(),
    iid: z.number().optional(),
    project_id: z.number(),
    status: z.string(),
  }).nullable().optional(),
  web_url: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  labels: z.array(z.string()).optional(),
});

// Full Merge Request schema (for validation of GitLab API responses)
export const GitLabMergeRequestSchema = z.object({
  id: z.number(),
  iid: z.number(),
  project_id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  state: z.string(),
  merged: z.boolean().optional(),
  draft: z.boolean().optional(),
  author: GitLabUserSchema,
  assignees: z.array(GitLabUserSchema).optional(),
  source_branch: z.string(),
  target_branch: z.string(),
  diff_refs: GitLabMergeRequestDiffRefSchema.nullable().optional(),
  head_pipeline: GitLabHeadPipelineSchema.nullable().optional(),
  web_url: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  merged_at: z.string().nullable(),
  closed_at: z.string().nullable(),
  merge_commit_sha: z.string().nullable(),
  detailed_merge_status: z.string().optional(),
  merge_status: z.string().optional(),
  merge_error: z.string().nullable().optional(),
  work_in_progress: z.boolean().optional(),
  blocking_discussions_resolved: z.boolean().optional(),
  should_remove_source_branch: z.boolean().nullable().optional(),
  force_remove_source_branch: z.boolean().nullable().optional(),
  allow_collaboration: z.boolean().optional(),
  allow_maintainer_to_push: z.boolean().optional(),
  changes_count: z.string().nullable().optional(),
  merge_when_pipeline_succeeds: z.boolean().optional(),
  squash: z.boolean().optional(),
  labels: z.array(z.string()).optional(),
});

/**
 * Transform full GitLab MR response to optimized format for AI agents
 */
export function streamlineMergeRequest(fullMR: any): z.infer<typeof OptimizedGitLabMergeRequestSchema> {
  return {
    iid: fullMR.iid,
    title: fullMR.title,
    description: fullMR.description,
    state: fullMR.state,
    merged: fullMR.merged,
    draft: fullMR.draft,
    author: {
      username: fullMR.author?.username,
    },
    assignees: fullMR.assignees?.map((assignee: any) => ({
      username: assignee.username,
    })),
    source_branch: fullMR.source_branch,
    target_branch: fullMR.target_branch,
    head_pipeline: fullMR.head_pipeline ? {
      id: fullMR.head_pipeline.id,
      iid: fullMR.head_pipeline.iid,
      project_id: fullMR.head_pipeline.project_id,
      status: fullMR.head_pipeline.status,
    } : null,
    web_url: fullMR.web_url,
    created_at: fullMR.created_at,
    updated_at: fullMR.updated_at,
    labels: fullMR.labels,
  };
}

/**
 * Transform full GitLab MR diff response to optimized format for AI agents
 * Removes unnecessary mode information and focuses on essential diff data
 */
export function streamlineMergeRequestDiff(fullDiff: any): z.infer<typeof OptimizedGitLabMergeRequestDiffSchema> {
  return {
    old_path: fullDiff.old_path,
    new_path: fullDiff.new_path,
    new_file: fullDiff.new_file,
    renamed_file: fullDiff.renamed_file,
    deleted_file: fullDiff.deleted_file,
    diff: fullDiff.diff,
  };
}



// Input schemas for MR operations
export const GetMergeRequestSchema = ProjectParamsSchema.extend({
  merge_request_iid: z.number().optional().describe("The IID of a merge request"),
  source_branch: z.string().optional().describe("Source branch name"),
});

export const GetMergeRequestDiffsSchema = ProjectParamsSchema.extend({
  merge_request_iid: z.number().optional().describe("The IID of a merge request"),
  source_branch: z.string().optional().describe("Source branch name"),
  view: z.enum(["inline", "parallel"]).optional().describe("Diff view type (inline or parallel)"),
});

export const ListMergeRequestDiscussionsSchema = ProjectParamsSchema.extend({
  merge_request_iid: z.number().describe("The IID of a merge request"),
  page: z.number().optional().describe("Page number (default: 1)"),
  per_page: z.number().optional().describe("Discussions per page (default: 20, max: 50)"),
  only_unresolved_comments: z.boolean().optional().describe("When true, list only unresolved comments for code fix in MR. When false, list all comments (default: true)"),
});

export const ReplyToThreadSchema = ProjectParamsSchema.extend({
  merge_request_iid: z.number().describe("The IID of a merge request"),
  discussion_id: z.string().describe("The ID of a thread"),
  body: z.string().describe("The content of the note or reply"),
});

export const UpdateMergeRequestSchema = ProjectParamsSchema.extend({
  merge_request_iid: z.number().optional().describe("The IID of a merge request"),
  source_branch: z.string().optional().describe("Source branch name"),
  title: z.string().optional().describe("The title of the merge request"),
  description: z.string().optional().describe("The description of the merge request"),
  target_branch: z.string().optional().describe("The target branch"),
  assignee_ids: z.array(z.number()).optional().describe("The ID of the users to assign the MR to"),
  labels: z.array(z.string()).optional().describe("Labels for the MR"),
  state_event: z.enum(["close", "reopen"]).optional().describe("New state (close/reopen) for the MR"),
  remove_source_branch: z.boolean().optional().describe("Flag indicating if the source branch should be removed"),
  squash: z.boolean().optional().describe("Squash commits into a single commit when merging"),
  draft: z.boolean().optional().describe("Work in progress merge request"),
});

// Input schema for creating a merge request
export const CreateMergeRequestSchema = ProjectParamsSchema.extend({
  title: z.string().describe("The title of the merge request"),
  description: z.string().optional().describe("The description of the merge request"),
  source_branch: z.string().describe("The name of the source branch"),
  target_branch: z.string().describe("The name of the target branch"),
  draft: z.boolean().optional().describe("Mark the merge request as a draft"),
  allow_collaboration: z.boolean().optional().describe("Allow commits from members who can merge to the target branch"),
  assignee_ids: z.array(z.number()).optional().describe("The ID of the users to assign the MR to"),
  labels: z.array(z.string()).optional().describe("Labels for the MR"),
});

// Types
export type GitLabMergeRequest = z.infer<typeof GitLabMergeRequestSchema>;
export type OptimizedGitLabMergeRequest = z.infer<typeof OptimizedGitLabMergeRequestSchema>;
export type GitLabMergeRequestDiff = z.infer<typeof GitLabMergeRequestDiffSchema>;
export type OptimizedGitLabMergeRequestDiff = z.infer<typeof OptimizedGitLabMergeRequestDiffSchema>;
export type CreateMergeRequestOptions = z.infer<typeof CreateMergeRequestSchema>; 