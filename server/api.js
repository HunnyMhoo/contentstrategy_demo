// Simple Node.js API server for rules JSON file storage
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const RULES_FILE = path.join(__dirname, '../data/rules.json');

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to read rules from JSON file
async function readRulesFile() {
  try {
    const data = await fs.readFile(RULES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading rules file:', error);
    // Return default structure if file doesn't exist
    return {
      rules: [],
      meta: {
        lastId: 0,
        version: '1.0',
        updatedAt: new Date().toISOString()
      }
    };
  }
}

// Helper function to write rules to JSON file
async function writeRulesFile(data) {
  try {
    data.meta.updatedAt = new Date().toISOString();
    await fs.writeFile(RULES_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing rules file:', error);
    return false;
  }
}

// GET /api/rules - Get all rules
app.get('/api/rules', async (req, res) => {
  try {
    const data = await readRulesFile();
    res.json({
      success: true,
      rules: data.rules,
      meta: data.meta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rules'
    });
  }
});

// GET /api/rules/:id - Get a specific rule
app.get('/api/rules/:id', async (req, res) => {
  try {
    const data = await readRulesFile();
    const rule = data.rules.find(r => r.id === req.params.id);
    
    if (!rule) {
      return res.status(404).json({
        success: false,
        error: 'Rule not found'
      });
    }
    
    res.json({
      success: true,
      rule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rule'
    });
  }
});

// POST /api/rules - Create a new rule
app.post('/api/rules', async (req, res) => {
  try {
    const data = await readRulesFile();
    const now = new Date().toISOString();
    
    const newRule = {
      id: uuidv4(),
      name: req.body.name || 'Untitled Rule',
      status: req.body.status || 'Draft',
      audienceSummary: req.body.audienceSummary || '',
      contentSources: req.body.contentSources || [],
      startDate: req.body.startDate || now,
      endDate: req.body.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
      audience: req.body.audience || null,
      content: req.body.content || null,
      fallback: req.body.fallback || null,
      createdAt: now,
      updatedAt: now
    };
    
    data.rules.push(newRule);
    data.meta.lastId += 1;
    
    const success = await writeRulesFile(data);
    
    if (success) {
      res.status(201).json({
        success: true,
        rule: newRule
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to create rule'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create rule'
    });
  }
});

// PUT /api/rules/:id - Update an existing rule
app.put('/api/rules/:id', async (req, res) => {
  try {
    const data = await readRulesFile();
    const ruleIndex = data.rules.findIndex(r => r.id === req.params.id);
    
    if (ruleIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Rule not found'
      });
    }
    
    const existingRule = data.rules[ruleIndex];
    const updatedRule = {
      ...existingRule,
      ...req.body,
      id: req.params.id, // Ensure ID doesn't change
      createdAt: existingRule.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    };
    
    data.rules[ruleIndex] = updatedRule;
    
    const success = await writeRulesFile(data);
    
    if (success) {
      res.json({
        success: true,
        rule: updatedRule
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to update rule'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update rule'
    });
  }
});

// DELETE /api/rules/:id - Delete a rule
app.delete('/api/rules/:id', async (req, res) => {
  try {
    const data = await readRulesFile();
    const ruleIndex = data.rules.findIndex(r => r.id === req.params.id);
    
    if (ruleIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Rule not found'
      });
    }
    
    const deletedRule = data.rules.splice(ruleIndex, 1)[0];
    
    const success = await writeRulesFile(data);
    
    if (success) {
      res.json({
        success: true,
        rule: deletedRule
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete rule'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete rule'
    });
  }
});

// POST /api/rules/:id/duplicate - Duplicate a rule
app.post('/api/rules/:id/duplicate', async (req, res) => {
  try {
    const data = await readRulesFile();
    const originalRule = data.rules.find(r => r.id === req.params.id);
    
    if (!originalRule) {
      return res.status(404).json({
        success: false,
        error: 'Rule not found'
      });
    }
    
    const now = new Date().toISOString();
    const duplicatedRule = {
      ...originalRule,
      id: uuidv4(),
      name: `${originalRule.name} (Copy)`,
      status: 'Draft',
      createdAt: now,
      updatedAt: now
    };
    
    data.rules.push(duplicatedRule);
    data.meta.lastId += 1;
    
    const success = await writeRulesFile(data);
    
    if (success) {
      res.status(201).json({
        success: true,
        rule: duplicatedRule
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to duplicate rule'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to duplicate rule'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Rules API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Rules API server running on http://localhost:${PORT}`);
  console.log(`📁 Rules file: ${RULES_FILE}`);
});
