export async function pollUntilComplete<T>(
    fn: () => Promise<T>,
    checkCondition: (res: T) => boolean,
    delayMs = 60000, 
    maxRetries = 1000
) {
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

    for (let i = 0; i < maxRetries; i++) {
        const result = await fn()
        if (checkCondition(result)) return result
        await delay(delayMs)
    }

    throw new Error("Polling timed out")
}