// FallbackScenarioCard.tsx - Individual fallback scenario configuration component
import React, { useState } from 'react';
import { 
  Switch, 
  Radio, 
  Select, 
  Input, 
  Card, 
  Typography, 
  Space,
  Row,
  Col,
  Alert,
  Divider
} from 'antd';
import { 
  FileTextOutlined, 
  AppstoreOutlined, 
  CloseOutlined 
} from '@ant-design/icons';
import type { FallbackScenarioConfig, ContentTemplate, FallbackOption } from '../../types';
import { fallbackCMSTemplates, defaultTileSamples, fallbackSampleData } from '../../contentTemplates';
import FallbackContentPreview from './FallbackContentPreview';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface FallbackScenarioCardProps {
  scenario: FallbackScenarioConfig;
  onChange: (scenario: FallbackScenarioConfig) => void;
}

const FallbackScenarioCardComponent: React.FC<FallbackScenarioCardProps> = ({
  scenario,
  onChange,
}) => {
  const [selectedCMSTemplate, setSelectedCMSTemplate] = useState<ContentTemplate | undefined>(
    scenario.content.cmsTemplate
  );

  const handleEnabledToggle = (enabled: boolean) => {
    onChange({
      ...scenario,
      enabled,
      content: enabled ? scenario.content : { option: 'none' },
    });
  };

  const handleOptionChange = (option: FallbackOption) => {
    const updatedScenario = {
      ...scenario,
      content: {
        option,
        // Reset specific content based on option
        ...(option === 'cms_content' && { cmsTemplate: selectedCMSTemplate }),
        ...(option === 'default_tile' && { 
          defaultTileContent: defaultTileSamples[scenario.scenario] 
        }),
      },
    };
    onChange(updatedScenario);
  };

  const handleCMSTemplateChange = (templateId: string) => {
    const template = fallbackCMSTemplates.find(t => t.id === templateId);
    setSelectedCMSTemplate(template);
    onChange({
      ...scenario,
      content: {
        ...scenario.content,
        cmsTemplate: template,
        tokenizedCopy: template ? {
          template: `{{${template.tokenFields[0]}|Default ${template.tokenFields[0]}}}`,
          preview: '',
        } : undefined,
      },
    });
  };

  const handleDefaultTileChange = (field: string, value: string) => {
    onChange({
      ...scenario,
      content: {
        ...scenario.content,
        defaultTileContent: {
          ...scenario.content.defaultTileContent!,
          [field]: value,
        },
      },
    });
  };

  const handleTokenizedCopyChange = (template: string) => {
    onChange({
      ...scenario,
      content: {
        ...scenario.content,
        tokenizedCopy: {
          template,
          preview: renderFallbackTokenizedCopy(template),
        },
      },
    });
  };

  const renderFallbackTokenizedCopy = (template: string): string => {
    const tokenRegex = /\{\{([^}]+)\}\}/g;
    return template.replace(tokenRegex, (match, tokenPath) => {
      const [path, fallback] = tokenPath.split('|').map((s: string) => s.trim());
      const tokenKey = path.split('.').pop();
      
      // @ts-ignore - Dynamic property access for demo purposes
      const value = fallbackSampleData.general[tokenKey];
      return value || fallback || match;
    });
  };

  const getScenarioTitle = () => {
    return scenario.scenario === 'ineligible_audience' 
      ? 'Ineligible Audience' 
      : 'Empty Supply';
  };

  const getScenarioColor = () => {
    return scenario.scenario === 'ineligible_audience' ? 'orange' : 'blue';
  };

  return (
    <div className="space-y-4">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <Text strong>Enable {getScenarioTitle()} Fallback</Text>
          <div className="text-sm text-gray-600 mt-1">
            {scenario.reason}
          </div>
        </div>
        <Switch
          checked={scenario.enabled}
          onChange={handleEnabledToggle}
          checkedChildren="ON"
          unCheckedChildren="OFF"
          size="default"
        />
      </div>

      {scenario.enabled && (
        <>
          {/* Fallback Options */}
          <div className="space-y-4">
            <Text strong>Choose Fallback Content Type:</Text>
            
            <Radio.Group 
              value={scenario.content.option} 
              onChange={(e) => handleOptionChange(e.target.value)}
              className="w-full"
            >
              <Space direction="vertical" size="large" className="w-full">
                {/* CMS Content Option */}
                <Card 
                  className={`cursor-pointer transition-all ${
                    scenario.content.option === 'cms_content' 
                      ? `border-${getScenarioColor()}-400 bg-${getScenarioColor()}-50` 
                      : 'border-gray-200'
                  }`}
                  size="small"
                >
                  <Radio value="cms_content" className="w-full">
                    <div className="flex items-center space-x-2 ml-2">
                      <FileTextOutlined className={`text-${getScenarioColor()}-500`} />
                      <div>
                        <div className="font-medium">CMS Content</div>
                        <div className="text-sm text-gray-500">
                          Use CMS articles or content as fallback
                        </div>
                      </div>
                    </div>
                  </Radio>
                </Card>

                {/* Default Tile Option */}
                <Card 
                  className={`cursor-pointer transition-all ${
                    scenario.content.option === 'default_tile' 
                      ? `border-${getScenarioColor()}-400 bg-${getScenarioColor()}-50` 
                      : 'border-gray-200'
                  }`}
                  size="small"
                >
                  <Radio value="default_tile" className="w-full">
                    <div className="flex items-center space-x-2 ml-2">
                      <AppstoreOutlined className={`text-${getScenarioColor()}-500`} />
                      <div>
                        <div className="font-medium">Default Tile</div>
                        <div className="text-sm text-gray-500">
                          Show a custom default tile with your content
                        </div>
                      </div>
                    </div>
                  </Radio>
                </Card>

                {/* None Option */}
                <Card 
                  className={`cursor-pointer transition-all ${
                    scenario.content.option === 'none' 
                      ? 'border-gray-400 bg-gray-50' 
                      : 'border-gray-200'
                  }`}
                  size="small"
                >
                  <Radio value="none" className="w-full">
                    <div className="flex items-center space-x-2 ml-2">
                      <CloseOutlined className="text-gray-500" />
                      <div>
                        <div className="font-medium">None</div>
                        <div className="text-sm text-gray-500">
                          Don't show any content (empty space)
                        </div>
                      </div>
                    </div>
                  </Radio>
                </Card>
              </Space>
            </Radio.Group>
          </div>

          {/* Configuration based on selected option */}
          {scenario.content.option === 'cms_content' && (
            <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <Text strong>CMS Content Configuration</Text>
              
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Space direction="vertical" size={0} className="w-full">
                    <Text>Fallback Template</Text>
                    <Select
                      placeholder="Select fallback CMS template"
                      value={selectedCMSTemplate?.id}
                      onChange={handleCMSTemplateChange}
                      className="w-full"
                    >
                      {fallbackCMSTemplates.map(template => (
                        <Option key={template.id} value={template.id}>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-xs text-gray-500">{template.description}</div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Space>
                </Col>
                
                {selectedCMSTemplate && (
                  <Col xs={24} lg={12}>
                    <Space direction="vertical" size={0} className="w-full">
                      <Text>Tokenized Copy</Text>
                      <TextArea
                        value={scenario.content.tokenizedCopy?.template || ''}
                        onChange={(e) => handleTokenizedCopyChange(e.target.value)}
                        placeholder={`Use tokens like {{${selectedCMSTemplate.tokenFields[0]}|fallback}}`}
                        rows={3}
                        className="font-mono"
                      />
                    </Space>
                  </Col>
                )}
              </Row>
            </div>
          )}

          {scenario.content.option === 'default_tile' && (
            <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <Text strong>Default Tile Configuration</Text>
              
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Space direction="vertical" size={0} className="w-full">
                    <Text>Tile Title</Text>
                    <Input
                      value={scenario.content.defaultTileContent?.title || ''}
                      onChange={(e) => handleDefaultTileChange('title', e.target.value)}
                      placeholder="Enter tile title"
                    />
                  </Space>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Space direction="vertical" size={0} className="w-full">
                    <Text>Image URL (optional)</Text>
                    <Input
                      value={scenario.content.defaultTileContent?.imageUrl || ''}
                      onChange={(e) => handleDefaultTileChange('imageUrl', e.target.value)}
                      placeholder="/images/fallback.jpg"
                    />
                  </Space>
                </Col>
                
                <Col span={24}>
                  <Space direction="vertical" size={0} className="w-full">
                    <Text>Description</Text>
                    <TextArea
                      value={scenario.content.defaultTileContent?.description || ''}
                      onChange={(e) => handleDefaultTileChange('description', e.target.value)}
                      placeholder="Enter tile description"
                      rows={2}
                    />
                  </Space>
                </Col>
              </Row>
            </div>
          )}

          {scenario.content.option === 'none' && (
            <Alert
              message="No Fallback Content"
              description="This scenario will show empty space when triggered. Users may see blank tiles."
              type="warning"
              showIcon
            />
          )}

          {/* Preview */}
          {scenario.content.option !== 'none' && (
            <>
              <Divider />
              <div>
                <Text strong>Preview</Text>
                <div className="mt-2">
                  <FallbackContentPreview 
                    scenario={scenario}
                    scenarioType={scenario.scenario}
                  />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default FallbackScenarioCardComponent;
