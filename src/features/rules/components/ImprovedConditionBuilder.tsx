import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Space, Tag, Alert, Input, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ComparisonOperator, ConditionOperator } from '../types';
import { getAttributesByGroup } from '../attributeDefinitions';

// Flexible condition structure - now supports both conditions and groups
interface FlexibleCondition {
  id: string;
  type: 'condition' | 'group';
  
  // For individual conditions
  attributeId?: string;
  operator?: ComparisonOperator;
  value?: any;
  
  // For groups
  groupOperator?: ConditionOperator; // AND, OR, NOT for the group
  children?: FlexibleCondition[];
  
  // For chaining (applies to both conditions and groups)
  logicalOperator?: ConditionOperator; // AND, OR for chaining with previous item
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
    // Fix logical operators immediately when setting initial state
    const fixGroupLogicalOperators = (items: FlexibleCondition[]): FlexibleCondition[] => {
      return items.map(item => {
        if (item.type === 'group' && item.children) {
          const fixedChildren = item.children.map((child, index) => ({
            ...child,
            logicalOperator: index === 0 ? undefined : item.groupOperator || 'AND'
          }));
          return { ...item, children: fixGroupLogicalOperators(fixedChildren) };
        }
        return item;
      });
    };
    return fixGroupLogicalOperators(initialConditions);
  });

  // Update conditions when initialConditions change
  useEffect(() => {
    console.log('ImprovedConditionBuilder received initialConditions:', initialConditions);
    // Fix any inconsistent logical operators in groups
    const fixedConditions = fixGroupLogicalOperators(initialConditions);
    setConditions(fixedConditions);
  }, [initialConditions]);

  // Helper function to ensure all conditions within groups use the group's operator
  const fixGroupLogicalOperators = (items: FlexibleCondition[]): FlexibleCondition[] => {
    return items.map(item => {
      if (item.type === 'group' && item.children) {
        const fixedChildren = item.children.map((child, index) => ({
          ...child,
          logicalOperator: index === 0 ? undefined : item.groupOperator || 'AND'
        }));
        return { ...item, children: fixGroupLogicalOperators(fixedChildren) };
      }
      return item;
    });
  };

  // Get all available attributes grouped by category
  const customerAttributes = getAttributesByGroup('customer');
  const activityAttributes = getAttributesByGroup('activity');
  const customAttributes = getAttributesByGroup('custom');
  const allAttributes = [...customerAttributes, ...activityAttributes, ...customAttributes];
  
  console.log('ImprovedConditionBuilder render - current conditions:', conditions);

  const addNewCondition = () => {
    const newCondition: FlexibleCondition = {
      id: `condition_${Date.now()}`,
      type: 'condition',
      attributeId: '',
      operator: 'equals',
      value: '',
      logicalOperator: conditions.length > 0 ? 'AND' : undefined
    };
    
    const newConditions = [...conditions, newCondition];
    setConditions(newConditions);
    onConditionChange(newConditions);
  };

  const addNewConditionGroup = () => {
    const newGroup: FlexibleCondition = {
      id: `group_${Date.now()}`,
      type: 'group',
      groupOperator: 'AND',
      children: [],
      logicalOperator: conditions.length > 0 ? 'AND' : undefined
    };
    
    const newConditions = [...conditions, newGroup];
    setConditions(newConditions);
    onConditionChange(newConditions);
  };


  const updateCondition = (conditionId: string, updates: Partial<FlexibleCondition>) => {
    const updateRecursive = (items: FlexibleCondition[]): FlexibleCondition[] => {
      return items.map(item => {
        if (item.id === conditionId) {
          const updatedItem = { ...item, ...updates };
          
          // If we're updating a group's operator, update child logical operators too
          if (updatedItem.type === 'group' && updates.groupOperator !== undefined && updatedItem.children) {
            updatedItem.children = updatedItem.children.map((child, index) => ({
              ...child,
              logicalOperator: index === 0 ? undefined : updatedItem.groupOperator
            }));
          }
          
          return updatedItem;
        }
        if (item.type === 'group' && item.children) {
          return { ...item, children: updateRecursive(item.children) };
        }
        return item;
      });
    };

    const newConditions = updateRecursive(conditions);
    setConditions(newConditions);
    onConditionChange(newConditions);
  };

  const removeCondition = (conditionId: string) => {
    const removeRecursive = (items: FlexibleCondition[]): FlexibleCondition[] => {
      const filtered = items.filter(item => item.id !== conditionId);
      return filtered.map(item => {
        if (item.type === 'group' && item.children) {
          return { ...item, children: removeRecursive(item.children) };
        }
        return item;
      });
    };

    const newConditions = removeRecursive(conditions);
    // Reset logical operator for first condition if it exists
    if (newConditions.length > 0) {
      newConditions[0].logicalOperator = undefined;
    }
    setConditions(newConditions);
    onConditionChange(newConditions);
  };

  const addToGroup = (groupId: string, itemType: 'condition' | 'group') => {
    const newItem: FlexibleCondition = itemType === 'condition' 
      ? {
          id: `condition_${Date.now()}`,
          type: 'condition',
          attributeId: '',
          operator: 'equals',
          value: ''
        }
      : {
          id: `group_${Date.now()}`,
          type: 'group',
          groupOperator: 'AND',
          children: []
        };

    const addToGroupRecursive = (items: FlexibleCondition[]): FlexibleCondition[] => {
      return items.map(item => {
        if (item.id === groupId && item.type === 'group') {
          const children = item.children || [];
          // Add logical operator to new item if it's not the first
          // Default to the group's operator, or 'AND' if not specified
          if (children.length > 0) {
            newItem.logicalOperator = item.groupOperator || 'AND';
          }
          return { ...item, children: [...children, newItem] };
        }
        if (item.type === 'group' && item.children) {
          return { ...item, children: addToGroupRecursive(item.children) };
        }
        return item;
      });
    };

    const newConditions = addToGroupRecursive(conditions);
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

  // Recursive rendering function for conditions and groups
  const renderConditionItem = (item: FlexibleCondition, depth: number = 0): React.ReactElement => {
    if (item.type === 'condition') {
      return renderCondition(item, depth);
    } else {
      return renderGroup(item, depth);
    }
  };

  const renderCondition = (condition: FlexibleCondition, depth: number): React.ReactElement => (
    <div key={condition.id} className="bg-white border border-gray-200 rounded-lg p-4" style={{ marginLeft: `${depth * 20}px` }}>
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
                {op.label}
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
            {getAvailableOperators(condition.attributeId || '').map(op => (
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
  );

  const renderGroup = (group: FlexibleCondition, depth: number): React.ReactElement => (
    <div key={group.id} className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50" style={{ marginLeft: `${depth * 20}px` }}>
      {/* Group Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Logical Operator for chaining groups */}
          {group.logicalOperator && (
            <Select
              value={group.logicalOperator}
              onChange={(value) => updateCondition(group.id, { logicalOperator: value })}
              className="w-20"
              size="small"
            >
            {LOGICAL_OPERATORS.map(op => (
              <Select.Option key={op.value} value={op.value}>
                {op.label}
              </Select.Option>
            ))}
            </Select>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            type="dashed" 
            size="small"
            icon={<PlusOutlined />}
            onClick={() => addToGroup(group.id, 'condition')}
          >
            Add Condition
          </Button>
          <Button 
            type="dashed" 
            size="small"
            onClick={() => addToGroup(group.id, 'group')}
          >
            Add Group
          </Button>
          <Button 
            type="text" 
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => removeCondition(group.id)}
            className="text-red-500 hover:text-red-700"
          />
        </div>
      </div>

      {/* Group Children */}
      <div className="space-y-3">
        {group.children && group.children.length > 0 ? (
          group.children.map(child => renderConditionItem(child, depth + 1))
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>Empty group - add conditions or nested groups</p>
          </div>
        )}
      </div>
    </div>
  );

  // Recursive function to render summary conditions
  const renderSummaryConditions = (items: FlexibleCondition[], depth: number = 0): React.ReactElement[] => {
    return items.map((item) => (
      <div key={item.id} className="flex items-center space-x-2" style={{ marginLeft: `${depth * 16}px` }}>
        {item.logicalOperator && (
          <Tag color="blue" className="font-medium">
            {item.logicalOperator}
          </Tag>
        )}
        <span>{getConditionPreview(item, allAttributes)}</span>
        {item.type === 'group' && item.children && item.children.length > 0 && (
          <div className="ml-4 space-y-1">
            {renderSummaryConditions(item.children, depth + 1)}
          </div>
        )}
      </div>
    ));
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
                  Add conditions or groups to define who should see this content
                </p>
              </div>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={addNewCondition}
                  size="large"
                >
                  Add Your First Condition
                </Button>
                <Button 
                  type="default" 
                  onClick={addNewConditionGroup}
                  size="large"
                >
                  Add Condition Group
                </Button>
              </Space>
            </div>
          )}

          {/* Condition List */}
          {conditions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Your Conditions:</h4>
                <Space>
                  <Button 
                    type="dashed" 
                    icon={<PlusOutlined />}
                    onClick={addNewCondition}
                    size="small"
                  >
                    Add Condition
                  </Button>
                  <Button 
                    type="dashed" 
                    onClick={addNewConditionGroup}
                    size="small"
                  >
                    Add Group
                  </Button>
                </Space>
              </div>
              
              {conditions.map(item => renderConditionItem(item))}
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
              {renderSummaryConditions(conditions)}
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
  if (condition.type === 'group') {
    const childrenCount = condition.children?.length || 0;
    return `Group (${condition.groupOperator}) with ${childrenCount} ${childrenCount === 1 ? 'item' : 'items'}`;
  }

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
