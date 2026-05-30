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

---

## 🚀 How to Run Locally

### 1. Prerequisite
Ensure **Node.js (v18+)** is installed on your computer.

### 2. Installation
Navigate to the root directory `ganga-maxx-marketplace` and run:
```bash
npm run install-all
```
This single command automatically installs all dependencies for the root, backend, and frontend directories.

### 3. API Key Configuration (Optional)
To test with real Gemini AI responses:
1. Navigate to the `server/` directory.
2. Create a file named `.env` (you can copy `.env.example`).
3. Add your Google Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=5000
   ```
*If left unconfigured, the application runs perfectly in **Simulated Offline Demo Mode**.*

### 4. Running the Development Servers
In the root directory, run:
```bash
npm run dev
```
This runs the backend Express server on `http://localhost:5000` and the React frontend client on `http://localhost:3000` concurrently with active proxying. 

Open your browser and navigate to: **`http://localhost:3000`**

---

## 🔗 How to Deploy & Submit Properly

To qualify for the internship, you must submit:
1. **GitHub Repository Link**
2. **Deployed Link (Working Live URL)**
3. **Write-up / Explanation**

### Step 1: Push to GitHub
1. Create a new repository on GitHub named `ganga-maxx-marketplace`.
2. Run these commands in the project root directory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Ganga Maxx B2B Sales Hub & AI Assistant"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ganga-maxx-marketplace.git
   git push -u origin main
   ```

### Step 2: Deploy the Application
To show a fully functional, live-working link:
- **Deploying on Render / Railway (Easiest Fullstack)**:
  1. Create a free account on [Render](https://render.com/).
  2. Select **New Web Service** and connect your GitHub repository.
  3. Set **Build Command** to: `npm install && npm run build --prefix client`
  4. Set **Start Command** to: `node server/index.js`
  5. Under **Environment Variables**, add `GEMINI_API_KEY` (if you want real AI live) and `PORT=5000`.
  6. Render will compile your frontend, bundle it into the backend static folder, and host the full-stack app on a public URL (e.g., `https://ganga-maxx-marketplace.onrender.com`).
  
- **Vercel Frontend (Serverless)**:
  If you decide to deploy the frontend separately, you can host the React build on Vercel and backend on Render, but deploying them together on Render/Railway is highly recommended.

### Step 3: Write-up for Submission
When filling out the **🔗 Submission Form**, include a compelling description. Here is a strong template you can use:

> **Project Title**: Ganga Maxx B2B Sales Hub & GenAI Assistant
> 
> **Overview**: 
> A unified facility sales dashboard for Ganga Maxx Marketplace, Puppalaguda. Instead of building a single isolated prototype, I created an integrated B2B ecosystem. It simulates a WhatsApp Sales Agent chatbot that assists commercial buyers with pricing, usage, and bulk discounts. It includes an AI Product Recommendation panel that calculates custom housekeeping kits based on building square footage and sector (Hotels, Hospitals, Schools), which directly populates an AI Quotation Generator. All interactions feed into a live CRM Lead Board to capture B2B customer leads.
> 
> **Core GenAI Innovation**:
> - Context-aware prompt engineering supplying a live JSON catalog database of Ganga Maxx inventory to Gemini 2.5 Flash.
> - High-fidelity local NLP fallback system: If the API key fails or hits rate limits, the backend catches the error and switches to local keyword parsers, keeping the application 100% stable for evaluators.
> - Lead Auto-Detection: Natural language parser that automatically extracts Name, Company, and Phone Numbers during chat and logs them into a CRM dashboard.
>
> **GitHub Link**: `[Your Github Link]`
> **Deployed Link**: `[Your Deployed Render Link]`

---

## 🧼 Inventory Database Reference
We have configured a comprehensive initial database (`catalog.json`) representing:
- **Chemical Cleaners (Swizydra)**: Premium floor cleaners, blue toilet cleaners, phenyle disinfectants, glass cleaners, kitchen degreasers, and liquid soaps in 5L volumes.
- **Housekeeping Tools**: Cotton loop-end mops, industrial wipers/squeegees, microfiber sets (400 GSM), and floor brooms.
- **Facility Supplies**: Puncture-resistant garbage bags (50-pack), C-fold paper cases, pedal dustbins, and blue nitrile gloves.
