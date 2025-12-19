import { logger } from "@/lib/utils";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";


export async function generateNewContent(prompt: string, modelName: string = "gemini-3-pro-preview"): Promise<any> {
    const functionName = "generateNewContent";
    logger.info("AI text generation initiated.", { functionName, promptLength: prompt?.length || 0, model: modelName });

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
        // Specifically handle safety filters or token limits if reported by the API
        const isSafetyError = error?.message?.toLowerCase().includes("safety") || error?.message?.toLowerCase().includes("candidate");
        const isContextOverflow = error?.message?.toLowerCase().includes("too many tokens") || error?.message?.toLowerCase().includes("context window");

        logger.error("AI text generation API call failed.", {
            functionName,
            model: modelName,
            error: error instanceof Error ? error.message : String(error),
            isSafetyError,
            isContextOverflow
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