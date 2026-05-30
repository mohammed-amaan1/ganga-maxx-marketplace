import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  checkAIStatus, 
  chatWithAI, 
  recommendProducts, 
  generateQuotation, 
  extractLeadDetails 
} from './geminiService.js';

// Setup environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database paths
const catalogPath = path.join(__dirname, 'catalog.json');
const leadsPath = path.join(__dirname, 'leads.json');

// Read JSON files helper
const readJsonFile = (filePath, fallback = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
      return fallback;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return fallback;
  }
};

// Write JSON files helper
const writeJsonFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    return false;
  }
};

/* ==========================================
   API ENDPOINTS
   ========================================== */

// 1. Check AI Connection Status
app.get('/api/status', async (req, res) => {
  const status = await checkAIStatus();
  res.json(status);
});

// 2. Fetch B2B Catalog
app.get('/api/catalog', (req, res) => {
  const catalog = readJsonFile(catalogPath);
  res.json(catalog);
});

// 3. Fetch CRM Leads
app.get('/api/leads', (req, res) => {
  const leads = readJsonFile(leadsPath);
  // Sort leads newest first
  const sortedLeads = [...leads].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(sortedLeads);
});

// 4. Manually Log a Lead
app.post('/api/leads', (req, res) => {
  const leadData = req.body;
  if (!leadData.name || !leadData.phone) {
    return res.status(400).json({ error: "Name and Phone Number are required to log a lead." });
  }

  const leads = readJsonFile(leadsPath);
  
  // Prevent duplicate logs of the same phone number within a brief timeframe
  const exists = leads.some(l => l.phone === leadData.phone && l.company === leadData.company);
  if (exists) {
    return res.json({ success: true, message: "Lead already exists in database.", lead: leadData });
  }

  const newLead = {
    id: `LEAD-${Date.now()}`,
    name: leadData.name,
    phone: leadData.phone,
    email: leadData.email || "Not Provided",
    company: leadData.company || "Direct Buyer",
    institution: leadData.institution || "Office",
    requirements: leadData.requirements || "Manual Enquiry",
    status: leadData.status || "Captured",
    timestamp: new Date().toISOString()
  };

  leads.push(newLead);
  writeJsonFile(leadsPath, leads);
  res.json({ success: true, lead: newLead });
});

// 5. Chat Endpoint with Lead Auto-Detection
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Conversation history list is required." });
  }

  const lastMessage = messages[messages.length - 1];
  const historyBeforeLast = messages.slice(0, -1);

  // Parse for lead details
  const leadCheck = extractLeadDetails(lastMessage.text, historyBeforeLast);
  let newLeadCaptured = null;

  if (leadCheck.isLead) {
    const leads = readJsonFile(leadsPath);
    // Double check duplicate phone
    const exists = leads.some(l => l.phone === leadCheck.lead.phone);
    if (!exists) {
      const newLead = {
        id: `LEAD-${Date.now()}`,
        ...leadCheck.lead
      };
      leads.push(newLead);
      writeJsonFile(leadsPath, leads);
      newLeadCaptured = newLead;
    }
  }

  // Get response from AI assistant
  try {
    const response = await chatWithAI(messages);
    res.json({
      text: response.text,
      mode: response.mode,
      newLeadCaptured
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate chat response: " + error.message });
  }
});

// 6. Recommendation Endpoint
app.post('/api/recommend', async (req, res) => {
  const { institutionType, requirements } = req.body;
  if (!institutionType) {
    return res.status(400).json({ error: "Institution type is required." });
  }

  try {
    const recommendation = await recommendProducts(institutionType, requirements || "");
    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate product recommendations: " + error.message });
  }
});

// 7. Quotation Endpoint
app.post('/api/quote', async (req, res) => {
  const { products, institutionType, clientName } = req.body;
  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ error: "Products array is required to generate quotation." });
  }

  try {
    const quotation = await generateQuotation(products, institutionType || "Commercial Space", clientName || "Valued Customer");
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate quotation: " + error.message });
  }
});

// Serve frontend in production (optional fallback)
const clientBuildPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Ganga Maxx B2B Server running at http://localhost:${PORT}`);
});
