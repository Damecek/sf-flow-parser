# Deno Flow Parser

A TypeScript library for parsing, manipulating, and serializing Salesforce Flow XML files in Deno.

## Features

- Parse Salesforce Flow XML files into TypeScript objects
- Manipulate Flow objects with a clean, type-safe API
- Serialize Flow objects back to XML
- Find and modify Flow nodes and their connections
- Sort Flow arrays by name for consistent output
- Comprehensive type definitions for Flow objects

## Installation

### From JSR

```bash
# Add to your dependencies
deno add @damecek/deno-flow-parser

# Or import directly in your code
import { parse, stringify } from "jsr:@damecek/deno-flow-parser";
```

### From GitHub

```typescript
import {parse, stringify} from "https://raw.githubusercontent.com/damecek/deno-flow-parser/main/src/main.ts";
```

### From Local Clone

```bash
# Clone the repository
git clone https://github.com/damecek/deno-flow-parser.git
cd deno-flow-parser

# Import in your code
import { parse, stringify } from "./src/main.ts";
```

## Usage

### Basic Usage

```typescript
import {parseFromFile, stringifyToFile} from "@damecek/deno-flow-parser";

// Parse a Flow XML file
const flow = parseFromFile("path/to/flow.xml");

// Modify the Flow object
flow.label = "Modified Flow";

// Write the modified Flow back to a file
stringifyToFile(flow, "path/to/modified-flow.xml");
```

### Finding and Modifying Flow Nodes

```typescript
import {
    parseFromFile,
    stringifyToFile,
    findFlowNodeByName,
    findParentFlowNodes,
    getConnectors
} from "@damecek/deno-flow-parser";

// Parse a Flow XML file
const flow = parseFromFile("path/to/flow.xml");

// Find a specific node
const node = findFlowNodeByName(flow, "MyDecision");
if (node) {
    // Modify the node
    node.label = "Updated Decision";
}

// Find all parent nodes that connect to a specific node
const parents = findParentFlowNodes(flow, "TargetNode");
parents.forEach(parent => {
    console.log(`Parent node: ${parent.name}`);

    // Get all connectors from the parent node
    const connectors = getConnectors(parent);
    connectors.forEach(connector => {
        console.log(`Connector target: ${connector.targetReference}`);
    });
});

// Write the modified Flow back to a file
stringifyToFile(flow, "path/to/modified-flow.xml");
```

## API Reference

### Core Functions

- `parse(xml: string): Flow` - Parse XML string into a Flow object
- `parseFromFile(path: string): Flow` - Parse Flow from XML file
- `stringify(flow: Flow): string` - Convert Flow object to XML string
- `stringifyToFile(flow: Flow, path: string): void` - Write Flow object to XML file

### Node Operations

- `findFlowNodeByName(flow: Flow, name: string): FlowNode | undefined` - Find a Flow node by name
- `findParentFlowNodes(flow: Flow, childName: string): FlowNode[]` - Find all parent nodes that connect to a child node
- `getConnectors(node: BaseFlowNodeWithConnector): FlowConnector[]` - Get all connectors from a Flow node
- `getFlowNodes(flow: Flow): FlowNode[]` - Get all nodes from a Flow object
- `reparentNode(flow: Flow, sourceNodeName: string, targetNodeName: string): void` - Change all parent node connections
  from one node to another

### Helper Functions

- `ensureArray(obj: Record<string, any>, propertyName: string): void` - Ensure a property is always an array
- `ensureArrayProperties(flow: Flow): void` - Ensure all Flow array properties are arrays
- `processNestedArrays(obj: Record<string, any>): void` - Process nested arrays in Flow objects
- `sortByName<T>(arr: T[]): T[]` - Sort an array of objects by name
- `sortFlowArrays(flow: Flow): Flow` - Sort all array properties in a Flow object by name

## Development

### Prerequisites

- [Deno](https://deno.land/) v1.37.0 or higher

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/damecek/deno-flow-parser.git
   cd deno-flow-parser
   ```

### Running Tests

```bash
# Run all tests
deno task test

# Run tests with coverage
deno task test:coverage

# Run specific test file
deno task test src/test/flow.test.ts
```

### Building

This is a Deno module, so no build step is required. The code can be imported directly.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Guidelines

1. Make sure all tests pass before submitting a PR
2. Add tests for new features
3. Update documentation for any changes
4. Follow the existing code style
5. Run `deno fmt` before committing to ensure consistent formatting

### Development Workflow

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes
4. Add or update tests
5. Run tests to ensure they pass
6. Run `deno fmt` to format your code
7. Submit a pull request

## Examples

Check out the [examples](./examples) directory for more usage examples:

- [Basic Usage](./examples/basic-usage.ts) - Simple example of parsing and modifying a Flow
- [Add Decision Node](./examples/add-decision-node.ts) - Advanced example showing how to add a new decision node to a
  Flow

Run examples with:

```bash
deno run --allow-read --allow-write examples/basic-usage.ts path/to/flow.xml
```

## License

[MIT](./LICENSE)
