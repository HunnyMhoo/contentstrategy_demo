// FallbackConfiguration.tsx - Main component for US-007: Fallback Plan Configuration
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Alert, 
  Typography, 
  Row, 
  Col,
  Divider
} from 'antd';
import { 
  ExclamationCircleOutlined, 
  InboxOutlined,
  WarningOutlined
} from '@ant-design/icons';
import type { FallbackConfiguration, FallbackValidationResult } from '../../types';
import FallbackScenarioCard from './FallbackScenarioCard';

const { Title, Text } = Typography;

interface FallbackConfigurationProps {
  configuration?: FallbackConfiguration;
  onChange: (config: FallbackConfiguration) => void;
  onValidationChange?: (validation: FallbackValidationResult) => void;
}

const defaultConfiguration: FallbackConfiguration = {
  ineligibleAudience: {
    scenario: 'ineligible_audience',
    enabled: false,
    content: {
      option: 'none',
    },
    reason: 'User does not match any audience targeting conditions',
  },
  emptySupply: {
    scenario: 'empty_supply',
    enabled: false,
    content: {
      option: 'none',
    },
    reason: 'No content available from configured sources',
  },
};

const FallbackConfigurationComponent: React.FC<FallbackConfigurationProps> = ({
  configuration = defaultConfiguration,
  onChange,
  onValidationChange,
}) => {
  const [config, setConfig] = useState<FallbackConfiguration>(configuration);

  // Update parent when config changes
  useEffect(() => {
    onChange(config);
  }, [config]);

  // Run validation when config changes
  useEffect(() => {
    validateConfiguration(config);
  }, [config]);

  const validateConfiguration = (cfg: FallbackConfiguration) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const scenarioErrors: Record<'ineligible_audience' | 'empty_supply', string[]> = {
      ineligible_audience: [],
      empty_supply: [],
    };

    let hasFallbacks = false;

    // Validate ineligible audience scenario
    if (cfg.ineligibleAudience.enabled) {
      hasFallbacks = true;
      if (cfg.ineligibleAudience.content.option === 'cms_content' && !cfg.ineligibleAudience.content.cmsTemplate) {
        scenarioErrors.ineligible_audience.push('CMS template required when using CMS content option');
      }
      if (cfg.ineligibleAudience.content.option === 'default_tile' && !cfg.ineligibleAudience.content.defaultTileContent?.title) {
        scenarioErrors.ineligible_audience.push('Default tile title is required');
      }
    }

    // Validate empty supply scenario
    if (cfg.emptySupply.enabled) {
      hasFallbacks = true;
      if (cfg.emptySupply.content.option === 'cms_content' && !cfg.emptySupply.content.cmsTemplate) {
        scenarioErrors.empty_supply.push('CMS template required when using CMS content option');
      }
      if (cfg.emptySupply.content.option === 'default_tile' && !cfg.emptySupply.content.defaultTileContent?.title) {
        scenarioErrors.empty_supply.push('Default tile title is required');
      }
    }

    // Collect all scenario errors
    const allScenarioErrors = [
      ...scenarioErrors.ineligible_audience,
      ...scenarioErrors.empty_supply,
    ];
    errors.push(...allScenarioErrors);

    // Add warnings
    if (!cfg.ineligibleAudience.enabled && !cfg.emptySupply.enabled) {
      warnings.push('No fallback scenarios configured - users may see empty content');
    }

    const validation: FallbackValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasFallbacks,
      scenarioErrors,
    };

    onValidationChange?.(validation);
  };

  const handleIneligibleAudienceChange = (scenarioConfig: typeof config.ineligibleAudience) => {
    setConfig(prev => ({ 
      ...prev, 
      ineligibleAudience: scenarioConfig 
    }));
  };

  const handleEmptySupplyChange = (scenarioConfig: typeof config.emptySupply) => {
    setConfig(prev => ({ 
      ...prev, 
      emptySupply: scenarioConfig 
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Alert
        message="Fallback Plan Configuration"
        description="Configure what content to show when rules don't match users or when content sources are empty. Fallbacks ensure users always see relevant content."
        type="info"
        showIcon
        className="mb-6"
      />

      {/* Ineligible Audience Scenario */}
      <Card 
        className="border-2 border-orange-200"
        title={
          <div className="flex items-center space-x-2">
            <ExclamationCircleOutlined className="text-orange-500 text-lg" />
            <span className="font-semibold">Ineligible Audience Fallback</span>
            {config.ineligibleAudience.enabled && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                Active
              </span>
            )}
          </div>
        }
      >
        <div className="mb-4">
          <Text type="secondary">
            Triggered when: <strong>User doesn't match audience targeting conditions</strong>
          </Text>
        </div>
        
        <FallbackScenarioCard
          scenario={config.ineligibleAudience}
          onChange={handleIneligibleAudienceChange}
        />
      </Card>

      {/* Empty Supply Scenario */}
      <Card 
        className="border-2 border-blue-200"
        title={
          <div className="flex items-center space-x-2">
            <InboxOutlined className="text-blue-500 text-lg" />
            <span className="font-semibold">Empty Supply Fallback</span>
            {config.emptySupply.enabled && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Active
              </span>
            )}
          </div>
        }
      >
        <div className="mb-4">
          <Text type="secondary">
            Triggered when: <strong>No content available from configured sources</strong>
          </Text>
        </div>
        
        <FallbackScenarioCard
          scenario={config.emptySupply}
          onChange={handleEmptySupplyChange}
        />
      </Card>

      <Divider />

      {/* Summary */}
      <Card className="bg-yellow-50 border-yellow-200">
        <div className="flex items-start space-x-3">
          <WarningOutlined className="text-yellow-600 text-lg mt-1" />
          <div>
            <Title level={5} className="text-yellow-800 mb-2">Fallback Strategy Summary</Title>
            <Row gutter={[16, 8]}>
              <Col xs={24} sm={12}>
                <Text>
                  <strong>Ineligible Audience:</strong> {
                    config.ineligibleAudience.enabled 
                      ? `${config.ineligibleAudience.content.option.replace('_', ' ')} ✅`
                      : 'Not configured ❌'
                  }
                </Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text>
                  <strong>Empty Supply:</strong> {
                    config.emptySupply.enabled 
                      ? `${config.emptySupply.content.option.replace('_', ' ')} ✅`
                      : 'Not configured ❌'
                  }
                </Text>
              </Col>
            </Row>
            <div className="mt-3">
              <Text type="secondary" className="text-sm">
                {config.ineligibleAudience.enabled || config.emptySupply.enabled
                  ? 'Fallback content will ensure users always see relevant information when primary rules don\'t apply.'
                  : 'Consider enabling at least one fallback scenario to prevent empty content experiences.'
                }
              </Text>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FallbackConfigurationComponent;
