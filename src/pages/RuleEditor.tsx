import React, { useState, useEffect } from 'react';
import { Tabs, Button, Space, Typography, Alert, Modal, message, Spin, InputNumber } from 'antd';
import { SaveOutlined, CopyOutlined, PlayCircleOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { rulesApi } from '../services/rulesApi';
import ImprovedConditionBuilder from '../features/rules/components/ImprovedConditionBuilder';
import ContentConfiguration from '../features/rules/components/content/ContentConfiguration';
import FallbackConfiguration from '../features/rules/components/fallback/FallbackConfiguration';
import PreviewSection from '../features/rules/components/PreviewSection';
import ImprovedTabNavigation from '../components/ImprovedTabNavigation';
import ContextualHelp from '../components/ContextualHelp';
import { getAttributesByGroup } from '../features/rules/attributeDefinitions';
import type { AudienceCondition, ValidationResult, ContentConfiguration as ContentConfigurationType, ContentValidationResult, FallbackConfiguration as FallbackConfigurationType, FallbackValidationResult } from '../features/rules/types';
import type { Rule } from '../lib/mockData';

const { Title } = Typography;

// Types for rule validation
interface RuleValidationState {
  audience: 'valid' | 'warning' | 'error' | 'empty';
  content: 'valid' | 'warning' | 'error' | 'empty';
  fallback: 'valid' | 'warning' | 'error' | 'empty';
  schedule: 'valid' | 'warning' | 'error' | 'empty';
  preview: 'valid' | 'warning' | 'error' | 'empty';
  json: 'valid' | 'warning' | 'error' | 'empty';
}

interface RuleData {
  name: string;
  priority: number;
  audience: AudienceCondition | null;
  content: ContentConfigurationType | null;
  fallback: FallbackConfigurationType | null;
  schedule: any;
}

const RuleEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNewRule = !id;

  // State management
  const [activeTab, setActiveTab] = useState<string>('audience');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isNavigationBlocked, setIsNavigationBlocked] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNewRule);
  const [saving, setSaving] = useState(false);
  const [useImprovedUX] = useState(true); // Always use improved UX
  const [audienceValidation, setAudienceValidation] = useState<ValidationResult>({ isValid: false, errors: [], warnings: [] });
  const [contentValidation, setContentValidation] = useState<ContentValidationResult>({ isValid: false, errors: [], warnings: [], hasContent: false, priorityConflicts: [] });
  const [fallbackValidation, setFallbackValidation] = useState<FallbackValidationResult>({ isValid: false, errors: [], warnings: [], hasFallbacks: false, scenarioErrors: { ineligible_audience: [], empty_supply: [] } });
  
  // Rule data state
  const [ruleData, setRuleData] = useState<RuleData>({
    name: isNewRule ? 'Untitled Rule' : `Rule ${id}`,
    priority: 80, // Default priority
    audience: null,
    content: null,
    fallback: null,
    schedule: null,
  });

  // Validation state for tabs
  const [validationState, setValidationState] = useState<RuleValidationState>({
    audience: 'empty',
    content: 'empty', 
    fallback: 'empty',
    schedule: 'empty',
    preview: 'warning', // Preview shows warning until simulation is run
    json: 'valid', // JSON is always valid as it's read-only
  });

  // Load existing rule data
  useEffect(() => {
    if (!isNewRule && id) {
      loadRule(id);
    }
  }, [id, isNewRule]);

  const loadRule = async (ruleId: string) => {
    setLoading(true);
    try {
      const response = await rulesApi.getRule(ruleId);
      if (response.success && response.data) {
        console.log('Loaded rule data:', response);
        const rule = response.data;
        console.log('Rule data:', rule);
        setRuleData({
          name: rule.name,
          priority: rule.priority || 80, // Use existing priority or default
          audience: rule.audience,
          content: rule.content,
          fallback: rule.fallback,
          schedule: null, // Will be implemented later
        });
      } else {
        message.error(response.error || 'Failed to load rule');
        navigate('/rules');
      }
    } catch (error) {
      console.error('Error loading rule:', error);
      message.error('Failed to load rule');
      navigate('/rules');
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation blocking for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handlePopState = () => {
      if (hasUnsavedChanges) {
        setIsNavigationBlocked(true);
        setPendingNavigation(location.pathname);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges, location.pathname]);

  // Validation logic with real audience validation
  const validateTab = (tabKey: string): 'valid' | 'warning' | 'error' | 'empty' => {
    switch (tabKey) {
      case 'audience':
        if (!ruleData.audience) return 'empty';
        if (audienceValidation.errors.length > 0) return 'error';
        if (audienceValidation.warnings.length > 0) return 'warning';
        return audienceValidation.isValid ? 'valid' : 'error';
      case 'content':
        if (!ruleData.content) return 'empty';
        if (contentValidation.errors.length > 0) return 'error';
        if (contentValidation.warnings.length > 0) return 'warning';
        return contentValidation.isValid && contentValidation.hasContent ? 'valid' : 'error';
      case 'fallback':
        if (!ruleData.fallback) return 'empty';
        if (fallbackValidation.errors.length > 0) return 'error';
        if (fallbackValidation.warnings.length > 0) return 'warning';
        return fallbackValidation.isValid ? 'valid' : 'error';
      case 'schedule':
        return ruleData.schedule ? 'valid' : 'empty';
      case 'preview':
        return validationState.preview;
      case 'json':
        return 'valid';
      default:
        return 'empty';
    }
  };

  // Get validation icon for tab
  const getValidationIcon = (status: 'valid' | 'warning' | 'error' | 'empty') => {
    switch (status) {
      case 'valid':
        return <CheckCircleOutlined className="ml-2 text-green-500" />;
      case 'warning':
        return <WarningOutlined className="ml-2 text-orange-500" />;
      case 'error':
        return <CloseCircleOutlined className="ml-2 text-red-500" />;
      case 'empty':
        return <span className="ml-2 text-gray-400">○</span>;
      default:
        return null;
    }
  };

  // Handle tab change
  const handleTabChange = (key: string) => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: 'Unsaved Changes',
        content: 'You have unsaved changes. Do you want to continue without saving?',
        okText: 'Continue',
        cancelText: 'Stay',
        onOk: () => {
          setActiveTab(key);
          setHasUnsavedChanges(false);
        },
      });
    } else {
      setActiveTab(key);
    }
  };

  // Handle navigation confirmation
  const handleNavigationConfirm = (confirm: boolean) => {
    if (confirm && pendingNavigation) {
      setHasUnsavedChanges(false);
      navigate(pendingNavigation);
    }
    setIsNavigationBlocked(false);
    setPendingNavigation(null);
  };

  // Generate audience summary from audience conditions
  const generateAudienceSummary = (audience: AudienceCondition | null): string => {
    if (!audience || !audience.rootNode || !audience.rootNode.children) {
      return '';
    }

    const generateConditionText = (node: any): string => {
      if (node.type === 'condition') {
        // Get attribute info
        const allAttributes = [...getAttributesByGroup('customer'), ...getAttributesByGroup('activity'), ...getAttributesByGroup('custom')];
        const attribute = allAttributes.find(attr => attr.id === node.attributeId);
        if (!attribute) return '';

        const attributeName = attribute.label;
        let operatorText = '';
        let valueText = '';

        // Convert comparison operators to readable text
        switch (node.comparison) {
          case 'equals':
            operatorText = '=';
            break;
          case 'not_equals':
            operatorText = '≠';
            break;
          case 'greater_than':
            operatorText = '>';
            break;
          case 'less_than':
            operatorText = '<';
            break;
          case 'contains':
            operatorText = 'contains';
            break;
          case 'in':
            operatorText = 'is one of';
            break;
          case 'not_in':
            operatorText = 'is not one of';
            break;
          default:
            operatorText = node.comparison;
        }

        // Format value based on type
        if (Array.isArray(node.value)) {
          valueText = `[${node.value.join(', ')}]`;
        } else if (typeof node.value === 'boolean') {
          valueText = node.value ? 'Yes' : 'No';
        } else {
          valueText = String(node.value);
        }

        return `${attributeName} ${operatorText} ${valueText}`;
      } else if (node.type === 'group' && node.children && node.children.length > 0) {
        const childTexts = node.children.map(generateConditionText).filter(Boolean);
        if (childTexts.length === 0) return '';
        if (childTexts.length === 1) return childTexts[0];
        return `(${childTexts.join(` ${node.operator || 'AND'} `)})`;
      }
      return '';
    };

    const conditions = audience.rootNode.children.map(generateConditionText).filter(Boolean);
    if (conditions.length === 0) return '';
    if (conditions.length === 1) return conditions[0];
    return conditions.join(` ${audience.rootNode.operator || 'AND'} `);
  };

  // Handle save draft
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const saveData = {
        name: ruleData.name,
        priority: ruleData.priority,
        status: 'Draft' as const,
        audienceSummary: generateAudienceSummary(ruleData.audience),
        contentSources: [], // Will be generated from content config
        audience: ruleData.audience,
        content: ruleData.content,
        fallback: ruleData.fallback,
      };

      let response;
      if (isNewRule) {
        response = await rulesApi.createRule(saveData);
        if (response.success && response.data) {
          // Navigate to the new rule's edit page
          navigate(`/rules/${response.data.id}`, { replace: true });
          message.success('Rule created successfully');
        }
      } else {
        response = await rulesApi.updateRule(id!, saveData);
        if (response.success) {
          message.success('Rule saved successfully');
        }
      }

      if (response.success) {
        setHasUnsavedChanges(false);
        console.log('rule_saved', { ruleId: id || 'new', data: ruleData });
      } else {
        message.error(response.error || 'Failed to save rule');
      }
    } catch (error) {
      console.error('Error saving rule:', error);
      message.error('Failed to save rule');
    } finally {
      setSaving(false);
    }
  };

  // Handle duplicate
  const handleDuplicate = async () => {
    if (!id) return;
    
    setSaving(true);
    try {
      const response = await rulesApi.duplicateRule(id);
      if (response.success && response.data) {
        console.log('rule_duplicated', { originalId: id });
        navigate(`/rules/${response.data.id}`);
        message.success('Rule duplicated successfully');
      } else {
        message.error(response.error || 'Failed to duplicate rule');
      }
    } catch (error) {
      console.error('Error duplicating rule:', error);
      message.error('Failed to duplicate rule');
    } finally {
      setSaving(false);
    }
  };

  // Handle run simulation
  const handleRunSimulation = () => {
    console.log('simulation_run', { ruleId: id || 'new' });
    
    // Check if we have minimum data for simulation
    if (!ruleData.audience && !ruleData.content) {
      message.warning('Please configure audience conditions and content sources before running simulation');
      return;
    }
    
    setActiveTab('preview');
    setValidationState(prev => ({ ...prev, preview: 'valid' }));
    message.success('Simulation ready - preview updated with current rule configuration');
  };

  // Handle audience condition changes
  const handleAudienceChange = (condition: AudienceCondition) => {
    setRuleData(prev => ({ ...prev, audience: condition }));
    setHasUnsavedChanges(true);
  };

  // Handle audience validation changes
  const handleAudienceValidationChange = (validation: ValidationResult) => {
    setAudienceValidation(validation);
  };

  const handleContentChange = (content: ContentConfigurationType) => {
    setRuleData(prev => ({ ...prev, content }));
    setHasUnsavedChanges(true);
  };

  const handleContentValidationChange = (validation: ContentValidationResult) => {
    setContentValidation(validation);
  };

  const handleFallbackChange = (fallback: FallbackConfigurationType) => {
    setRuleData(prev => ({ ...prev, fallback }));
    setHasUnsavedChanges(true);
  };

  const handleFallbackValidationChange = (validation: FallbackValidationResult) => {
    setFallbackValidation(validation);
  };

  // Handle priority change
  const handlePriorityChange = (value: number | null) => {
    if (value !== null && value >= 1 && value <= 100) {
      setRuleData(prev => ({ ...prev, priority: value }));
      setHasUnsavedChanges(true);
    }
  };

  // Handle improved condition builder changes
  const handleImprovedConditionChange = (conditions: any[]) => {
    // Convert flexible conditions to AudienceCondition format
    if (conditions.length === 0) {
      setRuleData(prev => ({ ...prev, audience: null }));
      setHasUnsavedChanges(true);
      return;
    }

    // Recursive function to convert flexible conditions to ConditionNode format
    const convertToConditionNode = (flexCondition: any): any => {
      if (flexCondition.type === 'condition') {
        return {
          id: flexCondition.id,
          type: 'condition',
          attributeId: flexCondition.attributeId,
          comparison: flexCondition.operator,
          value: flexCondition.value,
          depth: 1,
          isValid: !!(flexCondition.attributeId && flexCondition.operator && flexCondition.value !== '')
        };
      } else if (flexCondition.type === 'group') {
        return {
          id: flexCondition.id,
          type: 'group',
          operator: flexCondition.groupOperator || 'AND',
          children: (flexCondition.children || []).map(convertToConditionNode),
          depth: 1,
          isValid: flexCondition.children && flexCondition.children.length > 0
        };
      }
    };

    // Create audience condition from flexible conditions
    const audienceCondition: AudienceCondition = {
      id: `condition_${Date.now()}`,
      name: 'Flexible Audience Conditions',
      rootNode: {
        id: `node_${Date.now()}`,
        type: 'group',
        operator: 'AND', // Default root operator
        children: conditions.map(convertToConditionNode),
        depth: 0,
        isValid: conditions.length > 0
      },
      lastModified: new Date()
    };

    setRuleData(prev => ({ ...prev, audience: audienceCondition }));
    setHasUnsavedChanges(true);
    
    // Update validation state - more sophisticated validation for nested structures
    const validateRecursive = (items: any[]): boolean => {
      return items.every(item => {
        if (item.type === 'condition') {
          return item.attributeId && item.operator && item.value !== '';
        } else if (item.type === 'group') {
          return item.children && item.children.length > 0 && validateRecursive(item.children);
        }
        return false;
      });
    };

    const isValid = conditions.length > 0 && validateRecursive(conditions);
    setAudienceValidation({
      isValid,
      errors: isValid ? [] : ['Please complete all condition fields and ensure groups are not empty'],
      warnings: []
    });
  };

  // Convert AudienceCondition to FlexibleCondition[] for ImprovedConditionBuilder
  const convertAudienceToFlexibleConditions = (audience: AudienceCondition | null): any[] => {
    console.log('Converting audience:', audience);
    if (!audience || !audience.rootNode || !audience.rootNode.children) {
      console.log('No audience data to convert');
      return [];
    }

    // Convert ConditionNode to FlexibleCondition format (preserving nested structure)
    const convertNode = (node: any, isFirst: boolean = true): any => {
      if (node.type === 'condition') {
        return {
          id: node.id,
          type: 'condition',
          attributeId: node.attributeId,
          operator: node.comparison,
          value: node.value,
          logicalOperator: isFirst ? undefined : 'AND' // Default chaining operator
        };
      } else if (node.type === 'group') {
        return {
          id: node.id,
          type: 'group',
          groupOperator: node.operator || 'AND',
          children: node.children ? node.children.map((child: any, index: number) => 
            convertNode(child, index === 0)
          ) : [],
          logicalOperator: isFirst ? undefined : 'AND' // Default chaining operator
        };
      }
      return null;
    };

    // Convert all root children
    const result = audience.rootNode.children.map((child: any, index: number) => 
      convertNode(child, index === 0)
    ).filter(Boolean);

    console.log('Converted conditions:', result);
    return result;
  };

  // Convert current rule data to format expected by PreviewSection
  const convertRuleDataForPreview = (): Rule[] => {
    if (!ruleData.audience && !ruleData.content) {
      return [];
    }

    // Extract content sources from configuration
    const contentSources: ('TargetedLead' | 'ProductReco' | 'CMS')[] = [];
    
    if (ruleData.content?.cms?.enabled) {
      contentSources.push('CMS');
    }
    
    if (ruleData.content?.offering?.enabled) {
      if (ruleData.content.offering.targetedLead?.enabled) {
        contentSources.push('TargetedLead');
      }
      if (ruleData.content.offering.productReco?.enabled) {
        contentSources.push('ProductReco');
      }
    }

    const rule: Rule = {
      id: id || 'new-rule',
      name: ruleData.name,
      status: 'Active', // For preview purposes, treat as active
      audienceSummary: ruleData.audience ? 'Custom audience conditions configured' : 'No audience configured',
      contentSources,
      priority: ruleData.priority, // Use rule-level priority
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
      audience: ruleData.audience,
      content: ruleData.content,
      fallback: ruleData.fallback,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return [rule];
  };

  const tabItems = [
    {
      key: 'audience',
      label: (
        <span className="flex items-center">
          Audience
          {getValidationIcon(validateTab('audience'))}
        </span>
      ),
      children: (
        <div className="p-6">
          <ImprovedConditionBuilder
            onConditionChange={handleImprovedConditionChange}
            initialConditions={convertAudienceToFlexibleConditions(ruleData.audience)}
          />
        </div>
      ),
    },
    {
      key: 'content',
      label: (
        <span className="flex items-center">
          Content
          {getValidationIcon(validateTab('content'))}
        </span>
      ),
      children: (
        <div className="p-6">
          <ContentConfiguration
            configuration={ruleData.content || undefined}
            onChange={handleContentChange}
            onValidationChange={handleContentValidationChange}
          />
        </div>
      ),
    },
    {
      key: 'fallback',
      label: (
        <span className="flex items-center">
          Fallback
          {getValidationIcon(validateTab('fallback'))}
        </span>
      ),
      children: (
        <div className="p-6">
          <FallbackConfiguration
            configuration={ruleData.fallback || undefined}
            onChange={handleFallbackChange}
            onValidationChange={handleFallbackValidationChange}
          />
        </div>
      ),
    },
    {
      key: 'schedule',
      label: (
        <span className="flex items-center">
          Schedule
          {getValidationIcon(validateTab('schedule'))}
        </span>
      ),
      children: (
        <div className="p-6">
          <Alert
            message="Scheduling Coming Soon"
            description="UTC scheduling with local timezone display (Asia/Bangkok)."
            type="info"
            showIcon
            className="mb-4"
          />
          <div className="mb-4">
            <Button 
              type="dashed" 
              onClick={() => {
                setRuleData(prev => ({ ...prev, schedule: { configured: true } }));
                setHasUnsavedChanges(true);
              }}
              className="mb-2"
            >
              Mock: Mark Schedule as Configured
            </Button>
            <p className="text-sm text-gray-500">
              Click to simulate schedule configuration for validation demo
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'preview',
      label: (
        <span className="flex items-center">
          Preview
          {getValidationIcon(validateTab('preview'))}
        </span>
      ),
      children: (
        <div className="p-6">
          {ruleData.audience || ruleData.content ? (
            <PreviewSection rules={convertRuleDataForPreview()} />
          ) : (
            <Alert
              message="Configure Audience and Content First"
              description="Please configure at least the audience conditions and content sources to see the preview simulation."
              type="info"
              showIcon
              className="mb-4"
            />
          )}
        </div>
      ),
    },
    {
      key: 'json',
      label: (
        <span className="flex items-center">
          JSON
          {getValidationIcon(validateTab('json'))}
        </span>
      ),
      children: (
        <div className="p-6">
          <Alert
            message="JSON Preview Coming Soon"
            description="Read-only JSON configuration preview with schema validation."
            type="info"
            showIcon
            className="mb-4"
          />
          <div className="bg-gray-100 p-4 rounded border">
            <pre className="text-sm text-gray-700">
{`{
  "id": "${id || 'new'}",
  "name": "${ruleData.name}",
  "priority": ${ruleData.priority},
  "status": "Draft",
  "audience": ${JSON.stringify(ruleData.audience, null, 2)},
  "content": ${JSON.stringify(ruleData.content, null, 2)},
  "fallback": ${JSON.stringify(ruleData.fallback, null, 2)},
  "schedule": ${JSON.stringify(ruleData.schedule, null, 2)}
}`}
            </pre>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Navigation Confirmation Modal */}
      <Modal
        title="Unsaved Changes"
        open={isNavigationBlocked}
        onOk={() => handleNavigationConfirm(true)}
        onCancel={() => handleNavigationConfirm(false)}
        okText="Leave Without Saving"
        cancelText="Stay Here"
        okButtonProps={{ danger: true }}
      >
        <p>You have unsaved changes that will be lost if you navigate away.</p>
        <p>Are you sure you want to leave without saving?</p>
      </Modal>

      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Title level={2} className="!mb-2">
              {isNewRule ? 'Create New Rule' : `Edit Rule ${id}`}
              {hasUnsavedChanges && <span className="text-orange-500 ml-2">*</span>}
            </Title>
            <p className="text-gray-600 m-0 mb-4">
              Configure audience targeting and content for the "For You" placement
              {hasUnsavedChanges && (
                <span className="text-orange-500 ml-2 text-sm">(Unsaved changes)</span>
              )}
            </p>
            {/* Priority Setting */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-900">Rule Priority:</span>
                <InputNumber
                  min={1}
                  max={100}
                  value={ruleData.priority}
                  onChange={handlePriorityChange}
                  className="w-24"
                  size="middle"
                />
              </div>
              <span className="text-xs text-blue-600">
                Higher values = higher priority (1-100)
              </span>
            </div>
          </div>
          <Space>
            <Button
              icon={<SaveOutlined />}
              onClick={handleSaveDraft}
              type={hasUnsavedChanges ? "primary" : "default"}
              className={hasUnsavedChanges ? "animate-pulse" : ""}
              loading={saving}
            >
              Save Draft
            </Button>
            <Button
              icon={<CopyOutlined />}
              onClick={handleDuplicate}
              disabled={isNewRule}
              loading={saving}
            >
              Duplicate
            </Button>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleRunSimulation}
            >
              Run Simulation
            </Button>
          </Space>
        </div>
      </div>

      {/* Improved Navigation */}
      <div className="p-6">
        <ImprovedTabNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          tabValidation={Object.keys(validationState).reduce((acc, key) => ({
            ...acc,
            [key]: validateTab(key)
          }), {})}
        />
      </div>

      {/* Tabs Content */}
      <div className="flex-1 overflow-hidden">
        <Spin spinning={loading} tip="Loading rule...">
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={tabItems}
            className="h-full"
            tabBarStyle={{ 
              marginBottom: 0,
              paddingLeft: '24px',
              paddingRight: '24px',
              borderBottom: '1px solid #f0f0f0',
              display: 'none' // Always hide tabs since we use improved navigation
            }}
          />
        </Spin>
      </div>

      {/* Contextual Help */}
      <ContextualHelp currentTab={activeTab} />
    </div>
  );
};

export default RuleEditor;
