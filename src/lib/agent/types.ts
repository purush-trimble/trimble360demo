import type { SavedWorkflowConfig } from "@/lib/types";
import type { WorksManagerProject } from "@/lib/types";

export type AgentUIAction =
  | { type: "create_design"; accountId: string; suggestedName?: string; workflowId?: string; config?: SavedWorkflowConfig }
  | { type: "create_vcl_design"; workflowId?: string; config?: SavedWorkflowConfig; restart?: boolean }
  | { type: "connect_file_browser"; accountId: string }
  | { type: "worksmanager_design_list"; accountId: string; projectId?: string; projectName?: string; workflowId?: string; config?: SavedWorkflowConfig }
  | { type: "device_management"; projectId?: string; projectName?: string; workflowId?: string; config?: SavedWorkflowConfig }
  | { type: "project_loading"; targetAction: "worksmanager_design_list" | "device_management" }
  | { type: "project_picker"; targetAction: "worksmanager_design_list" | "device_management"; projects: WorksManagerProject[] }
  | { type: "project_processing"; targetAction: "worksmanager_design_list" | "device_management"; projectId: string; projectName: string }
  | { type: "b2westimate_list"; accountId: string }
  | { type: "autobid_list"; accountId: string }
  | { type: "publish_connect_to_wm" }
  | { type: "suggestions"; prompts: string[] }
  | { type: "text"; message: string }
  | { type: "agent_working"; stage: number; resultText: string; result?: AgentUIAction };

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  uiAction?: AgentUIAction;
  createdAt: string;
}
