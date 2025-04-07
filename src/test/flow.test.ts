import {assertEquals, assertExists, assertThrows} from "@std/assert";
import {
  BaseFlowNodeWithConnector,
  findFlowNodeByName,
  findParentFlowNodes,
  getConnectors,
  parse,
  parseFromFile,
  stringify,
  stringifyToFile,
} from "../lib/flow.ts";
import {Flow, FlowConnector, FlowDecision, FlowNode, FlowRule,} from "@salesforce/types/metadata";
import {bigFlow, flowSingleDecision, sampleFlowXml,} from "./mock/flow.mock.ts";

// Helper function to create a temporary file
function createTempFile(content: string): string {
  const tempDir = Deno.makeTempDirSync();
  const filePath = `${tempDir}/temp-flow.xml`;
  Deno.writeTextFileSync(filePath, content);
  return filePath;
}

// Helper function for string assertions
function assertTrue(condition: boolean, msg = "Expected condition to be true") {
  assertEquals(condition, true, msg);
}

// Test for parse function
Deno.test("parse function should parse XML string to Flow object", () => {
  const flow = parse(sampleFlowXml);
  // The XML parser might return the number as a string
  assertEquals(Number(flow.apiVersion), 58.0);
  assertEquals(flow.label, "Test Flow");
  assertEquals(flow.status, "Active");
});

// Test for parse function error handling
Deno.test("parse function should throw error for invalid XML", () => {
  assertThrows(
    () => parse("<invalid>XML</invalid>"),
    Error,
    "XML does not contain a Flow element"
  );
});

Deno.test("parse function should throw error for XML without Flow element", () => {
  assertThrows(
    () => parse("<NotAFlow></NotAFlow>"),
    Error,
    "XML does not contain a Flow element"
  );
});

Deno.test("big flow won't change after parsing and stringigying", () => {
  const flow = parse(bigFlow);
  const xml = stringify(flow);
  assertEquals(xml, bigFlow);
});

// Test for parse function
Deno.test("parsed flow should adhere to types", () => {
  const flow = parse(flowSingleDecision);
  // Check that the flow object has the expected structure
  assertExists(flow.decisions);
  assertEquals(
    Array.isArray(flow.decisions),
    true,
    "flow.decisions should be an array",
  );

  // Now we can safely access the array
  assertExists(flow.decisions[0]);
  assertEquals(flow.decisions[0].label, "Run?");
  assertEquals(flow.decisions[0].name, "Run");

  // Check rules - rules should also be an array
  assertExists(flow.decisions[0].rules);
  assertEquals(
    Array.isArray(flow.decisions[0].rules),
    true,
    "rules should be an array",
  );
  assertExists(flow.decisions[0].rules[0]);
  assertEquals(flow.decisions[0].rules[0].name, "YESrun");
  assertEquals(flow.decisions[0].rules[0].label, "YES");

  // Check conditions - conditions should also be an array
  assertExists(flow.decisions[0].rules[0].conditions);
  assertEquals(
    Array.isArray(flow.decisions[0].rules[0].conditions),
    true,
    "conditions should be an array",
  );
  assertExists(flow.decisions[0].rules[0].conditions[0]);
  assertEquals(flow.decisions[0].rules[0].conditions[0].operator, "EqualTo");
  assertEquals(
    flow.decisions[0].rules[0].conditions[0].leftValueReference,
    "Bypass_Logic.Should_Run",
  );

  // check type after find function
  const foundNode = findFlowNodeByName(flow, "Run") as FlowDecision;
  assertExists(foundNode.rules);
  assertEquals(
    Array.isArray(foundNode.rules),
    true,
    "flow.decisions should be an array",
  );
});

// Test for parseFromFile function error handling
Deno.test("parseFromFile function should throw error for non-existent file", () => {
  assertThrows(
    () => parseFromFile("/non/existent/file.xml"),
    Error,
    "File not found"
  );
});

// Test for parseFromFile function - requires --allow-write and --allow-read
Deno.test({
  name: "parseFromFile function should parse XML file to Flow object",
  ignore: Deno.permissions?.query === undefined, // Skip if permissions API is not available
  fn: async () => {
    // Check for required permissions
    if (Deno.permissions) {
      const writeStatus = await Deno.permissions.query({
        name: "write",
        path: "/tmp",
      });
      const readStatus = await Deno.permissions.query({
        name: "read",
        path: "/tmp",
      });
      if (writeStatus.state !== "granted" || readStatus.state !== "granted") {
        console.warn(
          "Skipping test: requires --allow-write and --allow-read permissions",
        );
        return;
      }
    }

    const tempFilePath = createTempFile(sampleFlowXml);
    try {
      const flow = parseFromFile(tempFilePath);
      assertEquals(Number(flow.apiVersion), 58.0);
      assertEquals(flow.label, "Test Flow");
      assertEquals(flow.status, "Active");
    } finally {
      // Clean up
      try {
        Deno.removeSync(tempFilePath);
        Deno.removeSync(
          tempFilePath.substring(0, tempFilePath.lastIndexOf("/")),
          { recursive: true },
        );
      } catch (e) {
        console.error("Error cleaning up temp files:", e);
      }
    }
  },
});

// Test for stringify function
Deno.test("stringify function should convert Flow object to XML string", () => {
  const mockFlow: Partial<Flow> = {
    apiVersion: 58.0,
    description: "Test Flow",
    label: "Test Flow",
    status: "Active",
    processMetadataValues: [],
  };

  const xml = stringify(mockFlow as Flow);

  // Check that the XML contains expected elements
  assertTrue(xml.includes('<?xml version="1.0" encoding="UTF-8"?>'));
  assertTrue(
    xml.includes('<Flow xmlns="http://soap.sforce.com/2006/04/metadata">'),
  );
  // The number might be formatted differently, so check for the number part only
  assertTrue(xml.includes("<apiVersion>58"));
  assertTrue(xml.includes("<label>Test Flow</label>"));
  assertTrue(xml.includes("<status>Active</status>"));
});

// Test for stringifyToFile function error handling
Deno.test("stringifyToFile function should throw error for invalid directory", () => {
  // Create a flow object
  const flow = parse(sampleFlowXml);

  assertThrows(
    () => stringifyToFile(flow, "/invalid/directory/file.xml"),
    Error,
    "Directory not found for file"
  );
});

// Test for stringifyToFile function - requires --allow-write and --allow-read
Deno.test({
  name: "stringifyToFile function should write Flow object to XML file",
  ignore: Deno.permissions?.query === undefined, // Skip if permissions API is not available
  fn: async () => {
    // Check for required permissions
    if (Deno.permissions) {
      const writeStatus = await Deno.permissions.query({
        name: "write",
        path: "/tmp",
      });
      const readStatus = await Deno.permissions.query({
        name: "read",
        path: "/tmp",
      });
      if (writeStatus.state !== "granted" || readStatus.state !== "granted") {
        console.warn(
          "Skipping test: requires --allow-write and --allow-read permissions",
        );
        return;
      }
    }

    const mockFlow: Partial<Flow> = {
      apiVersion: 58.0,
      description: "Test Flow",
      label: "Test Flow",
      status: "Active",
      processMetadataValues: [],
    };

    const tempDir = Deno.makeTempDirSync();
    const filePath = `${tempDir}/output-flow.xml`;

    try {
      stringifyToFile(mockFlow as Flow, filePath);

      // Verify file exists
      const fileInfo = Deno.statSync(filePath);
      assertTrue(fileInfo.isFile);

      // Verify content
      const content = Deno.readTextFileSync(filePath);
      assertTrue(content.includes('<?xml version="1.0" encoding="UTF-8"?>'));
      assertTrue(
        content.includes(
          '<Flow xmlns="http://soap.sforce.com/2006/04/metadata">',
        ),
      );
      // The number might be formatted differently, so check for the number part only
      assertTrue(content.includes("<apiVersion>58"));
      assertTrue(content.includes("<label>Test Flow</label>"));
    } finally {
      // Clean up
      try {
        Deno.removeSync(tempDir, { recursive: true });
      } catch (e) {
        console.error("Error cleaning up temp files:", e);
      }
    }
  },
});

// Test for findFlowNodeByName function
Deno.test("findFlowNodeByName function should find node by name", () => {
  // Create a mock flow with nodes
  const mockNode1: Partial<FlowNode> = {
    name: "Node1",
    processMetadataValues: [],
    locationX: 100,
    locationY: 100,
    label: "Node 1",
  };
  const mockNode2: Partial<FlowNode> = {
    name: "Node2",
    processMetadataValues: [],
    locationX: 200,
    locationY: 200,
    label: "Node 2",
  };

  const mockFlow: Partial<Flow> = {
    start: mockNode1 as any,
    decisions: [mockNode2 as any],
  };

  // Test finding existing node
  const foundNode = findFlowNodeByName(mockFlow as Flow, "Node1");
  assertExists(foundNode);
  assertEquals(foundNode.name, "Node1");
  foundNode.name = "NodeX";
  assertEquals(mockFlow.start?.name, "NodeX");

  // Test finding non-existent node
  const nonExistentNode = findFlowNodeByName(mockFlow as Flow, "NonExistent");
  assertEquals(nonExistentNode, undefined);
});

// Test for getConnectors function
Deno.test("getConnectors function should return all connectors from a node", () => {
  // Create a mock node with connectors
  const mockConnector1: FlowConnector = {
    targetReference: "Target1",
    processMetadataValues: [],
  };
  const mockConnector2: FlowConnector = {
    targetReference: "Target2",
    processMetadataValues: [],
  };

  const rule: Partial<FlowRule> = {
    connector: mockConnector1,
  };

  const mockNode: Partial<FlowDecision> = {
    defaultConnector: mockConnector2,
    rules: [
      rule as FlowRule,
    ],
  };

  const connectors = getConnectors(mockNode);
  assertEquals(connectors.length, 2);
  assertEquals(connectors[1].targetReference, "Target1");
  assertEquals(connectors[0].targetReference, "Target2");

  // Test with node that has no connectors
  const emptyNode: BaseFlowNodeWithConnector = {};
  const emptyConnectors = getConnectors(emptyNode);
  assertEquals(emptyConnectors.length, 0);
});

// Test for findParentFlowNodes function
Deno.test("findParentFlowNodes function should find parent nodes", () => {
  // Create mock nodes and connectors
  const mockConnector: FlowConnector = {
    targetReference: "ChildNode",
    processMetadataValues: [],
  };

  const parentNode: Partial<FlowNode> & BaseFlowNodeWithConnector = {
    name: "ParentNode",
    connector: mockConnector,
    processMetadataValues: [],
    locationX: 100,
    locationY: 100,
    label: "Parent Node",
  };

  const childNode: Partial<FlowNode> = {
    name: "ChildNode",
    processMetadataValues: [],
    locationX: 200,
    locationY: 200,
    label: "Child Node",
  };

  const unrelatedNode: Partial<FlowNode> = {
    name: "UnrelatedNode",
    processMetadataValues: [],
    locationX: 300,
    locationY: 300,
    label: "Unrelated Node",
  };

  const mockFlow: Partial<Flow> = {
    start: parentNode as any,
    decisions: [childNode as any, unrelatedNode as any],
  };

  // Test finding parent of child node
  const parents = findParentFlowNodes(mockFlow as Flow, "ChildNode");
  assertEquals(parents.length, 1);
  assertEquals(parents[0].name, "ParentNode");

  // Test with node that has no parents
  const noParents = findParentFlowNodes(mockFlow as Flow, "UnrelatedNode");
  assertEquals(noParents.length, 0);
});
