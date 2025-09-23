// CMSContentConfig.tsx - CMS content source configuration component
import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Select,
  InputNumber,
  Typography,
  Space,
  Divider,
  Tag,
} from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import type { CMSContentConfig, ContentTemplate } from '../../types';
import { cmsTemplates } from '../../contentTemplates';
import TokenizedCopyEditor from './TokenizedCopyEditor';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface CMSContentConfigProps {
  config: CMSContentConfig;
  onChange: (config: CMSContentConfig) => void;
}

const CMSContentConfigComponent: React.FC<CMSContentConfigProps> = ({
  config,
  onChange,
}) => {
  console.log('CMSContentConfig rendering with config:', config);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | undefined>(
    config.selectedTemplate
  );

  const handleTemplateChange = (templateId: string) => {
    const template = cmsTemplates.find(t => t.id === templateId);
    setSelectedTemplate(template);
    onChange({
      ...config,
      selectedTemplate: template,
      tokenizedCopy: template ? {
        template: `{{${template.tokenFields[0]}|Default ${template.tokenFields[0]}}}`,
        preview: '',
      } : undefined,
    });
  };

  const handleMaxYieldChange = (maxYield: number | null) => {
    if (maxYield !== null) {
      onChange({ ...config, maxYield });
    }
  };

  const handleTokenizedCopyChange = (tokenizedCopy: typeof config.tokenizedCopy) => {
    onChange({ ...config, tokenizedCopy });
  };

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Space direction="vertical" size={0} className="w-full">
            <Text strong>Content Template</Text>
            <Text type="secondary" className="text-xs">
              Choose how CMS content will be displayed
            </Text>
            <Select
              placeholder="Select CMS template"
              value={selectedTemplate?.id}
              onChange={handleTemplateChange}
              className="w-full"
              size="large"
            >
              {cmsTemplates.map(template => (
                <Option key={template.id} value={template.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-gray-500">{template.description}</div>
                    </div>
                    <FileTextOutlined className="text-gray-400" />
                  </div>
                </Option>
              ))}
            </Select>
          </Space>
        </Col>
        
        <Col xs={24} lg={10}>
          <Space direction="vertical" size={0} className="w-full">
            <Text strong>Max Tiles from CMS</Text>
            <Text type="secondary" className="text-xs">
              Maximum CMS tiles for this rule (1-5)
            </Text>
            <InputNumber
              min={1}
              max={5}
              value={config.maxYield}
              onChange={handleMaxYieldChange}
              className="w-full"
              size="large"
              placeholder="Max CMS tiles"
            />
          </Space>
        </Col>
      </Row>

      {/* Template Preview */}
      {selectedTemplate && (
        <>
          <Divider />
          <Card 
            size="small" 
            className="bg-gray-50 border-gray-300"
            title={
              <div className="flex items-center space-x-2">
                <FileTextOutlined className="text-gray-600" />
                <span className="text-sm">CMS Template: {selectedTemplate.name}</span>
                <Tag color="default">CMS</Tag>
              </div>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div className="space-y-2">
                  <Text strong className="text-sm">Available Tokens:</Text>
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplate.tokenFields.map(field => (
                      <Tag key={field} className="text-xs cursor-pointer" onClick={() => {
                        // Helper to insert token into copy editor
                        const tokenText = `{{${field}|Default ${field}}}`;
                        console.log('Token clicked:', tokenText);
                      }}>
                        {field}
                      </Tag>
                    ))}
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="space-y-2">
                  <Text strong className="text-sm">Template Style:</Text>
                  <div className="p-3 border border-gray-300 rounded bg-white">
                    <div className="text-sm font-medium text-gray-700">
                      📄 {selectedTemplate.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedTemplate.description}
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      Gray/content styling • Standard layout
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </>
      )}

      {/* Tokenized Copy Editor */}
      {selectedTemplate && (
        <>
          <Divider />
          <div>
            <Title level={5}>Content Copy Configuration</Title>
            <Paragraph type="secondary" className="text-sm">
              Customize the text that appears in CMS tiles. Use tokens like <code>{'{{title|Default Title}}'}</code> 
              with fallback values after the pipe (|) symbol.
            </Paragraph>
            
            <TokenizedCopyEditor
              sourceType="CMS"
              availableTokens={selectedTemplate.tokenFields}
              tokenizedCopy={config.tokenizedCopy}
              onChange={handleTokenizedCopyChange}
            />
          </div>
        </>
      )}

      {!selectedTemplate && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded">
          <FileTextOutlined className="text-4xl mb-2" />
          <p>Select a CMS template to configure content</p>
        </div>
      )}
    </div>
  );
};

export default CMSContentConfigComponent;
