import React, { useState, useEffect } from 'react';
import { Tabs, Button, Space, Typography, Alert, Modal, message, Spin } from 'antd';
import { SaveOutlined, CopyOutlined, PlayCircleOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { rulesApi } from '../services/rulesApi';
import ConditionBuilder from '../features/rules/components/ConditionBuilder';
import ImprovedConditionBuilder from '../features/rules/components/ImprovedConditionBuilder';
import ContentConfiguration from '../features/rules/components/content/ContentConfiguration';
import FallbackConfiguration from '../features/rules/components/fallback/FallbackConfiguration';
import PreviewSection from '../features/rules/components/PreviewSection';
import ImprovedTabNavigation from '../components/ImprovedTabNavigation';
import ContextualHelp from '../components/ContextualHelp';
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
  const [useImprovedUX, setUseImprovedUX] = useState(true); // Toggle for new UX
  const [audienceValidation, setAudienceValidation] = useState<ValidationResult>({ isValid: false, errors: [], warnings: [] });
  const [contentValidation, setContentValidation] = useState<ContentValidationResult>({ isValid: false, errors: [], warnings: [], hasContent: false, priorityConflicts: [] });
  const [fallbackValidation, setFallbackValidation] = useState<FallbackValidationResult>({ isValid: false, errors: [], warnings: [], hasFallbacks: false, scenarioErrors: { ineligible_audience: [], empty_supply: [] } });
  
  // Rule data state
  const [ruleData, setRuleData] = useState<RuleData>({
    name: isNewRule ? 'Untitled Rule' : `Rule ${id}`,
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

  // Handle save draft
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const saveData = {
        name: ruleData.name,
        status: 'Draft' as const,
        audienceSummary: '', // Will be generated from audience conditions
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

  // Handle improved condition builder changes
  const handleImprovedConditionChange = (conditions: any[]) => {
    // Convert flexible conditions to AudienceCondition format
    if (conditions.length === 0) {
      setRuleData(prev => ({ ...prev, audience: null }));
      setHasUnsavedChanges(true);
      return;
    }

    // Create audience condition from flexible conditions
    const audienceCondition: AudienceCondition = {
      id: `condition_${Date.now()}`,
      name: 'Flexible Audience Conditions',
      rootNode: {
        id: `node_${Date.now()}`,
        type: 'group',
        operator: 'AND', // Default root operator
        children: conditions.map((condition) => ({
          id: condition.id,
          type: 'condition',
          attributeId: condition.attributeId,
          comparison: condition.operator,
          value: condition.value,
          depth: 1,
          isValid: !!(condition.attributeId && condition.operator && condition.value !== '')
        })),
        depth: 0,
        isValid: conditions.every(c => c.attributeId && c.operator && c.value !== '')
      },
      lastModified: new Date()
    };

    setRuleData(prev => ({ ...prev, audience: audienceCondition }));
    setHasUnsavedChanges(true);
    
    // Update validation state
    const isValid = conditions.length > 0 && conditions.every(c => c.attributeId && c.operator && c.value !== '');
    setAudienceValidation({
      isValid,
      errors: isValid ? [] : ['Please complete all condition fields'],
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

    // Extract conditions from the tree structure and flatten them
    const extractConditions = (node: any, isFirst: boolean = true): any[] => {
      console.log('Extracting conditions from node:', node);
      if (node.type === 'condition') {
        const condition = {
          id: node.id,
          attributeId: node.attributeId,
          operator: node.comparison,
          value: node.value,
          logicalOperator: isFirst ? undefined : node.operator || 'AND'
        };
        console.log('Created condition:', condition);
        return [condition];
      } else if (node.type === 'group' && node.children) {
        // Flatten all conditions from the group
        const conditions: any[] = [];
        node.children.forEach((child: any) => {
          const childConditions = extractConditions(child, conditions.length === 0);
          conditions.push(...childConditions);
        });
        console.log('Extracted conditions from group:', conditions);
        return conditions;
      }
      return [];
    };

    const result = extractConditions(audience.rootNode);
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
      priority: ruleData.content?.priority || 80, // Use configured priority or default
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
          {useImprovedUX ? (
            <ImprovedConditionBuilder
              onConditionChange={handleImprovedConditionChange}
              initialConditions={convertAudienceToFlexibleConditions(ruleData.audience)}
            />
          ) : (
            <ConditionBuilder
              condition={ruleData.audience || undefined}
              onChange={handleAudienceChange}
              onValidationChange={handleAudienceValidationChange}
            />
          )}
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
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="!mb-2">
              {isNewRule ? 'Create New Rule' : `Edit Rule ${id}`}
              {hasUnsavedChanges && <span className="text-orange-500 ml-2">*</span>}
            </Title>
            <p className="text-gray-600 m-0">
              Configure audience targeting and content for the "For You" placement
              {hasUnsavedChanges && (
                <span className="text-orange-500 ml-2 text-sm">(Unsaved changes)</span>
              )}
            </p>
          </div>
          <Space>
            <Button
              type="dashed"
              onClick={() => setUseImprovedUX(!useImprovedUX)}
              className="text-sm"
            >
              {useImprovedUX ? 'Classic UI' : 'New UX'}
            </Button>
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

      {/* Improved Navigation (when enabled) */}
      {useImprovedUX && (
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
      )}

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
              display: useImprovedUX ? 'none' : 'flex' // Hide tabs when using improved UX
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
