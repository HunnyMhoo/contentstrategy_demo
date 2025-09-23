# User Stories Breakdown - Rule Configuration Demo UI

**Project:** KPlus Rule Configuration Demo  
**Created:** 2025-09-23  
**Based on:** PRD_Rule_Configuration_Demo.md v0.2  

---

## **Technical Architecture Decisions**

### **Design System Recommendation**
- **Primary:** Ant Design (antd) - Comprehensive React component library with professional look
- **Alternative:** Chakra UI - Modern, simple, and highly customizable
- **Styling:** Tailwind CSS for custom styling and spacing
- **Rationale:** Antd provides rich form components, tables, and complex UI patterns needed for rule builders

### **Tech Stack (Final)**
- **Framework:** React 18 + TypeScript
- **UI Library:** Ant Design + Tailwind CSS
- **State:** React useState/useContext (no complex state management needed)
- **Routing:** React Router v6
- **Validation:** Zod for JSON schema validation
- **Date/Time:** date-fns for UTC/local timezone handling
- **Build:** Vite for fast development

### **Audience Builder Approach**
- **Visual Tree Builder:** Interactive drag-and-drop condition builder
- **Form-based Fallback:** Simple form inputs for basic conditions
- **Target Users:** Non-technical business users (Marketing Managers)

---

## **Epic 1: Core Application Setup**

### **US-001: Project Foundation Setup**
**As a** developer  
**I want** to set up the basic React application with routing and design system  
**So that** I have a solid foundation to build features on  

**Acceptance Criteria:**
- [ ] React + TypeScript project initialized with Vite
- [ ] Ant Design and Tailwind CSS integrated
- [ ] React Router configured with `/rules`, `/rules/new`, `/rules/:id` routes
- [ ] Basic layout with navigation header
- [ ] Responsive design works on desktop and tablet

**Technical Tasks:**
- Initialize Vite React-TS project
- Install dependencies: antd, tailwindcss, react-router-dom, date-fns, zod
- Configure Tailwind with Ant Design
- Create basic layout components
- Set up routing structure

---

## **Epic 2: Rule Management**

### **US-002: Rule List Page**
**As a** Marketing Manager  
**I want** to view all existing rules in a table format  
**So that** I can quickly scan and manage my rule configurations  

**Acceptance Criteria:**
- [ ] Table displays rule name, status, audience summary, schedule, last modified
- [ ] Support for 5+ sample rules with different configurations
- [ ] Actions: Edit, Duplicate, Delete (demo placeholders)
- [ ] "Create New Rule" button navigates to rule editor
- [ ] Status badges (Draft, Active, Inactive) are visually distinct
- [ ] Responsive table with horizontal scroll on mobile

**Mock Data Requirements:**
- At least 5 diverse rule examples
- Mix of Targeted Lead and other audience conditions
- Different content sources (TargetedLead, ProductReco, CMS)
- Various schedule configurations

### **US-003: Rule Editor Navigation**
**As a** Marketing Manager  
**I want** to navigate through rule configuration sections using tabs  
**So that** I can build rules step-by-step without losing context  

**Acceptance Criteria:**
- [ ] 6 main tabs: Audience, Content, Fallback, Schedule, Preview, JSON
- [ ] Tab validation indicators (✅, ⚠️, ❌)
- [ ] Persistent actions bar: Save Draft, Duplicate, Run Simulation
- [ ] Breadcrumb navigation showing current rule
- [ ] Unsaved changes warning when navigating away

---

## **Epic 3: Audience Builder (Core Feature)**

### **US-004: Visual Condition Builder**
**As a** Marketing Manager  
**I want** to build audience conditions using a visual interface  
**So that** I can create complex targeting rules without writing code  

**Acceptance Criteria:**
- [ ] Drag-and-drop interface for AND/OR/NOT logic
- [ ] Three attribute groups: Customer Attributes, User Activity, Custom Data
- [ ] **Targeted Lead** prominently featured in Customer Attributes
- [ ] Support for boolean, enum, and numeric field types
- [ ] Visual tree representation with max depth of 5 levels
- [ ] Real-time validation with error messages
- [ ] "Test Condition" button to validate against sample users

**Customer Attributes (Focus on Targeted Lead):**
```json
{
  "targeted_lead": { "type": "boolean", "label": "Has Targeted Lead" },
  "offering_types": { "type": "multi-select", "options": ["Investment", "Loan", "Insurance", "Savings"] },
  "aum_band": { "type": "enum", "values": ["<1M","1–5M","5–20M","20M+"] },
  "risk_band": { "type": "enum", "values": ["Cautious","Balanced","Aggressive"] }
}
```

### **US-005: Condition Templates (Future Placeholder)**
**As a** Marketing Manager  
**I want** to see saved condition templates  
**So that** I can reuse common audience patterns  

**Acceptance Criteria:**
- [ ] "Coming Soon" placeholder in UI
- [ ] Visual mockup of how templates would appear
- [ ] Template categories: Risk-based, Activity-based, Offering-based

---

## **Epic 4: Content Configuration**

### **US-006: Content Source Selection**
**As a** Marketing Manager  
**I want** to configure what content to show when audience conditions match  
**So that** I can deliver relevant experiences to targeted customers  

**Acceptance Criteria:**
- [ ] Three content sources: Targeted Lead, Product Recommendations, CMS
- [ ] **Targeted Lead source** prominently featured with special styling
- [ ] Template selection with visual previews
- [ ] Max yield configuration (1-5 tiles)
- [ ] Tokenized copy editor with fallback syntax: `{{lead.title|Our pick}}`
- [ ] Live preview of tokenized copy with sample data

**Content Templates (Visually Distinct):**
- **Targeted Lead:** Gold/premium styling, lead-specific fields
- **Product Reco:** Blue/standard styling, product fields  
- **CMS:** Gray/content styling, article fields

### **US-007: Fallback Plan Configuration**
**As a** Marketing Manager  
**I want** to configure what happens when rules don't match or content is empty  
**So that** users always see relevant content  

**Acceptance Criteria:**
- [ ] Two fallback scenarios: "Ineligible Audience" and "Empty Supply"
- [ ] Three fallback options per scenario: CMS Content, Default Tile, None
- [ ] Visual preview of fallback content
- [ ] Reason-aware configuration (different content per reason)

---

## **Epic 5: Scheduling**

### **US-008: Rule Scheduling**
**As a** Marketing Manager  
**I want** to schedule when rules are active  
**So that** I can plan campaigns and content timing  

**Acceptance Criteria:**
- [ ] Start/end date picker (stored as UTC)
- [ ] Days of week selector
- [ ] Local time range (08:00-22:00) with timezone display (Asia/Bangkok)
- [ ] Visual timezone conversion indicator
- [ ] Schedule validation (start < end, valid time ranges)
- [ ] "Always Active" quick option

---

## **Epic 6: Simulation & Preview**

### **US-009: User Simulation**
**As a** Marketing Manager  
**I want** to simulate rule outcomes for specific users  
**So that** I can verify my rules work as expected  

**Acceptance Criteria:**
- [ ] User ID input field with autocomplete from fixtures
- [ ] "Run Simulation" button
- [ ] Results display: up to 5 tiles in visual layout
- [ ] Each tile shows: content, source badge, template indicator
- [ ] **Explain-Why** text (40-120 chars) for each tile
- [ ] Visual deduplication: struck-through duplicates, "backfill" labels
- [ ] Simulation works for users with/without targeted leads

**Sample Users for Demo:**
```json
[
  {
    "user_id": "user_001",
    "name": "Sarah (High-Value, Has Targeted Lead)",
    "customer": { "targeted_lead": true, "offering_types": ["Investment"], "risk_band": "Aggressive", "aum_band": "5–20M" }
  },
  {
    "user_id": "user_002", 
    "name": "Mike (Standard, No Targeted Lead)",
    "customer": { "targeted_lead": false, "offering_types": ["Savings"], "risk_band": "Cautious", "aum_band": "1–5M" }
  }
]
```

### **US-010: Evaluation Trace**
**As a** Product Manager  
**I want** to see detailed evaluation logic  
**So that** I can understand why specific content was selected  

**Acceptance Criteria:**
- [ ] Expandable "Eval Trace" section
- [ ] JSON-like structure showing: audience_pass, selected_items, deduped_items, fallback_reason
- [ ] Step-by-step logic explanation
- [ ] Copy trace to clipboard functionality

---

## **Epic 7: JSON Preview & Export**

### **US-011: JSON Configuration Preview**
**As a** Technical Product Manager  
**I want** to see the rule configuration as exportable JSON  
**So that** I can understand the data structure and copy configurations  

**Acceptance Criteria:**
- [ ] Read-only JSON editor with syntax highlighting
- [ ] Real-time updates as rule is modified
- [ ] Schema validation with ✅/❌ indicators
- [ ] Copy to clipboard functionality
- [ ] Formatted and minified view toggle
- [ ] Schema documentation link (placeholder)

---

## **Epic 8: Demo Experience**

### **US-012: Demo Mode & Scenarios**
**As a** Demo Presenter  
**I want** pre-configured demo scenarios  
**So that** I can showcase key features smoothly  

**Acceptance Criteria:**
- [ ] Demo mode toggle (always on for this version)
- [ ] Pre-loaded sample data and rules
- [ ] "Demo Scenarios" help panel with scripted flows
- [ ] Quick actions: "Load Sample Rule", "Run Standard Simulation"
- [ ] Telemetry event names logged to console

**Key Demo Scenarios:**
1. **Targeted Lead Showcase:** Create rule targeting users with leads, simulate with user_001
2. **Fallback Demo:** Show rule with impossible conditions, demonstrate fallback logic
3. **Deduplication:** Show rule that produces duplicate content, highlight visual dedup

### **US-013: Visual Polish & Accessibility**
**As a** user with accessibility needs  
**I want** the interface to be keyboard navigable and screen reader friendly  
**So that** I can use the demo regardless of my abilities  

**Acceptance Criteria:**
- [ ] Keyboard navigation for all interactive elements
- [ ] Focus indicators on all controls
- [ ] ARIA labels on complex components (condition builder)
- [ ] High contrast mode support
- [ ] Screen reader announcements for dynamic content
- [ ] Color-blind friendly status indicators

---

## **Implementation Priority**

### **Phase 1 (Core MVP):**
- US-001: Project Foundation Setup
- US-002: Rule List Page  
- US-003: Rule Editor Navigation
- US-004: Visual Condition Builder (basic)

### **Phase 2 (Content & Simulation):**
- US-006: Content Source Selection
- US-007: Fallback Plan Configuration
- US-009: User Simulation

### **Phase 3 (Polish & Demo):**
- US-008: Rule Scheduling
- US-010: Evaluation Trace
- US-011: JSON Configuration Preview
- US-012: Demo Mode & Scenarios
- US-013: Visual Polish & Accessibility

### **Future Phases:**
- US-005: Condition Templates (placeholder only)
- Advanced validation and error handling
- Performance optimizations

---

## **Definition of Done**

For each user story to be considered complete:
- [ ] Feature works as described in acceptance criteria
- [ ] Responsive design (desktop + tablet)
- [ ] Basic keyboard accessibility
- [ ] Console logging for demo telemetry
- [ ] No TypeScript errors
- [ ] Manual testing with provided scenarios
- [ ] Code review completed

---

## **Risk Mitigation**

**High Risk:**
- **Condition Builder Complexity:** Start with simple form-based approach, enhance to visual tree later
- **Mock Data Consistency:** Create comprehensive fixtures early and validate across all features

**Medium Risk:**
- **Timezone Handling:** Use date-fns consistently, test with multiple timezones
- **Performance:** Optimize re-renders in condition builder with React.memo

**Low Risk:**
- **Design Consistency:** Establish component library early, document patterns
