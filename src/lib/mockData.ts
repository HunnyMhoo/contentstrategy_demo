export interface Rule {
  id: string;
  name: string;
  status: 'Draft' | 'Active' | 'Inactive';
  audienceSummary: string;
  contentSources: ('TargetedLead' | 'ProductReco' | 'CMS')[];
  contentFiles?: string[]; // CMS content file names
  priority: number; // Rule priority for "Special for you" placement (1-100)
  startDate: string;
  endDate: string;
  audience: any;
  content: any;
  fallback: any;
  createdAt: string;
  updatedAt: string;
}

export const mockRules: Rule[] = [
  {
    id: 'rule_001',
    name: 'Targeted Lead Priority',
    status: 'Active',
    audienceSummary: 'Targeted Lead = true AND Risk Band in [Balanced, Aggressive]',
    contentSources: ['TargetedLead', 'ProductReco'],
    contentFiles: ['premium-leads-q4.cms', 'investment-products.cms'],
    priority: 95,
    startDate: '2025-09-23T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    audience: null,
    content: null,
    fallback: null,
    createdAt: '2025-09-23T08:30:00Z',
    updatedAt: '2025-09-23T14:30:00Z',
  },
  {
    id: 'rule_002',
    name: 'High-Value Investment Focus',
    status: 'Active',
    audienceSummary: 'AUM Band = "5–20M" AND Offering Types includes "Investment"',
    contentSources: ['ProductReco', 'CMS'],
    contentFiles: ['wealth-management-content.cms', 'high-value-offers.cms'],
    priority: 85,
    startDate: '2025-09-22T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    audience: null,
    content: null,
    fallback: null,
    createdAt: '2025-09-22T09:00:00Z',
    updatedAt: '2025-09-22T16:45:00Z',
  },
  {
    id: 'rule_003',
    name: 'Targeted Lead + HNWI Combo',
    status: 'Draft',
    audienceSummary: 'Targeted Lead = true AND AUM Band = "20M+"',
    contentSources: ['TargetedLead'],
    contentFiles: ['hnwi-exclusive-content.cms'],
    priority: 90,
    startDate: '2025-09-21T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    audience: null,
    content: null,
    fallback: null,
    createdAt: '2025-09-21T10:00:00Z',
    updatedAt: '2025-09-21T11:20:00Z',
  },
  {
    id: 'rule_004',
    name: 'Cautious Savings Campaign',
    status: 'Inactive',
    audienceSummary: 'Risk Band = "Cautious" AND Offering Types includes "Savings"',
    contentSources: ['CMS', 'ProductReco'],
    contentFiles: ['savings-campaign-winter.cms', 'conservative-products.cms'],
    priority: 60,
    startDate: '2025-09-20T00:00:00Z',
    endDate: '2025-12-15T23:59:59Z',
    audience: null,
    content: null,
    fallback: null,
    createdAt: '2025-09-20T08:00:00Z',
    updatedAt: '2025-09-20T09:15:00Z',
  },
  {
    id: 'rule_005',
    name: 'New Customer Onboarding',
    status: 'Active',
    audienceSummary: 'Customer Age < 90 days AND Targeted Lead = false',
    contentSources: ['CMS'],
    contentFiles: ['onboarding-welcome.cms', 'getting-started-guide.cms'],
    priority: 75,
    startDate: '2025-09-19T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    audience: null,
    content: null,
    fallback: null,
    createdAt: '2025-09-19T12:00:00Z',
    updatedAt: '2025-09-19T13:10:00Z',
  },
  {
    id: 'rule_006',
    name: 'Premium Lead Showcase',
    status: 'Draft',
    audienceSummary: 'Targeted Lead = true AND AUM Band in ["5–20M", "20M+"]',
    contentSources: ['TargetedLead', 'ProductReco', 'CMS'],
    contentFiles: ['premium-showcase.cms', 'exclusive-opportunities.cms'],
    priority: 88,
    startDate: '2025-09-18T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    audience: null,
    content: null,
    fallback: null,
    createdAt: '2025-09-18T15:00:00Z',
    updatedAt: '2025-09-18T16:22:00Z',
  },
  {
    id: 'rule_007',
    name: 'Insurance Focus Campaign',
    status: 'Active',
    audienceSummary: 'Offering Types includes "Insurance" AND Risk Band != "Aggressive"',
    contentSources: ['ProductReco'],
    contentFiles: ['insurance-products-fall.cms'],
    priority: 70,
    startDate: '2025-09-17T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    audience: null,
    content: null,
    fallback: null,
    createdAt: '2025-09-17T09:30:00Z',
    updatedAt: '2025-09-17T10:45:00Z',
  },
];

export const mockUsers = [
  {
    user_id: 'user_001',
    name: 'Sarah (High-Value, Has Targeted Lead)',
    customer: { 
      targeted_lead: true, 
      offering_types: ['Investment'], 
      risk_band: 'Aggressive', 
      aum_band: '5–20M' 
    }
  },
  {
    user_id: 'user_002', 
    name: 'Mike (Standard, No Targeted Lead)',
    customer: { 
      targeted_lead: false, 
      offering_types: ['Savings'], 
      risk_band: 'Cautious', 
      aum_band: '1–5M' 
    }
  },
  {
    user_id: 'user_003',
    name: 'Lisa (HNWI, Has Targeted Lead)',
    customer: {
      targeted_lead: true,
      offering_types: ['Investment', 'Insurance'],
      risk_band: 'Balanced',
      aum_band: '20M+'
    }
  },
  {
    user_id: 'user_004',
    name: 'David (New Customer)',
    customer: {
      targeted_lead: false,
      offering_types: ['Savings', 'Loan'],
      risk_band: 'Cautious',
      aum_band: '<1M'
    }
  }
];
