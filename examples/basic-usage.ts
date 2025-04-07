/**
 * Basic usage example for deno-flow-parser
 *
 * This example demonstrates the basic functionality of the deno-flow-parser library:
 * - Parsing a Flow XML file
 * - Accessing Flow properties
 * - Finding and analyzing Flow nodes
 * - Sorting Flow arrays
 * - Serializing a Flow back to XML
 *
 * Run with:
 * deno run --allow-read --allow-write examples/basic-usage.ts path/to/flow.xml
 */

import {
  BaseFlowNodeWithConnector,
  findParentFlowNodes,
  getConnectors,
  getFlowNodes,
  parseFromFile,
  sortFlowArrays,
  stringifyToFile
} from "../src/main.ts";

/**
 * Main function to run the example
 */
function main() {
  // Check if a file path was provided
  if (Deno.args.length < 1) {
    console.error("Please provide a path to a Flow XML file");
    console.error(
      "Usage: deno run --allow-read --allow-write examples/basic-usage.ts path/to/flow.xml",
    );
    Deno.exit(1);
  }

  const inputPath = Deno.args[0];
  const outputPath = "output.xml";

  try {
    // Parse the Flow XML file
    console.log(`Parsing Flow from ${inputPath}...`);
    const flow = parseFromFile(inputPath);

    // Get all nodes in the Flow
    const allNodes = getFlowNodes(flow);
    console.log(`Flow contains ${allNodes.length} nodes`);

    // Display some basic information about the Flow
    console.log(`\nFlow Information:`);
    console.log(`- API Version: ${flow.apiVersion}`);
    console.log(`- Label: ${flow.label}`);
    console.log(`- Status: ${flow.status}`);

    // Find a specific node (for example, the first decision node)
    if (flow.decisions && flow.decisions.length > 0) {
      const firstDecision = flow.decisions[0];
      console.log(`\nFirst Decision Node:`);
      console.log(`- Name: ${firstDecision.name}`);
      console.log(`- Label: ${firstDecision.label}`);

      // Find all parent nodes that connect to this decision
      const parents = findParentFlowNodes(flow, firstDecision.name || "");
      console.log(`\nParent Nodes (${parents.length}):`);
      parents.forEach((parent) => {
        console.log(`- ${parent.name} (${parent.label})`);

        // Get all connectors from the parent node
        const connectors = getConnectors(parent as BaseFlowNodeWithConnector);
        console.log(`  Connectors (${connectors.length}):`);
        connectors.forEach((connector) => {
          console.log(`  - Target: ${connector.targetReference}`);
        });
      });
    }

    // Sort all array properties by name
    console.log(`\nSorting Flow arrays by name...`);
    const sortedFlow = sortFlowArrays(flow);

    // Serialize the Flow back to XML
    console.log(`\nWriting sorted Flow to ${outputPath}...`);
    stringifyToFile(sortedFlow, outputPath);
    console.log(`Successfully wrote Flow to ${outputPath}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    Deno.exit(1);
  }
}

// Run the main function
main();
