import { logger } from "@/lib/utils";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function generateNewContent(prompt: any): Promise<any> {
    const functionName = "generateNewContent";
    logger.info("AI text generation initiated.", { functionName, promptLength: prompt?.length || 0 });

    try {
        const model = google("gemini-2.5-pro");
        const result = await generateText({
            model,
            temperature: 0.7,
            prompt: prompt,
        });

        if (result.text) {
            logger.info("AI text generation successful.", { functionName, model: "gemini-2.5-pro", generatedTextLength: result.text.length });
            return {
                generatedText: result.text,
                errorReason: null,
            };
        } else {
            logger.warn("AI generation call succeeded but returned no text.", { functionName, model: "gemini-2.5-pro", result });
            return {
                generatedText: null,
                errorReason: 'The AI model returned an empty response.',
            };
        }
    } catch (error) {
        logger.error("AI text generation API call failed.", {
            functionName,
            model: "gemini-2.5-pro",
            error: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined
        });
        return {
            generatedText: null,
            errorReason: `The AI service failed to process the request. ${error instanceof Error ? error.message : 'An unknown error occurred.'}`,
        };
    }
}