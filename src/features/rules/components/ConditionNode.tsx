import React from 'react';
import { Card, Select, Button, Space, Tag, Tooltip } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ConditionNode as ConditionNodeType, ComparisonOperator, ConditionOperator } from '../types';
import { getAttributeById, getAttributesByGroup } from '../attributeDefinitions';

interface ConditionNodeProps {
  node: ConditionNodeType;
  onUpdate: (nodeId: string, updates: Partial<ConditionNodeType>) => void;
  onDelete: (nodeId: string) => void;
  onAddChild: (nodeId: string, childType: 'group' | 'condition') => void;
  maxDepth?: number;
  isRoot?: boolean;
}

const COMPARISON_OPERATORS: { value: ComparisonOperator; label: string; types: string[] }[] = [
  { value: 'equals', label: 'equals', types: ['boolean', 'enum', 'string', 'number'] },
  { value: 'not_equals', label: 'does not equal', types: ['boolean', 'enum', 'string', 'number'] },
  { value: 'greater_than', label: 'greater than', types: ['number'] },
  { value: 'less_than', label: 'less than', types: ['number'] },
  { value: 'contains', label: 'contains', types: ['multi-select', 'string'] },
  { value: 'in', label: 'is one of', types: ['enum', 'multi-select'] },
  { value: 'not_in', label: 'is not one of', types: ['enum', 'multi-select'] }
];

const CONDITION_OPERATORS: { value: ConditionOperator; label: string; color: string }[] = [
  { value: 'AND', label: 'AND', color: 'blue' },
  { value: 'OR', label: 'OR', color: 'green' },
  { value: 'NOT', label: 'NOT', color: 'red' }
];

const ConditionNodeComponent: React.FC<ConditionNodeProps> = ({
  node,
  onUpdate,
  onDelete,
  onAddChild,
  maxDepth = 5,
  isRoot = false
}) => {
  const currentDepth = node.depth || 0;
  const canAddChildren = currentDepth < maxDepth;

  const renderConditionNode = () => {
    const attribute = node.attributeId ? getAttributeById(node.attributeId) : undefined;
    const availableOperators = attribute 
      ? COMPARISON_OPERATORS.filter(op => op.types.includes(attribute.type))
      : COMPARISON_OPERATORS;

    return (
      <Card 
        size="small" 
        className={`condition-node ${node.isValid === false ? 'border-red-300' : 'border-gray-300'}`}
        style={{ marginBottom: 8 }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          {/* Attribute Selection */}
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">Attribute</label>
            <Select
              placeholder="Select attribute"
              value={node.attributeId}
              onChange={(value) => onUpdate(node.id, { 
                attributeId: value, 
                comparison: undefined, 
                value: undefined 
              })}
              className="min-w-48"
              showSearch
              optionFilterProp="label"
            >
              <Select.OptGroup label="Customer Attributes">
                {getAttributesByGroup('customer').map(attr => (
                  <Select.Option key={attr.id} value={attr.id} label={attr.label}>
                    <div className="flex items-center justify-between">
                      <span>{attr.label}</span>
                      {attr.featured && <Tag color="gold">Featured</Tag>}
                    </div>
                    {attr.description && (
                      <div className="text-xs text-gray-500">{attr.description}</div>
                    )}
                  </Select.Option>
                ))}
              </Select.OptGroup>
              <Select.OptGroup label="User Activity">
                {getAttributesByGroup('activity').map(attr => (
                  <Select.Option key={attr.id} value={attr.id} label={attr.label}>
                    <span>{attr.label}</span>
                    {attr.description && (
                      <div className="text-xs text-gray-500">{attr.description}</div>
                    )}
                  </Select.Option>
                ))}
              </Select.OptGroup>
              <Select.OptGroup label="Custom Data">
                {getAttributesByGroup('custom').map(attr => (
                  <Select.Option key={attr.id} value={attr.id} label={attr.label}>
                    <span>{attr.label}</span>
                    {attr.description && (
                      <div className="text-xs text-gray-500">{attr.description}</div>
                    )}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            </Select>
          </div>

          {/* Comparison Operator */}
          {node.attributeId && (
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Operator</label>
              <Select
                placeholder="Select operator"
                value={node.comparison}
                onChange={(value) => onUpdate(node.id, { comparison: value, value: undefined })}
                className="min-w-32"
              >
                {availableOperators.map(op => (
                  <Select.Option key={op.value} value={op.value}>
                    {op.label}
                  </Select.Option>
                ))}
              </Select>
            </div>
          )}

          {/* Value Input */}
          {node.attributeId && node.comparison && attribute && (
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">Value</label>
              {renderValueInput(attribute, node.comparison, node.value, (value) => 
                onUpdate(node.id, { value })
              )}
            </div>
          )}

          {/* Delete Button */}
          {!isRoot && (
            <Tooltip title="Delete condition">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => onDelete(node.id)}
                className="text-red-500 hover:text-red-700"
                size="small"
              />
            </Tooltip>
          )}
        </div>

        {/* Validation Errors */}
        {node.errors && node.errors.length > 0 && (
          <div className="mt-2">
            {node.errors.map((error, index) => (
              <div key={index} className="text-red-500 text-xs">{error}</div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  const renderGroupNode = () => {
    return (
      <Card 
        className={`group-node ${node.isValid === false ? 'border-red-300' : 'border-blue-300'}`}
        style={{ backgroundColor: '#fafafa', marginBottom: 8 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Operator Selection */}
            <Select
              value={node.operator}
              onChange={(value) => onUpdate(node.id, { operator: value })}
              className="min-w-20"
              size="small"
            >
              {CONDITION_OPERATORS.map(op => (
                <Select.Option key={op.value} value={op.value}>
                  <Tag color={op.color}>{op.label}</Tag>
                </Select.Option>
              ))}
            </Select>
            
            <span className="text-sm text-gray-500">
              {node.children?.length || 0} condition{(node.children?.length || 0) !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Add Child Buttons */}
            {canAddChildren && (
              <Space.Compact>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => onAddChild(node.id, 'condition')}
                  title="Add condition"
                >
                  Condition
                </Button>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => onAddChild(node.id, 'group')}
                  title="Add group"
                >
                  Group
                </Button>
              </Space.Compact>
            )}

            {/* Delete Button */}
            {!isRoot && (
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => onDelete(node.id)}
                className="text-red-500 hover:text-red-700"
                size="small"
              />
            )}
          </div>
        </div>

        {/* Children */}
        <div className="pl-4 border-l-2 border-gray-200">
          {node.children?.map((child) => (
            <ConditionNodeComponent
              key={child.id}
              node={child}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddChild={onAddChild}
              maxDepth={maxDepth}
            />
          ))}
          
          {(!node.children || node.children.length === 0) && (
            <div className="text-gray-400 text-sm italic py-2">
              No conditions added yet
            </div>
          )}
        </div>

        {/* Validation Errors */}
        {node.errors && node.errors.length > 0 && (
          <div className="mt-2">
            {node.errors.map((error, index) => (
              <div key={index} className="text-red-500 text-xs">{error}</div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  const renderValueInput = (attribute: any, comparison: ComparisonOperator, value: any, onChange: (value: any) => void) => {
    switch (attribute.type) {
      case 'boolean':
        return (
          <Select value={value} onChange={onChange} className="min-w-24">
            <Select.Option value={true}>True</Select.Option>
            <Select.Option value={false}>False</Select.Option>
          </Select>
        );

      case 'enum':
        return (
          <Select 
            value={value} 
            onChange={onChange} 
            className="min-w-32"
            placeholder="Select value"
          >
            {attribute.options?.map((option: string) => (
              <Select.Option key={option} value={option}>{option}</Select.Option>
            ))}
          </Select>
        );

      case 'multi-select':
        if (['in', 'not_in'].includes(comparison)) {
          return (
            <Select 
              mode="multiple"
              value={Array.isArray(value) ? value : []}
              onChange={onChange} 
              className="min-w-48"
              placeholder="Select values"
            >
              {attribute.options?.map((option: string) => (
                <Select.Option key={option} value={option}>{option}</Select.Option>
              ))}
            </Select>
          );
        } else {
          return (
            <Select 
              value={value} 
              onChange={onChange} 
              className="min-w-32"
              placeholder="Select value"
            >
              {attribute.options?.map((option: string) => (
                <Select.Option key={option} value={option}>{option}</Select.Option>
              ))}
            </Select>
          );
        }

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 min-w-24"
            placeholder="Enter number"
          />
        );

      case 'string':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 min-w-32"
            placeholder="Enter text"
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 min-w-32"
            placeholder="Enter value"
          />
        );
    }
  };

  if (node.type === 'group') {
    return renderGroupNode();
  } else {
    return renderConditionNode();
  }
};

export default ConditionNodeComponent;
