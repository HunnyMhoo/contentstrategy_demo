// TokenizedCopyEditor.tsx - Tokenized copy editor with live preview
import React, { useState, useEffect } from 'react';
import {
  Input,
  Card,
  Typography,
  Alert,
  Space,
  Button,
  Tag,
  Row,
  Col,
  Tooltip,
} from 'antd';
import { 
  EyeOutlined, 
  CopyOutlined, 
  InfoCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { TokenizedCopy, ContentSourceType } from '../../types';
import { renderTokenizedCopy } from '../../contentTemplates';

const { TextArea } = Input;
const { Text } = Typography;

interface TokenizedCopyEditorProps {
  sourceType: ContentSourceType;
  availableTokens: string[];
  tokenizedCopy?: TokenizedCopy;
  onChange: (tokenizedCopy: TokenizedCopy) => void;
}

const TokenizedCopyEditorComponent: React.FC<TokenizedCopyEditorProps> = ({
  sourceType,
  availableTokens,
  tokenizedCopy,
  onChange,
}) => {
  const [template, setTemplate] = useState(tokenizedCopy?.template || '');
  const [preview, setPreview] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  // Update preview when template changes
  useEffect(() => {
    try {
      const renderedPreview = renderTokenizedCopy(template, sourceType);
      setPreview(renderedPreview);
      setIsValid(true);
      setErrors([]);
      
      onChange({
        template,
        preview: renderedPreview,
      });
    } catch (error) {
      setIsValid(false);
      setErrors([`Invalid template: ${error}`]);
      setPreview('Error rendering preview');
    }
  }, [template, sourceType, onChange]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplate(e.target.value);
  };

  const insertToken = (token: string) => {
    const tokenText = `{{${token}|Default ${token}}}`;
    const textarea = document.querySelector('textarea[placeholder*="tokenized copy"]') as HTMLTextAreaElement;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = template.substring(0, start) + tokenText + template.substring(end);
      setTemplate(newValue);
      
      // Set cursor position after inserted token
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tokenText.length, start + tokenText.length);
      }, 0);
    } else {
      setTemplate(prev => prev + tokenText);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(template);
  };

  const getSourceColor = () => {
    switch (sourceType) {
      case 'TargetedLead': return '#faad14'; // Gold
      case 'ProductReco': return '#1890ff'; // Blue
      case 'CMS': return '#8c8c8c'; // Gray
      default: return '#d9d9d9';
    }
  };

  const getSourceIcon = () => {
    switch (sourceType) {
      case 'TargetedLead': return '🏆';
      case 'ProductReco': return '📦';
      case 'CMS': return '📄';
      default: return '📝';
    }
  };

  return (
    <div className="space-y-4">
      {/* Token Palette */}
      <Card size="small" className="bg-blue-50">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <InfoCircleOutlined className="text-blue-500" />
            <Text strong className="text-sm">Available Tokens for {sourceType}</Text>
          </div>
          <div className="flex flex-wrap gap-1">
            {availableTokens.map(token => (
              <Tooltip key={token} title={`Click to insert {{${token}|fallback}}`}>
                <Tag 
                  className="cursor-pointer hover:bg-blue-100" 
                  onClick={() => insertToken(token)}
                  style={{ borderColor: getSourceColor() }}
                >
                  {token}
                </Tag>
              </Tooltip>
            ))}
          </div>
          <Text type="secondary" className="text-xs">
            Click tokens to insert them. Use format: <code>{'{{token|fallback}}'}</code>
          </Text>
        </div>
      </Card>

      {/* Template Editor */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Space direction="vertical" size={0} className="w-full">
            <div className="flex items-center justify-between">
              <Text strong>Tokenized Copy Template</Text>
              <Button 
                size="small" 
                icon={<CopyOutlined />} 
                onClick={copyToClipboard}
                type="text"
              >
                Copy
              </Button>
            </div>
            <TextArea
              value={template}
              onChange={handleTemplateChange}
              placeholder={`Enter tokenized copy for ${sourceType}...
Example: {{title|Default Title}} - {{description|Great content for you!}}`}
              rows={4}
              className="font-mono"
            />
            {!isValid && errors.length > 0 && (
              <Alert 
                message="Template Error" 
                description={errors.join(', ')} 
                type="error" 
              />
            )}
          </Space>
        </Col>

        <Col xs={24} lg={12}>
          <Space direction="vertical" size={0} className="w-full">
            <div className="flex items-center space-x-2">
              <EyeOutlined />
              <Text strong>Live Preview</Text>
              {isValid && <CheckCircleOutlined className="text-green-500" />}
            </div>
            <Card 
              size="small" 
              className={`min-h-[100px] ${
                sourceType === 'TargetedLead' ? 'bg-yellow-50 border-yellow-300' :
                sourceType === 'ProductReco' ? 'bg-blue-50 border-blue-300' :
                'bg-gray-50 border-gray-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getSourceIcon()}</span>
                  <Tag color={getSourceColor()}>{sourceType}</Tag>
                </div>
                <div className={`p-3 rounded ${
                  sourceType === 'TargetedLead' ? 'bg-yellow-100 text-yellow-800' :
                  sourceType === 'ProductReco' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {preview || 'Enter template above to see preview...'}
                </div>
                <Text type="secondary" className="text-xs">
                  Preview uses sample data. Actual content will vary.
                </Text>
              </div>
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Help Text */}
      <Alert
        message="Token Syntax Guide"
        description={
          <div className="space-y-1 text-sm">
            <div><code>{'{{token}}'}</code> - Simple token replacement</div>
            <div><code>{'{{token|fallback}}'}</code> - Token with fallback value</div>
            <div><code>{'{{lead.title|Our recommendation}}'}</code> - Nested token with fallback</div>
          </div>
        }
        type="info"
        showIcon={false}
        className="text-xs"
      />
    </div>
  );
};

export default TokenizedCopyEditorComponent;
