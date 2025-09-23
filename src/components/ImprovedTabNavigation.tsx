import React from 'react';
import { Steps, Card, Badge } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface TabStep {
  key: string;
  title: string;
  description: string;
  icon: string;
  status: 'wait' | 'process' | 'finish' | 'error';
  optional?: boolean;
}

interface ImprovedTabNavigationProps {
  activeTab: string;
  onTabChange: (key: string) => void;
  tabValidation: Record<string, 'valid' | 'warning' | 'error' | 'empty'>;
}

const ImprovedTabNavigation: React.FC<ImprovedTabNavigationProps> = ({
  activeTab,
  onTabChange,
  tabValidation
}) => {
  const steps: TabStep[] = [
    {
      key: 'audience',
      title: 'Define Audience',
      description: 'Who should see this content?',
      icon: '👥',
      status: getStepStatus('audience', tabValidation.audience)
    },
    {
      key: 'content',
      title: 'Choose Content',
      description: 'What should they see?',
      icon: '📱',
      status: getStepStatus('content', tabValidation.content)
    },
    {
      key: 'fallback',
      title: 'Set Fallbacks',
      description: 'What if conditions don\'t match?',
      icon: '🛡️',
      status: getStepStatus('fallback', tabValidation.fallback),
      optional: true
    },
    {
      key: 'schedule',
      title: 'Schedule',
      description: 'When should this run?',
      icon: '⏰',
      status: getStepStatus('schedule', tabValidation.schedule),
      optional: true
    },
    {
      key: 'preview',
      title: 'Test & Preview',
      description: 'See how it looks',
      icon: '👁️',
      status: getStepStatus('preview', tabValidation.preview)
    }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === activeTab);

  return (
    <div className="mb-8">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Rule Configuration
            </h1>
            <p className="text-gray-600">
              Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex]?.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
            </div>
          </div>
        </div>

        {/* Interactive Steps */}
        <Steps
          current={currentStepIndex}
          onChange={onTabChange}
          className="cursor-pointer"
          items={steps.map((step, index) => ({
            title: (
              <div className="flex items-center space-x-2">
                <span className="text-lg">{step.icon}</span>
                <div>
                  <div className="font-medium">{step.title}</div>
                  {step.optional && (
                    <Badge count="Optional" className="text-xs" />
                  )}
                </div>
              </div>
            ),
            description: step.description,
            status: step.status,
            icon: getStepIcon(step.status)
          }))}
        />
      </div>

      {/* Current Step Context Card */}
      <Card className="border-l-4 border-l-blue-500">
        <div className="flex items-start space-x-4">
          <div className="text-3xl">{steps[currentStepIndex]?.icon}</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {steps[currentStepIndex]?.title}
            </h3>
            <p className="text-gray-600 mb-3">
              {getStepGuidance(activeTab)}
            </p>
            {getStepStatus(activeTab, tabValidation[activeTab]) === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="flex items-center space-x-2 text-red-700">
                  <ExclamationCircleOutlined />
                  <span className="font-medium">Action Required</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  {getStepErrorMessage(activeTab)}
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

// Helper functions
function getStepStatus(tabKey: string, validation: string): 'wait' | 'process' | 'finish' | 'error' {
  switch (validation) {
    case 'valid': return 'finish';
    case 'error': return 'error';
    case 'warning': return 'process';
    default: return 'wait';
  }
}

function getStepIcon(status: string) {
  switch (status) {
    case 'finish': return <CheckCircleOutlined className="text-green-500" />;
    case 'error': return <ExclamationCircleOutlined className="text-red-500" />;
    case 'process': return <ClockCircleOutlined className="text-orange-500" />;
    default: return undefined;
  }
}

function getStepGuidance(tabKey: string): string {
  const guidance = {
    audience: 'Define who should see this content by selecting customer characteristics and behaviors.',
    content: 'Choose what content to display and configure templates for different scenarios.',
    fallback: 'Set up backup content for when your main conditions don\'t match or content isn\'t available.',
    schedule: 'Configure when this rule should be active and any time-based restrictions.',
    preview: 'Test your rule with sample customers to see exactly how it will work in production.'
  };
  return guidance[tabKey as keyof typeof guidance] || '';
}

function getStepErrorMessage(tabKey: string): string {
  const messages = {
    audience: 'Please add at least one audience condition to continue.',
    content: 'Please configure at least one content source and template.',
    fallback: 'Please set up fallback options for both scenarios.',
    schedule: 'Please configure the rule schedule and timing.',
    preview: 'Please run a simulation to validate your rule configuration.'
  };
  return messages[tabKey as keyof typeof messages] || 'Please complete this step to continue.';
}

export default ImprovedTabNavigation;
