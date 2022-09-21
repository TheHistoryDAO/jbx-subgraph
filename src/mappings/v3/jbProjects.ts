import { BigInt, log } from "@graphprotocol/graph-ts";
import {
  Create,
  SetMetadata,
  Transfer,
} from "../../../generated/V3JBProjects/JBProjects";
import {
  Project,
  ProjectCreateEvent,
  ProtocolLog,
  ProtocolV3Log,
} from "../../../generated/schema";
import { PROTOCOL_ID } from "../../constants";
import { CV, ProjectEventKey } from "../../types";
import {
  newProtocolLog,
  newProtocolV3Log,
  saveNewProjectEvent,
  updateProtocolEntity,
} from "../../utils/entity";
import { idForProject, idForProjectTx } from "../../utils/ids";

const cv: CV = "3";

export function handleCreate(event: Create): void {
  const projectId = idForProject(event.params.projectId, cv);
  const project = new Project(projectId);
  if (!project) {
    log.error("[handleCreate] Missing project. ID:{}", [
      idForProject(event.params.projectId, cv),
    ]);
    return;
  }
  project.projectId = event.params.projectId.toI32();
  project.cv = cv;
  project.trendingScore = BigInt.fromString("0");
  project.trendingVolume = BigInt.fromString("0");
  project.trendingPaymentsCount = BigInt.fromString("0").toI32();
  project.createdWithinTrendingWindow = true;
  project.owner = event.params.owner;
  project.createdAt = event.block.timestamp.toI32();
  project.metadataUri = event.params.metadata.content;
  project.metadataDomain = event.params.metadata.domain;
  project.totalPaid = BigInt.fromString("0");
  project.totalRedeemed = BigInt.fromString("0");
  project.currentBalance = BigInt.fromString("0");
  project.save();

  const projectCreateEvent = new ProjectCreateEvent(
    idForProjectTx(event.params.projectId, cv, event)
  );
  if (projectCreateEvent) {
    projectCreateEvent.cv = cv;
    projectCreateEvent.project = project.id;
    projectCreateEvent.projectId = event.params.projectId.toI32();
    projectCreateEvent.timestamp = event.block.timestamp.toI32();
    projectCreateEvent.txHash = event.transaction.hash;
    projectCreateEvent.caller = event.transaction.from;
    projectCreateEvent.save();

    saveNewProjectEvent(
      event,
      event.params.projectId,
      projectCreateEvent.id,
      cv,
      ProjectEventKey.projectCreateEvent
    );
  }

  if (!ProtocolLog.load(PROTOCOL_ID)) {
    const protocolLog = newProtocolLog();
    protocolLog.save();
  }

  let protocolV3Log = ProtocolV3Log.load(PROTOCOL_ID);
  if (!protocolV3Log) protocolV3Log = newProtocolV3Log();
  if (protocolV3Log) {
    // We only need to create log here, since there will only be one entity and it will be created when first project is created.
    protocolV3Log.projectsCount = protocolV3Log.projectsCount + 1;
    protocolV3Log.log = PROTOCOL_ID;
    protocolV3Log.save();
  }
  updateProtocolEntity();
}

export function handleSetMetadata(event: SetMetadata): void {
  const project = Project.load(idForProject(event.params.projectId, cv));
  if (!project) {
    log.error("[handleSetMetadata] Missing project. ID:{}", [
      idForProject(event.params.projectId, cv),
    ]);
    return;
  }
  project.metadataUri = event.params.metadata.content;
  project.metadataDomain = event.params.metadata.domain;
  project.save();
}

export function handleTransferOwnership(event: Transfer): void {
  const project = Project.load(idForProject(event.params.tokenId, cv));
  if (!project) {
    // Project will be missing on initial mint transfer
    return;
  }
  project.owner = event.params.to;
  project.save();
}
