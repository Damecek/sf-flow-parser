import type {Flow} from "@salesforce/types/metadata";
import * as xmlLib from "@libs/xml";
import {ensureArrayProperties, sortFlowArrays} from "./helper.ts";
import {XML_CONFIG} from "./types.ts";

/**
 * Parse XML string into a Flow object
 * @param xml XML string to parse
 * @returns Flow object
 * @throws Error if XML is invalid or doesn't contain a Flow element
 */
export function parse(xml: string): Flow {
  try {
    const parsed = xmlLib.parse(xml);
    if (!parsed["Flow"]) {
      throw new Error("XML does not contain a Flow element");
    }
    const flow = parsed["Flow"] as Flow;
    ensureArrayProperties(flow);
    return flow;
  } catch (error: any) {
    if (error.message === "XML does not contain a Flow element") {
      throw error;
    }
    throw new Error(`Failed to parse XML: ${error.message}`);
  }
}

/**
 * Parse Flow from XML file
 * @param path Path to XML file
 * @returns Flow object
 * @throws Error if file cannot be read or XML is invalid
 */
export function parseFromFile(path: string): Flow {
  try {
    const xml = Deno.readTextFileSync(path);
    return parse(xml);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new Error(`File not found: ${path}`);
    }
    if (error instanceof Deno.errors.PermissionDenied) {
      throw new Error(`Permission denied to read file: ${path}`);
    }
    throw error;
  }
}

/**
 * Convert Flow object to XML string
 * @param flow Flow object to stringify
 * @returns XML string
 */
export function stringify(flow: Flow): string {
  // Replace self-closing tags with proper XML tags
  const replaceSelfClosingTags = (value: string) =>
    value.replace(/<(\w+)([^>]*)\/>\n/g, "<$1$2></$1>\n");

  // Sort all array properties by name before stringifying
  const sortedFlow = sortFlowArrays(flow);

  // Convert to XML
  const xmlString = xmlLib.stringify({
    "@version": XML_CONFIG.version,
    "@encoding": XML_CONFIG.encoding,
    "Flow": {
      "@xmlns": XML_CONFIG.namespace,
      ...sortedFlow,
    },
  }, XML_CONFIG.options);

  return replaceSelfClosingTags(xmlString) + "\n";
}

/**
 * Write Flow object to XML file
 * @param flow Flow object to write
 * @param path Path to write to
 * @throws Error if file cannot be written
 */
export function stringifyToFile(flow: Flow, path: string): void {
  try {
    const xml = stringify(flow);
    Deno.writeTextFileSync(path, xml);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new Error(`Directory not found for file: ${path}`);
    }
    if (error instanceof Deno.errors.PermissionDenied) {
      throw new Error(`Permission denied to write file: ${path}`);
    }
    throw error;
  }
}

// Re-export node operations from nodes.ts
export {
  findFlowNodeByName,
  findParentFlowNodes,
  getConnectors,
} from "./nodes.ts";

// Re-export types
export type { BaseFlowNodeWithConnector } from "./types.ts";
