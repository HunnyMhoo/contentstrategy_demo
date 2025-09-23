import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, Button, Space, Alert, Modal, Select, Divider, Typography, Tag } from 'antd';
import { PlayCircleOutlined, InfoCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ConditionNode, AudienceCondition, ValidationResult, ConditionTestResult } from '../types';
import { SAMPLE_USERS } from '../sampleUsers';
import { testConditionAgainstUsers } from '../conditionEvaluator';
import { getFeaturedAttributes } from '../attributeDefinitions';
import ConditionNodeComponent from './ConditionNode';

const { Title, Text } = Typography;

interface ConditionBuilderProps {
  condition?: AudienceCondition;
  onChange: (condition: AudienceCondition) => void;
  onValidationChange?: (validation: ValidationResult) => void;
}

const ConditionBuilder: React.FC<ConditionBuilderProps> = ({
  condition,
  onChange,
  onValidationChange
}) => {
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [testResults, setTestResults] = useState<ConditionTestResult[]>([]);
  const [selectedTestUser, setSelectedTestUser] = useState<string>('');

  // Initialize with empty condition if none provided - memoized to prevent re-creation
  const currentCondition: AudienceCondition = useMemo(() => {
    return condition || {
      id: `condition_${Date.now()}`,
      name: 'New Audience Condition',
      rootNode: {
        id: `node_${Date.now()}`,
        type: 'group',
        operator: 'AND',
        children: [],
        depth: 0,
        isValid: false
      },
      lastModified: new Date()
    };
  }, [condition]);

  // Generate unique ID for new nodes
  const generateNodeId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Update node in the tree
  const updateNode = useCallback((nodeId: string, updates: Partial<ConditionNode>) => {
    const updateNodeRecursive = (node: ConditionNode): ConditionNode => {
      if (node.id === nodeId) {
        return { ...node, ...updates };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNodeRecursive)
        };
      }
      return node;
    };

    const updatedRootNode = updateNodeRecursive(currentCondition.rootNode);
    const updatedCondition: AudienceCondition = {
      ...currentCondition,
      rootNode: updatedRootNode,
      lastModified: new Date()
    };

    onChange(updatedCondition);
  }, [currentCondition, onChange]);

  // Delete node from the tree
  const deleteNode = useCallback((nodeId: string) => {
    const deleteNodeRecursive = (node: ConditionNode): ConditionNode => {
      if (node.children) {
        return {
          ...node,
          children: node.children.filter(child => child.id !== nodeId).map(deleteNodeRecursive)
        };
      }
      return node;
    };

    const updatedRootNode = deleteNodeRecursive(currentCondition.rootNode);
    const updatedCondition: AudienceCondition = {
      ...currentCondition,
      rootNode: updatedRootNode,
      lastModified: new Date()
    };

    onChange(updatedCondition);
  }, [currentCondition, onChange]);

  // Add child node
  const addChild = useCallback((parentId: string, childType: 'group' | 'condition') => {
    const addChildRecursive = (node: ConditionNode): ConditionNode => {
      if (node.id === parentId) {
        const newChild: ConditionNode = {
          id: generateNodeId(),
          type: childType,
          depth: (node.depth || 0) + 1,
          isValid: false
        };

        if (childType === 'group') {
          newChild.operator = 'AND';
          newChild.children = [];
        }

        return {
          ...node,
          children: [...(node.children || []), newChild]
        };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(addChildRecursive)
        };
      }
      return node;
    };

    const updatedRootNode = addChildRecursive(currentCondition.rootNode);
    const updatedCondition: AudienceCondition = {
      ...currentCondition,
      rootNode: updatedRootNode,
      lastModified: new Date()
    };

    onChange(updatedCondition);
  }, [currentCondition, onChange]);

  // Validate condition
  const validateCondition = useCallback((cond: AudienceCondition): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const validateNodeRecursive = (node: ConditionNode) => {
      if (node.type === 'condition') {
        if (!node.attributeId) {
          errors.push(`Condition ${node.id}: No attribute selected`);
        }
        if (!node.comparison) {
          errors.push(`Condition ${node.id}: No comparison operator selected`);
        }
        if (node.value === undefined || node.value === null || node.value === '') {
          errors.push(`Condition ${node.id}: No value specified`);
        }
      } else if (node.type === 'group') {
        if (!node.operator) {
          errors.push(`Group ${node.id}: No operator selected`);
        }
        if (!node.children || node.children.length === 0) {
          warnings.push(`Group ${node.id}: No child conditions`);
        }
        if (node.operator === 'NOT' && node.children && node.children.length > 1) {
          errors.push(`Group ${node.id}: NOT operator can only have one child`);
        }
      }

      if (node.children) {
        node.children.forEach(validateNodeRecursive);
      }
    };

    validateNodeRecursive(cond.rootNode);

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    return result;
  }, []);

  // Test condition against users
  const handleTestCondition = () => {
    const results = testConditionAgainstUsers(currentCondition.rootNode, SAMPLE_USERS);
    setTestResults(results);
    setTestModalVisible(true);
  };

  // Quick setup for featured attributes (like Targeted Lead)
  const addFeaturedCondition = (attributeId: string) => {
    const newCondition: ConditionNode = {
      id: generateNodeId(),
      type: 'condition',
      attributeId,
      comparison: 'equals',
      value: true,
      depth: 1,
      isValid: true
    };

    const updatedRootNode: ConditionNode = {
      ...currentCondition.rootNode,
      children: [...(currentCondition.rootNode.children || []), newCondition]
    };

    const updatedCondition: AudienceCondition = {
      ...currentCondition,
      rootNode: updatedRootNode,
      lastModified: new Date()
    };

    onChange(updatedCondition);
  };

  const validation = useMemo(() => validateCondition(currentCondition), [currentCondition, validateCondition]);
  const featuredAttributes = getFeaturedAttributes();

  // Call onValidationChange when validation changes
  useEffect(() => {
    onValidationChange?.(validation);
  }, [validation, onValidationChange]);

  return (
    <div className="condition-builder">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <Title level={4} className="!mb-0">Audience Condition Builder</Title>
          <Space>
            <Button
              icon={<PlayCircleOutlined />}
              onClick={handleTestCondition}
              type="primary"
              disabled={!validation.isValid}
            >
              Test Condition
            </Button>
          </Space>
        </div>
        <Text type="secondary">
          Build complex audience targeting rules using drag-and-drop conditions with AND/OR/NOT logic
        </Text>
      </div>

      {/* Quick Setup for Featured Attributes */}
      {featuredAttributes.length > 0 && (
        <Card size="small" className="mb-4" style={{ backgroundColor: '#fff7e6' }}>
          <div className="flex items-center gap-2 mb-2">
            <InfoCircleOutlined className="text-orange-500" />
            <Text strong>Quick Setup - Featured Attributes</Text>
          </div>
          <Space wrap>
            {featuredAttributes.map(attr => (
              <Button
                key={attr.id}
                size="small"
                onClick={() => addFeaturedCondition(attr.id)}
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <Tag color="gold">★</Tag>
                Add {attr.label}
              </Button>
            ))}
          </Space>
        </Card>
      )}

      {/* Validation Status */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <Alert
          type={validation.errors.length > 0 ? "error" : "warning"}
          showIcon
          className="mb-4"
          message={
            validation.errors.length > 0 
              ? `${validation.errors.length} error${validation.errors.length !== 1 ? 's' : ''} found`
              : `${validation.warnings.length} warning${validation.warnings.length !== 1 ? 's' : ''} found`
          }
          description={
            <div>
              {validation.errors.map((error, index) => (
                <div key={`error-${index}`} className="text-red-600">• {error}</div>
              ))}
              {validation.warnings.map((warning, index) => (
                <div key={`warning-${index}`} className="text-orange-600">• {warning}</div>
              ))}
            </div>
          }
        />
      )}

      {/* Condition Tree */}
      <Card title="Condition Tree" className="mb-4">
        <ConditionNodeComponent
          node={currentCondition.rootNode}
          onUpdate={updateNode}
          onDelete={deleteNode}
          onAddChild={addChild}
          maxDepth={5}
          isRoot={true}
        />
      </Card>

      {/* Test Results Modal */}
      <Modal
        title="Condition Test Results"
        open={testModalVisible}
        onCancel={() => setTestModalVisible(false)}
        width={800}
        footer={null}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Text>
              Testing against {SAMPLE_USERS.length} sample users
            </Text>
            <Select
              placeholder="Select user to view details"
              value={selectedTestUser}
              onChange={setSelectedTestUser}
              className="min-w-48"
            >
              {testResults.map(result => (
                <Select.Option key={result.user.user_id} value={result.user.user_id}>
                  <div className="flex items-center justify-between">
                    <span>{result.user.name}</span>
                    {result.matches ? (
                      <CheckCircleOutlined className="text-green-500" />
                    ) : (
                      <ExclamationCircleOutlined className="text-red-500" />
                    )}
                  </div>
                </Select.Option>
              ))}
            </Select>
          </div>

          <Divider />

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {testResults.filter(r => r.matches).length}
                </div>
                <div className="text-gray-500">Matches</div>
              </div>
            </Card>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {testResults.filter(r => !r.matches).length}
                </div>
                <div className="text-gray-500">No Match</div>
              </div>
            </Card>
          </div>

          {/* Detailed Results */}
          {selectedTestUser && (
            <>
              <Divider />
              {(() => {
                const result = testResults.find(r => r.user.user_id === selectedTestUser);
                if (!result) return null;

                return (
                  <div>
                    <Title level={5}>
                      {result.user.name} - {result.matches ? 'Match' : 'No Match'}
                    </Title>
                    
                    <div className="space-y-2">
                      <Text strong>Evaluation Trace:</Text>
                      {result.evaluationTrace.map((trace, index) => (
                        <div key={index} className="pl-4 border-l-2 border-gray-200">
                          <div className={`text-sm ${trace.result ? 'text-green-600' : 'text-red-600'}`}>
                            {trace.result ? '✓' : '✗'} {trace.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ConditionBuilder;
