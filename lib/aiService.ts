interface Message {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

// Debt context types for AI analysis
export interface DebtContext {
  debtItems: Array<{
    id: string;
    name: string;
    debtType: string;
    totalAmount: string;
    minimumPayment: string;
    interestRate: string;
    dueDate: string;
    paymentStatus: string;
  }>;
  income: string;
  expense: string;
  riskPercentage: number;
}

interface ChatOptions {
  maxHistory?: number; // Maximum number of messages to retain in history
  temperature?: number; // Control response randomness
}

interface OCROptions {
  detail?: "low" | "high" | "auto"; // Image detail level for OCR
}

class AIService {
  private apiKey: string;
  private personalContext: string;
  private conversationHistory: Message[];

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("OpenAI API key not found");
    }
    this.personalContext = ""; // Default empty context
    this.conversationHistory = []; // Initialize empty history
  }

  /**
   * Set a personal context to customize AI responses
   * @param context - Custom instructions or preferences (e.g., tone, role, or specific guidelines)
   */
  setPersonalContext(context: string): void {
    this.personalContext = context;
  }

  /**
   * Clear the personal context
   */
  clearPersonalContext(): void {
    this.personalContext = "";
  }

  /**
   * Clear the conversation history
   */
  clearConversationHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Chat with the AI, maintaining conversation history
   * @param message - User's message
   * @param options - Optional settings (max history, temperature)
   * @returns AI response
   */
  async chat(message: string, options: ChatOptions = {}): Promise<string> {
    const { maxHistory = 10, temperature = 0.7 } = options;

    try {
      // Build the prompt with personal context
      const systemPrompt: Message = {
        role: "system",
        content: this.personalContext
          ? `You are an AI assistant with the following context: ${this.personalContext}`
          : "You are a helpful AI assistant.",
      };

      // Add user message to history
      this.conversationHistory.push({ role: "user", content: message });

      // Trim history to respect maxHistory limit (keep system prompt + recent messages)
      if (this.conversationHistory.length > maxHistory) {
        this.conversationHistory = this.conversationHistory.slice(-maxHistory);
      }

      // Prepare messages for the API
      const messages: Message[] = [systemPrompt, ...this.conversationHistory];

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
            temperature,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantResponse = data.choices[0].message.content;

      // Add assistant's response to history
      this.conversationHistory.push({
        role: "assistant",
        content: assistantResponse,
      });

      return assistantResponse;
    } catch (error) {
      throw new Error(`Failed to process chat request: ${error}`);
    }
  }

  /**
   * Extract text from an image using OCR
   * @param image - Base64-encoded image or image URL
   * @param options - Optional settings (detail level)
   * @returns Extracted text
   */
  async ocr(image: string, options: OCROptions = {}): Promise<string> {
    const { detail = "auto" } = options;

    try {
      // Determine if the image is a URL or base64
      const isUrl = image.startsWith("http://") || image.startsWith("https://");
      const imageContent = isUrl
        ? { type: "image_url", image_url: { url: image, detail } }
        : {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${image}`, detail },
          };

      // Build the prompt with personal context
      const systemPrompt: Message = {
        role: "system",
        content: this.personalContext
          ? `You are an AI assistant with the following context: ${this.personalContext}. Extract text from the provided image accurately.`
          : "You are an AI assistant. Extract text from the provided image accurately.",
      };

      const messages: Message[] = [
        systemPrompt,
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please extract all text from the provided image.",
            },
            imageContent,
          ],
        },
      ];

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();

      return data.choices[0].message.content;
    } catch (error) {
      throw new Error(`Failed to process OCR request: ${error}`);
    }
  }

  /**
   * Generate a response for a single prompt (original method)
   * @param prompt - User's prompt
   * @returns AI response
   */
  async generateResponse(prompt: string): Promise<string> {
    try {
      const systemPrompt: Message = {
        role: "system",
        content: this.personalContext
          ? `You are an AI assistant with the following context: ${this.personalContext}`
          : "You are a helpful AI assistant.",
      };

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [systemPrompt, { role: "user", content: prompt }],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();

      return data.choices[0].message.content;
    } catch (error) {
      throw new Error(`Failed to generate response: ${error}`);
    }
  }
}

/**
 * Save user's debt context to their profile for future AI interactions
 * @param userId - User ID
 * @param context - Context string to store
 * @returns Success status
 */
export async function updateUserDebtContext(
  userId: string,
  context: string,
): Promise<boolean> {
  try {
    const response = await fetch(`/api/users/${userId}/context`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ context }),
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Helper function to create a structured Thai prompt from debt context
 * @param context - The debt context object
 * @returns Formatted Thai language prompt
 */
export function createDebtPrompt(context: DebtContext): string {
  const { debtItems, income, expense, riskPercentage } = context;

  const totalDebt = debtItems.reduce(
    (sum, debt) => sum + parseFloat(debt.totalAmount.replace(/,/g, "")),
    0,
  );

  const monthlyPayments = debtItems.reduce(
    (sum, debt) => sum + parseFloat(debt.minimumPayment.replace(/,/g, "")),
    0,
  );

  return `
        วิเคราะห์สถานะทางการเงินของฉัน:
        - รายได้ต่อเดือน: ${income} บาท
        - ค่าใช้จ่ายต่อเดือน: ${expense} บาท
        - หนี้ทั้งหมด: ${totalDebt.toLocaleString("th-TH")} บาท
        - ยอดชำระรายเดือน: ${monthlyPayments.toLocaleString("th-TH")} บาท
        - ระดับความเสี่ยง: ${riskPercentage}%
        
        หนี้ที่มี:
        ${debtItems.map((debt) => `- ${debt.name}: ${debt.totalAmount} บาท (ดอกเบี้ย ${debt.interestRate}%)`).join("\n")}
        
        ช่วยให้คำแนะนำในการจัดการหนี้ การวางแผนชำระ และวิธีลดความเสี่ยงทางการเงิน
    `;
}

export default AIService;
