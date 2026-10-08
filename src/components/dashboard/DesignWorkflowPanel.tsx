import type { JSX } from "solid-js";
import { CreateDesignCard } from "@/components/agent/CreateDesignCard";
import { PublishConnectToWmCard } from "@/components/agent/PublishConnectToWmCard";
import { WorksManagerPluginCard } from "@/components/plugins/WorksManagerPluginCard";

function Step(props: { n: number; title: string; children: JSX.Element }) {
  return (
    <div class="byop-design-workflow-step">
      <p class="byop-design-workflow-step-label">
        <span class="byop-design-workflow-step-num">{props.n}</span>
        {props.title}
      </p>
      {props.children}
    </div>
  );
}

/** Create → compare field designs → publish, one job-view panel. */
export function DesignWorkflowPanel() {
  return (
    <div class="byop-design-workflow">
      <Step n={1} title="Create a design">
        <CreateDesignCard onCreated={() => undefined} />
      </Step>
      <Step n={2} title="Compare field designs">
        <WorksManagerPluginCard />
      </Step>
      <Step n={3} title="Publish to the field">
        <PublishConnectToWmCard />
      </Step>
    </div>
  );
}
