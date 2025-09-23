// Mock Content Templates for US-006: Content Source Selection
import type { ContentTemplate } from './types';

// CMS Content Templates (Gray/content styling)
export const cmsTemplates: ContentTemplate[] = [
  {
    id: 'cms_article_card',
    name: 'Article Card',
    description: 'Standard article layout with image and summary',
    sourceType: 'CMS',
    tokenFields: ['title', 'summary', 'author', 'publishDate', 'readTime', 'category'],
  },
  {
    id: 'cms_news_brief',
    name: 'News Brief',
    description: 'Compact news format with headline and key points',
    sourceType: 'CMS',
    tokenFields: ['headline', 'keyPoints', 'source', 'timestamp'],
  },
  {
    id: 'cms_educational_tile',
    name: 'Educational Tile',
    description: 'Learning-focused content with tips and insights',
    sourceType: 'CMS',
    tokenFields: ['title', 'tip', 'insight', 'difficulty', 'duration'],
  },
];

// Targeted Lead Templates (Gold/premium styling)
export const targetedLeadTemplates: ContentTemplate[] = [
  {
    id: 'lead_premium_showcase',
    name: 'Premium Lead Showcase',
    description: 'Highlighted lead opportunity with premium styling',
    sourceType: 'TargetedLead',
    tokenFields: ['title', 'description', 'expectedReturn', 'riskLevel', 'minimumInvestment', 'deadline'],
  },
  {
    id: 'lead_exclusive_offer',
    name: 'Exclusive Opportunity',
    description: 'VIP-style lead presentation for high-value clients',
    sourceType: 'TargetedLead',
    tokenFields: ['opportunityName', 'exclusiveDetails', 'potentialGains', 'clientTier', 'contactPerson'],
  },
  {
    id: 'lead_personalized_match',
    name: 'Personalized Match',
    description: 'Tailored lead based on client profile and preferences',
    sourceType: 'TargetedLead',
    tokenFields: ['matchReason', 'leadTitle', 'personalizedMessage', 'relevanceScore', 'nextSteps'],
  },
];

// Product Recommendation Templates (Blue/standard styling)
export const productRecoTemplates: ContentTemplate[] = [
  {
    id: 'product_investment_card',
    name: 'Investment Product Card',
    description: 'Standard investment product presentation',
    sourceType: 'ProductReco',
    tokenFields: ['productName', 'productType', 'expectedReturn', 'riskRating', 'minInvestment', 'features'],
  },
  {
    id: 'product_savings_offer',
    name: 'Savings Product Offer',
    description: 'Savings account or deposit product layout',
    sourceType: 'ProductReco',
    tokenFields: ['accountType', 'interestRate', 'benefits', 'requirements', 'promotionalOffer'],
  },
  {
    id: 'product_insurance_plan',
    name: 'Insurance Plan Card',
    description: 'Insurance product with coverage details',
    sourceType: 'ProductReco',
    tokenFields: ['planName', 'coverage', 'premium', 'benefits', 'eligibility', 'claimProcess'],
  },
  {
    id: 'product_loan_option',
    name: 'Loan Product Option',
    description: 'Loan product with terms and rates',
    sourceType: 'ProductReco',
    tokenFields: ['loanType', 'loanInterestRate', 'maxAmount', 'tenure', 'eligibility', 'processingTime'],
  },
];

// All templates combined for easy access
export const allContentTemplates: ContentTemplate[] = [
  ...cmsTemplates,
  ...targetedLeadTemplates,
  ...productRecoTemplates,
];

// Sample data for token preview
export const sampleTokenData = {
  // CMS sample data
  cms: {
    title: 'Market Insights for Q4 2025',
    summary: 'Key trends and opportunities in the current market landscape',
    author: 'Financial Research Team',
    publishDate: '2025-09-23',
    readTime: '5 min',
    category: 'Market Analysis',
    headline: 'Asian Markets Show Strong Recovery',
    keyPoints: ['Tech sector up 12%', 'Banking resilience noted', 'Green bonds trending'],
    source: 'KPlus Research',
    timestamp: '2025-09-23 14:30',
    tip: 'Diversify your portfolio across multiple asset classes',
    insight: 'Historical data shows balanced portfolios outperform during volatility',
    difficulty: 'Intermediate',
    duration: '10 minutes',
  },
  
  // Targeted Lead sample data
  lead: {
    title: 'Exclusive REIT Opportunity',
    description: 'High-yield commercial real estate investment trust with 8.5% expected returns',
    expectedReturn: '8.5%',
    riskLevel: 'Moderate',
    minimumInvestment: '$50,000',
    deadline: '2025-10-15',
    opportunityName: 'Premium Bangkok Office REIT',
    exclusiveDetails: 'Limited to top-tier clients with proven investment track record',
    potentialGains: 'Projected 12-15% total returns over 3 years',
    clientTier: 'Platinum',
    contactPerson: 'Sarah Chen, Senior Investment Advisor',
    matchReason: 'Matches your preference for real estate and moderate risk tolerance',
    leadTitle: 'Tailored Investment Opportunity',
    personalizedMessage: 'Based on your portfolio, this REIT complements your current holdings',
    relevanceScore: '94%',
    nextSteps: 'Schedule consultation within 48 hours',
  },
  
  // Product Recommendation sample data
  product: {
    productName: 'KPlus Growth Fund',
    productType: 'Equity Mutual Fund',
    expectedReturn: '7-9%',
    riskRating: 'Medium',
    minInvestment: '$1,000',
    features: ['Professional management', 'Diversified portfolio', 'Monthly SIP options'],
    accountType: 'High-Yield Savings',
    interestRate: '4.25%',
    benefits: ['No minimum balance', 'Free transfers', 'Mobile banking'],
    requirements: ['Valid ID', 'Proof of income'],
    promotionalOffer: 'Bonus 0.25% for first 6 months',
    planName: 'KPlus Life Protection Plus',
    coverage: 'Up to $500,000',
    premium: 'Starting from $89/month',
    eligibility: 'Ages 21-65',
    claimProcess: '24/7 online claim submission',
    loanType: 'Personal Loan',
    loanInterestRate: '5.99%',
    maxAmount: '$100,000',
    tenure: 'Up to 7 years',
    processingTime: '24-48 hours',
  },
};

// Helper function to render tokenized copy with sample data
export const renderTokenizedCopy = (template: string, sourceType: 'CMS' | 'TargetedLead' | 'ProductReco'): string => {
  const tokenRegex = /\{\{([^}]+)\}\}/g;
  const dataSource = sourceType === 'CMS' ? sampleTokenData.cms : 
                    sourceType === 'TargetedLead' ? sampleTokenData.lead : 
                    sampleTokenData.product;
  
  return template.replace(tokenRegex, (match, tokenPath) => {
    const [path, fallback] = tokenPath.split('|').map((s: string) => s.trim());
    const tokenKey = path.split('.').pop(); // Get the last part after dot notation
    
    // @ts-ignore - Dynamic property access for demo purposes
    const value = dataSource[tokenKey];
    return value || fallback || match;
  });
};
