// FallbackContentPreview.tsx - Visual preview component for fallback content
import React from 'react';
import { Card, Typography, Tag, Image, Empty } from 'antd';
import { 
  FileTextOutlined, 
  AppstoreOutlined, 
  ExclamationCircleOutlined,
  InboxOutlined 
} from '@ant-design/icons';
import type { FallbackScenarioConfig, FallbackScenario } from '../../types';

const { Text, Title } = Typography;

interface FallbackContentPreviewProps {
  scenario: FallbackScenarioConfig;
  scenarioType: FallbackScenario;
}

const FallbackContentPreviewComponent: React.FC<FallbackContentPreviewProps> = ({
  scenario,
  scenarioType,
}) => {
  const getScenarioIcon = () => {
    return scenarioType === 'ineligible_audience' 
      ? <ExclamationCircleOutlined className="text-orange-500" />
      : <InboxOutlined className="text-blue-500" />;
  };

  const getScenarioColor = () => {
    return scenarioType === 'ineligible_audience' ? 'orange' : 'blue';
  };

  const getScenarioLabel = () => {
    return scenarioType === 'ineligible_audience' 
      ? 'Ineligible Audience' 
      : 'Empty Supply';
  };

  const renderPreviewContent = () => {
    if (!scenario.enabled || scenario.content.option === 'none') {
      return (
        <div className="text-center py-8 text-gray-500">
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No fallback content configured"
          />
        </div>
      );
    }

    if (scenario.content.option === 'cms_content') {
      const template = scenario.content.cmsTemplate;
      const tokenizedCopy = scenario.content.tokenizedCopy;
      
      if (!template) {
        return (
          <div className="text-center py-4 text-gray-500">
            <FileTextOutlined className="text-2xl mb-2" />
            <p>Select a CMS template to see preview</p>
          </div>
        );
      }

      return (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <FileTextOutlined className="text-gray-600" />
            <Tag color="default">CMS Content</Tag>
            <Text className="text-sm text-gray-500">{template.name}</Text>
          </div>
          
          <div className="p-3 border border-gray-300 rounded bg-white">
            <div className="space-y-2">
              <div className="font-medium text-gray-700">
                {tokenizedCopy?.preview || template.name}
              </div>
              <div className="text-sm text-gray-500">
                Template: {template.description}
              </div>
              <div className="text-xs text-gray-400">
                Available tokens: {template.tokenFields.join(', ')}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (scenario.content.option === 'default_tile') {
      const tileContent = scenario.content.defaultTileContent;
      
      if (!tileContent?.title) {
        return (
          <div className="text-center py-4 text-gray-500">
            <AppstoreOutlined className="text-2xl mb-2" />
            <p>Configure default tile content to see preview</p>
          </div>
        );
      }

      return (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <AppstoreOutlined className={`text-${getScenarioColor()}-600`} />
            <Tag color={getScenarioColor()}>Default Tile</Tag>
          </div>
          
          <div className={`p-4 border-2 border-${getScenarioColor()}-300 rounded-lg bg-${getScenarioColor()}-50`}>
            <div className="space-y-3">
              {tileContent.imageUrl && (
                <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                  <Image
                    src={tileContent.imageUrl}
                    alt={tileContent.title}
                    className="max-h-full"
                    fallback="/images/placeholder.jpg"
                    preview={false}
                  />
                </div>
              )}
              
              <div>
                <Title level={5} className="mb-1">
                  {tileContent.title}
                </Title>
                <Text className="text-gray-600">
                  {tileContent.description}
                </Text>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                <Text className="text-xs text-gray-500">
                  Fallback: {getScenarioLabel()}
                </Text>
                <div className="flex items-center space-x-1">
                  {getScenarioIcon()}
                  <Text className="text-xs text-gray-500">Auto-generated</Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Card 
      size="small"
      className="bg-gray-50"
      title={
        <div className="flex items-center space-x-2">
          {getScenarioIcon()}
          <span className="text-sm">
            {getScenarioLabel()} Fallback Preview
          </span>
        </div>
      }
    >
      {renderPreviewContent()}
      
      {scenario.enabled && scenario.content.option !== 'none' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-start space-x-2">
            <ExclamationCircleOutlined className="text-yellow-600 mt-0.5" />
            <div>
              <Text strong className="text-yellow-800 text-sm">
                When this shows:
              </Text>
              <div className="text-sm text-yellow-700 mt-1">
                {scenario.reason}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default FallbackContentPreviewComponent;
