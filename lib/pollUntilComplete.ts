export async function pollUntilComplete<T>(
    fn: () => Promise<T>,
    checkCondition: (res: T) => boolean,
    delayMs = 10000,
    maxRetries = 60
) {
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

    for (let i = 0; i < maxRetries; i++) {
        const result = await fn()
        if (checkCondition(result)) return result
        await delay(delayMs)
    }

    throw new Error("Polling timed out")
}