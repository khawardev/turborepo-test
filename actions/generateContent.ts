'use server';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

export async function generateNewContent(
   prompt:any
): Promise<any> {
    try {
        let model;

        // if (data.modelAlias === 'recomended') {
        //     model = openai("gpt-4.1");
        // } else {
        //     model = google("gemini-2.5-pro-preview-05-06");
        // }
        model = google("gemini-2.5-pro");
        const result = await generateText({
            model,
            temperature: 0.7,
            system: undefined,
            prompt: prompt,
        });

        if (result.text) {
            return {
                generatedText: result.text,
                errorReason: null,
            };
        } else {
            return {
                generatedText: null,
            };
        }
    } catch (error) {
        console.error('LLM Generation failed:', error);
        return {
            generatedText: null,
            errorReason: `LLM API call failed: ${error instanceof Error ? error.message : String(error)
                }`,
        };
    }
}

