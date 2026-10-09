import type { PluginId } from "@/lib/types";
import { INTENTS } from "@/lib/agent/intents";
import { PLUGIN_CATALOG } from "@/lib/pluginCatalog";

export type LifecyclePhase = "bid" | "design" | "build";
export type SolutionGroup = "design" | "construction" | "geospatial" | "transportation";
/** Status = understand the job; Execute = change something on the project. */
export type WidgetIntent = "status" | "execute";

/** Multi-product feature mix for one activity on a project phase (handbook widget). */
export interface ActivityWidget {
  id: string;
  name: string;
  intent: WidgetIntent;
  phases: LifecyclePhase[];
  valueStory: string;
  solutionIds: string[];
  featureIds: string[];
}

export interface OrgAccount {
  id: string;
  name: string;
  region: string;
  /** Trimble solution areas this organization has licensed. */
  solutionIds: string[];
}

export interface OrgProject {
  id: string;
  accountId: string;
  name: string;
  phase: LifecyclePhase;
  status: string;
  /** Why this job should not open every Trimble product. */
  value: string;
}

export interface ProductFeature {
  id: string;
  productId: PluginId;
  alsoRequires?: PluginId[];
  name: string;
  description: string;
  phase: LifecyclePhase;
  prompt: string;
}

export interface Solution {
  id: string;
  group: SolutionGroup;
  name: string;
  description: string;
  /** Demo products that can open a chat card for this solution. */
  pluginIds?: PluginId[];
  featureIds?: string[];
}

export const PHASE_LABEL: Record<LifecyclePhase, string> = {
  bid: "Bid",
  design: "Design",
  build: "Build",
};

export const SOLUTION_GROUPS: { id: SolutionGroup; label: string }[] = [
  { id: "design", label: "Design and detailing" },
  { id: "construction", label: "Construction management" },
  { id: "geospatial", label: "Geospatial and positioning" },
  { id: "transportation", label: "Transportation and logistics" },
];

export const SOLUTIONS: Solution[] = [
  {
    id: "bim",
    group: "design",
    name: "3D modeling and BIM",
    description: "Coordinate the model that the rest of the job is built from.",
    pluginIds: ["connect"],
    featureIds: ["connect_files"],
  },
  {
    id: "detailing",
    group: "design",
    name: "Constructible detailing",
    description: "Turn the model into details the field and shop can build.",
  },
  {
    id: "fabrication",
    group: "design",
    name: "Fabrication planning and management",
    description: "Track shop production against the model.",
  },
  {
    id: "steel",
    group: "design",
    name: "Steel detailing",
    description: "Produce steel drawings and fabrication data from the model.",
  },
  {
    id: "structural",
    group: "design",
    name: "Structural analysis and design",
    description: "Check the structure before it is issued for construction.",
  },
  {
    id: "site-planning",
    group: "design",
    name: "Site planning and coordination",
    description: "Align the team on the site model before work starts.",
    pluginIds: ["connect", "worksmanager"],
    featureIds: ["connect_files", "create_design"],
  },
  {
    id: "assets",
    group: "construction",
    name: "Asset lifecycle management",
    description: "Follow equipment and installed assets across the job.",
  },
  {
    id: "collaboration",
    group: "construction",
    name: "Collaboration",
    description: "Share the project files every role on this job actually needs.",
    pluginIds: ["connect"],
    featureIds: ["connect_files"],
  },
  {
    id: "hr",
    group: "construction",
    name: "Construction human resources management",
    description: "Payroll, onboarding, and crew compliance.",
  },
  {
    id: "estimating",
    group: "construction",
    name: "Estimating and takeoff",
    description: "Price the work from quantities, estimates, and bid packages.",
    pluginIds: ["b2westimate", "autobid"],
    featureIds: ["b2w_estimates", "autobid_bids"],
  },
  {
    id: "field-service",
    group: "construction",
    name: "Field service management",
    description: "Dispatch technicians and close out service work.",
  },
  {
    id: "financials",
    group: "construction",
    name: "Financial management",
    description: "Job cost, cash, and the books behind the project.",
  },
  {
    id: "permitting",
    group: "construction",
    name: "Permitting and licensing",
    description: "Track permits and land constraints for the site.",
  },
  {
    id: "project-mgmt",
    group: "construction",
    name: "Project management",
    description: "Keep the job's designs and deliverables in one place.",
    pluginIds: ["worksmanager", "connect"],
    featureIds: ["wm_designs", "create_design"],
  },
  {
    id: "field-systems",
    group: "geospatial",
    name: "Building construction field systems",
    description: "Carry the model into layout and field verification.",
    pluginIds: ["worksmanager"],
    featureIds: ["wm_designs"],
  },
  {
    id: "machine-control",
    group: "geospatial",
    name: "Machine control",
    description: "Publish designs the machines on this job can run.",
    pluginIds: ["connect", "worksmanager"],
    featureIds: ["publish_to_wm", "wm_designs"],
  },
  {
    id: "survey",
    group: "geospatial",
    name: "Surveying and mapping",
    description: "Work from the same survey files as the office.",
    pluginIds: ["connect"],
    featureIds: ["connect_files"],
  },
  {
    id: "routing",
    group: "transportation",
    name: "Routing and optimization",
    description: "Plan truck routes for material moving to and from the job.",
  },
  {
    id: "supply-chain",
    group: "transportation",
    name: "Supply chain tracking, visibility and safety",
    description: "See loads in transit instead of calling the scale house.",
  },
  {
    id: "tms",
    group: "transportation",
    name: "Transportation management",
    description: "Run orders, carriers, and delivery against the project schedule.",
  },
  {
    id: "fleet",
    group: "transportation",
    name: "Telematics and fleet management",
    description: "Watch the trucks and operators assigned to this haul.",
  },
];

export const ACCOUNTS: OrgAccount[] = [
  {
    id: "acct-morgan",
    name: "Morgan Construction Co.",
    region: "Heavy civil",
    solutionIds: ["bim", "site-planning", "collaboration", "estimating", "project-mgmt", "field-systems", "machine-control", "survey"],
  },
  {
    id: "acct-harbor",
    name: "Harbor Civil Group",
    region: "Marine and utilities",
    solutionIds: ["bim", "structural", "site-planning", "collaboration", "project-mgmt", "field-systems", "machine-control", "survey"],
  },
  {
    id: "acct-summit",
    name: "Summit Bid Partners",
    region: "Preconstruction",
    solutionIds: ["bim", "site-planning", "collaboration", "estimating", "project-mgmt"],
  },
  {
    id: "acct-apex",
    name: "Apex Fabrication",
    region: "Steel",
    solutionIds: ["bim", "detailing", "fabrication", "steel", "collaboration"],
  },
  {
    id: "acct-northline",
    name: "Northline Haulage",
    region: "Materials transport",
    solutionIds: ["collaboration", "routing", "supply-chain", "tms", "fleet"],
  },
];

export const PROJECTS: OrgProject[] = [
  {
    id: "proj-north-ridge",
    accountId: "acct-morgan",
    name: "North Ridge Highway",
    phase: "build",
    status: "Active",
    value: "The field crew runs machine control and survey from one profile. Estimating, payroll, and fleet stay closed.",
  },
  {
    id: "proj-valley",
    accountId: "acct-morgan",
    name: "Valley Interchange",
    phase: "bid",
    status: "Planning",
    value: "Precon prices the interchange from takeoff and bids. Machine control stays off until the job is awarded.",
  },
  {
    id: "proj-pier4",
    accountId: "acct-harbor",
    name: "Pier 4 Rehabilitation",
    phase: "design",
    status: "Active",
    value: "Design coordinates the model, structural checks, and the site plan. No bid desk and no truck routing.",
  },
  {
    id: "proj-east-dock",
    accountId: "acct-harbor",
    name: "East Dock Utilities",
    phase: "build",
    status: "Active",
    value: "The field engineer publishes designs to machines and checks survey. Steel detailing and telematics belong to other contracts.",
  },
  {
    id: "proj-i5",
    accountId: "acct-summit",
    name: "I-5 Overlay Bid",
    phase: "bid",
    status: "Due this week",
    value: "Estimators win the overlay from takeoff and bid tabs. They never open machine control.",
  },
  {
    id: "proj-campus",
    accountId: "acct-summit",
    name: "Campus Site Package",
    phase: "design",
    status: "Draft",
    value: "Site planners coordinate the model with the owner. Fabrication and fleet are outside this contract.",
  },
  {
    id: "proj-girders",
    accountId: "acct-apex",
    name: "River Crossing Girders",
    phase: "design",
    status: "In the shop",
    value: "Detailers produce steel and fabrication data from the model. The jobsite machines are a different company's tools.",
  },
  {
    id: "proj-haul",
    accountId: "acct-northline",
    name: "North Ridge Aggregate Haul",
    phase: "build",
    status: "Hauling",
    value: "Dispatch routes trucks and watches the fleet. BIM and machine control stay with the contractor.",
  },
];

export const FEATURES: ProductFeature[] = [
  {
    id: "connect_files",
    productId: "connect",
    name: "Browse project files",
    description: "Open the shared files for this job without leaving the workspace.",
    phase: "design",
    prompt: "show my Connect files",
  },
  {
    id: "create_design",
    productId: "worksmanager",
    alsoRequires: ["connect"],
    name: "Create a design",
    description: "Start a field design from the shared project files.",
    phase: "design",
    prompt: "create a design",
  },
  {
    id: "wm_designs",
    productId: "worksmanager",
    name: "Field designs",
    description: "Review the designs this job will build from.",
    phase: "build",
    prompt: "show my designs",
  },
  {
    id: "publish_to_wm",
    productId: "connect",
    alsoRequires: ["worksmanager"],
    name: "Publish to the field",
    description: "Send a project file to the machines and crews on this job.",
    phase: "build",
    prompt: "Publish a Connect design to WorksManager",
  },
  {
    id: "b2w_estimates",
    productId: "b2westimate",
    name: "Estimates",
    description: "Review the estimate behind this bid.",
    phase: "bid",
    prompt: "show my B2W estimates",
  },
  {
    id: "autobid_bids",
    productId: "autobid",
    name: "Bids",
    description: "Track bid packages and due dates.",
    phase: "bid",
    prompt: "show my AutoBid bids",
  },
];

export const ACTIVITY_WIDGETS: ActivityWidget[] = [
  {
    id: "design-to-field",
    name: "Create, compare, publish",
    intent: "execute",
    phases: ["design", "build"],
    valueStory:
      "One workflow: create a field design, compare it with other designs in WorksManager, and publish to machines when you are ready.",
    solutionIds: ["site-planning", "collaboration", "project-mgmt", "machine-control"],
    featureIds: ["connect_files", "create_design", "wm_designs", "publish_to_wm"],
  },
  {
    id: "bid-value-engineering",
    name: "Bid value engineering",
    intent: "execute",
    phases: ["bid"],
    valueStory:
      "When the bid has to come down, review B2W estimates and AutoBid packages alongside the Connect model to test scope changes on the spot.",
    solutionIds: ["estimating", "collaboration", "bim"],
    featureIds: ["b2w_estimates", "autobid_bids", "connect_files"],
  },
  {
    id: "bid-status",
    name: "Bid desk status",
    intent: "status",
    phases: ["bid"],
    valueStory: "See estimate totals and bid due dates in one place — no hopping between precon apps to know if the package is on track.",
    solutionIds: ["estimating"],
    featureIds: ["b2w_estimates", "autobid_bids"],
  },
  {
    id: "design-coordination",
    name: "Issued designs check",
    intent: "status",
    phases: ["design"],
    valueStory: "Browse the coordinated model and see what is already issued in WorksManager before the team commits.",
    solutionIds: ["bim", "site-planning", "collaboration", "project-mgmt"],
    featureIds: ["connect_files", "wm_designs"],
  },
  {
    id: "build-status",
    name: "Build status",
    intent: "status",
    phases: ["build"],
    valueStory: "Understand what is on the machines and in the shared model — a read-focused view for supers and owners.",
    solutionIds: ["collaboration", "field-systems", "machine-control"],
    featureIds: ["connect_files", "wm_designs"],
  },
  {
    id: "survey-and-model",
    name: "Survey and model check",
    intent: "execute",
    phases: ["build", "design"],
    valueStory: "Align survey and layout with the same Connect files the office issued — compare model to what is in the field.",
    solutionIds: ["survey", "bim", "collaboration"],
    featureIds: ["connect_files", "wm_designs"],
  },
  {
    id: "precon-handoff",
    name: "Precon to operations handoff",
    intent: "status",
    phases: ["bid", "design"],
    valueStory: "See the estimate, open the model, and know what the field team will inherit when the job is awarded.",
    solutionIds: ["estimating", "bim", "collaboration"],
    featureIds: ["b2w_estimates", "connect_files"],
  },
  // --- Trimble-ecosystem activity concepts (demo features as stand-ins for full suites) ---
  {
    id: "connected-project-setup",
    name: "Connected project setup",
    intent: "execute",
    phases: ["design", "build"],
    valueStory:
      "Jobsite Connectivity style: treat Connect as the source of truth, then spin up the WorksManager design import the field team will run — same story as Connected Project without hopping apps.",
    solutionIds: ["collaboration", "site-planning", "project-mgmt"],
    featureIds: ["connect_files", "create_design"],
  },
  {
    id: "submittal-spec-gate",
    name: "Submittal and spec gate",
    intent: "status",
    phases: ["bid", "design"],
    valueStory:
      "ProjectSight submittal mindset: open the spec and model folders in Connect while AutoBid shows which packages still block fabrication or buy-out.",
    solutionIds: ["estimating", "bim", "collaboration"],
    featureIds: ["connect_files", "autobid_bids"],
  },
  {
    id: "field-issue-to-rfi",
    name: "Field issue to RFI",
    intent: "execute",
    phases: ["build", "design"],
    valueStory:
      "Start from a ProjectSight-style field issue: pull drawing context from Connect, compare issued WorksManager designs, then you are ready to formalize the RFI with the right attachments.",
    solutionIds: ["collaboration", "project-mgmt", "bim"],
    featureIds: ["connect_files", "wm_designs"],
  },
  {
    id: "push-grade-tonight",
    name: "Push grade tonight",
    intent: "execute",
    phases: ["build"],
    valueStory:
      "Machine control night shift: review the design roster in WorksManager and publish the approved surface to devices — the ops loop after the office signs off in Connect.",
    solutionIds: ["machine-control", "field-systems", "project-mgmt"],
    featureIds: ["wm_designs", "publish_to_wm"],
  },
  {
    id: "pco-cost-check",
    name: "Change order cost check",
    intent: "execute",
    phases: ["bid", "build"],
    valueStory:
      "Before a potential change order hits Vista or Spectrum, reopen the B2W estimate line and the Connect model markup in one handbook view — ProjectSight-to-ERP sanity check.",
    solutionIds: ["estimating", "bim", "collaboration"],
    featureIds: ["b2w_estimates", "connect_files"],
  },
  {
    id: "owner-site-walk",
    name: "Owner site walk",
    intent: "status",
    phases: ["build"],
    valueStory:
      "Owner and CM rep walk: what the coordinated model shows in Connect versus what is actually loaded on machines in WorksManager — transparency without a training session.",
    solutionIds: ["collaboration", "machine-control", "field-systems"],
    featureIds: ["connect_files", "wm_designs"],
  },
  {
    id: "bid-night-closeout",
    name: "Bid night closeout",
    intent: "execute",
    phases: ["bid"],
    valueStory:
      "Estimator closeout: lock B2W totals against AutoBid package due dates and scope tabs — the precon desk version of a ProjectSight dashboard, minus the module hopping.",
    solutionIds: ["estimating"],
    featureIds: ["b2w_estimates", "autobid_bids"],
  },
  {
    id: "layout-verify-republish",
    name: "Layout verify and republish",
    intent: "execute",
    phases: ["build"],
    valueStory:
      "Survey and layout loop: verify the issued design against Connect, adjust in WorksManager, and republish — field systems workflow without reopening the full design authoring stack.",
    solutionIds: ["survey", "machine-control", "collaboration", "project-mgmt"],
    featureIds: ["connect_files", "wm_designs", "publish_to_wm"],
  },
  {
    id: "shop-release-check",
    name: "Shop release check",
    intent: "status",
    phases: ["design"],
    valueStory:
      "Fabrication and steel detailing handoff: confirm the released model set in Connect before the shop or yard commits — Tekla/Trimble detailing release gate in one glance.",
    solutionIds: ["bim", "detailing", "fabrication", "collaboration"],
    featureIds: ["connect_files"],
  },
  {
    id: "dispatch-job-packet",
    name: "Dispatch job packet",
    intent: "status",
    phases: ["build"],
    valueStory:
      "Haul and fleet dispatch: the Connect job packet dispatchers trust (maps, tickets, daily plan) while routing and telematics run in their own Trimble apps.",
    solutionIds: ["collaboration", "routing", "supply-chain"],
    featureIds: ["connect_files"],
  },
  {
    id: "takeoff-model-reconcile",
    name: "Takeoff vs model reconcile",
    intent: "execute",
    phases: ["bid"],
    valueStory:
      "Estimating takeoff meet BIM: reconcile B2W quantities with the live Connect model when scope shifts mid-bid — Construction One precon without duplicate quantity entry.",
    solutionIds: ["estimating", "bim", "collaboration"],
    featureIds: ["b2w_estimates", "connect_files"],
  },
  {
    id: "daily-report-packet",
    name: "Daily report packet",
    intent: "status",
    phases: ["build"],
    valueStory:
      "ProjectSight daily report mindset: supers skim shared files and machine-ready designs to answer “what changed today?” before they write the log.",
    solutionIds: ["collaboration", "project-mgmt", "field-systems"],
    featureIds: ["connect_files", "wm_designs"],
  },
];

export const WIDGET_INTENT_LABEL: Record<WidgetIntent, string> = {
  status: "Understand status",
  execute: "Execute work",
};

/** ponytail: phase hints only — user trims the list; upgrade path = ML or admin templates */
const PHASE_SUGGESTED_SOLUTIONS: Record<LifecyclePhase, string[]> = {
  bid: ["estimating", "collaboration", "site-planning", "bim"],
  design: ["bim", "site-planning", "structural", "collaboration", "detailing", "project-mgmt"],
  build: ["field-systems", "machine-control", "survey", "collaboration", "project-mgmt"],
};

export function accountById(id: string) {
  return ACCOUNTS.find((account) => account.id === id);
}

export function projectById(id: string) {
  return PROJECTS.find((project) => project.id === id);
}

export function featureById(id: string) {
  return FEATURES.find((feature) => feature.id === id);
}

export function solutionById(id: string) {
  return SOLUTIONS.find((solution) => solution.id === id);
}

export function projectsForAccount(accountId: string) {
  return PROJECTS.filter((project) => project.accountId === accountId);
}

export function solutionsInGroup(group: SolutionGroup) {
  return SOLUTIONS.filter((solution) => solution.group === group);
}

function pluginsForSolutions(solutionIds: string[]) {
  const plugins = new Set<PluginId>();
  for (const id of solutionIds) {
    for (const pluginId of solutionById(id)?.pluginIds ?? []) plugins.add(pluginId);
  }
  return plugins;
}

function featureLicensed(feature: ProductFeature, plugins: Set<PluginId>) {
  return plugins.has(feature.productId) && (feature.alsoRequires ?? []).every((id) => plugins.has(id));
}

/** Chat actions the selected solutions can actually open in this demo. */
export function featuresForSolutions(solutionIds: string[]) {
  const plugins = pluginsForSolutions(solutionIds);
  const allowed = new Set(solutionIds.flatMap((id) => solutionById(id)?.featureIds ?? []));
  return FEATURES.filter((feature) => allowed.has(feature.id) && featureLicensed(feature, plugins));
}

export function widgetById(id: string) {
  return ACTIVITY_WIDGETS.find((widget) => widget.id === id);
}

function licensedFeaturesForAccount(accountId: string) {
  const account = accountById(accountId);
  if (!account) return new Set<string>();
  return new Set(featuresForSolutions(account.solutionIds).map((feature) => feature.id));
}

/** Activity widgets this account can run on this project phase (demo features only). */
export function widgetsForProject(accountId: string, projectId: string) {
  const account = accountById(accountId);
  const project = projectById(projectId);
  if (!account || !project) return [] as ActivityWidget[];
  const licensedSolutions = new Set(account.solutionIds);
  const licensedFeatures = licensedFeaturesForAccount(accountId);
  return ACTIVITY_WIDGETS.filter(
    (widget) =>
      widget.phases.includes(project.phase) &&
      widget.solutionIds.every((id) => licensedSolutions.has(id)) &&
      widget.featureIds.every((id) => licensedFeatures.has(id)),
  );
}

export function selectionFromWidget(accountId: string, widget: ActivityWidget) {
  const account = accountById(accountId);
  const licensedSolutions = new Set(account?.solutionIds ?? []);
  const solutionIds = widget.solutionIds.filter((id) => licensedSolutions.has(id));
  const allowedFeatures = new Set(featuresForSolutions(solutionIds).map((feature) => feature.id));
  const featureIds = widget.featureIds.filter((id) => allowedFeatures.has(id));
  return {
    widgetId: widget.id,
    name: widget.name,
    solutionIds,
    featureIds,
    productIds: productsUsedBy(featureIds),
  };
}

/** Phase-based starting point — only solutions the account licenses. User customizes from here. */
export function suggestedSelection(accountId: string, projectId: string) {
  const account = accountById(accountId);
  const project = projectById(projectId);
  if (!account || !project) return { solutionIds: [] as string[], productIds: [] as PluginId[], featureIds: [] as string[] };
  const licensed = new Set(account.solutionIds);
  const solutionIds = PHASE_SUGGESTED_SOLUTIONS[project.phase].filter((id) => licensed.has(id));
  const featureIds = featuresForSolutions(solutionIds).map((feature) => feature.id);
  return { solutionIds, featureIds, productIds: productsUsedBy(featureIds) };
}

export function productsUsedBy(featureIds: string[]): PluginId[] {
  const ids = new Set<PluginId>();
  for (const id of featureIds) {
    const feature = featureById(id);
    if (!feature) continue;
    ids.add(feature.productId);
    for (const extra of feature.alsoRequires ?? []) ids.add(extra);
  }
  return [...ids];
}

/** Display names for the product footnote on workflow widget cards. */
export function productLabelsForFeatures(featureIds: string[]): string[] {
  return productsUsedBy(featureIds).map((id) => PLUGIN_CATALOG[id].name);
}

export function promptsFor(featureIds: string[]) {
  return featureIds.flatMap((id) => {
    const feature = featureById(id);
    return feature ? [feature.prompt] : [];
  });
}

export function solutionNames(ids: string[]) {
  return ids.flatMap((id) => {
    const solution = solutionById(id);
    return solution ? [solution.name] : [];
  });
}

export function orderedFeatures(features: ProductFeature[], phase: LifecyclePhase) {
  return [...features].sort((a, b) => Number(b.phase === phase) - Number(a.phase === phase));
}

/** Maps a catalog feature to the dashboard tile action key. */
export const FEATURE_ACTION: Record<string, string> = {
  connect_files: "connect_file_browser",
  create_design: "create_design",
  wm_designs: "worksmanager_design_list",
  publish_to_wm: "publish_connect_to_wm",
  b2w_estimates: "b2westimate_list",
  autobid_bids: "autobid_list",
};

export const DESIGN_WORKFLOW_FEATURES = ["create_design", "wm_designs", "publish_to_wm"] as const;
export const DESIGN_WORKFLOW_ACTION = "design_workflow_unified";

export function isDesignWorkflowBundle(featureIds: readonly string[]) {
  const set = new Set(featureIds);
  return DESIGN_WORKFLOW_FEATURES.every((id) => set.has(id));
}

export function dashboardPanelsForFeatures(featureIds: string[]) {
  const set = new Set(featureIds);
  if (isDesignWorkflowBundle(featureIds)) {
    const panels: { name: string; action: string; featureId: string }[] = [];
    if (set.has("connect_files")) {
      const feature = featureById("connect_files");
      const action = FEATURE_ACTION.connect_files;
      if (feature && action) panels.push({ name: feature.name, action, featureId: "connect_files" });
    }
    panels.push({
      name: "Create, compare, publish",
      action: DESIGN_WORKFLOW_ACTION,
      featureId: "create_design",
    });
    for (const id of featureIds) {
      if (id === "connect_files" || (DESIGN_WORKFLOW_FEATURES as readonly string[]).includes(id)) continue;
      const feature = featureById(id);
      const action = FEATURE_ACTION[id];
      if (!feature || !action) continue;
      panels.push({ name: feature.name, action, featureId: id });
    }
    return panels;
  }
  return featureIds.flatMap((id) => {
    const feature = featureById(id);
    const action = FEATURE_ACTION[id];
    if (!feature || !action) return [];
    return [{ name: feature.name, action, featureId: id }];
  });
}

if (import.meta.env.DEV) {
  const intentIds = new Set(INTENTS.map((intent) => intent.featureId));
  for (const feature of FEATURES) {
    if (!intentIds.has(feature.id)) console.error("work profile feature missing intent", feature.id);
  }
  const build = suggestedSelection("acct-morgan", "proj-north-ridge");
  if (build.solutionIds.includes("estimating") || !build.solutionIds.includes("machine-control")) {
    console.error("build phase suggestion self-check failed", build);
  }
  const bid = suggestedSelection("acct-summit", "proj-i5");
  if (!bid.solutionIds.includes("estimating") || bid.solutionIds.includes("machine-control")) {
    console.error("bid phase suggestion self-check failed", bid);
  }
  const haul = suggestedSelection("acct-northline", "proj-haul");
  if (!haul.solutionIds.length || haul.solutionIds.includes("bim")) {
    console.error("haul build phase suggestion self-check failed", haul);
  }
  const morganWidgets = widgetsForProject("acct-morgan", "proj-north-ridge");
  if (!morganWidgets.some((widget) => widget.id === "design-to-field")) {
    console.error("morgan build widgets self-check failed", morganWidgets.map((w) => w.id));
  }
  const designPanels = dashboardPanelsForFeatures(["connect_files", "create_design", "wm_designs", "publish_to_wm"]);
  if (designPanels.length !== 2 || designPanels[1]?.action !== DESIGN_WORKFLOW_ACTION) {
    console.error("design workflow panel self-check failed", designPanels);
  }
  const summitWidgets = widgetsForProject("acct-summit", "proj-i5");
  if (!summitWidgets.some((widget) => widget.id === "bid-value-engineering")) {
    console.error("summit bid widgets self-check failed", summitWidgets.map((w) => w.id));
  }
  const harbor = accountById("acct-harbor");
  if (!harbor || harbor.solutionIds.includes("estimating")) console.error("harbor license self-check failed");
  const morganAll = featuresForSolutions(accountById("acct-morgan")?.solutionIds ?? []).map((feature) => feature.id);
  if (!morganAll.includes("autobid_bids") || !morganAll.includes("wm_designs")) console.error("account scope self-check failed", morganAll);
}
