# Ganga Maxx B2B Sales Hub & AI Assistant

A premium B2B Sales Dashboard and GenAI Assistant prototype built for the **Ganga Maxx Marketplace** (Hyderabad, Telangana) internship opportunity.

This application showcases production-grade full-stack features by combining **all three** requested AI capabilities into a single, cohesive, high-fidelity experience:
1. **AI WhatsApp Sales Assistant** (Full Interactive Chatbot)
2. **AI Product Recommendation Assistant** (B2B Institution-specific Suggestions)
3. **AI Quotation Generator** (Instant Quotation Writer)
4. **CRM Lead Management Panel** (Live lead capture dashboard from interactions)

---

## 🟢 Special Resiliency Feature: AI Status Indicator & Offline Fallback
To ensure this prototype remains **100% stable during evaluation and review**, it features an automated **API Status Guard**:
- **Live Mode (`🟢 AI Status: Live (Gemini)`)**: If a valid Google Gemini API Key is configured in `server/.env`, the application routes prompts directly to Google's standard `gemini-2.5-flash` model.
- **Simulated Mode (`🟠 AI Status: Simulated (Demo)`)**: If the API key is missing, rate-limited, or fails (such as model activation blocks), the server intercepts the failure and engages a **local, rule-based NLP simulator** that parses user commands, matches them against `catalog.json` products, and responds. The UI never crashes.

---

## 🛠️ Technology Stack
- **Frontend**: Vite, React (18.3), Lucide-React (Icons)
- **Backend**: Node.js, Express, dotenv, cors
- **Styling**: Google Stitch-inspired Custom Vanilla CSS (with responsive grid and dark/light modes)
- **AI Models**: Google Gemini 2.5 Flash / Local NLP Fallback Engine

---

## 📁 File Structure
```
ganga-maxx-marketplace/
├── package.json                   # Root orchestrator scripts
├── README.md                      # Setup & submission guide
├── server/
│   ├── index.js                   # Express server entry point
│   ├── package.json               # Backend dependencies
│   ├── catalog.json               # Ganga Maxx B2B Cleaning catalog (prices, bulk discounts)
│   ├── leads.json                 # Captured CRM leads
│   ├── geminiService.js           # Gemini API orchestrator with simulated fallback
│   └── .env.example               # Template for environment variables
└── client/
    ├── package.json               # Frontend dependencies
    ├── index.html                 # Index file with Google Fonts (Outfit, Inter)
    ├── vite.config.js             # Vite configuration with API Proxying
    └── src/
        ├── main.jsx               # React client entry point
        ├── App.jsx                # Main workspace shell (tabs, layouts)
        ├── App.css                # Premium CSS styling system (Dark Mode, layout)
        └── components/
            ├── WhatsAppChat.jsx   # WhatsApp UI simulator chatbot
            ├── Recommender.jsx    # Cleaning plan & product recommend tool
            ├── QuoteGenerator.jsx # Quote creator with PDF export capability
            ├── LeadDashboard.jsx  # Live CRM pipeline viewer
            └── ProductGrid.jsx    # Interactive product catalog view
```
