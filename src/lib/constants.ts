/**
 * Constants file for Flow parser
 * Contains all property definitions and configurations
 */

/**
 * List of node types that should be included in getFlowNodes
 */
export const FLOW_ARRAY_NODES = [
  "decisions",
  "actionCalls",
  "apexPluginCalls",
  "assignments",
  "collectionProcessors",
  "customErrors",
  "loops",
  "recordCreates",
  "recordDeletes",
  "recordLookups",
  "recordRollbacks",
  "recordUpdates",
  "screens",
  "subflows",
  "transforms",
  "waits",
  "orchestratedStages",
];

/**
 * List of all Flow properties that should be arrays
 */
export const FLOW_ARRAY_PROPERTIES = [
  ...FLOW_ARRAY_NODES,
  // Additional Flow properties
  "choices",
  "constants",
  "dynamicChoiceSets",
  "environments",
  "formulas",
  "processMetadataValues",
  "stages",
  "steps",
  "textTemplates",
  "variables",
];

/**
 * Configuration for nested array properties in Flow objects
 * Maps parent property to array of child properties that should be arrays
 */
export const NESTED_ARRAY_CONFIG = {
  // Decision node properties
  decisions: {
    childArrays: ["rules"],
    nestedConfig: {
      rules: {
        childArrays: ["conditions"],
      },
    },
  },

  // Screen node properties
  screens: {
    childArrays: ["fields", "actions", "rules", "triggers"],
    nestedConfig: {
      rules: {
        childArrays: ["conditions", "ruleActions"],
      },
      triggers: {
        childArrays: ["handlers"],
      },
      fields: {
        childArrays: [
          "fields",
          "choiceReferences",
          "inputParameters",
          "outputParameters",
          "dataTypeMappings",
        ],
        recursive: "fields", // Property that should be processed recursively
      },
    },
  },

  // Record operation properties
  recordLookups: {
    childArrays: ["filters", "outputAssignments", "queriedFields"],
  },
  recordCreates: {
    childArrays: ["inputAssignments"],
  },
  recordUpdates: {
    childArrays: ["filters", "inputAssignments"],
  },
  recordDeletes: {
    childArrays: ["filters"],
  },

  // Assignment properties
  assignments: {
    childArrays: ["assignmentItems"],
  },

  // Call properties
  actionCalls: {
    childArrays: ["inputParameters", "outputParameters", "dataTypeMappings"],
  },
  apexPluginCalls: {
    childArrays: ["inputParameters", "outputParameters"],
  },

  // Subflow properties
  subflows: {
    childArrays: ["inputAssignments", "outputAssignments"],
  },

  // Wait properties
  waits: {
    childArrays: ["waitEvents"],
    nestedConfig: {
      waitEvents: {
        childArrays: [
          "conditions",
          "filters",
          "inputParameters",
          "outputParameters",
        ],
      },
    },
  },

  // Transform properties
  transforms: {
    childArrays: ["transformValues"],
    nestedConfig: {
      transformValues: {
        childArrays: ["transformValueActions"],
        nestedConfig: {
          transformValueActions: {
            childArrays: ["inputParameters"],
          },
        },
      },
    },
  },

  // Orchestrated stage properties
  orchestratedStages: {
    childArrays: [
      "stageSteps",
      "exitConditions",
      "exitActionInputParameters",
      "exitActionOutputParameters",
    ],
    nestedConfig: {
      stageSteps: {
        childArrays: [
          "assignees",
          "entryConditions",
          "exitConditions",
          "inputParameters",
          "outputParameters",
          "entryActionInputParameters",
          "entryActionOutputParameters",
          "exitActionInputParameters",
          "exitActionOutputParameters",
        ],
      },
    },
  },

  // Start node properties
  start: {
    childArrays: ["filters", "scheduledPaths", "capabilityTypes"],
    nestedConfig: {
      capabilityTypes: {
        childArrays: ["inputs"],
      },
    },
  },

  // Dynamic choice set properties
  dynamicChoiceSets: {
    childArrays: ["filters", "outputAssignments"],
  },

  // Collection processor properties
  collectionProcessors: {
    childArrays: ["conditions", "mapItems", "sortOptions"],
  },

  // Custom error properties
  customErrors: {
    childArrays: ["customErrorMessages"],
  },
};
/**
 * Configuration for nested sorting in Flow objects
 * Maps parent property to array of child properties that should be sorted
 */
export const NESTED_SORT_CONFIG: Record<string, { childArrays: string[] }> = {
  decisions: {
    childArrays: ["rules"],
  },
  screens: {
    childArrays: ["fields", "actions"],
  },
};
