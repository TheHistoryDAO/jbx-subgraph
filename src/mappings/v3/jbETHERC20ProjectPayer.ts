import { dataSource } from "@graphprotocol/graph-ts";
import { OwnershipTransferred } from "../../../generated/V3JBProjects/JBProjects";
import { SetDefaultValues } from "../../../generated/V3JBETHERC20ProjectPayerDeployer/JBETHERC20ProjectPayer";
import { ETHERC20ProjectPayer } from "../../../generated/schema";

import { CV } from "../../types";
import { idForProject } from "../../utils/ids";

const cv: CV = "3";

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  const context = dataSource.context();
  const address = context
    .getBytes("address")
    .toHexString()
    .toLowerCase();
  const projectPayer = ETHERC20ProjectPayer.load(address);
  if (!projectPayer) return;
  projectPayer.owner = event.params.newOwner;
  projectPayer.save();
}

export function handleSetDefaultValues(event: SetDefaultValues): void {
  const context = dataSource.context();
  const address = context
    .getBytes("address")
    .toHexString()
    .toLowerCase();
  const projectPayer = ETHERC20ProjectPayer.load(address);
  if (!projectPayer) return;
  projectPayer.beneficiary = event.params.beneficiary;
  projectPayer.memo = event.params.memo;
  projectPayer.metadata = event.params.metadata;
  projectPayer.preferAddToBalance = event.params.preferAddToBalance;
  projectPayer.preferClaimedTokens = event.params.preferClaimedTokens;
  projectPayer.project = idForProject(event.params.projectId, cv);
  projectPayer.projectId = event.params.projectId.toI32();
  projectPayer.save();
}
