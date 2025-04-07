/**
 * Type definitions for Flow parser
 */
import type {FlowConnector, FlowRule, FlowScheduledPath, FlowWaitEvent} from "@salesforce/types/metadata";

/**
 * Interface for Flow nodes that can have connectors
 */
export interface BaseFlowNodeWithConnector {
  connector?: FlowConnector;
  defaultConnector?: FlowConnector;
  nextValueConnector?: FlowConnector;
  noMoreValuesConnector?: FlowConnector;
  faultConnector?: FlowConnector;
  rules?: FlowRule[];
  scheduledPaths?: FlowScheduledPath[];
  waitEvents?: FlowWaitEvent[];
  // Add other potential connector-containing arrays here
}

/**
 * Type for nested array configuration
 */
export type NestedArrayConfig = {
  childArrays: string[];
  nestedConfig?: Record<string, NestedArrayConfig>;
  recursive?: string;
};

/**
 * Type for objects with optional name property
 */
export type NamedObject = {
  name?: string;
  [key: string]: any;
};

/**
 * XML configuration for Flow serialization
 */
export const XML_CONFIG = {
  version: "1.0",
  encoding: "UTF-8",
  namespace: "http://soap.sforce.com/2006/04/metadata",
  options: {
    replace: {
      entities: true,
    },
    format: {
      indent: "    ",
      breakline: Number.MAX_SAFE_INTEGER,
    },
  },
};
