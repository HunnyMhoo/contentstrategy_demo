import React, { useState } from 'react';
import { Card, Select, Button, Divider, Tag, Typography, Space, Alert, Spin } from 'antd';
import { PlayCircleOutlined, UserOutlined, TrophyOutlined, FileTextOutlined } from '@ant-design/icons';
import type { Rule } from '../../../lib/mockData';
import type { SampleUser } from '../types';
import { SAMPLE_USERS } from '../sampleUsers';

const { Title, Text } = Typography;
const { Option } = Select;

interface PreviewSectionProps {
  rules: Rule[];
}

interface RuleMatch {
  rule: Rule;
  matches: boolean;
  reason: string;
}

interface PreviewResult {
  user: SampleUser;
  matchedRules: RuleMatch[];
  finalContent: {
    source: string;
    template: string;
    renderedContent: string;
  } | null;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({ rules }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Demo rule evaluation logic for Kasikornbank scenarios
  const evaluateRulesForUser = async (userId: string): Promise<PreviewResult> => {
    const user = SAMPLE_USERS.find(u => u.user_id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    const ruleMatches: RuleMatch[] = [];
    
    // Only evaluate Active rules
    const activeRules = rules.filter(rule => rule.status === 'Active');
    
    for (const rule of activeRules) {
      let matches = false;
      let reason = '';

      // Demo scenario evaluation logic
      if (rule.name === 'Location-Based Credit Card Promotion') {
        if (user.customer.location === 'Shopping Area' && user.customer.distance_to_mall && user.customer.distance_to_mall < 500) {
          matches = true;
          reason = `User is ${user.customer.distance_to_mall}m from shopping area`;
        } else {
          reason = 'User is not near shopping area or distance > 500m';
        }
      } else if (rule.name === 'Express Loan for Targeted Leads') {
        if (user.customer.targeted_lead && user.customer.targeted_lead_type === 'Express Loan') {
          matches = true;
          reason = 'User has Express Loan targeted lead';
        } else {
          reason = 'User does not have Express Loan targeted lead';
        }
      } else if (rule.name === 'Mutual Fund Recommendation') {
        if (user.customer.product_recommendation === 'Mutual Fund') {
          matches = true;
          reason = 'User has Mutual Fund recommendation';
        } else {
          reason = 'User does not have Mutual Fund recommendation';
        }
      } else if (rule.name === 'Bancassurance Recommendation') {
        if (user.customer.product_recommendation === 'Bancassurance') {
          matches = true;
          reason = 'User has Bancassurance recommendation';
        } else {
          reason = 'User does not have Bancassurance recommendation';
        }
      } else if (rule.name === 'LINE BC Register - Broadcast Campaign') {
        matches = true; // Always matches as it's broadcast content
        reason = 'Broadcast content - matches all users';
      } else {
        reason = 'Rule does not match current demo scenarios';
      }

      ruleMatches.push({ rule, matches, reason });
    }

    // Sort by priority (highest first) and get the first matching rule
    const matchedRules = ruleMatches.filter(rm => rm.matches).sort((a, b) => b.rule.priority - a.rule.priority);
    
    let finalContent = null;
    if (matchedRules.length > 0) {
      const topRule = matchedRules[0].rule;
      const primarySource = topRule.contentSources[0];
      
      // Generate Kasikornbank content based on rule type
      let template = '';
      let renderedContent = '';
      
      if (topRule.name === 'Location-Based Credit Card Promotion') {
        template = 'K-Credit Card Special Offer\nGet 5% cashback at shopping malls\nApply now with instant approval';
        renderedContent = 'K-Credit Card Special Offer\nGet 5% cashback at shopping malls\nApply now with instant approval';
      } else if (topRule.name === 'Express Loan for Targeted Leads') {
        template = 'K-Express Loan\nGet loan approval in 15 minutes\nUp to 5 million baht, competitive rates';
        renderedContent = 'K-Express Loan\nGet loan approval in 15 minutes\nUp to 5 million baht, competitive rates';
      } else if (topRule.name === 'Mutual Fund Recommendation') {
        template = 'K-Fund Plus\nDiversified mutual fund portfolio\n8-12% expected annual return';
        renderedContent = 'K-Fund Plus\nDiversified mutual fund portfolio\n8-12% expected annual return';
      } else if (topRule.name === 'Bancassurance Recommendation') {
        template = 'K-Protect Life Insurance\nComprehensive coverage with investment\nStarting from 2,500 baht/month';
        renderedContent = 'K-Protect Life Insurance\nComprehensive coverage with investment\nStarting from 2,500 baht/month';
      } else if (topRule.name === 'LINE BC Register - Broadcast Campaign') {
        template = 'LINE BK Register\nSign up for LINE BK and get 500 K-Points\nEasy banking on LINE app';
        renderedContent = 'LINE BK Register\nSign up for LINE BK and get 500 K-Points\nEasy banking on LINE app';
      }
      
      finalContent = {
        source: primarySource,
        template,
        renderedContent
      };
    }

    return {
      user,
      matchedRules: ruleMatches,
      finalContent
    };
  };

  const handlePreview = async () => {
    if (!selectedUserId) return;
    
    setLoading(true);
    try {
      const result = await evaluateRulesForUser(selectedUserId);
      setPreviewResult(result);
    } catch (error) {
      console.error('Preview error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'LocationBased': return 'purple';
      case 'TargetedLead': return 'gold';
      case 'ProductReco': return 'blue';
      case 'Broadcast': return 'green';
      case 'CMS': return 'default';
      default: return 'default';
    }
  };

  return (
    <Card className="mt-6 shadow-lg border-0 rounded-lg">
      <div className="mb-4">
        <Title level={3} className="!mb-2 text-gray-800 flex items-center gap-2">
          <PlayCircleOutlined className="text-blue-600" />
          Content Preview
        </Title>
        <Text className="text-gray-600">
          Test how rules will display content for different users in the "Special for you" placement
        </Text>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end mb-6">
        <div className="flex-1 min-w-0">
          <Text strong className="block mb-2">Select Mock User:</Text>
          <Select
            placeholder="Choose a user to preview content"
            value={selectedUserId}
            onChange={setSelectedUserId}
            className="w-full"
            size="large"
          >
            {SAMPLE_USERS.map(user => (
              <Option key={user.user_id} value={user.user_id}>
                <div className="flex items-center gap-2">
                  <UserOutlined />
                  <span className="font-medium">{user.name}</span>
                  <Tag color={user.customer.targeted_lead ? 'gold' : 'default'}>
                    {user.customer.targeted_lead ? 'Has Lead' : 'No Lead'}
                  </Tag>
                  <Tag color="blue">
                    {user.customer.customer_tier}
                  </Tag>
                </div>
              </Option>
            ))}
          </Select>
        </div>
        
        <Button
          type="primary"
          size="large"
          icon={<PlayCircleOutlined />}
          onClick={handlePreview}
          disabled={!selectedUserId}
          loading={loading}
          className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
        >
          Preview Content
        </Button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <Spin size="large" />
          <div className="mt-2 text-gray-600">Evaluating rules...</div>
        </div>
      )}

      {previewResult && !loading && (
        <div className="space-y-6">
          <Divider />
          
          {/* User Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <Title level={4} className="!mb-3 flex items-center gap-2">
              <UserOutlined />
              User Profile: {previewResult.user.name}
            </Title>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Text strong>Customer Details:</Text>
                <div className="mt-1 space-y-1">
                  <div>Targeted Lead: <Tag color={previewResult.user.customer.targeted_lead ? 'success' : 'default'}>
                    {previewResult.user.customer.targeted_lead ? 'Yes' : 'No'}
                  </Tag></div>
                  {previewResult.user.customer.targeted_lead_type && (
                    <div>Lead Type: <Tag color="gold">{previewResult.user.customer.targeted_lead_type}</Tag></div>
                  )}
                  <div>Tier: <Tag color="blue">{previewResult.user.customer.customer_tier}</Tag></div>
                  <div>Risk Band: <Tag>{previewResult.user.customer.risk_band}</Tag></div>
                </div>
              </div>
              <div>
                <Text strong>Location & Context:</Text>
                <div className="mt-1 space-y-1">
                  <div>Location: <Tag color="purple">{previewResult.user.customer.location}</Tag></div>
                  {previewResult.user.customer.distance_to_mall && (
                    <div>Distance to Mall: <Tag color="orange">{previewResult.user.customer.distance_to_mall}m</Tag></div>
                  )}
                  {previewResult.user.customer.product_recommendation && (
                    <div>Product Reco: <Tag color="cyan">{previewResult.user.customer.product_recommendation}</Tag></div>
                  )}
                </div>
              </div>
              <div>
                <Text strong>Offering Types:</Text>
                <div className="mt-1">
                  <Space wrap>
                    {previewResult.user.customer.offering_types.map(type => (
                      <Tag key={type} color="geekblue">{type}</Tag>
                    ))}
                  </Space>
                </div>
              </div>
              <div>
                <Text strong>Activity:</Text>
                <div className="mt-1 space-y-1">
                  <div>Last Login: {previewResult.user.activity.last_login_days} days ago</div>
                  <div>Page Views (30d): {previewResult.user.activity.page_views_30d}</div>
                  <div>Recent Transaction: <Tag color={previewResult.user.activity.has_recent_transaction ? 'success' : 'default'}>
                    {previewResult.user.activity.has_recent_transaction ? 'Yes' : 'No'}
                  </Tag></div>
                </div>
              </div>
            </div>
          </div>

          {/* Content to Display - Moved here */}
          <div>
            <Title level={4} className="!mb-3">
              Content to Display in "Special for you" Placement
            </Title>
            
            {previewResult.finalContent ? (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                {/* Content Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                    <Tag color={getSourceColor(previewResult.finalContent.source)} className="font-medium">
                      {previewResult.finalContent.source} Content
                    </Tag>
                      <Text className="text-sm text-gray-600">
                        From highest priority matching rule
                      </Text>
                    </div>
                    <Text className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      Preview Mode
                    </Text>
                  </div>
                </div>
                
                {/* "Special for you" Placement - 5 Tiles */}
                <div className="p-6">
                  <div className="mb-4 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Special for you</h2>
                    <p className="text-gray-600">Personalized content based on your profile</p>
                  </div>
                  
                  {/* 5-Tile Mobile-Style Carousel */}
                  <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollSnapType: 'x mandatory' }}>
                    {/* Tile 1 - Primary Content from Matching Rule */}
                    <div className={`flex-shrink-0 w-48 relative overflow-hidden rounded-lg border-2 bg-white shadow-sm ${
                      previewResult.finalContent.source === 'LocationBased' ? 'border-purple-300' :
                      previewResult.finalContent.source === 'TargetedLead' ? 'border-amber-300' :
                      previewResult.finalContent.source === 'ProductReco' ? 'border-blue-300' :
                      previewResult.finalContent.source === 'Broadcast' ? 'border-green-300' :
                      'border-gray-300'
                    }`} style={{ scrollSnapAlign: 'start' }}>
                      <div className="absolute top-2 right-2 z-10">
                        <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          #1
                        </div>
                      </div>
                      {/* Kasikornbank Logo Area */}
                      <div className="bg-green-600 text-white text-center py-1 text-xs font-bold">
                        KASIKORNBANK
                      </div>
                      {/* Hero Banner Image */}
                      <div className="h-20 relative overflow-hidden">
                        {previewResult.finalContent.source === 'LocationBased' && (
                          <img 
                            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&crop=center" 
                            alt="Credit Card Payment" 
                            className="w-full h-full object-cover"
                          />
                        )}
                        {previewResult.finalContent.source === 'TargetedLead' && (
                          <img 
                            src="https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=400&h=200&fit=crop&crop=center" 
                            alt="Personal Loan" 
                            className="w-full h-full object-cover"
                          />
                        )}
                        {previewResult.finalContent.source === 'ProductReco' && previewResult.user.customer.product_recommendation === 'Mutual Fund' && (
                          <img 
                            src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=200&fit=crop&crop=center" 
                            alt="Investment Growth" 
                            className="w-full h-full object-cover"
                          />
                        )}
                        {previewResult.finalContent.source === 'ProductReco' && previewResult.user.customer.product_recommendation === 'Bancassurance' && (
                          <img 
                            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=200&fit=crop&crop=center" 
                            alt="Insurance Protection" 
                            className="w-full h-full object-cover"
                          />
                        )}
                        {previewResult.finalContent.source === 'Broadcast' && (
                          <img 
                            src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=200&fit=crop&crop=center" 
                            alt="Digital Banking" 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-2">
                        <div className="space-y-1">
                          <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${
                            previewResult.finalContent.source === 'LocationBased' ? 'bg-purple-200 text-purple-800' :
                            previewResult.finalContent.source === 'TargetedLead' ? 'bg-amber-200 text-amber-800' :
                            previewResult.finalContent.source === 'ProductReco' ? 'bg-blue-200 text-blue-800' :
                            previewResult.finalContent.source === 'Broadcast' ? 'bg-green-200 text-green-800' :
                            'bg-gray-200 text-gray-800'
                          }`}>
                            {previewResult.finalContent.source === 'LocationBased' ? 'LOCATION OFFER' :
                             previewResult.finalContent.source === 'TargetedLead' ? 'PERSONAL LOAN' :
                             previewResult.finalContent.source === 'ProductReco' ? 'INVESTMENT' :
                             previewResult.finalContent.source === 'Broadcast' ? 'NEW FEATURE' : 'GENERAL'}
                          </span>
                          <h3 className="font-bold text-xs text-gray-900 leading-tight">
                            {previewResult.finalContent.source === 'LocationBased' ? 'K-Credit Card 5% Cashback' :
                             previewResult.finalContent.source === 'TargetedLead' ? 'K-Express Loan 15 Min' :
                             previewResult.finalContent.source === 'ProductReco' && previewResult.user.customer.product_recommendation === 'Mutual Fund' ? 'K-Fund Plus Portfolio' :
                             previewResult.finalContent.source === 'ProductReco' && previewResult.user.customer.product_recommendation === 'Bancassurance' ? 'K-Protect Insurance' :
                             previewResult.finalContent.source === 'Broadcast' ? 'LINE BK Register' :
                             'K-Plus Banking'}
                          </h3>
                          <p className="text-xs text-gray-500 leading-tight mb-2">
                            {previewResult.finalContent.source === 'LocationBased' ? 'Special offer at shopping malls' :
                             previewResult.finalContent.source === 'TargetedLead' ? 'Up to 5M baht, fast approval' :
                             previewResult.finalContent.source === 'ProductReco' && previewResult.user.customer.product_recommendation === 'Mutual Fund' ? '8-12% expected annual return' :
                             previewResult.finalContent.source === 'ProductReco' && previewResult.user.customer.product_recommendation === 'Bancassurance' ? 'From 2,500 baht/month' :
                             previewResult.finalContent.source === 'Broadcast' ? 'Get 500 K-Points bonus' :
                             'Digital banking solutions'}
                          </p>
                          <button className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 px-2 rounded font-medium transition-colors">
                            {previewResult.finalContent.source === 'LocationBased' ? 'Apply Now' :
                             previewResult.finalContent.source === 'TargetedLead' ? 'Get Loan' :
                             previewResult.finalContent.source === 'ProductReco' ? 'Learn More' :
                             previewResult.finalContent.source === 'Broadcast' ? 'Register' : 'Explore'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Tile 2 - K-Savings Plus */}
                    <div className="flex-shrink-0 w-48 relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm" style={{ scrollSnapAlign: 'start' }}>
                      <div className="absolute top-2 right-2 z-10">
                        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          #2
                        </div>
                      </div>
                      <div className="bg-green-600 text-white text-center py-1 text-xs font-bold">
                        KASIKORNBANK
                      </div>
                      {/* Hero Banner Image */}
                      <div className="h-16 relative overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=200&fit=crop&crop=center" 
                          alt="High Yield Savings" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <div className="space-y-1">
                          <span className="inline-block text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded font-medium">
                            HIGH YIELD
                          </span>
                          <h3 className="font-bold text-xs text-gray-900 leading-tight">
                            K-Savings Plus
                          </h3>
                          <p className="text-xs text-gray-500 leading-tight mb-2">
                            Earn up to 2.5% p.a. with flexible terms
                          </p>
                          <button className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 px-2 rounded font-medium transition-colors">
                            Open Account
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Tile 3 - K-Auto Loan */}
                    <div className="flex-shrink-0 w-48 relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm" style={{ scrollSnapAlign: 'start' }}>
                      <div className="absolute top-2 right-2 z-10">
                        <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          #3
                        </div>
                      </div>
                      <div className="bg-green-600 text-white text-center py-1 text-xs font-bold">
                        KASIKORNBANK
                      </div>
                      {/* Hero Banner Image */}
                      <div className="h-16 relative overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=200&fit=crop&crop=center" 
                          alt="Auto Loan Financing" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <div className="space-y-1">
                          <span className="inline-block text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded font-medium">
                            AUTO LOAN
                          </span>
                          <h3 className="font-bold text-xs text-gray-900 leading-tight">
                            K-Auto Loan
                          </h3>
                          <p className="text-xs text-gray-500 leading-tight mb-2">
                            Special rate 4.99% for new cars
                          </p>
                          <button className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 px-2 rounded font-medium transition-colors">
                            Apply Now
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Tile 4 - K-Mobile Banking */}
                    <div className="flex-shrink-0 w-48 relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm" style={{ scrollSnapAlign: 'start' }}>
                      <div className="absolute top-2 right-2 z-10">
                        <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          #4
                        </div>
                      </div>
                      <div className="bg-green-600 text-white text-center py-1 text-xs font-bold">
                        KASIKORNBANK
                      </div>
                      {/* Hero Banner Image */}
                      <div className="h-16 relative overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop&crop=center" 
                          alt="Mobile Banking" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <div className="space-y-1">
                          <span className="inline-block text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded font-medium">
                            DIGITAL
                          </span>
                          <h3 className="font-bold text-xs text-gray-900 leading-tight">
                            K PLUS Mobile
                          </h3>
                          <p className="text-xs text-gray-500 leading-tight mb-2">
                            Complete banking on your phone
                          </p>
                          <button className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 px-2 rounded font-medium transition-colors">
                            Download App
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Tile 5 - K-Cyber Security */}
                    <div className="flex-shrink-0 w-48 relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm" style={{ scrollSnapAlign: 'start' }}>
                      <div className="absolute top-2 right-2 z-10">
                        <div className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          #5
                        </div>
                      </div>
                      <div className="bg-green-600 text-white text-center py-1 text-xs font-bold">
                        KASIKORNBANK
                      </div>
                      {/* Hero Banner Image */}
                      <div className="h-16 relative overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop&crop=center" 
                          alt="Digital Security" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <div className="space-y-1">
                          <span className="inline-block text-xs bg-teal-200 text-teal-800 px-2 py-0.5 rounded font-medium">
                            SECURITY
                          </span>
                          <h3 className="font-bold text-xs text-gray-900 leading-tight">
                            K-Cyber Protection
                          </h3>
                          <p className="text-xs text-gray-500 leading-tight mb-2">
                            Advanced fraud protection tips
                          </p>
                          <button className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 px-2 rounded font-medium transition-colors">
                            Learn More
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Placement Footer */}
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                      Content personalized based on your preferences and activity • 
                      <span className="text-blue-600 cursor-pointer hover:underline ml-1">Manage preferences</span>
                    </p>
                  </div>
                </div>
                
                {/* Technical Details */}
                <details className="border-t border-gray-200">
                  <summary className="cursor-pointer px-6 py-3 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors">
                    View Technical Details
                  </summary>
                  <div className="px-6 pb-4 bg-gray-50">
                    <div className="space-y-3">
                      <div>
                        <Text strong className="text-sm">Template Used:</Text>
                        <div className="mt-1 p-3 bg-white rounded border text-sm font-mono text-gray-700">
                          {previewResult.finalContent.template}
                        </div>
                      </div>
                      <div>
                        <Text strong className="text-sm">Raw Content Output:</Text>
                        <div className="mt-1 p-3 bg-white rounded border text-sm text-gray-700 whitespace-pre-line">
                          {previewResult.finalContent.renderedContent}
                        </div>
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            ) : (
              <Alert
                message="No Content to Display"
                description="This user does not match any active rules. In a real scenario, fallback content would be shown."
                type="warning"
                showIcon
                className="border border-orange-200"
              />
            )}
          </div>

          {/* Rule Evaluation Results */}
          <div>
            <Title level={4} className="!mb-3 flex items-center gap-2">
              <TrophyOutlined />
              Rule Evaluation Results
            </Title>
            
            <div className="space-y-3">
              {previewResult.matchedRules
                .sort((a, b) => b.rule.priority - a.rule.priority)
                .map(({ rule, matches, reason }) => (
                <div
                  key={rule.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    matches 
                      ? 'bg-green-50 border-l-green-500' 
                      : 'bg-gray-50 border-l-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Text strong className={matches ? 'text-green-700' : 'text-gray-600'}>
                          {rule.name}
                        </Text>
                        <Tag color={matches ? 'success' : 'default'}>
                          {matches ? 'MATCH' : 'NO MATCH'}
                        </Tag>
                        <Tag color="orange">Priority: {rule.priority}</Tag>
                      </div>
                      <Text className="text-sm text-gray-600 block mb-2">
                        Audience: {rule.audienceSummary}
                      </Text>
                      <Text className={`text-sm ${matches ? 'text-green-600' : 'text-gray-500'}`}>
                        {reason}
                      </Text>
                    </div>
                    <div className="ml-4">
                      <Space wrap>
                        {rule.contentSources.map(source => (
                          <Tag key={source} color={getSourceColor(source)} icon={<FileTextOutlined />}>
                            {source}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </Card>
  );
};

export default PreviewSection;
