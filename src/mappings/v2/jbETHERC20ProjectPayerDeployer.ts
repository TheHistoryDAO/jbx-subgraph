import { DataSourceContext } from "@graphprotocol/graph-ts";

import { DeployProjectPayer } from "../../../generated/JBETHERC20ProjectPayerDeployer/JBETHERC20ProjectPayerDeployer";
import {
  DeployProjectPayerEvent,
  ETHERC20ProjectPayer,
} from "../../../generated/schema";
import { JBETHERC20ProjectPayer } from "../../../generated/templates";
import { CV, ProjectEventKey } from "../../types";
import { idForProject, saveNewProjectEvent } from "../../utils";

const cv: CV = "2";

export function handleDeployProjectPayer(event: DeployProjectPayer): void {
  // Create dataSource context
  let projectPayerContext = new DataSourceContext();
  projectPayerContext.setBytes("address", event.params.projectPayer);
  JBETHERC20ProjectPayer.createWithContext(
    event.params.projectPayer,
    projectPayerContext
  );

  // Create entity
  let projectPayer = new ETHERC20ProjectPayer(
    event.params.projectPayer.toHexString()
  );
  if (!projectPayer) return;
  projectPayer.address = event.params.projectPayer;
  projectPayer.beneficiary = event.params.defaultBeneficiary;
  projectPayer.directory = event.params.directory;
  projectPayer.memo = event.params.defaultMemo;
  projectPayer.metadata = event.params.defaultMetadata;
  projectPayer.owner = event.params.owner;
  projectPayer.preferAddToBalance = event.params.preferAddToBalance;
  projectPayer.preferClaimedTokens = event.params.defaultPreferClaimedTokens;
  projectPayer.project = idForProject(event.params.defaultProjectId, cv);
  projectPayer.projectId = event.params.defaultProjectId.toI32();
  projectPayer.save();

  let deployProjectPayerEvent = new DeployProjectPayerEvent(
    projectPayer.address.toHexString()
  );
  if (!deployProjectPayerEvent) return;
  deployProjectPayerEvent.address = projectPayer.address;
  deployProjectPayerEvent.beneficiary = projectPayer.beneficiary;
  deployProjectPayerEvent.directory = projectPayer.directory;
  deployProjectPayerEvent.memo = projectPayer.memo;
  deployProjectPayerEvent.metadata = projectPayer.metadata;
  deployProjectPayerEvent.owner = projectPayer.owner;
  deployProjectPayerEvent.preferAddToBalance = projectPayer.preferAddToBalance;
  deployProjectPayerEvent.preferClaimedTokens =
    projectPayer.preferClaimedTokens;
  deployProjectPayerEvent.projectId = projectPayer.projectId;
  deployProjectPayerEvent.project = projectPayer.project;
  deployProjectPayerEvent.timestamp = event.block.timestamp;
  deployProjectPayerEvent.txHash = event.transaction.hash;
  deployProjectPayerEvent.save();
  saveNewProjectEvent(
    event,
    event.params.defaultProjectId.toI32(),
    deployProjectPayerEvent.id,
    cv,
    ProjectEventKey.deployProjectPayerEvent
  );
}
