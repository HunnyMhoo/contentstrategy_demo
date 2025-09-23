// Types for the Visual Condition Builder (US-004)

export type ConditionOperator = 'AND' | 'OR' | 'NOT';
export type ComparisonOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
export type FieldType = 'boolean' | 'enum' | 'multi-select' | 'number' | 'string';

// Attribute definitions
export interface AttributeDefinition {
  id: string;
  label: string;
  type: FieldType;
  group: 'customer' | 'activity' | 'custom';
  options?: string[]; // For enum and multi-select types
  featured?: boolean; // For prominent display (e.g., Targeted Lead)
  description?: string;
}

// Condition node structure for the visual tree
export interface ConditionNode {
  id: string;
  type: 'group' | 'condition';
  operator?: ConditionOperator; // For group nodes
  children?: ConditionNode[]; // For group nodes
  
  // For condition leaf nodes
  attributeId?: string;
  comparison?: ComparisonOperator;
  value?: any;
  
  // UI state
  isValid?: boolean;
  errors?: string[];
  depth?: number;
}

// Root condition structure
export interface AudienceCondition {
  id: string;
  name: string;
  description?: string;
  rootNode: ConditionNode;
  lastModified: Date;
}

// Sample user data structure for testing
export interface SampleUser {
  user_id: string;
  name: string;
  customer: {
    targeted_lead: boolean;
    offering_types: string[];
    aum_band: string;
    risk_band: string;
    [key: string]: any;
  };
  activity: {
    [key: string]: any;
  };
  custom: {
    [key: string]: any;
  };
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Test result for condition evaluation
export interface ConditionTestResult {
  user: SampleUser;
  matches: boolean;
  evaluationTrace: {
    nodeId: string;
    result: boolean;
    reason: string;
  }[];
}

// Content Configuration Types (US-006)
export type ContentSourceType = 'CMS' | 'TargetedLead' | 'ProductReco';

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  sourceType: ContentSourceType;
  previewImage?: string;
  tokenFields: string[]; // Available tokens like 'title', 'description', etc.
}

export interface TokenizedCopy {
  template: string; // e.g., "{{lead.title|Our pick}} - {{lead.description|Great opportunity}}"
  preview: string; // Rendered with sample data
}

export interface CMSContentConfig {
  enabled: boolean;
  selectedTemplate?: ContentTemplate;
  tokenizedCopy?: TokenizedCopy;
  maxYield: number; // 1-5 tiles from this source
}

export interface OfferingContentConfig {
  enabled: boolean; // Manual toggle by user
  targetedLead?: {
    enabled: boolean;
    selectedTemplate?: ContentTemplate;
    tokenizedCopy?: TokenizedCopy;
    maxYield: number;
  };
  productReco?: {
    enabled: boolean;
    selectedTemplate?: ContentTemplate;
    tokenizedCopy?: TokenizedCopy;
    maxYield: number;
  };
}

export interface ContentConfiguration {
  cms: CMSContentConfig;
  offering: OfferingContentConfig;
  priority: number; // Rule priority for "Special for you" placement
  totalMaxYield: number; // Total tiles this rule can produce (1-5)
}

// Content validation result
export interface ContentValidationResult extends ValidationResult {
  hasContent: boolean;
  priorityConflicts: string[];
}
