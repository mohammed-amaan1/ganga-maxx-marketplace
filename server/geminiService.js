import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read catalog file
const catalogPath = path.join(__dirname, 'catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Helper to get API key
const getApiKey = () => process.env.GEMINI_API_KEY || null;

/**
 * Checks if the Gemini API Key is present and valid
 */
export async function checkAIStatus() {
  const apiKey = getApiKey();
  if (!apiKey) return { live: false, message: "No API Key provided in environment." };
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "ping" }] }]
      })
    });
    
    if (response.ok) {
      return { live: true, message: "Gemini 2.5 Flash Connected" };
    } else {
      const errorData = await response.json();
      return { live: false, message: errorData.error?.message || "Invalid API key or model restriction." };
    }
  } catch (error) {
    return { live: false, message: `Connection error: ${error.message}` };
  }
}

/**
 * Main Chat function with Gemini API and local fallback
 */
export async function chatWithAI(messages) {
  const apiKey = getApiKey();
  const apiStatus = await checkAIStatus();
  
  // Format history for prompt context
  const historyText = messages.map(m => `${m.sender === 'user' ? 'Customer' : 'Assistant'}: ${m.text}`).join('\n');
  const lastMessageText = messages[messages.length - 1]?.text || "";

  if (apiStatus.live) {
    try {
      const systemInstruction = `
You are the official AI B2B Sales Assistant for Ganga Maxx Marketplace, located in Puppalaguda/Manikonda, Hyderabad.
We supply premium cleaning chemicals (branded as Swizydra) and commercial housekeeping tools (Ganga Maxx brand) to hotels, hospitals, schools, apartments, and offices.

Here is our live B2B product catalog in JSON format:
${JSON.stringify(catalog, null, 2)}

Our Business Policies:
- Delivery: Across Hyderabad and Telangana region. Free delivery for orders above ₹5,000. Flat ₹250 delivery fee for smaller orders. Standard delivery is 24-48 hours.
- Payments: Net 15/30 credit terms available for registered corporate accounts (requires GSTIN). Advance payment for initial orders.
- Custom Quotations: We generate formal quotes for bulk requirements.

Your Guidelines:
1. Speak in a helpful, professional, yet friendly business tone.
2. Format your response in WhatsApp style: use asterisks for *bold* text, bullet points for lists, and friendly emojis (like 👍, 🧼, 🧹, 📞). Keep paragraphs readable.
3. Refer *only* to products in our catalog. If asked for prices or details, look up the exact name and price. If a product isn't listed, offer the closest match or state that we can source it for bulk orders.
4. Highlight bulk discounts when customers ask about larger quantities.
5. If the customer asks for a quote, pricing, or shares intent to order, politely ask for their contact details (Name, Phone Number, and Business/Institution Name) if they haven't provided them.

Conversation History:
${historyText}

Respond to the last Customer message in WhatsApp-style.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemInstruction }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseText = data.candidates[0].content.parts[0].text.trim();
        return { text: responseText, mode: 'live' };
      }
    } catch (e) {
      console.warn("Gemini API call failed, falling back to local simulation.", e);
    }
  }

  // LOCAL SIMULATOR (Offline Fallback)
  return { text: simulateLocalChat(lastMessageText), mode: 'simulated' };
}

/**
 * AI Product Recommender
 */
export async function recommendProducts(institutionType, requirements) {
  const apiKey = getApiKey();
  const apiStatus = await checkAIStatus();
  
  const prompt = `
You are a commercial cleaning consultant representing Ganga Maxx Marketplace.
Recommend a tailored cleaning supply list for a client.
Client Institution: ${institutionType}
Client Special Requirements: ${requirements}

Here is our catalog of available products:
${JSON.stringify(catalog, null, 2)}

Provide your recommendation in a clean JSON format.
The JSON must contain:
1. "summary": A brief explanation of the recommendation strategy (2-3 sentences).
2. "recommendations": An array of objects containing:
   - "productId": The exact product ID from our catalog.
   - "qty": A recommended B2B starter quantity (integer).
   - "reason": A short reason why this product is crucial for this specific institution type.
   
Return ONLY the raw JSON block without markdown formatting or code blocks.`;

  if (apiStatus.live) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const resultText = data.candidates[0].content.parts[0].text.trim();
        return { data: JSON.parse(resultText), mode: 'live' };
      }
    } catch (e) {
      console.warn("Gemini recommender failed, falling back to local simulation.", e);
    }
  }

  // Fallback Recommender
  return { data: simulateLocalRecommendation(institutionType, requirements), mode: 'simulated' };
}

/**
 * AI Quotation Generator
 */
export async function generateQuotation(products, institutionType, clientName) {
  const apiKey = getApiKey();
  const apiStatus = await checkAIStatus();

  const cartDetails = products.map(p => {
    const orig = catalog.find(item => item.id === p.productId) || {};
    return `- ${orig.name || p.productId}: Qty ${p.qty} (B2B Price: ₹${orig.price || 0} per ${orig.unitSize || 'unit'})`;
  }).join('\n');

  const prompt = `
You are the B2B Sales Director of Ganga Maxx Marketplace, Hyderabad.
Generate a formal, highly professional email quotation for our client.

Client Name/Company: ${clientName}
Institution Type: ${institutionType}
Products Requested:
${cartDetails}

B2B Pricing Catalog for Reference (check bulk discount tiers):
${JSON.stringify(catalog, null, 2)}

Guidelines for the quotation:
1. Start with a professional business salutation and appreciation.
2. Outline the quotation in a structured, neat table format. Calculate the subtotal for each item.
3. Apply any bulk discounts if the quantities qualify (refer to "minBulkQty" and "discountPercent" in the reference catalog). If a discount applies, show the original subtotal, the discount applied, and the discounted total.
4. Calculate a final Net Total in INR (₹) including a 5% mock B2B tax/GST.
5. Detail delivery terms (Hyderabad region: Free delivery above ₹5,000, otherwise ₹250; 24-48 hours delivery).
6. Detail payment terms (Net 15 days credit upon invoice verification, or advance payment for new customers).
7. End with a professional signature from Ganga Maxx Sales Team, Manikonda, Hyderabad.

Return the quotation text. Use clear markdown formatting.`;

  if (apiStatus.live) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        return { text: data.candidates[0].content.parts[0].text.trim(), mode: 'live' };
      }
    } catch (e) {
      console.warn("Gemini quotation generator failed, falling back to local simulation.", e);
    }
  }

  // Fallback Quotation
  return { text: simulateLocalQuotation(products, institutionType, clientName), mode: 'simulated' };
}

/**
 * Helper to scan a chat message for potential client leads (Contact name, phone, company)
 */
export function extractLeadDetails(messageText, conversationHistory = []) {
  const combinedText = [
    ...conversationHistory.map(h => h.text),
    messageText
  ].join(' | ');

  // Regex matches
  const phoneRegex = /(?:\+91[\-\s]?)?[6-9]\d{9}/; // Indian phone numbers
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  
  const phoneMatch = combinedText.match(phoneRegex);
  const emailMatch = combinedText.match(emailRegex);

  // Fallback lead detection
  if (phoneMatch) {
    // Attempt to guess name & business
    let name = "B2B Prospect";
    let company = "Generic Institution";

    // Simple heuristical parser
    const nameKeywords = /(?:my name is|i am|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i;
    const nameMatch = combinedText.match(nameKeywords);
    if (nameMatch) name = nameMatch[1];

    const compKeywords = /(?:from|works at|office is|company is|school is|hotel is|hospital is|representing|represent)\s+([A-Za-z0-9\s]+?)(?=\s*(?:[.,|]|$))/i;
    const compMatch = combinedText.match(compKeywords);
    if (compMatch) company = compMatch[1].trim();

    // Check if user specified institution type in text
    let institution = "Office";
    if (/hotel|restaurant|stay|resort/i.test(combinedText)) institution = "Hotel";
    else if (/hospital|clinic|hygiene|medical|doctor/i.test(combinedText)) institution = "Hospital";
    else if (/school|college|university|academy|student/i.test(combinedText)) institution = "School";
    else if (/apartment|society|flat|residential/i.test(combinedText)) institution = "Apartment";

    return {
      isLead: true,
      lead: {
        name,
        phone: phoneMatch[0],
        email: emailMatch ? emailMatch[0] : "Not Provided",
        company,
        institution,
        requirements: messageText.substring(0, 150),
        status: "Captured",
        timestamp: new Date().toISOString()
      }
    };
  }

  return { isLead: false };
}

/* ==========================================
   LOCAL SIMULATION UTILITIES (Offline Engine)
   ========================================== */

function simulateLocalChat(input) {
  const text = input.toLowerCase();
  
  // 1. Pricing / Product info
  for (const item of catalog) {
    const words = item.name.toLowerCase().split(' ');
    const matched = words.filter(w => w.length > 3 && text.includes(w)).length >= 2;
    if (matched || text.includes(item.id)) {
      return `🧼 *Ganga Maxx Catalog Search*:\n\n*${item.name}*\n• *Unit Size*: ${item.unitSize}\n• *Price*: ₹${item.price} (B2B Wholesaler Rate)\n• *Availability*: ${item.availability}\n• *Usage*: ${item.usage}\n• *Bulk Discount*: ${item.bulkDiscount}\n\nWould you like me to add this to your quotation list? Just let me know the quantity!`;
    }
  }

  if (text.includes("floor") && text.includes("cleaner")) {
    const item = catalog[0];
    return `We have the *${item.name}* (${item.unitSize}) for ₹${item.price}. Dilution: 50ml in 10L. Disinfectant option: *Swizydra Phenyle* for ₹380.\nWould you like a custom quote for these?`;
  }
  if (text.includes("mop") || text.includes("wiper") || text.includes("cloth")) {
    return `We offer several commercial housekeeping tools:\n1. *Ganga Maxx Cotton Mop* - ₹280\n2. *Ganga Maxx Microfiber Cloth Pack (10-pack)* - ₹450 (400 GSM)\n3. *Industrial Floor Squeegee (24\")* - ₹320\n\nAll tools are heavy-duty and built for commercial workloads! What quantities do you need?`;
  }
  if (text.includes("dustbin") || text.includes("bag") || text.includes("garbage")) {
    return `We have washroom & waste management supplies in bulk:\n1. *Heavy Duty Garbage Bags (Large, Pack of 50)* - ₹350\n2. *Plastic Pedal Dustbin (20L)* - ₹380\n3. *C-Fold Paper Towels (2-Ply Case)* - ₹850\n\nWould you like to include these in your quotation cart?`;
  }

  // 2. Bulk discounts
  if (text.includes("discount") || text.includes("bulk") || text.includes("cheap") || text.includes("wholesale")) {
    return `💰 *B2B Bulk Discount Policy*:\n\nWe offer commercial scale discounts on volume purchases:\n• *Swizydra Cleaning Chemicals*: 10% off for 10+ Cans.\n• *Ganga Maxx Heavy Duty Garbage Bags*: 20% off for 50+ packs.\n• *Microfiber Cloths*: 12% off for 20+ packs.\n• *Floor Squeegee/Wipers*: 10% off for 20+ units.\n\nLet me know what items you need, and I'll calculate the discount for you automatically!`;
  }

  // 3. Delivery
  if (text.includes("delivery") || text.includes("deliver") || text.includes("ship") || text.includes("hyderabad") || text.includes("location")) {
    return `🚚 *Delivery Information*:\n\n• *Zones*: Hyderabad, Secunderabad, and surrounding districts in Telangana.\n• *Charges*: *FREE delivery* for orders above ₹5,000. Flat ₹250 for orders below ₹5,000.\n• *Timeline*: Delivered within 24 to 48 working hours from order confirmation.\n\nWhere is your business located?`;
  }

  // 4. Quotation request
  if (text.includes("quote") || text.includes("quotation") || text.includes("invoice") || text.includes("buy")) {
    return `📋 *Request a Professional Quotation*:\n\nI can generate a professional B2B quotation for you instantly! \n\nPlease provide:\n1. *Your Name*\n2. *Your Phone Number / Email*\n3. *Your Business or Institution Name*\n4. *The Products and Quantities* you require.\n\nAlternatively, you can use the *AI Product Recommender* and *Quotation Generator* panels on the right side of this dashboard to build it visually!`;
  }

  // 5. Help / Greeting
  if (text.includes("hello") || text.includes("hi") || text.includes("hey") || text.includes("start")) {
    return `👋 *Welcome to Ganga Maxx Marketplace B2B Support!*\n\nI am your AI sales assistant. I can help you with:\n• Checking product pricing and stock status\n• Explaining chemical dilution & usage instructions\n• Calculating B2B bulk discounts\n• Generating professional sales quotations\n• Arranging delivery across Hyderabad\n\nHow can I assist your business today?`;
  }

  // Default response asking for contact info
  return `Thank you for reaching out to *Ganga Maxx Marketplace*! \n\nI can answer questions about cleaning chemicals (Swizydra), heavy-duty mops, garbage bags, bulk discounts, and delivery timelines. \n\nIf you want to receive a formal quotation, please reply with your *Name, Contact Number, and Company Name*, or use the panels on the right to compile your request! 🧹🧼`;
}

function simulateLocalRecommendation(institutionType, requirements) {
  const summary = `Based on the cleaning needs for a typical ${institutionType}, we have configured a commercial-grade hygiene kit prioritizing disinfectant chemicals (Swizydra) and heavy-duty housekeeping equipment to maintain high-traffic spaces.`;
  
  const recommendations = [];
  
  if (institutionType === "Hotel") {
    recommendations.push(
      { productId: "chem-floor", qty: 15, reason: "High-dilution citrus floor cleaner for marble lobbies and guest hallways." },
      { productId: "chem-glass", qty: 10, reason: "Concentrated cleaner for streak-free windows, glass partitions, and bathroom mirrors." },
      { productId: "tool-microfiber", qty: 25, reason: "Color-coded microfibers (400 GSM) to prevent cross-contamination between rooms and washrooms." },
      { productId: "supp-pedal-bin", qty: 20, reason: "Hands-free pedal bins for guest rooms and communal lounges." }
    );
  } else if (institutionType === "Hospital") {
    recommendations.push(
      { productId: "chem-disinfectant", qty: 25, reason: "High-efficacy phenyle disinfectant cleaner for clinical surfaces and patient wards." },
      { productId: "chem-handwash", qty: 20, reason: "Nourishing liquid handwash to promote hand hygiene among medical staff and visitors." },
      { productId: "supp-gloves", qty: 15, reason: "Medical-grade nitrile gloves to protect housekeeping staff during sanitization rounds." },
      { productId: "supp-garbage-bags", qty: 30, reason: "Thick, puncture-resistant liners for clinical and general waste containment." }
    );
  } else if (institutionType === "School" || institutionType === "College") {
    recommendations.push(
      { productId: "chem-floor", qty: 10, reason: "Safe, non-toxic floor cleaner for high-traffic corridors and classroom floors." },
      { productId: "chem-toilet", qty: 12, reason: "Heavy-duty toilet cleaner for institutional student washrooms." },
      { productId: "tool-mop", qty: 15, reason: "Loop-end cotton mops with long handles to cover large classroom areas quickly." },
      { productId: "supp-garbage-bags", qty: 20, reason: "Large waste bin liners for playground and hallway garbage bins." }
    );
  } else {
    // Office / General default
    recommendations.push(
      { productId: "chem-floor", qty: 5, reason: "Maintains gloss on marble and ceramic floor surfaces in workspaces." },
      { productId: "chem-handwash", qty: 8, reason: "Essential washroom liquid hand soap refiller." },
      { productId: "supp-paper-towels", qty: 5, reason: "Premium C-fold paper towels for employee washroom hand dryers." },
      { productId: "tool-microfiber", qty: 10, reason: "Excellent dry dusting cloth pack for IT equipment, desks, and glass panels." }
    );
  }

  return { summary, recommendations };
}

function simulateLocalQuotation(products, institutionType, clientName) {
  let subtotal = 0;
  let totalDiscount = 0;
  
  const client = clientName || "Valued B2B Customer";
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const quoteNo = `GMM-Q-${Math.floor(1000 + Math.random() * 9000)}`;

  let tableRows = "";
  
  products.forEach((p, index) => {
    const orig = catalog.find(item => item.id === p.productId);
    if (!orig) return;
    
    const qty = parseInt(p.qty) || 1;
    const itemPrice = orig.price;
    const rowSubtotal = itemPrice * qty;
    
    // Apply B2B Bulk discount logic if qualifies
    let discount = 0;
    if (qty >= orig.minBulkQty) {
      discount = (rowSubtotal * orig.discountPercent) / 100;
    }
    
    const finalRowSubtotal = rowSubtotal - discount;
    subtotal += rowSubtotal;
    totalDiscount += discount;

    tableRows += `| ${index + 1} | ${orig.name} (${orig.unitSize}) | ${qty} | ₹${itemPrice} | ₹${rowSubtotal} | ${discount > 0 ? `₹${discount} (${orig.discountPercent}%)` : 'None'} | ₹${finalRowSubtotal} |\n`;
  });

  const netSubtotal = subtotal - totalDiscount;
  const mockGst = Math.round(netSubtotal * 0.05); // 5% B2B discount tax
  const deliveryCharge = netSubtotal >= 5000 ? 0 : 250;
  const grandTotal = netSubtotal + mockGst + deliveryCharge;

  return `
# GANGA MAXX MARKETPLACE
*Puppalaguda Main Road, Manikonda, Hyderabad, TS - 500089*
*Email: sales@gangamaxxmarketplace.com | Web: www.gangamaxxmarketplace.com*

---

### **PROFORMA INVOICE / B2B SALES QUOTATION**

**Quote Number:** ${quoteNo}  
**Date:** ${dateStr}  
**Prepared For:** ${client} (${institutionType} Facility Management)  

Dear Sir/Madam,

Thank you for your inquiry. We are pleased to submit our commercial wholesale quotation for Swizydra cleaning chemicals and Ganga Maxx housekeeping materials, detailed below:

| S.No | Product Details | Qty | Unit Price | Gross Total | Discount | Net Subtotal |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
${tableRows}

### **Financial Summary**
* **Gross Subtotal:** ₹${subtotal}
* **B2B Bulk Discount:** -₹${totalDiscount}
* **Net Subtotal:** ₹${netSubtotal}
* **Mock GST / Tax (5%):** ₹${mockGst}
* **Delivery & Shipping (Hyderabad):** ${deliveryCharge === 0 ? "FREE (Order > ₹5,000)" : `₹${deliveryCharge}`}
* **GRAND TOTAL (INR):** **₹${grandTotal}**

---

### **Terms and Conditions**
1. **Delivery Timeline:** 24 - 48 Hours within the Hyderabad/Secunderabad limits.
2. **Payment Terms:** Initial B2B orders require 100% advance. Net 15 credit terms are available from the 2nd order onwards (Subject to KYC & GSTIN registration approval).
3. **Validity:** This quotation is valid for 30 days from the date of issue.
4. **Supply Guarantee:** All chemical cleaners (Swizydra) are certified biodegradable and safe for corporate cleaning guidelines.

We look forward to serving your facility management requirements. If you approve of this quote, please contact our helpline or reply to our WhatsApp sales line to confirm delivery.

Sincerely,  
**Ganga Maxx Sales Team**  
*AI-Generated Quotation Service (Simulated fallback)*
`;
}
