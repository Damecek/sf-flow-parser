/**
 * Flow node operations
 *
 * This module provides functions for working with Flow nodes, including:
 * - Finding nodes by name
 * - Getting all nodes from a Flow
 * - Finding parent nodes that connect to a specific node
 * - Getting all connectors from a node
 * - Reparenting nodes (changing connections)
 */
import type {Flow, FlowConnector, FlowNode} from "@salesforce/types/metadata";
import {FLOW_ARRAY_NODES} from "./constants.ts";
import type {BaseFlowNodeWithConnector} from "./types.ts";

/**
 * Get all nodes from a Flow object
 * @param flow Flow object to extract nodes from
 * @returns Array of FlowNode objects from all node types in the Flow
 * @example
 * const flow = parseFromFile("path/to/flow.xml");
 * const allNodes = getFlowNodes(flow);
 * console.log(`Flow contains ${allNodes.length} nodes`);
 */
export function getFlowNodes(flow: Flow): FlowNode[] {
  // Start with the start node if it exists
  const nodes: (FlowNode | undefined)[] = [flow.start];

  // Add all node types from the Flow object
  FLOW_ARRAY_NODES.forEach((prop) => {
    // Only add properties that are arrays of nodes
    const nodeArray = flow[prop as keyof Flow];
    if (nodeArray && Array.isArray(nodeArray)) {
      nodes.push(...(nodeArray as FlowNode[]));
    }
  });

  // Filter out undefined nodes and cast to FlowNode[]
  return nodes.filter(Boolean) as FlowNode[];
}

/**
 * Find a Flow node by name
 * @param flow Flow object to search
 * @param name Name of the node to find
 * @returns FlowNode if found, undefined otherwise
 * @example
 * const flow = parseFromFile("path/to/flow.xml");
 * const decisionNode = findFlowNodeByName(flow, "MyDecision");
 * if (decisionNode) {
 *   console.log(`Found node: ${decisionNode.label}`);
 * }
 */
export function findFlowNodeByName(
  flow: Flow,
  name: string,
): FlowNode | undefined {
  return getFlowNodes(flow).find((node) => node.name === name);
}

/**
 * Get all connectors from a Flow node
 * @param node Flow node to get connectors from
 * @returns Array of FlowConnector objects
 * @example
 * const flow = parseFromFile("path/to/flow.xml");
 * const node = findFlowNodeByName(flow, "MyDecision");
 * if (node) {
 *   const connectors = getConnectors(node);
 *   connectors.forEach(conn => {
 *     console.log(`Connector to: ${conn.targetReference}`);
 *   });
 * }
 */
export function getConnectors(
  node: BaseFlowNodeWithConnector,
): FlowConnector[] {
  // Collect all possible connectors
  const connectors: (FlowConnector | undefined)[] = [
    node.connector,
    node.defaultConnector,
    node.nextValueConnector,
    node.noMoreValuesConnector,
    node.faultConnector,
  ];

  // Add connectors from rules if they exist
  if (Array.isArray(node.rules)) {
    connectors.push(...node.rules.map((rule) => rule.connector));
  }

  // Add connectors from scheduledPaths if they exist
  if (Array.isArray(node.scheduledPaths)) {
    connectors.push(...node.scheduledPaths.map((path) => path.connector));
  }

  // Add connectors from waitEvents if they exist
  if (Array.isArray(node.waitEvents)) {
    connectors.push(...node.waitEvents.map((event) => event.connector));
  }

  // Filter out undefined connectors and cast to FlowConnector[]
  return connectors.filter(Boolean) as FlowConnector[];
}

/**
 * Find all parent nodes that connect to a child node
 * @param flow Flow object to search
 * @param childName Name of the child node
 * @returns Array of parent FlowNode objects
 * @example
 * const flow = parseFromFile("path/to/flow.xml");
 * const parents = findParentFlowNodes(flow, "TargetNodeName");
 * console.log(`Found ${parents.length} parent nodes`);
 */
export function findParentFlowNodes(flow: Flow, childName: string): FlowNode[] {
  return getFlowNodes(flow).filter((node) => {
    return getConnectors(node as BaseFlowNodeWithConnector).some((connector) =>
      connector.targetReference === childName
    );
  });
}

/**
 * Changes the target reference of all parent nodes that point to sourceNodeName to point to targetNodeName instead
 * @param flow - The Flow object containing all nodes
 * @param sourceNodeName - The name of the original target node whose parents should be updated
 * @param targetNodeName - The name of the new target node that parents should point to
 * @example
 * const flow = parseFromFile("path/to/flow.xml");
 * // Change all connections from "OldNode" to "NewNode"
 * reparentNode(flow, "OldNode", "NewNode");
 */
export function reparentNode(
  flow: Flow,
  sourceNodeName: string,
  targetNodeName: string,
) {
  findParentFlowNodes(flow, sourceNodeName).forEach((parent) => {
    getConnectors(parent as BaseFlowNodeWithConnector).forEach(
      (connector) => {
        if (connector.targetReference === sourceNodeName) {
          connector.targetReference = targetNodeName;
        }
      },
    );
  });
}
