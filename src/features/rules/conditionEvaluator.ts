import type { ConditionNode, SampleUser, ConditionTestResult, ComparisonOperator } from './types';
import { getAttributeById } from './attributeDefinitions';

// Evaluate a single condition against user data
function evaluateCondition(node: ConditionNode, user: SampleUser): { result: boolean; reason: string } {
  if (!node.attributeId || !node.comparison || node.value === undefined) {
    return { result: false, reason: 'Incomplete condition configuration' };
  }

  const attribute = getAttributeById(node.attributeId);
  if (!attribute) {
    return { result: false, reason: `Unknown attribute: ${node.attributeId}` };
  }

  // Get the actual value from user data based on attribute group
  let actualValue: any;
  switch (attribute.group) {
    case 'customer':
      actualValue = user.customer[node.attributeId];
      break;
    case 'activity':
      actualValue = user.activity[node.attributeId];
      break;
    case 'custom':
      actualValue = user.custom[node.attributeId];
      break;
    default:
      return { result: false, reason: `Unknown attribute group: ${attribute.group}` };
  }

  if (actualValue === undefined || actualValue === null) {
    return { result: false, reason: `Missing value for ${attribute.label}` };
  }

  const result = compareValues(actualValue, node.value, node.comparison, attribute.type);
  const reason = `${attribute.label} (${actualValue}) ${node.comparison} ${node.value} → ${result}`;

  return { result, reason };
}

// Compare values based on operator and field type
function compareValues(actual: any, expected: any, operator: ComparisonOperator, fieldType: string): boolean {
  switch (operator) {
    case 'equals':
      return actual === expected;
    
    case 'not_equals':
      return actual !== expected;
    
    case 'greater_than':
      if (fieldType === 'number') {
        return Number(actual) > Number(expected);
      }
      return false;
    
    case 'less_than':
      if (fieldType === 'number') {
        return Number(actual) < Number(expected);
      }
      return false;
    
    case 'contains':
      if (Array.isArray(actual)) {
        return actual.includes(expected);
      }
      if (typeof actual === 'string') {
        return actual.toLowerCase().includes(expected.toLowerCase());
      }
      return false;
    
    case 'in':
      if (Array.isArray(expected)) {
        return expected.includes(actual);
      }
      return false;
    
    case 'not_in':
      if (Array.isArray(expected)) {
        return !expected.includes(actual);
      }
      return false;
    
    default:
      return false;
  }
}

// Recursively evaluate condition tree
function evaluateNode(node: ConditionNode, user: SampleUser): { result: boolean; trace: { nodeId: string; result: boolean; reason: string }[] } {
  const trace: { nodeId: string; result: boolean; reason: string }[] = [];

  if (node.type === 'condition') {
    const evaluation = evaluateCondition(node, user);
    trace.push({
      nodeId: node.id,
      result: evaluation.result,
      reason: evaluation.reason
    });
    return { result: evaluation.result, trace };
  }

  if (node.type === 'group' && node.children && node.operator) {
    let result: boolean;
    const childTraces: { nodeId: string; result: boolean; reason: string }[] = [];

    switch (node.operator) {
      case 'AND':
        result = true;
        for (const child of node.children) {
          const childEval = evaluateNode(child, user);
          childTraces.push(...childEval.trace);
          if (!childEval.result) {
            result = false;
          }
        }
        break;

      case 'OR':
        result = false;
        for (const child of node.children) {
          const childEval = evaluateNode(child, user);
          childTraces.push(...childEval.trace);
          if (childEval.result) {
            result = true;
          }
        }
        break;

      case 'NOT':
        if (node.children.length !== 1) {
          result = false;
          childTraces.push({
            nodeId: node.id,
            result: false,
            reason: 'NOT operator must have exactly one child'
          });
        } else {
          const childEval = evaluateNode(node.children[0], user);
          childTraces.push(...childEval.trace);
          result = !childEval.result;
        }
        break;

      default:
        result = false;
        childTraces.push({
          nodeId: node.id,
          result: false,
          reason: `Unknown operator: ${node.operator}`
        });
    }

    trace.push(...childTraces);
    trace.push({
      nodeId: node.id,
      result,
      reason: `${node.operator} group → ${result}`
    });

    return { result, trace };
  }

  // Invalid node
  trace.push({
    nodeId: node.id,
    result: false,
    reason: 'Invalid node configuration'
  });
  return { result: false, trace };
}

// Main function to test condition against a user
export function testCondition(rootNode: ConditionNode, user: SampleUser): ConditionTestResult {
  const evaluation = evaluateNode(rootNode, user);
  
  return {
    user,
    matches: evaluation.result,
    evaluationTrace: evaluation.trace
  };
}

// Test condition against multiple users
export function testConditionAgainstUsers(rootNode: ConditionNode, users: SampleUser[]): ConditionTestResult[] {
  return users.map(user => testCondition(rootNode, user));
}
