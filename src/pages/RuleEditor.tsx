import React from 'react';
import { Tabs, Button, Space, Typography, Card, Alert } from 'antd';
import { SaveOutlined, CopyOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

const { Title } = Typography;

const RuleEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewRule = !id;

  const tabItems = [
    {
      key: 'audience',
      label: (
        <span className="flex items-center">
          Audience
          <span className="ml-2 text-orange-500">⚠️</span>
        </span>
      ),
      children: (
        <div className="p-6">
          <Alert
            message="Audience Builder Coming Soon"
            description="The visual condition builder for creating audience targeting rules will be implemented in the next phase."
            type="info"
            showIcon
            className="mb-4"
          />
          <p className="text-gray-600">
            This section will allow you to build complex audience conditions using:
          </p>
          <ul className="text-gray-600 ml-4">
            <li>Customer Attributes (including Targeted Lead)</li>
            <li>User Activity patterns</li>
            <li>Custom Data fields</li>
            <li>Boolean logic (AND/OR/NOT) with visual tree builder</li>
          </ul>
        </div>
      ),
    },
    {
      key: 'content',
      label: 'Content',
      children: (
        <div className="p-6">
          <Alert
            message="Content Configuration Coming Soon"
            description="Content source selection and template configuration will be implemented next."
            type="info"
            showIcon
            className="mb-4"
          />
          <p className="text-gray-600">
            This section will allow you to configure:
          </p>
          <ul className="text-gray-600 ml-4">
            <li>Content sources (Targeted Lead, Product Recommendations, CMS)</li>
            <li>Template selection with visual previews</li>
            <li>Max yield configuration (1-5 tiles)</li>
            <li>Tokenized copy with fallback syntax</li>
          </ul>
        </div>
      ),
    },
    {
      key: 'fallback',
      label: 'Fallback',
      children: (
        <div className="p-6">
          <Alert
            message="Fallback Plan Coming Soon"
            description="Fallback configuration for ineligible audiences and empty supply scenarios."
            type="info"
            showIcon
          />
        </div>
      ),
    },
    {
      key: 'schedule',
      label: 'Schedule',
      children: (
        <div className="p-6">
          <Alert
            message="Scheduling Coming Soon"
            description="UTC scheduling with local timezone display (Asia/Bangkok)."
            type="info"
            showIcon
          />
        </div>
      ),
    },
    {
      key: 'preview',
      label: 'Preview',
      children: (
        <div className="p-6">
          <Alert
            message="Simulation Coming Soon"
            description="User simulation and rule testing functionality."
            type="info"
            showIcon
          />
        </div>
      ),
    },
    {
      key: 'json',
      label: 'JSON',
      children: (
        <div className="p-6">
          <Alert
            message="JSON Preview Coming Soon"
            description="Read-only JSON configuration preview with schema validation."
            type="info"
            showIcon
          />
        </div>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="!mb-2">
              {isNewRule ? 'Create New Rule' : `Edit Rule ${id}`}
            </Title>
            <p className="text-gray-600 m-0">
              Configure audience targeting and content for the "For You" placement
            </p>
          </div>
          <Space>
            <Button
              icon={<SaveOutlined />}
              onClick={() => console.log('Save draft')}
            >
              Save Draft
            </Button>
            <Button
              icon={<CopyOutlined />}
              onClick={() => console.log('Duplicate rule')}
              disabled={isNewRule}
            >
              Duplicate
            </Button>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => console.log('Run simulation')}
            >
              Run Simulation
            </Button>
          </Space>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs
          defaultActiveKey="audience"
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
