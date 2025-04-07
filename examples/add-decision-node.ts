/**
 * Advanced example: Adding a decision node to a Flow
 *
 * This example demonstrates more advanced usage of the sf-flow-parser library:
 * - Creating a new decision node
 * - Inserting it into an existing Flow
 * - Rerouting connections between nodes
 * - Modifying the Flow structure
 *
 * Run with:
 * deno run --allow-read --allow-write examples/add-decision-node.ts path/to/flow.xml
 */

import {
  BaseFlowNodeWithConnector,
  findParentFlowNodes,
  getConnectors,
  parseFromFile,
  stringifyToFile,
} from "../src/main.ts";
import {FlowCondition, FlowDecision} from "@salesforce/types/metadata";

/**
 * Create a decision node with the specified connections
 *
 * @param name - Name of the decision node
 * @param defaultTarget - Target node for the default path
 * @param conditionTarget - Target node for the condition path
 * @param fieldName - Optional field name to use in the condition (defaults to "$Record.SomeField__c")
 * @returns A new FlowDecision object
 */
function createDecisionNode(
  name: string,
  defaultTarget: string,
  conditionTarget: string,
  fieldName = "$Record.SomeField__c",
): FlowDecision {
  // Create a condition that checks if the field equals "SomeValue"
  const condition: FlowCondition = {
    leftValueReference: fieldName,
    operator: "EqualTo",
    rightValue: {
      stringValue: "SomeValue",
    },
    processMetadataValues: [],
  };

  return {
    name: name,
    label: "Custom Decision",
    locationX: 0,
    locationY: 0,
    processMetadataValues: [],
    defaultConnector: {
      targetReference: defaultTarget,
      processMetadataValues: [],
    },
    defaultConnectorLabel: "Default",
    rules: [
      {
        name: "Condition1",
        conditionLogic: "and",
        conditions: [condition],
        connector: {
          targetReference: conditionTarget,
          processMetadataValues: [],
        },
        label: "Condition 1",
        processMetadataValues: [],
      },
    ],
  } as FlowDecision;
}

/**
 * Main function to run the example
 */
function main() {
  // Check if a file path was provided
  if (Deno.args.length < 1) {
    console.error("Please provide a path to a Flow XML file");
    console.error(
      "Usage: deno run --allow-read --allow-write examples/add-decision-node.ts path/to/flow.xml",
    );
    Deno.exit(1);
  }

  const inputPath = Deno.args[0];
  const outputPath = "modified-flow.xml";

  try {
    // Parse the Flow XML file
    console.log(`Parsing Flow from ${inputPath}...`);
    const flow = parseFromFile(inputPath);

    // Find a target node to insert our decision before
    // For this example, we'll use the first subflow if available
    if (!flow.subflows || flow.subflows.length === 0) {
      console.error(
        "No subflows found in the Flow. This example requires a Flow with at least one subflow.",
      );
      Deno.exit(1);
    }

    const targetSubflow = flow.subflows[0];
    const targetName = targetSubflow.name || "";
    const nextNodeName = targetSubflow.connector?.targetReference || "";

    console.log(`Target subflow: ${targetName}`);
    console.log(`Next node: ${nextNodeName}`);

    // Create a new decision node
    const decisionNode = createDecisionNode(
      "Custom_Decision_" + Date.now(),
      targetName, // Default path goes to the original target
      nextNodeName, // Condition path goes to where the target was going
    );

    console.log(`Created decision node: ${decisionNode.name}`);

    // Method 1: Find and update parent nodes manually
    const parents = findParentFlowNodes(flow, targetName);
    console.log(`Found ${parents.length} parent nodes`);

    parents.forEach((parent) => {
      console.log(`Updating connectors in parent: ${parent.name}`);
      getConnectors(parent as BaseFlowNodeWithConnector).forEach(
        (connector) => {
          if (connector.targetReference === targetName) {
            console.log(
              `  Changing connector target from ${connector.targetReference} to ${decisionNode.name}`,
            );
            connector.targetReference = decisionNode.name || "";
          }
        },
      );
    });

    // Method 2: Alternative approach using the reparentNode function
    // Uncomment the line below to use this approach instead
    // const updatedCount = reparentNode(flow, targetName, decisionNode.name || "");
    // console.log(`Updated ${updatedCount} connections using reparentNode function`);

    // Add the decision node to the Flow
    if (!flow.decisions) {
      flow.decisions = [];
    }
    flow.decisions.push(decisionNode);

    // Write the modified Flow back to a file
    console.log(`Writing modified Flow to ${outputPath}...`);
    stringifyToFile(flow, outputPath);
    console.log(`Successfully wrote modified Flow to ${outputPath}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    Deno.exit(1);
  }
}

// Run the main function
try {
  main();
} catch (error: any) {
  console.error("Error:", error);
  Deno.exit(1);
}
