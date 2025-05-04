interface Message {
  role: "system" | "user" | "assistant";
  content:
  | string
  | Array<{ type: string; text?: string; image_url?: { url: string; detail?: string }; file_path?: string }>;
  type?: string;
  text?: string;
  image_url?: { url: string; detail?: string };
  file_path?: string;
}

// Restricted topics that should not be answered in MVP
const RESTRICTED_TOPICS = [
  // Legal debt issues
  /ยึดทรัพย์|ฟ้องร้อง|กฎหมายหนี้|ศาล|พ.ร.บ.|ทนายความ|ล้มละลาย|ฟ้องล้มละลาย|คดีความ|บังคับคดี/i,
  // Investment advice
  /ลงทุน|หุ้น|กองทุน|ทองคำ|คริปโต|บิทคอยน์|อสังหาริมทรัพย์|หุ้นกู้|พันธบัตร|ผลตอบแทน/i,
  // Legal or tax personal advice
  /ภาษี|ลดหย่อนภาษี|ประกันสังคม|กฎหมายภาษี|กรมสรรพากร|ภาษีเงินได้|ภาษีนิติบุคคล|ภาษีมูลค่าเพิ่ม|ภาษีหัก ณ ที่จ่าย/i,
  // Detailed income-expense analysis requiring new data input
  /กรอกข้อมูลใหม่|กรอกรายได้|กรอกรายจ่าย|บันทึกรายรับ|บันทึกรายจ่าย|ลงทะเบียนรายได้|ลงทะเบียนค่าใช้จ่าย/i,
];

// Response for restricted topics
const RESTRICTED_RESPONSE =
  "ขออภัยค่ะ ตอนนี้เรายังไม่สามารถให้คำแนะนำในเรื่องนี้ได้ เนื่องจากอยู่นอกขอบเขตบริการของเรา แนะนำให้ปรึกษาผู้เชี่ยวชาญโดยตรงค่ะ";

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
  fileType?: "image" | "pdf"; // Type of file being processed
  fileName?: string; // Original filename (needed for PDF upload)
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
   * Check if a message contains restricted topics
   * @param message - User's message to check
   * @returns Boolean indicating if the message contains restricted topics
   */
  private containsRestrictedTopics(message: string): boolean {
    return RESTRICTED_TOPICS.some((pattern) => pattern.test(message));
  }

  /**
   * Chat with the AI, maintaining conversation history
   * @param message - User's message
   * @param options - Optional settings (max history, temperature)
   * @returns AI response
   */
  async chat(message: string, options: ChatOptions = {}): Promise<string> {
    try {
      const { maxHistory = 10, temperature = 0.7 } = options;

      // Check for restricted topics
      if (this.containsRestrictedTopics(message)) {
        return RESTRICTED_RESPONSE;
      }

      // Add user message to history
      this.conversationHistory.push({
        role: "user",
        content: message,
      });

      // Trim history if exceeding max
      if (this.conversationHistory.length > maxHistory * 2) {
        // Keep the last N pairs of exchanges (user + assistant messages)
        this.conversationHistory = this.conversationHistory.slice(
          -maxHistory * 2,
        );
      }

      // Construct system message with context
      const systemMessage: Message = {
        role: "system",
        content: this.personalContext
          ? `You are an AI assistant with the following context: ${this.personalContext}. You specialize in Thai personal finance and debt management advice.`
          : "You are an AI assistant specializing in Thai personal finance and debt management advice. Provide clear, actionable guidance for users managing their finances.",
      };

      // Prepare messages for OpenAI API
      const messages = [systemMessage, ...this.conversationHistory];

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
   * Extract text from an image or PDF using OCR
   * @param fileData - Base64-encoded image, PDF, or URL
   * @param options - OCR processing options
   * @returns Extracted text
   */
  async ocr(fileData: string, options: OCROptions = {}): Promise<string> {
    try {
      const { detail = "high", fileType = "image", fileName = "document" } = options;

      // Validate input
      if (!fileData) {
        throw new Error("No file data provided");
      }

      console.log(`Processing file of type: ${fileType}`);

      // Process based on file type
      if (fileType === "pdf") {
        // If it's a data URL, it needs special handling
        if (fileData.startsWith('data:application/pdf;base64,')) {
          console.log('Processing data URL PDF...');
          // Extract the base64 part without the prefix
          const base64Data = fileData.split(',')[1];
          // PDF processing with specialized PDF method
          return this.processPdfOcr(base64Data, fileName);
        } else {
          // Otherwise just use the data as-is (might be already base64)
          return this.processPdfOcr(fileData, fileName);
        }
      } else if (fileType === "image") {
        // Image processing with vision API
        return this.processImageOcr(fileData, detail);
      } else {
        throw new Error(`Unsupported file type: ${fileType}. Supported types are 'image' and 'pdf'.`);
      }
    } catch (error: any) {
      console.error("OCR processing error:", error);
      // Check for specific error messages
      if (error.message && error.message.includes("invalid_image_format")) {
        throw new Error("Invalid image format. Please upload PNG, JPEG, GIF, or WEBP files only.");
      }
      throw new Error(`Failed to process OCR request: ${error.message || error}`);
    }
  }

  /**
   * Process image data for OCR
   * @param imageData - Base64-encoded image or image URL
   * @param detail - Image detail level
   * @returns Extracted text
   */
  private async processImageOcr(imageData: string | Buffer, detail: string): Promise<string> {
    try {
      // Determine if the image is a URL, Buffer, or base64
      let imageContent: any;

      if (Buffer.isBuffer(imageData)) {
        // Convert Buffer to base64
        const base64Image = imageData.toString('base64');
        imageContent = {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${base64Image}`,
            detail,
          },
        };
      } else if (typeof imageData === 'string') {
        // Check if it's a URL or base64
        const isUrl = imageData.startsWith("http://") || imageData.startsWith("https://");
        imageContent = {
          type: "image_url",
          image_url: {
            url: isUrl ? imageData : `data:image/jpeg;base64,${imageData}`,
            detail,
          },
        };
      } else {
        throw new Error("Unsupported image data format");
      }

      // Build the prompt with personal context and enhanced Thai financial document recognition instructions
      const systemPrompt: Message = {
        role: "system",
        content: this.personalContext
          ? `You are an AI assistant with the following context: ${this.personalContext}. You are an expert at extracting financial information from Thai financial documents, receipts, bills, and credit statements. Extract text from the provided image with high accuracy, paying special attention to amounts, dates, and financial terms.`
          : "You are an AI assistant specializing in Thai financial document analysis. Extract text from the provided image with high accuracy, paying special attention to amounts, dates, and financial terms.",
      };

      const messages: Message[] = [
        systemPrompt,
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please extract all text from this financial document, focusing on debt details, minimum payments, interest rates, due dates, and total amounts. If the document contains multiple pages, analyze all visible content carefully.",
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
            model: "gpt-4.1", // Using the requested GPT-4.1 model
            messages,
            temperature: 0.1, // Low temperature for more deterministic extraction
            max_tokens: 1500, // Increased token limit for more detailed extraction
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OCR API error:", errorData);
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Image OCR processing error:", error);
      throw new Error(`Failed to process image OCR: ${error}`);
    }
  }

  /**
   * Process PDF data for OCR using OpenAI's Files API
   * @param pdfData - PDF data as Buffer or base64 string
   * @param fileName - Original filename
   * @returns Extracted text
   */
  private async processPdfOcr(pdfData: string | Buffer, fileName: string): Promise<string> {
    try {
      // First, prepare the PDF file for upload
      let fileObject: File;

      if (Buffer.isBuffer(pdfData)) {
        // Convert Buffer to Blob
        const blob = new Blob([pdfData], { type: 'application/pdf' });
        fileObject = new File([blob], fileName || 'document.pdf', { type: 'application/pdf' });
      } else if (typeof pdfData === 'string') {
        // Handle different string formats (URL, data URL, base64)
        if (pdfData.startsWith('http')) {
          // Fetch from URL
          const response = await fetch(pdfData);
          if (!response.ok) {
            throw new Error(`Failed to fetch PDF from URL: ${response.statusText}`);
          }
          const blob = await response.blob();
          if (blob.type !== 'application/pdf') {
            throw new Error('URL does not point to a valid PDF file');
          }
          fileObject = new File([blob], fileName || 'document.pdf', { type: 'application/pdf' });
        } else if (pdfData.startsWith('data:application/pdf;base64,')) {
          // Handle full data URL format (starting with data:application/pdf;base64,)
          try {
            // Extract the base64 part from the data URL
            const base64Data = pdfData.split(',')[1];
            // Convert base64 to binary
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'application/pdf' });
            fileObject = new File([blob], fileName || 'document.pdf', { type: 'application/pdf' });
          } catch (e) {
            console.error('Error processing PDF data URL:', e);
            throw new Error('Invalid PDF data URL');
          }
        } else {
          // Assume base64 string
          try {
            // Convert base64 to binary
            const binaryString = atob(pdfData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'application/pdf' });
            fileObject = new File([blob], fileName || 'document.pdf', { type: 'application/pdf' });
          } catch (e) {
            console.error('Error processing PDF base64:', e);
            throw new Error('Invalid base64 PDF data');
          }
        }
      } else {
        throw new Error('Invalid PDF data format');
      }

      // Check file size - OpenAI has a 25MB limit for vision API
      if (fileObject.size > 25 * 1024 * 1024) { // 25MB in bytes
        throw new Error('PDF file exceeds the maximum size limit of 25MB');
      }

      // For PDFs, we'll use the same approach as images with base64 encoding
      // Convert PDF to base64
      const reader = new FileReader();

      // Create a promise to handle the FileReader async operation
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64String = reader.result as string;
          // Remove the data URL prefix if present
          const base64Data = base64String.split(',')[1] || base64String;
          resolve(base64Data);
        };
        reader.onerror = () => {
          reject(new Error('Failed to read PDF file'));
        };
      });

      // Start reading the file
      reader.readAsDataURL(fileObject);

      // Wait for the reading to complete
      const base64Data = await base64Promise;

      // Build system prompt for Thai financial document analysis
      const systemPrompt: Message = {
        role: "system",
        content: this.personalContext
          ? `You are an AI assistant with the following context: ${this.personalContext}. You are an expert at extracting financial information from Thai financial documents, receipts, bills, and credit statements. Extract text from the provided PDF with high accuracy, paying special attention to amounts, dates, and financial terms.`
          : "You are an AI assistant specializing in Thai financial document analysis. Extract text from the provided PDF with high accuracy, paying special attention to amounts, dates, and financial terms.",
      };

      console.log('Processing PDF with OpenAI Vision API...');

      // Create form data for API upload
      const formData = new FormData();
      // Convert the base64 string back to a binary blob
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const file = new File([blob], fileName || 'document.pdf', { type: 'application/pdf' });

      formData.append('file', file);
      formData.append('purpose', 'assistants');

      console.log('Uploading PDF to OpenAI Files API...');
      const uploadResponse = await fetch('https://api.openai.com/v1/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Failed to upload PDF:', errorText);
        throw new Error(`Failed to upload PDF: ${uploadResponse.statusText}`);
      }

      const uploadResult = await uploadResponse.json();
      const fileId = uploadResult.id;
      console.log(`PDF uploaded with ID: ${fileId}`);

      // Now create a messages array for GPT-4 with a system message and user prompt
      const messages = [
        {
          role: "system",
          content: systemPrompt.content,
        },
        {
          role: "user",
          content: `I've uploaded a PDF document with ID ${fileId}. Please extract all financial information from it, including debt details, payment amounts, interest rates, due dates, and total amounts. Focus particularly on information that would be relevant for financial planning in Thailand.`
        },
      ];

      // Submit the file ID for processing
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4.1",
            messages,
            temperature: 0.1,
            max_tokens: 1500,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("PDF OCR API error:", errorData);
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('PDF processing completed successfully');

      // Clean up by deleting the file
      try {
        console.log(`Deleting file ${fileId}...`);
        const deleteResponse = await fetch(`https://api.openai.com/v1/files/${fileId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        });

        if (!deleteResponse.ok) {
          console.warn(`Failed to delete file ${fileId}, but processing was successful`);
        } else {
          console.log(`File ${fileId} deleted successfully`);
        }
      } catch (deleteError) {
        console.warn('Error during file cleanup:', deleteError);
      }

      return data.choices[0].message.content;
    } catch (error: any) {
      console.error("PDF OCR processing error:", error);
      // Provide more specific error messages
      if (error.message && error.message.includes('application/pdf')) {
        throw new Error('Invalid PDF format. Please ensure you are uploading a valid PDF file.');
      } else if (error.message && error.message.includes('file size')) {
        throw new Error('PDF file is too large. Maximum size is 25MB.');
      }
      throw new Error(`Failed to process PDF OCR: ${error.message || error}`);
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


export async function getUserContext(userId: string): Promise<DebtContext | null> {
  try {
    const response = await fetch(`/api/users/${userId}/context`);
    const data = await response.json();
    return data.context;
  } catch (error) {
    console.error("Error fetching user context:", error);
    return null;
  }
}

export default AIService;
