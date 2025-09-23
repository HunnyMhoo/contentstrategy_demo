import React, { useState } from 'react';
import { Drawer, Button, Card, Steps, Tag, Space } from 'antd';
import { QuestionCircleOutlined, PlayCircleOutlined, BookOutlined } from '@ant-design/icons';

interface ContextualHelpProps {
  currentTab: string;
}

const ContextualHelp: React.FC<ContextualHelpProps> = ({ currentTab }) => {
  const [helpVisible, setHelpVisible] = useState(false);

  const helpContent = {
    audience: {
      title: '👥 Building Your Audience',
      description: 'Learn how to define who should see your content',
      examples: [
        {
          name: 'High-Value Targeted Leads',
          description: 'Customers with targeted leads AND high AUM',
          conditions: ['Has Targeted Lead = Yes', 'AUM Band = 5M+ baht'],
          expectedReach: '~850 customers'
        },
        {
          name: 'New Conservative Investors',
          description: 'Recent customers interested in safe investments',
          conditions: ['Account Age < 90 days', 'Risk Profile = Cautious'],
          expectedReach: '~1,200 customers'
        }
      ],
      tips: [
        'Start with 1-2 conditions and test before adding more',
        'Use the Preview tab to see which customers match',
        'Targeted Lead conditions typically have higher conversion'
      ]
    },
    content: {
      title: '📱 Choosing Content',
      description: 'Configure what content to show your audience',
      examples: [
        {
          name: 'Targeted Lead Content',
          description: 'Personalized offers based on customer leads',
          setup: 'Enable Targeted Lead source + select template',
          bestFor: 'High-value customers with active leads'
        },
        {
          name: 'Product Recommendations',
          description: 'AI-powered product suggestions',
          setup: 'Enable Product Reco + set max tiles',
          bestFor: 'Broad audiences without specific leads'
        }
      ],
      tips: [
        'Targeted Lead content typically performs best',
        'Limit total tiles to 3-5 for optimal engagement',
        'Always configure fallback content'
      ]
    },
    preview: {
      title: '👁️ Testing Your Rule',
      description: 'Validate your rule works as expected',
      examples: [
        {
          name: 'Test with High-Value Customer',
          user: 'Sarah (Has Targeted Lead, 5-20M AUM)',
          expected: 'Should see targeted lead content in slot #1'
        },
        {
          name: 'Test with Standard Customer',
          user: 'Mike (No Lead, 1-5M AUM)',
          expected: 'Should see fallback or product recommendations'
        }
      ],
      tips: [
        'Test with at least 2-3 different user types',
        'Check the evaluation trace for debugging',
        'Verify content appears in the correct priority order'
      ]
    }
  };

  const currentHelp = helpContent[currentTab as keyof typeof helpContent];

  if (!currentHelp) return null;

  return (
    <>
      {/* Help Button - Always Visible */}
      <Button
        type="text"
        icon={<QuestionCircleOutlined />}
        onClick={() => setHelpVisible(true)}
        className="fixed bottom-6 right-6 bg-blue-500 text-white hover:bg-blue-600 shadow-lg z-50 w-12 h-12 rounded-full flex items-center justify-center"
      >
      </Button>

      {/* Help Drawer */}
      <Drawer
        title={
          <div className="flex items-center space-x-2">
            <BookOutlined />
            <span>{currentHelp.title}</span>
          </div>
        }
        placement="right"
        onClose={() => setHelpVisible(false)}
        open={helpVisible}
        width={480}
        className="help-drawer"
      >
        <div className="space-y-6">
          {/* Description */}
          <div>
            <p className="text-gray-600 text-base leading-relaxed">
              {currentHelp.description}
            </p>
          </div>

          {/* Examples */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-lg mr-2">💡</span>
              Examples
            </h4>
            <div className="space-y-4">
              {currentHelp.examples.map((example, index) => (
                <Card key={index} size="small" className="border-blue-100">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-900">
                        {example.name}
                      </h5>
                      {(example as any).expectedReach && (
                        <Tag color="blue" className="text-xs">
                          {(example as any).expectedReach}
                        </Tag>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {example.description}
                    </p>
                    {(example as any).conditions && (
                      <div className="space-y-1">
                        {(example as any).conditions.map((condition: string, i: number) => (
                          <div key={i} className="flex items-center space-x-2">
                            {i > 0 && <Tag size="small">AND</Tag>}
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {condition}
                            </code>
                          </div>
                        ))}
                      </div>
                    )}
                    {(example as any).setup && (
                      <div className="bg-blue-50 p-2 rounded">
                        <span className="text-xs text-blue-700 font-medium">Setup: </span>
                        <span className="text-xs text-blue-600">{(example as any).setup}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-lg mr-2">🚀</span>
              Pro Tips
            </h4>
            <div className="space-y-2">
              {currentHelp.tips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-green-500 font-bold">•</span>
                  <span className="text-sm text-gray-700">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
            <Space direction="vertical" className="w-full">
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />} 
                block
                onClick={() => setHelpVisible(false)}
              >
                Try It Now
              </Button>
              <Button type="default" block>
                View More Examples
              </Button>
            </Space>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default ContextualHelp;
