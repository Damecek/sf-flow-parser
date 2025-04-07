/**
 * Main entry point for the deno-flow-parser library
 * Exports all public API functions and types
 *
 * This library provides tools for parsing, manipulating, and serializing
 * Salesforce Flow XML files in Deno.
 */

// Export core Flow parsing/serialization functions
export {
  parse,
  parseFromFile,
  stringify,
  stringifyToFile,
} from "./lib/flow.ts";

// Export Flow node operations
export {
  findFlowNodeByName,
  findParentFlowNodes,
  getConnectors,
  getFlowNodes,
  reparentNode,
} from "./lib/nodes.ts";

// Export helper functions
export {
  ensureArray,
  ensureArrayProperties,
  processNestedArrays,
  sortByName,
  sortFlowArrays,
} from "./lib/helper.ts";

// Export types
export type {
  BaseFlowNodeWithConnector,
  NamedObject,
  NestedArrayConfig,
} from "./lib/types.ts";

// Export constants
export {
  FLOW_ARRAY_NODES,
  FLOW_ARRAY_PROPERTIES,
  NESTED_ARRAY_CONFIG,
  NESTED_SORT_CONFIG,
} from "./lib/constants.ts";
