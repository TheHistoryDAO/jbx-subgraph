import { DataSourceContext } from "@graphprotocol/graph-ts";

import { DelegateDeployed } from "../../../generated/JBTiered721DelegateDeployer/JBTiered721DelegateDeployer";
import { JB721DelegateToken as JB721DelegateTokenTemplate } from "../../../generated/templates";
import { Version } from "../../types";

const pv: Version = "2";

/**
 * When a delegate is deployed, we create a new dataSource so we can 
 * handle token transfers later.
 */
export function handleDelegateDeployed(event: DelegateDeployed): void {
  const address = event.params.newDelegate;

  const jbTiered721DelegateContext = new DataSourceContext();
  jbTiered721DelegateContext.setBigInt("projectId", event.params.projectId);
  jbTiered721DelegateContext.setString("pv", pv);
  JB721DelegateTokenTemplate.createWithContext(
    address,
    jbTiered721DelegateContext
  );
}
