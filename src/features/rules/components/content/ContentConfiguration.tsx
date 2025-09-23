// ContentConfiguration.tsx - Main component for US-006: Content Source Selection
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Switch, 
  InputNumber, 
  Divider, 
  Alert, 
  Typography, 
  Row, 
  Col,
  Badge,
  Space
} from 'antd';
import { 
  AppstoreOutlined, 
  FileTextOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import type { ContentConfiguration, ContentValidationResult } from '../../types';
import CMSContentConfig from './CMSContentConfig';
import OfferingContentConfig from './OfferingContentConfig';

const { Title, Text } = Typography;

interface ContentConfigurationProps {
  configuration?: ContentConfiguration;
  onChange: (config: ContentConfiguration) => void;
  onValidationChange?: (validation: ContentValidationResult) => void;
}

const defaultConfiguration: ContentConfiguration = {
  cms: {
    enabled: true,
    maxYield: 3,
  },
  offering: {
    enabled: false,
  },
  priority: 1,
  totalMaxYield: 3,
};

const ContentConfigurationComponent: React.FC<ContentConfigurationProps> = ({
  configuration = defaultConfiguration,
  onChange,
  onValidationChange,
}) => {
  const [config, setConfig] = useState<ContentConfiguration>(configuration);

  // Fixed useEffect - only run validation when config changes, not when onChange changes
  useEffect(() => {
    validateConfiguration(config);
  }, [config]);

  // Call onChange when config changes, but don't include it in dependencies to avoid loops
  useEffect(() => {
    onChange(config);
  }, [config]);

  const validateConfiguration = (cfg: ContentConfiguration) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let hasContent = false;

    // Validate CMS (always required as primary source)
    if (!cfg.cms.enabled) {
      errors.push('CMS content source must be enabled as primary content');
    } else {
      hasContent = true;
      if (!cfg.cms.selectedTemplate) {
        warnings.push('No CMS template selected');
      }
    }

    // Validate offering content if enabled
    if (cfg.offering.enabled) {
      const hasTargetedLead = cfg.offering.targetedLead?.enabled;
      const hasProductReco = cfg.offering.productReco?.enabled;
      
      if (!hasTargetedLead && !hasProductReco) {
        warnings.push('Offering content enabled but no sources selected');
      } else {
        hasContent = true;
      }
    }

    // Validate priority
    if (cfg.priority < 1 || cfg.priority > 100) {
      errors.push('Priority must be between 1 and 100');
    }

    // Validate total max yield
    if (cfg.totalMaxYield < 1 || cfg.totalMaxYield > 5) {
      errors.push('Total max yield must be between 1 and 5 tiles');
    }

    const validation: ContentValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasContent,
      priorityConflicts: [],
    };

    onValidationChange?.(validation);
  };

  const handleCMSChange = (cmsConfig: typeof config.cms) => {
    setConfig(prev => ({ ...prev, cms: cmsConfig }));
  };

  const handleOfferingToggle = (enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      offering: {
        ...prev.offering,
        enabled,
      },
    }));
  };

  const handleOfferingChange = (offeringConfig: typeof config.offering) => {
    setConfig(prev => ({ ...prev, offering: offeringConfig }));
  };

  const handlePriorityChange = (priority: number | null) => {
    if (priority !== null) {
      setConfig(prev => ({ ...prev, priority }));
    }
  };

  const handleTotalMaxYieldChange = (totalMaxYield: number | null) => {
    if (totalMaxYield !== null) {
      setConfig(prev => ({ ...prev, totalMaxYield }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Priority and Total Yield */}
      <Card className="border-2 border-blue-200">
        <Row gutter={[16, 16]} align="middle">
          <Col span={24}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <TrophyOutlined className="text-xl text-blue-500" />
                <Title level={4} className="mb-0">Rule Configuration</Title>
              </div>
              <Badge 
                count={`Priority ${config.priority}`} 
                style={{ backgroundColor: '#1890ff' }}
              />
            </div>
          </Col>
          
          <Col xs={24} sm={12}>
            <Space direction="vertical" size={0} className="w-full">
              <Text strong>Rule Priority</Text>
              <Text type="secondary" className="text-xs">
                Higher priority rules show first in "Special for you" placement
              </Text>
              <InputNumber
                min={1}
                max={100}
                value={config.priority}
                onChange={handlePriorityChange}
                className="w-full"
                placeholder="Enter priority (1-100)"
              />
            </Space>
          </Col>
          
          <Col xs={24} sm={12}>
            <Space direction="vertical" size={0} className="w-full">
              <Text strong>Max Tiles from this Rule</Text>
              <Text type="secondary" className="text-xs">
                Maximum tiles this rule can contribute (1-5)
              </Text>
              <InputNumber
                min={1}
                max={5}
                value={config.totalMaxYield}
                onChange={handleTotalMaxYieldChange}
                className="w-full"
                placeholder="Max tiles"
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* CMS Content Configuration (Primary - Always Available) */}
      <Card 
        className="border-2 border-gray-300"
        title={
          <div className="flex items-center space-x-2">
            <FileTextOutlined className="text-gray-600" />
            <span>CMS Content (Primary Source)</span>
            <Badge count="Required" style={{ backgroundColor: '#52c41a' }} />
          </div>
        }
      >
        <Alert
          message="Primary Content Source"
          description="CMS content is the primary source and always available. Configure templates and copy for general content."
          type="info"
          showIcon
          className="mb-4"
        />
        
        <CMSContentConfig
          config={config.cms}
          onChange={handleCMSChange}
        />
      </Card>

      {/* Offering Content Configuration (Optional - Manual Toggle) */}
      <Card 
        className={`border-2 ${config.offering.enabled ? 'border-orange-300' : 'border-gray-200'}`}
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AppstoreOutlined className="text-orange-500" />
              <span>Offering Content (Optional)</span>
              {config.offering.enabled && (
                <Badge count="Active" style={{ backgroundColor: '#fa8c16' }} />
              )}
            </div>
            <Switch
              checked={config.offering.enabled}
              onChange={handleOfferingToggle}
              checkedChildren="Enabled"
              unCheckedChildren="Disabled"
            />
          </div>
        }
      >
        <Alert
          message="Offering-Specific Content"
          description="Enable to add Targeted Lead and Product Recommendation content sources for offering-related rules."
          type="warning"
          showIcon
          className="mb-4"
        />

        {config.offering.enabled ? (
          <OfferingContentConfig
            config={config.offering}
            onChange={handleOfferingChange}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AppstoreOutlined className="text-4xl mb-2" />
            <p>Enable offering content to configure Targeted Lead and Product Recommendation sources</p>
          </div>
        )}
      </Card>

      <Divider />

      {/* Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <Title level={5}>Configuration Summary</Title>
        <Row gutter={[16, 8]}>
          <Col span={24}>
            <Text>
              <strong>Priority:</strong> {config.priority} | 
              <strong> Max Tiles:</strong> {config.totalMaxYield} | 
              <strong> CMS:</strong> {config.cms.enabled ? '✅' : '❌'} | 
              <strong> Offering:</strong> {config.offering.enabled ? '✅' : '❌'}
            </Text>
          </Col>
        </Row>
      </Card>
    </div>
  )
};

export default ContentConfigurationComponent;
