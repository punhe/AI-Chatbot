import OpenAI from "openai";
import { Assistant as OpenAIAssistant } from "./openai"; // file ở trên

const deepseekClient = new OpenAI({
  apiKey: import.meta.env.VITE_DEEPSEEK_AI_API_KEY,
  baseURL: "https://api.deepseek.com",
  dangerouslyAllowBrowser: true,
});

export class Assistant extends OpenAIAssistant {
  #fallbackAssistant;

  constructor(model = "deepseek-chat", client = deepseekClient) {
    super(model, client);
    this.#fallbackAssistant = new OpenAIAssistant();
  }

  async chat(content, history) {
    try {
      return await super.chat(content, history);
    } catch (error) {
      console.warn("DeepseekAI error, falling back to OpenAI:", error.message);
      return this.#fallbackAssistant.chat(content, history);
    }
  }

  async *chatStream(content, history) {
    try {
      const result = await super.chatStream(content, history);
      for await (const chunk of result) {
        yield chunk;
      }
    } catch (error) {
      console.warn("DeepseekAI stream error, falling back to OpenAI:", error.message);
      const fallbackResult = await this.#fallbackAssistant.chatStream(content, history);
      for await (const chunk of fallbackResult) {
        yield chunk;
      }
    }
  }
}
