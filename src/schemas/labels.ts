import { z } from "zod";

// List Labels schema
export const ListLabelsSchema = z.object({
  project_id: z.string().describe("Project ID or URL-encoded path"),
  search: z.string().optional().describe("Keyword to filter labels by"),
  include_ancestor_groups: z.boolean().optional().describe("Include ancestor groups"),
  with_counts: z.boolean().optional().describe("Whether or not to include issue and merge request counts"),
});

// Create Label schema  
export const CreateLabelSchema = z.object({
  project_id: z.string().describe("Project ID or URL-encoded path"),
  name: z.string().describe("The name of the label"),
  color: z.string().describe("The color of the label given in 6-digit hex notation with leading '#' sign"),
  description: z.string().optional().describe("The description of the label"),
  priority: z.number().nullable().optional().describe("The priority of the label"),
});

// Update Label schema
export const UpdateLabelSchema = z.object({
  project_id: z.string().describe("Project ID or URL-encoded path"),
  label_id: z.union([z.number(), z.string()]).describe("The ID or title of a project's label"),
  new_name: z.string().optional().describe("The new name of the label"),
  color: z.string().optional().describe("The color of the label given in 6-digit hex notation with leading '#' sign"),
  description: z.string().optional().describe("The new description of the label"),
  priority: z.number().nullable().optional().describe("The new priority of the label"),
});

// Delete Label schema
export const DeleteLabelSchema = z.object({
  project_id: z.string().describe("Project ID or URL-encoded path"),
  label_id: z.union([z.number(), z.string()]).describe("The ID or title of a project's label"),
});

// Type exports (GitLabLabel and GitLabLabelSchema are already exported from issues.ts)
export type ListLabelsOptions = z.infer<typeof ListLabelsSchema>;
export type CreateLabelOptions = z.infer<typeof CreateLabelSchema>;
export type UpdateLabelOptions = z.infer<typeof UpdateLabelSchema>;
export type DeleteLabelOptions = z.infer<typeof DeleteLabelSchema>; 