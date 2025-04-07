import type {Flow} from "@salesforce/types/metadata";
import {FLOW_ARRAY_PROPERTIES, NESTED_ARRAY_CONFIG,} from "./constants.ts";
import type {NamedObject, NestedArrayConfig} from "./types.ts";

/**
 * Helper function to ensure a property is always an array
 * @param obj Object to modify
 * @param propertyName Property name to ensure is an array
 * @example
 * const obj = { items: "single item" };
 * ensureArray(obj, "items");
 * // obj.items is now ["single item"]
 *
 * const obj2 = { items: null };
 * ensureArray(obj2, "items");
 * // obj2.items is now []
 */
export function ensureArray<T>(
  obj: Record<string, any>,
  propertyName: string,
): void {
  if (obj[propertyName] && !Array.isArray(obj[propertyName])) {
    obj[propertyName] = [obj[propertyName]];
  } else if (!obj[propertyName]) {
    obj[propertyName] = [];
  }
}

/**
 * Helper function to ensure certain properties are always arrays
 * @param flow Flow object to process
 * @example
 * const flow = parse(xmlString);
 * ensureArrayProperties(flow);
 * // Now all array properties in the flow are guaranteed to be arrays
 */
export function ensureArrayProperties(flow: Flow): void {
  // Ensure each property is an array
  FLOW_ARRAY_PROPERTIES.forEach((prop) => ensureArray(flow, prop));

  // Process nested arrays in Flow objects
  processNestedArrays(flow);
}

/**
 * Process nested arrays in Flow objects using configuration-driven approach
 * @param obj Object to process
 * @example
 * const flow = parse(xmlString);
 * processNestedArrays(flow);
 * // Now all nested arrays in the flow are properly processed
 */
export function processNestedArrays(
  obj: Record<string, any> | null | undefined,
): void {
  if (!obj || typeof obj !== "object") return;

  // Process each property defined in the nested array configuration
  Object.entries(NESTED_ARRAY_CONFIG).forEach(([prop, config]) => {
    if (obj[prop]) {
      processPropertyArrays(obj, prop, config);
    }
  });
}

/**
 * Process arrays for a specific property based on configuration
 * @param obj Parent object
 * @param prop Property name
 * @param config Configuration for the property
 */
function processPropertyArrays(
  obj: Record<string, any>,
  prop: string,
  config: NestedArrayConfig,
): void {
  // Special case for start node which is not an array itself
  if (prop === "start" && obj[prop] && typeof obj[prop] === "object") {
    // Process child arrays of start node
    config.childArrays.forEach((childProp) => {
      ensureArray(obj[prop], childProp);
    });

    // Process nested configurations for start node
    if (config.nestedConfig) {
      Object.entries(config.nestedConfig).forEach(
        ([childProp, childConfig]) => {
          if (obj[prop][childProp]) {
            processPropertyArrays(obj[prop], childProp, childConfig);
          }
        },
      );
    }
    return;
  }

  // Handle single items that should be arrays
  ensureArray(obj, prop);

  // Skip if not an array or empty
  if (!Array.isArray(obj[prop]) || obj[prop].length === 0) return;

  // Process each item in the array
  obj[prop].forEach((item: Record<string, any>) => {
    // Ensure each child property is an array
    config.childArrays.forEach((childProp) => {
      ensureArray(item, childProp);
    });

    // Process nested configurations
    if (config.nestedConfig) {
      Object.entries(config.nestedConfig).forEach(
        ([childProp, childConfig]) => {
          if (item[childProp]) {
            processPropertyArrays(item, childProp, childConfig);
          }
        },
      );
    }

    // Handle recursive properties (like nested fields)
    if (
      config.recursive && item[config.recursive] &&
      item[config.recursive].length > 0
    ) {
      // Create a temporary object with the same structure to process recursively
      const tempObj: Record<string, any> = {};
      tempObj[prop] = [{ [config.recursive]: item[config.recursive] }];
      processNestedArrays(tempObj);
    }
  });
}

/**
 * Sorts an array of objects by their name property
 * @param arr Array to sort
 * @returns Sorted array (new array, doesn't modify the original)
 * @example
 * const decisions = flow.decisions || [];
 * const sortedDecisions = sortByName(decisions);
 * // sortedDecisions is now sorted alphabetically by name
 */
export function sortByName<T extends NamedObject>(arr: T[]): T[] {
  if (!arr || !Array.isArray(arr)) return arr;

  return [...arr].sort((a, b) => {
    const nameA = a.name || "";
    const nameB = b.name || "";
    return nameA.localeCompare(nameB);
  });
}

/**
 * Sorts all array properties in a Flow object by name
 * @param flow Flow object to sort
 * @returns Flow object with sorted arrays (new object, doesn't modify the original)
 * @example
 * const flow = parseFromFile("path/to/flow.xml");
 * const sortedFlow = sortFlowArrays(flow);
 * // All array properties in sortedFlow are now sorted by name
 */
export function sortFlowArrays(
  flow: Flow | null | undefined,
): Flow | null | undefined {
  if (!flow) return flow;

  // Create a new object to avoid modifying the original
  const sortedFlow = { ...flow } as Record<string, any>;

  // Sort each array property
  FLOW_ARRAY_PROPERTIES.forEach((prop) => {
    if (sortedFlow[prop] && Array.isArray(sortedFlow[prop])) {
      sortedFlow[prop] = sortByName(sortedFlow[prop]);
    }
  });

  return sortedFlow as Flow;
}
