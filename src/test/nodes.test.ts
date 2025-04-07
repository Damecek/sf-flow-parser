import { assertEquals, assertExists } from "@std/assert";
import { Flow, FlowConnector, FlowDecision, FlowNode, FlowRule, FlowStart, FlowScreen, FlowAssignment, FlowMetadataValue } from "@salesforce/types/metadata";
import {
  getFlowNodes,
  findFlowNodeByName,
  getConnectors,
  findParentFlowNodes,
  reparentNode
} from "../lib/nodes.ts";
import { BaseFlowNodeWithConnector } from "../lib/types.ts";
import { parse } from "../lib/flow.ts";
import { flowSingleDecision } from "./mock/flow.mock.ts";

// Test for getFlowNodes function
Deno.test("getFlowNodes should return all nodes from a Flow object", () => {
  // Create a mock flow with various node types
  const mockFlow: Partial<Flow> = {
    start: {
      name: "StartNode",
      processMetadataValues: [],
      locationX: 100,
      locationY: 100,
      label: "Start Node",
      connector: undefined,
      filters: [],
      scheduledPaths: [],
      capabilityTypes: [],
    } as FlowStart,
    decisions: [
      {
        name: "Decision1",
        processMetadataValues: [],
        locationX: 200,
        locationY: 200,
        label: "Decision 1",
        rules: [],
      } as FlowDecision,
      {
        name: "Decision2",
        processMetadataValues: [],
        locationX: 300,
        locationY: 300,
        label: "Decision 2",
        rules: [],
      } as FlowDecision,
    ],
    screens: [
      {
        name: "Screen1",
        processMetadataValues: [],
        locationX: 400,
        locationY: 400,
        label: "Screen 1",
        fields: [],
        actions: [],
        rules: [],
        triggers: [],
      } as FlowScreen,
    ],
    assignments: [
      {
        name: "Assignment1",
        processMetadataValues: [],
        locationX: 500,
        locationY: 500,
        label: "Assignment 1",
        assignmentItems: [],
      } as FlowAssignment,
    ],
  };

  // Get all nodes
  const nodes = getFlowNodes(mockFlow as Flow);

  // Check that all nodes are returned
  assertEquals(nodes.length, 5);

  // Create a set of expected node names
  const nodeNames = new Set(nodes.map(node => node.name));

  // Check that all expected nodes are in the set
  assertEquals(nodeNames.has("StartNode"), true);
  assertEquals(nodeNames.has("Decision1"), true);
  assertEquals(nodeNames.has("Decision2"), true);
  assertEquals(nodeNames.has("Screen1"), true);
  assertEquals(nodeNames.has("Assignment1"), true);
});

// Test for getFlowNodes with missing start node
Deno.test("getFlowNodes should handle missing start node", () => {
  // Create a mock flow without a start node
  const mockFlow: Partial<Flow> = {
    decisions: [
      {
        name: "Decision1",
        processMetadataValues: [],
        locationX: 200,
        locationY: 200,
        label: "Decision 1",
        rules: [],
      } as FlowDecision,
    ],
  };

  // Get all nodes
  const nodes = getFlowNodes(mockFlow as Flow);

  // Check that only the decision node is returned
  assertEquals(nodes.length, 1);
  assertEquals(nodes[0].name, "Decision1");
});

// Test for getFlowNodes with empty flow
Deno.test("getFlowNodes should handle empty flow", () => {
  // Create an empty mock flow
  const mockFlow: Partial<Flow> = {};

  // Get all nodes
  const nodes = getFlowNodes(mockFlow as Flow);

  // Check that no nodes are returned
  assertEquals(nodes.length, 0);
});

// Test for findFlowNodeByName with complex flow
Deno.test("findFlowNodeByName should find node in complex flow", () => {
  // Parse the complex flow from mock data
  const flow = parse(flowSingleDecision);

  // Find the decision node
  const decisionNode = findFlowNodeByName(flow, "Run");
  assertExists(decisionNode);
  assertEquals(decisionNode.label, "Run?");

  // Find the start node
  const startNode = findFlowNodeByName(flow, "Start");
  assertEquals(startNode, undefined); // Start node doesn't have a name in the mock

  // Find a non-existent node
  const nonExistentNode = findFlowNodeByName(flow, "NonExistentNode");
  assertEquals(nonExistentNode, undefined);
});

// Test for getConnectors with different node types
Deno.test("getConnectors should handle different node types", () => {
  // Create a mock node with various connector types
  const mockRule1: Partial<FlowRule> = {
    processMetadataValues: [],
    connector: {
      targetReference: "Target1",
      processMetadataValues: [],
    },
  };

  const mockRule2: Partial<FlowRule> = {
    processMetadataValues: [],
    connector: {
      targetReference: "Target2",
      processMetadataValues: [],
    },
  };

  const mockScheduledPath = {
    processMetadataValues: [],
    connector: {
      targetReference: "Target3",
      processMetadataValues: [],
    },
  };

  const mockWaitEvent = {
    processMetadataValues: [],
    connector: {
      targetReference: "Target4",
      processMetadataValues: [],
    },
  };

  const mockNode: BaseFlowNodeWithConnector = {
    connector: {
      targetReference: "Target5",
      processMetadataValues: [],
    },
    defaultConnector: {
      targetReference: "Target6",
      processMetadataValues: [],
    },
    nextValueConnector: {
      targetReference: "Target7",
      processMetadataValues: [],
    },
    noMoreValuesConnector: {
      targetReference: "Target8",
      processMetadataValues: [],
    },
    faultConnector: {
      targetReference: "Target9",
      processMetadataValues: [],
    },
    rules: [mockRule1 as FlowRule, mockRule2 as FlowRule],
    scheduledPaths: [mockScheduledPath as any],
    waitEvents: [mockWaitEvent as any],
  };

  // Get all connectors
  const connectors = getConnectors(mockNode);

  // Check that all connectors are returned
  assertEquals(connectors.length, 9);
  assertEquals(connectors[0].targetReference, "Target5"); // connector
  assertEquals(connectors[1].targetReference, "Target6"); // defaultConnector
  assertEquals(connectors[2].targetReference, "Target7"); // nextValueConnector
  assertEquals(connectors[3].targetReference, "Target8"); // noMoreValuesConnector
  assertEquals(connectors[4].targetReference, "Target9"); // faultConnector
  assertEquals(connectors[5].targetReference, "Target1"); // rules[0].connector
  assertEquals(connectors[6].targetReference, "Target2"); // rules[1].connector
  assertEquals(connectors[7].targetReference, "Target3"); // scheduledPaths[0].connector
  assertEquals(connectors[8].targetReference, "Target4"); // waitEvents[0].connector
});

// Test for getConnectors with null/undefined connectors
Deno.test("getConnectors should handle null/undefined connectors", () => {
  // Create a mock node with some null/undefined connectors
  const mockNode: BaseFlowNodeWithConnector = {
    connector: undefined,
    defaultConnector: undefined,
    rules: [
      {
        processMetadataValues: [],
        connector: {
          targetReference: "Target1",
          processMetadataValues: [],
        },
        conditionLogic: "and",
        conditions: [],
        label: "Rule 1",
      } as FlowRule,
    ],
  };

  // Get all connectors
  const connectors = getConnectors(mockNode);

  // Check that only the valid connector is returned
  assertEquals(connectors.length, 1);
  assertEquals(connectors[0].targetReference, "Target1");
});

// Test for findParentFlowNodes with multiple parents
Deno.test("findParentFlowNodes should find multiple parent nodes", () => {
  // Create a mock flow with multiple parents pointing to the same child
  const childNodeName = "ChildNode";

  const parentNode1: Partial<FlowNode> & BaseFlowNodeWithConnector = {
    name: "ParentNode1",
    connector: {
      targetReference: childNodeName,
      processMetadataValues: [],
    },
    processMetadataValues: [],
    locationX: 100,
    locationY: 100,
    label: "Parent Node 1",
    rules: [],
  };

  const parentNode2: Partial<FlowNode> & BaseFlowNodeWithConnector = {
    name: "ParentNode2",
    connector: {
      targetReference: childNodeName,
      processMetadataValues: [],
    },
    processMetadataValues: [],
    locationX: 200,
    locationY: 200,
    label: "Parent Node 2",
    rules: [],
  };

  const unrelatedNode: Partial<FlowNode> & BaseFlowNodeWithConnector = {
    name: "UnrelatedNode",
    connector: {
      targetReference: "SomeOtherNode",
      processMetadataValues: [],
    },
    processMetadataValues: [],
    locationX: 300,
    locationY: 300,
    label: "Unrelated Node",
    rules: [],
  };

  const childNode: Partial<FlowNode> = {
    name: childNodeName,
    processMetadataValues: [],
    locationX: 400,
    locationY: 400,
    label: "Child Node",
  };

  const mockFlow: Partial<Flow> = {
    decisions: [parentNode1 as any, parentNode2 as any, unrelatedNode as any, childNode as any],
  };

  // Find parent nodes
  const parents = findParentFlowNodes(mockFlow as Flow, childNodeName);

  // Check that both parent nodes are found
  assertEquals(parents.length, 2);
  assertEquals(parents[0].name, "ParentNode1");
  assertEquals(parents[1].name, "ParentNode2");
});

// Test for reparentNode function
Deno.test("reparentNode should update parent node connectors", () => {
  // Create a mock flow with parent nodes pointing to a source node
  const sourceNodeName = "SourceNode";
  const targetNodeName = "TargetNode";

  const parentNode1: Partial<FlowNode> & BaseFlowNodeWithConnector = {
    name: "ParentNode1",
    connector: {
      targetReference: sourceNodeName,
      processMetadataValues: [],
    },
    processMetadataValues: [],
    locationX: 100,
    locationY: 100,
    label: "Parent Node 1",
    rules: [],
  };

  const parentNode2: Partial<FlowNode> & BaseFlowNodeWithConnector = {
    name: "ParentNode2",
    defaultConnector: {
      targetReference: sourceNodeName,
      processMetadataValues: [],
    },
    processMetadataValues: [],
    locationX: 200,
    locationY: 200,
    label: "Parent Node 2",
    rules: [],
  };

  const parentNode3: Partial<FlowNode> & BaseFlowNodeWithConnector = {
    name: "ParentNode3",
    rules: [
      {
        processMetadataValues: [],
        connector: {
          targetReference: sourceNodeName,
          processMetadataValues: [],
        },
        conditionLogic: "and",
        conditions: [],
        label: "Rule 1",
      } as FlowRule,
    ],
    processMetadataValues: [],
    locationX: 300,
    locationY: 300,
    label: "Parent Node 3",
  };

  const sourceNode: Partial<FlowNode> = {
    name: sourceNodeName,
    processMetadataValues: [],
    locationX: 400,
    locationY: 400,
    label: "Source Node",
  };

  const targetNode: Partial<FlowNode> = {
    name: targetNodeName,
    processMetadataValues: [],
    locationX: 500,
    locationY: 500,
    label: "Target Node",
  };

  const mockFlow: Partial<Flow> = {
    decisions: [parentNode1 as any, parentNode2 as any, parentNode3 as any, sourceNode as any, targetNode as any],
  };

  // Reparent the nodes
  reparentNode(mockFlow as Flow, sourceNodeName, targetNodeName);

  // Check that all parent nodes now point to the target node
  assertEquals(parentNode1.connector?.targetReference, targetNodeName);
  assertEquals(parentNode2.defaultConnector?.targetReference, targetNodeName);
  assertEquals(parentNode3.rules?.[0].connector?.targetReference, targetNodeName);
});

// Test for reparentNode with no parents
Deno.test("reparentNode should handle case with no parents", () => {
  // Create a mock flow with no parents pointing to the source node
  const sourceNodeName = "SourceNode";
  const targetNodeName = "TargetNode";

  const unrelatedNode: Partial<FlowNode> & BaseFlowNodeWithConnector = {
    name: "UnrelatedNode",
    connector: {
      targetReference: "SomeOtherNode",
      processMetadataValues: [],
    },
    processMetadataValues: [],
    locationX: 100,
    locationY: 100,
    label: "Unrelated Node",
    rules: [],
  };

  const sourceNode: Partial<FlowNode> = {
    name: sourceNodeName,
    processMetadataValues: [],
    locationX: 200,
    locationY: 200,
    label: "Source Node",
  };

  const targetNode: Partial<FlowNode> = {
    name: targetNodeName,
    processMetadataValues: [],
    locationX: 300,
    locationY: 300,
    label: "Target Node",
  };

  const mockFlow: Partial<Flow> = {
    decisions: [unrelatedNode as any, sourceNode as any, targetNode as any],
  };

  // Reparent the nodes (should not throw any errors)
  reparentNode(mockFlow as Flow, sourceNodeName, targetNodeName);

  // Check that the unrelated node still points to the original target
  assertEquals(unrelatedNode.connector?.targetReference, "SomeOtherNode");
});
