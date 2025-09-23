// OfferingContentConfig.tsx - Offering content configuration with TargetedLead and ProductReco
import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Switch,
  Select,
  InputNumber,
  Typography,
  Space,
  Divider,
  Badge,
  Alert,
} from 'antd';
import { 
  GoldOutlined, 
  ShoppingOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import type { OfferingContentConfig, ContentTemplate } from '../../types';
import { targetedLeadTemplates, productRecoTemplates } from '../../contentTemplates';
import TokenizedCopyEditor from './TokenizedCopyEditor';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface OfferingContentConfigProps {
  config: OfferingContentConfig;
  onChange: (config: OfferingContentConfig) => void;
}

const OfferingContentConfigComponent: React.FC<OfferingContentConfigProps> = ({
  config,
  onChange,
}) => {
  const [selectedTargetedLeadTemplate, setSelectedTargetedLeadTemplate] = useState<ContentTemplate | undefined>(
    config.targetedLead?.selectedTemplate
  );
  const [selectedProductRecoTemplate, setSelectedProductRecoTemplate] = useState<ContentTemplate | undefined>(
    config.productReco?.selectedTemplate
  );

  const handleTargetedLeadToggle = (enabled: boolean) => {
    onChange({
      ...config,
      targetedLead: {
        enabled,
        maxYield: enabled ? 2 : 0,
      },
    });
  };

  const handleProductRecoToggle = (enabled: boolean) => {
    onChange({
      ...config,
      productReco: {
        enabled,
        maxYield: enabled ? 2 : 0,
      },
    });
  };

  const handleTargetedLeadTemplateChange = (templateId: string) => {
    const template = targetedLeadTemplates.find(t => t.id === templateId);
    setSelectedTargetedLeadTemplate(template);
    onChange({
      ...config,
      targetedLead: {
        ...config.targetedLead!,
        selectedTemplate: template,
        tokenizedCopy: template ? {
          template: `{{${template.tokenFields[0]}|Premium ${template.tokenFields[0]}}}`,
          preview: '',
        } : undefined,
      },
    });
  };

  const handleProductRecoTemplateChange = (templateId: string) => {
    const template = productRecoTemplates.find(t => t.id === templateId);
    setSelectedProductRecoTemplate(template);
    onChange({
      ...config,
      productReco: {
        ...config.productReco!,
        selectedTemplate: template,
        tokenizedCopy: template ? {
          template: `{{${template.tokenFields[0]}|Recommended ${template.tokenFields[0]}}}`,
          preview: '',
        } : undefined,
      },
    });
  };

  const handleTargetedLeadMaxYieldChange = (maxYield: number | null) => {
    if (maxYield !== null) {
      onChange({
        ...config,
        targetedLead: {
          ...config.targetedLead!,
          maxYield,
        },
      });
    }
  };

  const handleProductRecoMaxYieldChange = (maxYield: number | null) => {
    if (maxYield !== null) {
      onChange({
        ...config,
        productReco: {
          ...config.productReco!,
          maxYield,
        },
      });
    }
  };

  const handleTargetedLeadTokenizedCopyChange = (tokenizedCopy: any) => {
    onChange({
      ...config,
      targetedLead: {
        ...config.targetedLead!,
        tokenizedCopy,
      },
    });
  };

  const handleProductRecoTokenizedCopyChange = (tokenizedCopy: any) => {
    onChange({
      ...config,
      productReco: {
        ...config.productReco!,
        tokenizedCopy,
      },
    });
  };

  return (
    <div className="space-y-6">
      <Alert
        message="Offering Content Sources"
        description="Configure content sources specific to offering-related rules. TargetedLead content is premium and prominently featured."
        type="info"
        showIcon
        className="mb-4"
      />

      {/* Targeted Lead Configuration - Prominently Featured */}
      <Card 
        className={`border-2 ${config.targetedLead?.enabled ? 'border-yellow-400 shadow-lg' : 'border-yellow-200'} bg-gradient-to-r from-yellow-50 to-orange-50`}
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <GoldOutlined className="text-2xl text-yellow-600" />
                <TrophyOutlined className="text-xl text-yellow-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-yellow-800">Targeted Lead Content</span>
                  <Badge count="PREMIUM" style={{ backgroundColor: '#faad14', color: '#000' }} />
                </div>
                <Text type="secondary" className="text-sm">
                  High-value personalized lead content with premium styling
                </Text>
              </div>
            </div>
            <Switch
              checked={config.targetedLead?.enabled || false}
              onChange={handleTargetedLeadToggle}
              checkedChildren="ON"
              unCheckedChildren="OFF"
              size="default"
              style={{ backgroundColor: config.targetedLead?.enabled ? '#faad14' : undefined }}
            />
          </div>
        }
      >
        {config.targetedLead?.enabled ? (
          <div className="space-y-4">
            {/* Template and Yield Selection */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={14}>
                <Space direction="vertical" size={0} className="w-full">
                  <Text strong className="text-yellow-800">Lead Template</Text>
                  <Text type="secondary" className="text-xs">
                    Premium templates for targeted lead content
                  </Text>
                  <Select
                    placeholder="Select Targeted Lead template"
                    value={selectedTargetedLeadTemplate?.id}
                    onChange={handleTargetedLeadTemplateChange}
                    className="w-full"
                    size="large"
                  >
                    {targetedLeadTemplates.map(template => (
                      <Option key={template.id} value={template.id}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-yellow-800">{template.name}</div>
                            <div className="text-xs text-yellow-600">{template.description}</div>
                          </div>
                          <GoldOutlined className="text-yellow-500" />
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Space>
              </Col>
              
              <Col xs={24} lg={10}>
                <Space direction="vertical" size={0} className="w-full">
                  <Text strong className="text-yellow-800">Max Lead Tiles</Text>
                  <Text type="secondary" className="text-xs">
                    Maximum lead tiles for this rule
                  </Text>
                  <InputNumber
                    min={1}
                    max={5}
                    value={config.targetedLead?.maxYield || 2}
                    onChange={handleTargetedLeadMaxYieldChange}
                    className="w-full"
                    size="large"
                    placeholder="Max lead tiles"
                  />
                </Space>
              </Col>
            </Row>

            {/* Tokenized Copy Editor for Targeted Lead */}
            {selectedTargetedLeadTemplate && (
              <>
                <Divider />
                <div>
                  <Title level={5} className="text-yellow-800">Premium Lead Copy Configuration</Title>
                  <Paragraph type="secondary" className="text-sm">
                    Customize premium lead content with personalized messaging and high-impact copy.
                  </Paragraph>
                  
                  <TokenizedCopyEditor
                    sourceType="TargetedLead"
                    availableTokens={selectedTargetedLeadTemplate.tokenFields}
                    tokenizedCopy={config.targetedLead?.tokenizedCopy}
                    onChange={handleTargetedLeadTokenizedCopyChange}
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-yellow-600">
            <div className="flex justify-center items-center space-x-2 mb-2">
              <GoldOutlined className="text-4xl" />
              <TrophyOutlined className="text-3xl" />
            </div>
            <p className="font-medium">Enable Targeted Lead content for premium personalized opportunities</p>
            <p className="text-sm text-yellow-500">High-value content with gold styling and exclusive templates</p>
          </div>
        )}
      </Card>

      {/* Product Recommendation Configuration */}
      <Card 
        className={`border-2 ${config.productReco?.enabled ? 'border-blue-400' : 'border-blue-200'} bg-blue-50`}
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingOutlined className="text-2xl text-blue-600" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-blue-800">Product Recommendations</span>
                  <Badge count="STANDARD" style={{ backgroundColor: '#1890ff' }} />
                </div>
                <Text type="secondary" className="text-sm">
                  Product-focused content with standard blue styling
                </Text>
              </div>
            </div>
            <Switch
              checked={config.productReco?.enabled || false}
              onChange={handleProductRecoToggle}
              checkedChildren="ON"
              unCheckedChildren="OFF"
              size="default"
            />
          </div>
        }
      >
        {config.productReco?.enabled ? (
          <div className="space-y-4">
            {/* Template and Yield Selection */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={14}>
                <Space direction="vertical" size={0} className="w-full">
                  <Text strong className="text-blue-800">Product Template</Text>
                  <Text type="secondary" className="text-xs">
                    Standard templates for product recommendations
                  </Text>
                  <Select
                    placeholder="Select Product Recommendation template"
                    value={selectedProductRecoTemplate?.id}
                    onChange={handleProductRecoTemplateChange}
                    className="w-full"
                    size="large"
                  >
                    {productRecoTemplates.map(template => (
                      <Option key={template.id} value={template.id}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-blue-800">{template.name}</div>
                            <div className="text-xs text-blue-600">{template.description}</div>
                          </div>
                          <ShoppingOutlined className="text-blue-500" />
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Space>
              </Col>
              
              <Col xs={24} lg={10}>
                <Space direction="vertical" size={0} className="w-full">
                  <Text strong className="text-blue-800">Max Product Tiles</Text>
                  <Text type="secondary" className="text-xs">
                    Maximum product tiles for this rule
                  </Text>
                  <InputNumber
                    min={1}
                    max={5}
                    value={config.productReco?.maxYield || 2}
                    onChange={handleProductRecoMaxYieldChange}
                    className="w-full"
                    size="large"
                    placeholder="Max product tiles"
                  />
                </Space>
              </Col>
            </Row>

            {/* Tokenized Copy Editor for Product Reco */}
            {selectedProductRecoTemplate && (
              <>
                <Divider />
                <div>
                  <Title level={5} className="text-blue-800">Product Copy Configuration</Title>
                  <Paragraph type="secondary" className="text-sm">
                    Customize product recommendation content with clear value propositions and features.
                  </Paragraph>
                  
                  <TokenizedCopyEditor
                    sourceType="ProductReco"
                    availableTokens={selectedProductRecoTemplate.tokenFields}
                    tokenizedCopy={config.productReco?.tokenizedCopy}
                    onChange={handleProductRecoTokenizedCopyChange}
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-blue-600">
            <ShoppingOutlined className="text-4xl mb-2" />
            <p className="font-medium">Enable Product Recommendations for standard offering content</p>
            <p className="text-sm text-blue-500">Product-focused content with blue styling and standard templates</p>
          </div>
        )}
      </Card>

      {/* Summary */}
      {(config.targetedLead?.enabled || config.productReco?.enabled) && (
        <Card className="bg-orange-50 border-orange-200">
          <Title level={5}>Offering Content Summary</Title>
          <Row gutter={[16, 8]}>
            <Col span={24}>
              <Text>
                <strong>Targeted Lead:</strong> {config.targetedLead?.enabled ? '✅' : '❌'} 
                {config.targetedLead?.enabled && ` (${config.targetedLead.maxYield} tiles)`} | 
                <strong> Product Reco:</strong> {config.productReco?.enabled ? '✅' : '❌'}
                {config.productReco?.enabled && ` (${config.productReco.maxYield} tiles)`}
              </Text>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default OfferingContentConfigComponent;
