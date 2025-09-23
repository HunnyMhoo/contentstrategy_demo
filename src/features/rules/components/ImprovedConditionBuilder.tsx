import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Space, Tag, Alert, Divider, Input, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined, UserOutlined, TrophyOutlined, DollarOutlined } from '@ant-design/icons';
import type { ComparisonOperator, ConditionOperator } from '../types';
import { getAttributesByGroup } from '../attributeDefinitions';

// Flexible condition structure
interface FlexibleCondition {
  id: string;
  attributeId: string;
  operator: ComparisonOperator;
  value: any;
  logicalOperator?: ConditionOperator; // AND, OR for chaining
}

interface ImprovedConditionBuilderProps {
  onConditionChange: (conditions: FlexibleCondition[]) => void;
  initialConditions?: FlexibleCondition[];
}

// Available operators for different field types
const COMPARISON_OPERATORS: { value: ComparisonOperator; label: string; types: string[] }[] = [
  { value: 'equals', label: 'equals (=)', types: ['boolean', 'enum', 'string', 'number'] },
  { value: 'not_equals', label: 'does not equal (≠)', types: ['boolean', 'enum', 'string', 'number'] },
  { value: 'greater_than', label: 'greater than (>)', types: ['number'] },
  { value: 'less_than', label: 'less than (<)', types: ['number'] },
  { value: 'contains', label: 'contains', types: ['multi-select', 'string'] },
  { value: 'in', label: 'is one of', types: ['enum', 'multi-select'] },
  { value: 'not_in', label: 'is not one of', types: ['enum', 'multi-select'] }
];

const LOGICAL_OPERATORS: { value: ConditionOperator; label: string; color: string }[] = [
  { value: 'AND', label: 'AND', color: 'blue' },
  { value: 'OR', label: 'OR', color: 'green' }
];


const ImprovedConditionBuilder: React.FC<ImprovedConditionBuilderProps> = ({ 
  onConditionChange,
  initialConditions = []
}) => {
  const [conditions, setConditions] = useState<FlexibleCondition[]>(() => {
    console.log('Setting initial conditions:', initialConditions);
    return initialConditions;
  });
  const [isAddingCondition, setIsAddingCondition] = useState(false);

  // Update conditions when initialConditions change
  useEffect(() => {
    console.log('ImprovedConditionBuilder received initialConditions:', initialConditions);
    setConditions(initialConditions);
  }, [initialConditions]);

  // Get all available attributes grouped by category
  const customerAttributes = getAttributesByGroup('customer');
  const activityAttributes = getAttributesByGroup('activity');
  const customAttributes = getAttributesByGroup('custom');
  const allAttributes = [...customerAttributes, ...activityAttributes, ...customAttributes];
  
  console.log('ImprovedConditionBuilder render - current conditions:', conditions);

  const addNewCondition = () => {
    const newCondition: FlexibleCondition = {
      id: `condition_${Date.now()}`,
      attributeId: '',
      operator: 'equals',
      value: '',
      logicalOperator: conditions.length > 0 ? 'AND' : undefined
    };
    
    const newConditions = [...conditions, newCondition];
    setConditions(newConditions);
    setIsAddingCondition(true);
    onConditionChange(newConditions);
  };

  const updateCondition = (conditionId: string, updates: Partial<FlexibleCondition>) => {
    const newConditions = conditions.map(condition => 
      condition.id === conditionId ? { ...condition, ...updates } : condition
    );
    setConditions(newConditions);
    onConditionChange(newConditions);
  };

  const removeCondition = (conditionId: string) => {
    const newConditions = conditions.filter(c => c.id !== conditionId);
    // Reset logical operator for first condition if it exists
    if (newConditions.length > 0) {
      newConditions[0].logicalOperator = undefined;
    }
    setConditions(newConditions);
    onConditionChange(newConditions);
  };

  const getAvailableOperators = (attributeId: string) => {
    const attribute = allAttributes.find(attr => attr.id === attributeId);
    if (!attribute) return COMPARISON_OPERATORS;
    
    return COMPARISON_OPERATORS.filter(op => op.types.includes(attribute.type));
  };

  const renderValueInput = (condition: FlexibleCondition) => {
    const attribute = allAttributes.find(attr => attr.id === condition.attributeId);
    if (!attribute) return <Input placeholder="Enter value" />;

    switch (attribute.type) {
      case 'boolean':
        return (
          <Select
            value={condition.value}
            onChange={(value) => updateCondition(condition.id, { value })}
            placeholder="Select value"
            className="w-full"
          >
            <Select.Option value={true}>Yes / True</Select.Option>
            <Select.Option value={false}>No / False</Select.Option>
          </Select>
        );
      
      case 'enum':
        return (
          <Select
            value={condition.value}
            onChange={(value) => updateCondition(condition.id, { value })}
            placeholder="Select value"
            className="w-full"
          >
            {attribute.options?.map(option => (
              <Select.Option key={option} value={option}>{option}</Select.Option>
            ))}
          </Select>
        );
      
      case 'multi-select':
        return (
          <Select
            mode="multiple"
            value={condition.value}
            onChange={(value) => updateCondition(condition.id, { value })}
            placeholder="Select values"
            className="w-full"
          >
            {attribute.options?.map(option => (
              <Select.Option key={option} value={option}>{option}</Select.Option>
            ))}
          </Select>
        );
      
      case 'number':
        return (
          <InputNumber
            value={condition.value}
            onChange={(value) => updateCondition(condition.id, { value })}
            placeholder="Enter number"
            className="w-full"
          />
        );
      
      default:
        return (
          <Input
            value={condition.value}
            onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
            placeholder="Enter value"
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Who should see this content?
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Build your audience by selecting attributes, operators, and values. Chain conditions with AND/OR logic.
        </p>
      </div>

      {/* Condition Builder Interface */}
      <Card title="🎯 Audience Conditions" className="mb-6">
        <div className="space-y-4">
          {/* Empty State */}
          {conditions.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="mb-4">
                <div className="text-4xl mb-2">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Start Building Your Audience
                </h3>
                <p className="text-gray-600 mb-4">
                  Add conditions to define who should see this content
                </p>
              </div>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={addNewCondition}
                size="large"
              >
                Add Your First Condition
              </Button>
            </div>
          )}

          {/* Condition List */}
          {conditions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Your Conditions:</h4>
                <Button 
                  type="dashed" 
                  icon={<PlusOutlined />}
                  onClick={addNewCondition}
                  size="small"
                >
                  Add Condition
                </Button>
              </div>
              
              {conditions.map((condition, index) => (
                <div key={condition.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  {/* Logical Operator */}
                  {condition.logicalOperator && (
                    <div className="flex items-center mb-3">
                      <Select
                        value={condition.logicalOperator}
                        onChange={(value) => updateCondition(condition.id, { logicalOperator: value })}
                        className="w-20"
                        size="small"
                      >
                        {LOGICAL_OPERATORS.map(op => (
                          <Select.Option key={op.value} value={op.value}>
                            <Tag color={op.color} size="small">{op.label}</Tag>
                          </Select.Option>
                        ))}
                      </Select>
                    </div>
                  )}

                  {/* Condition Builder Row */}
                  <div className="grid grid-cols-12 gap-3 items-center">
                    {/* Attribute Selection */}
                    <div className="col-span-4">
                      <Select
                        value={condition.attributeId}
                        onChange={(value) => updateCondition(condition.id, { attributeId: value })}
                        placeholder="Select attribute"
                        className="w-full"
                        showSearch
                        optionFilterProp="label"
                      >
                        <Select.OptGroup label="Customer Attributes">
                          {customerAttributes.map(attr => (
                            <Select.Option key={attr.id} value={attr.id} label={attr.label}>
                              {attr.label}
                            </Select.Option>
                          ))}
                        </Select.OptGroup>
                        <Select.OptGroup label="Activity">
                          {activityAttributes.map(attr => (
                            <Select.Option key={attr.id} value={attr.id} label={attr.label}>
                              {attr.label}
                            </Select.Option>
                          ))}
                        </Select.OptGroup>
                        <Select.OptGroup label="Custom Data">
                          {customAttributes.map(attr => (
                            <Select.Option key={attr.id} value={attr.id} label={attr.label}>
                              {attr.label}
                            </Select.Option>
                          ))}
                        </Select.OptGroup>
                      </Select>
                    </div>

                    {/* Operator Selection */}
                    <div className="col-span-3">
                      <Select
                        value={condition.operator}
                        onChange={(value) => updateCondition(condition.id, { operator: value })}
                        placeholder="Operator"
                        className="w-full"
                      >
                        {getAvailableOperators(condition.attributeId).map(op => (
                          <Select.Option key={op.value} value={op.value}>
                            {op.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>

                    {/* Value Input */}
                    <div className="col-span-4">
                      {renderValueInput(condition)}
                    </div>

                    {/* Remove Button */}
                    <div className="col-span-1">
                      <Button 
                        type="text" 
                        icon={<DeleteOutlined />}
                        onClick={() => removeCondition(condition.id)}
                        className="text-red-500 hover:text-red-700"
                      />
                    </div>
                  </div>

                  {/* Condition Summary */}
                  {condition.attributeId && condition.operator && condition.value !== '' && (
                    <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                      <strong>Preview:</strong> {getConditionPreview(condition, allAttributes)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Audience Summary */}
      {conditions.length > 0 && (
        <Card title="📋 Audience Summary" className="border-green-200 bg-green-50">
          <div className="space-y-2">
            <p className="font-medium text-gray-700">Show content to customers who match:</p>
            <div className="text-sm text-gray-600">
              {conditions.map((condition, index) => (
                <div key={condition.id} className="flex items-center space-x-2">
                  {condition.logicalOperator && (
                    <Tag color="blue" size="small" className="font-medium">
                      {condition.logicalOperator}
                    </Tag>
                  )}
                  <span>{getConditionPreview(condition, allAttributes)}</span>
                </div>
              ))}
            </div>
            <Alert
              message={`Estimated audience: ${estimateAudienceSize(conditions)} customers`}
              type="info"
              showIcon
              className="mt-3"
            />
          </div>
        </Card>
      )}

      {/* Help & Examples */}
      <Card size="small" className="bg-gray-50">
        <div className="text-sm text-gray-600">
          <strong>💡 Pro Tip:</strong> Start with simple conditions and test with the Preview tab. 
          Use AND for stricter targeting, OR for broader reach.
        </div>
      </Card>
    </div>
  );
};

// Helper function to estimate audience size (mock)
const estimateAudienceSize = (conditions: FlexibleCondition[]): string => {
  if (conditions.length === 0) return '0';
  if (conditions.length === 1) return '~2,500';
  if (conditions.length === 2) return '~850';
  return '~320';
};

// Helper function to get condition preview text
const getConditionPreview = (condition: FlexibleCondition, attributes: any[]): string => {
  const attribute = attributes.find(attr => attr.id === condition.attributeId);
  if (!attribute || !condition.value) return 'Incomplete condition';

  const attributeName = attribute.label;
  const operator = COMPARISON_OPERATORS.find(op => op.value === condition.operator)?.label || condition.operator;
  
  let valueText = '';
  if (Array.isArray(condition.value)) {
    valueText = `[${condition.value.join(', ')}]`;
  } else if (typeof condition.value === 'boolean') {
    valueText = condition.value ? 'Yes' : 'No';
  } else {
    valueText = String(condition.value);
  }

  return `${attributeName} ${operator} ${valueText}`;
};

export default ImprovedConditionBuilder;
