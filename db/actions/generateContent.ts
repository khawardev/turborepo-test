import { logger } from "@/lib/utils";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";


export async function generateNewContent(prompt: string, modelName: string = "gemini-3-pro-preview"): Promise<any> {
    const functionName = "generateNewContent";
    logger.info("AI text generation initiated.", { functionName, promptLength: prompt?.length || 0, model: modelName });

    let attempt = 0;
    const maxRetries = 10; // Increased to handle strict rate limits
    let lastError: any = null;

    while (attempt <= maxRetries) {
        try {
            const model = google(modelName);
            const result = await generateText({
                model,
                temperature: 0.7,
                prompt: prompt,
            });

            if (result.text) {
                logger.info("AI text generation successful.", { functionName, model: modelName, generatedTextLength: result.text.length });
                return {
                    generatedText: result.text,
                    errorReason: null,
                };
            } else {
                logger.warn("AI generation call succeeded but returned no text.", { functionName, model: modelName, result });
                return {
                    generatedText: null,
                    errorReason: 'The AI model returned an empty response.',
                };
            }
        } catch (error: any) {
            lastError = error;
            const errorMessage = error?.message?.toLowerCase() || "";
            const isQuotaError = errorMessage.includes("quota") || errorMessage.includes("429") || errorMessage.includes("rate limit") || errorMessage.includes("resource has been exhausted");
            const isSafetyError = errorMessage.includes("safety") || errorMessage.includes("candidate");
            const isContextOverflow = errorMessage.includes("too many tokens") || errorMessage.includes("context window");

            if (isQuotaError && attempt < maxRetries) {
                let waitTime = 2000 * Math.pow(2, attempt); // Exponential backoff
                
                // Try to parse "retry in X s"
                const match = errorMessage.match(/retry in\s+([\d.]+)\s*s/);
                if (match && match[1]) {
                    waitTime = (parseFloat(match[1]) * 1000) + 2000; // Add 2s buffer
                }

                logger.warn(`AI Quota exceeded. Retrying in ${waitTime}ms... (Attempt ${attempt + 1}/${maxRetries})`, { functionName, waitTime, errorMessage: error.message });
                await new Promise(resolve => setTimeout(resolve, waitTime));
                attempt++;
                continue;
            }

            // If not a quota error, or retries exhausted, log and return error
            logger.error("AI text generation API call failed.", {
                functionName,
                model: modelName,
                error: error instanceof Error ? error.message : String(error),
                isSafetyError,
                isContextOverflow,
                attempt
            });

            return {
                generatedText: null,
                errorReason: isContextOverflow 
                    ? "The content is too large for the AI to process in one go." 
                    : isSafetyError 
                    ? "The AI safety filters blocked this response. Please review the website content."
                    : `${error instanceof Error ? error.message : 'An unknown error occurred.'}`,
            };
        }
    }
}