import React, { useState, useEffect } from 'react';
import { Tabs, Button, Space, Typography, Alert, Modal } from 'antd';
import { SaveOutlined, CopyOutlined, PlayCircleOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ConditionBuilder from '../features/rules/components/ConditionBuilder';
import ContentConfiguration from '../features/rules/components/content/ContentConfiguration';
import FallbackConfiguration from '../features/rules/components/fallback/FallbackConfiguration';
import type { AudienceCondition, ValidationResult, ContentConfiguration as ContentConfigurationType, ContentValidationResult, FallbackConfiguration as FallbackConfigurationType, FallbackValidationResult } from '../features/rules/types';

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
  const handleSaveDraft = () => {
    console.log('rule_saved', { ruleId: id || 'new', data: ruleData });
    setHasUnsavedChanges(false);
    // Mock save success - update validation state
    setValidationState(prev => ({
      ...prev,
      audience: validateTab('audience'),
      content: ruleData.content ? 'valid' : 'empty',
      fallback: ruleData.fallback ? 'valid' : 'empty',
      schedule: ruleData.schedule ? 'valid' : 'empty',
    }));
  };

  // Handle duplicate
  const handleDuplicate = () => {
    console.log('rule_duplicated', { originalId: id });
    const newRuleId = `${id}_copy_${Date.now()}`;
    navigate(`/rules/${newRuleId}`);
  };

  // Handle run simulation
  const handleRunSimulation = () => {
    console.log('simulation_run', { ruleId: id || 'new' });
    setActiveTab('preview');
    setValidationState(prev => ({ ...prev, preview: 'valid' }));
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
          <ConditionBuilder
            condition={ruleData.audience || undefined}
            onChange={handleAudienceChange}
            onValidationChange={handleAudienceValidationChange}
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
          <Alert
            message="Simulation Coming Soon"
            description="User simulation and rule testing functionality."
            type="info"
            showIcon
            className="mb-4"
          />
          <div className="mb-4">
            <p className="text-gray-600">
              Preview tab shows ⚠️ warning until simulation is run. Click "Run Simulation" button to test.
            </p>
          </div>
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
              icon={<SaveOutlined />}
              onClick={handleSaveDraft}
              type={hasUnsavedChanges ? "primary" : "default"}
              className={hasUnsavedChanges ? "animate-pulse" : ""}
            >
              Save Draft
            </Button>
            <Button
              icon={<CopyOutlined />}
              onClick={handleDuplicate}
              disabled={isNewRule}
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

      {/* Tabs Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          className="h-full"
          tabBarStyle={{ 
            marginBottom: 0,
            paddingLeft: '24px',
            paddingRight: '24px',
            borderBottom: '1px solid #f0f0f0'
          }}
        />
      </div>
    </div>
  );
};

export default RuleEditor;
