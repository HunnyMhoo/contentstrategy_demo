import type { AttributeDefinition } from './types';

// Customer Attributes - Focus on Targeted Lead as specified in US-004
export const CUSTOMER_ATTRIBUTES: AttributeDefinition[] = [
  {
    id: 'targeted_lead',
    label: 'Has Targeted Lead',
    type: 'boolean',
    group: 'customer',
    featured: true,
    description: 'Customer has an active targeted lead recommendation'
  },
  {
    id: 'offering_types',
    label: 'Offering Types',
    type: 'multi-select',
    group: 'customer',
    options: ['Investment', 'Loan', 'Insurance', 'Savings'],
    description: 'Types of financial products the customer is interested in'
  },
  {
    id: 'aum_band',
    label: 'Assets Under Management',
    type: 'enum',
    group: 'customer',
    options: ['<1M', '1–5M', '5–20M', '20M+'],
    description: 'Customer\'s total assets under management band'
  },
  {
    id: 'risk_band',
    label: 'Risk Profile',
    type: 'enum',
    group: 'customer',
    options: ['Cautious', 'Balanced', 'Aggressive'],
    description: 'Customer\'s investment risk tolerance'
  },
  {
    id: 'customer_tier',
    label: 'Customer Tier',
    type: 'enum',
    group: 'customer',
    options: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    description: 'Customer relationship tier based on value and engagement'
  },
  {
    id: 'account_age_months',
    label: 'Account Age (Months)',
    type: 'number',
    group: 'customer',
    description: 'Number of months since account was opened'
  },
  {
    id: 'location',
    label: 'Location',
    type: 'enum',
    group: 'customer',
    options: ['Shopping Area', 'Bangkok CBD', 'Sukhumvit', 'Silom', 'Chatuchak', 'Siam', 'Asok', 'Thonglor'],
    description: 'Customer\'s current or primary location'
  },
  {
    id: 'distance_to_mall',
    label: 'Distance to Mall (meters)',
    type: 'number',
    group: 'customer',
    description: 'Distance to nearest shopping mall in meters'
  }
];

// User Activity Attributes
export const ACTIVITY_ATTRIBUTES: AttributeDefinition[] = [
  {
    id: 'last_login_days',
    label: 'Days Since Last Login',
    type: 'number',
    group: 'activity',
    description: 'Number of days since the user last logged in'
  },
  {
    id: 'page_views_30d',
    label: 'Page Views (30 days)',
    type: 'number',
    group: 'activity',
    description: 'Total page views in the last 30 days'
  },
  {
    id: 'product_interactions',
    label: 'Product Interactions',
    type: 'multi-select',
    group: 'activity',
    options: ['Viewed Details', 'Added to Watchlist', 'Calculated Returns', 'Downloaded Brochure'],
    description: 'Types of interactions with products in the last 30 days'
  },
  {
    id: 'has_recent_transaction',
    label: 'Has Recent Transaction',
    type: 'boolean',
    group: 'activity',
    description: 'Has made a transaction in the last 30 days'
  },
  {
    id: 'session_duration_avg',
    label: 'Average Session Duration (min)',
    type: 'number',
    group: 'activity',
    description: 'Average session duration in minutes over the last 30 days'
  }
];

// Investment Behavior Attributes
export const INVESTMENT_ATTRIBUTES: AttributeDefinition[] = [
  {
    id: 'investment_experience_level',
    label: 'Investment Experience Level',
    type: 'enum',
    group: 'investment',
    options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    description: 'Customer\'s level of investment experience and knowledge'
  },
  {
    id: 'investment_portfolio_holdings',
    label: 'Investment Portfolio Holdings',
    type: 'multi-select',
    group: 'investment',
    options: ['Stocks', 'Bonds', 'Mutual Funds', 'ETFs', 'Structured Products', 'Alternative Investments'],
    description: 'Types of investment products currently held by customer'
  },
  {
    id: 'investment_frequency',
    label: 'Investment Frequency',
    type: 'enum',
    group: 'investment',
    options: ['Never', 'Rarely', 'Monthly', 'Weekly', 'Daily'],
    description: 'How frequently the customer makes investment transactions'
  },
  {
    id: 'average_investment_amount',
    label: 'Average Investment Amount',
    type: 'enum',
    group: 'investment',
    options: ['<50K', '50K-200K', '200K-1M', '1M+'],
    description: 'Typical amount invested per transaction'
  },
  {
    id: 'investment_goal',
    label: 'Investment Goal',
    type: 'enum',
    group: 'investment',
    options: ['Wealth Preservation', 'Income Generation', 'Capital Growth', 'Speculation'],
    description: 'Primary investment objective'
  },
  {
    id: 'portfolio_diversification',
    label: 'Portfolio Diversification',
    type: 'enum',
    group: 'investment',
    options: ['Single Asset', 'Low Diversity', 'Moderate Diversity', 'High Diversity'],
    description: 'Level of diversification in investment portfolio'
  },
  {
    id: 'risk_tolerance_score',
    label: 'Risk Tolerance Score',
    type: 'number',
    group: 'investment',
    description: 'Numerical risk tolerance score (0-100, higher = more risk tolerant)'
  },
  {
    id: 'market_volatility_reaction',
    label: 'Market Volatility Reaction',
    type: 'enum',
    group: 'investment',
    options: ['Panic Seller', 'Cautious', 'Neutral', 'Opportunistic'],
    description: 'How customer typically reacts to market volatility'
  },
  {
    id: 'esg_investment_interest',
    label: 'ESG Investment Interest',
    type: 'boolean',
    group: 'investment',
    description: 'Interest in Environmental, Social, and Governance (ESG) investments'
  },
  {
    id: 'cryptocurrency_interest',
    label: 'Cryptocurrency Interest',
    type: 'enum',
    group: 'investment',
    options: ['Not Interested', 'Curious', 'Active Trader'],
    description: 'Level of interest in cryptocurrency investments'
  }
];

// Digital Journey Attributes
export const DIGITAL_ATTRIBUTES: AttributeDefinition[] = [
  {
    id: 'digital_adoption_stage',
    label: 'Digital Adoption Stage',
    type: 'enum',
    group: 'digital',
    options: ['Digital Beginner', 'Growing Confidence', 'Digital Native', 'Power User'],
    description: 'Customer\'s comfort level with digital banking services'
  },
  {
    id: 'channel_preference',
    label: 'Channel Preference',
    type: 'enum',
    group: 'digital',
    options: ['Branch Only', 'Hybrid', 'Digital Preferred', 'Digital Only'],
    description: 'Preferred channel for banking interactions'
  },
  {
    id: 'mobile_app_usage_intensity',
    label: 'Mobile App Usage Intensity',
    type: 'enum',
    group: 'digital',
    options: ['Never', 'Light', 'Moderate', 'Heavy'],
    description: 'Frequency and depth of mobile app usage'
  },
  {
    id: 'feature_discovery_rate',
    label: 'Feature Discovery Rate',
    type: 'number',
    group: 'digital',
    description: 'Rate at which customer discovers and adopts new features (0-100)'
  },
  {
    id: 'digital_transaction_comfort',
    label: 'Digital Transaction Comfort',
    type: 'enum',
    group: 'digital',
    options: ['Cash Only', 'Basic Digital', 'Advanced Digital', 'All Digital'],
    description: 'Comfort level with different types of digital transactions'
  },
  {
    id: 'self_service_preference',
    label: 'Self-Service Preference',
    type: 'boolean',
    group: 'digital',
    description: 'Prefers self-service options over human assistance'
  },
  {
    id: 'educational_content_engagement',
    label: 'Educational Content Engagement',
    type: 'enum',
    group: 'digital',
    options: ['Skips All', 'Occasional', 'Regular', 'Enthusiast'],
    description: 'Level of engagement with educational content'
  },
  {
    id: 'device_usage_pattern',
    label: 'Device Usage Pattern',
    type: 'enum',
    group: 'digital',
    options: ['Mobile Only', 'Desktop Only', 'Multi-Device'],
    description: 'Primary devices used for banking'
  },
  {
    id: 'digital_onboarding_completion_rate',
    label: 'Digital Onboarding Completion Rate',
    type: 'number',
    group: 'digital',
    description: 'Percentage of digital onboarding steps completed (0-100)'
  },
  {
    id: 'notification_responsiveness',
    label: 'Notification Responsiveness',
    type: 'enum',
    group: 'digital',
    options: ['Ignores', 'Selective', 'Responsive', 'Immediate'],
    description: 'How quickly and frequently customer responds to notifications'
  },
  {
    id: 'digital_security_awareness',
    label: 'Digital Security Awareness',
    type: 'enum',
    group: 'digital',
    options: ['Basic', 'Moderate', 'Advanced'],
    description: 'Level of awareness about digital security practices'
  },
  {
    id: 'customer_lifecycle_stage',
    label: 'Customer Lifecycle Stage',
    type: 'enum',
    group: 'digital',
    options: ['Prospect', 'New Customer', 'Growing', 'Mature', 'At Risk', 'Win-back'],
    description: 'Current stage in the customer lifecycle'
  },
  {
    id: 'product_adoption_journey',
    label: 'Product Adoption Journey',
    type: 'enum',
    group: 'digital',
    options: ['Awareness', 'Consideration', 'Trial', 'Adoption', 'Advocacy'],
    description: 'Current stage in product adoption process'
  },
  {
    id: 'last_product_purchase_days',
    label: 'Days Since Last Product Purchase',
    type: 'number',
    group: 'digital',
    description: 'Number of days since customer last purchased a new product'
  },
  {
    id: 'cross_sell_readiness_score',
    label: 'Cross-sell Readiness Score',
    type: 'number',
    group: 'digital',
    description: 'Predictive score for cross-selling additional products (0-100)'
  }
];

// Custom Data Attributes
export const CUSTOM_ATTRIBUTES: AttributeDefinition[] = [
  {
    id: 'marketing_segment',
    label: 'Marketing Segment',
    type: 'enum',
    group: 'custom',
    options: ['High-Value', 'Growth', 'Retention', 'Acquisition'],
    description: 'Custom marketing segmentation'
  },
  {
    id: 'campaign_tags',
    label: 'Campaign Tags',
    type: 'multi-select',
    group: 'custom',
    options: ['Q4-Promo', 'New-Year', 'Wealth-Focus', 'Digital-First'],
    description: 'Custom campaign targeting tags'
  },
  {
    id: 'custom_score',
    label: 'Custom Score',
    type: 'number',
    group: 'custom',
    description: 'Custom scoring metric (0-100)'
  },
  {
    id: 'feature_flags',
    label: 'Feature Flags',
    type: 'multi-select',
    group: 'custom',
    options: ['beta-features', 'premium-ui', 'advanced-analytics', 'mobile-enhanced'],
    description: 'Active feature flags for the user'
  }
];

// All attributes combined
export const ALL_ATTRIBUTES: AttributeDefinition[] = [
  ...CUSTOMER_ATTRIBUTES,
  ...ACTIVITY_ATTRIBUTES,
  ...INVESTMENT_ATTRIBUTES,
  ...DIGITAL_ATTRIBUTES,
  ...CUSTOM_ATTRIBUTES
];

// Helper function to get attribute by ID
export const getAttributeById = (id: string): AttributeDefinition | undefined => {
  return ALL_ATTRIBUTES.find(attr => attr.id === id);
};

// Helper function to get attributes by group
export const getAttributesByGroup = (group: 'customer' | 'activity' | 'custom' | 'investment' | 'digital'): AttributeDefinition[] => {
  return ALL_ATTRIBUTES.filter(attr => attr.group === group);
};

// Helper function to get featured attributes (like Targeted Lead)
export const getFeaturedAttributes = (): AttributeDefinition[] => {
  return ALL_ATTRIBUTES.filter(attr => attr.featured);
};
