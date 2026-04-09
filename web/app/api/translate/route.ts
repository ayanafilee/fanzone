import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { title, body } = await req.json();
        
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.error("GEMINI_API_KEY environment variable is not set");
            return NextResponse.json({ 
                error: {
                    code: 500,
                    message: "Translation service configuration error",
                    status: "CONFIG_ERROR"
                }
            }, { status: 500 });
        }
        const prompt = `Translate the following title and body to Amharic and Afaan Oromoo. 
        Return exactly a JSON object with this structure:
        {
          "title": { "am": "...", "om": "..." },
          "body": { "am": "...", "om": "..." }
        }
        
        Title to translate: "${title || ''}"
        Body to translate: "${body || ''}"`;

        const maxRetries = 2;
        const baseDelay = 500; // 500ms
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });

                if (!response.ok) {
                    // Retry on 503 (service unavailable) or 429 (rate limit)
                    if ((response.status === 503 || response.status === 429) && attempt < maxRetries) {
                        const delay = baseDelay * Math.pow(2, attempt);
                        console.warn(`Gemini API temporarily unavailable (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                    
                    // For other errors or exhausted retries, handle the error
                    const errorText = await response.text();
                    let errorMessage = "Translation service error";
                    
                    try {
                        const errorData = JSON.parse(errorText);
                        if (errorData.error?.message) {
                            errorMessage = errorData.error.message;
                        }
                    } catch {
                        errorMessage = errorText || `HTTP ${response.status}`;
                    }
                    
                    return NextResponse.json({ 
                        error: {
                            code: response.status,
                            message: errorMessage,
                            status: response.status === 503 ? "UNAVAILABLE" : "ERROR"
                        }
                    }, { status: response.status });
                }

                // Success - process the response
                const data = await response.json();
                let resultText = data.candidates[0].content.parts[0].text;
                
                // Try to strip markdown JSON wrapping if it exists
                resultText = resultText.replace(/```json/gi, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(resultText);
                
                return NextResponse.json(parsed);
                
            } catch (fetchError) {
                // Network errors - retry if we have attempts left
                if (attempt < maxRetries) {
                    const delay = baseDelay * Math.pow(2, attempt);
                    console.warn(`Network error during translation (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`, fetchError);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                
                // If we've exhausted retries, throw the error to be caught by outer catch
                throw fetchError;
            }
        }
        
    } catch (error) {
        console.error("Translation API error:", error);
        return NextResponse.json({ 
            error: {
                code: 500,
                message: "Translation service is currently unavailable. Please try again later.",
                status: "INTERNAL_ERROR"
            }
        }, { status: 500 });
    }
}
