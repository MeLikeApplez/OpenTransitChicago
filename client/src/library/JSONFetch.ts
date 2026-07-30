type JSONFetchReturn<T, E> = Promise<[T, null] | [null, E]>

export default async function JSONFetch<T>(input: RequestInfo | URL, customError?: Error): JSONFetchReturn<T, Error> {
    customError = customError || new Error('Failed to fetch JSON!')
    
    try {   
        const response = await fetch(input)
        const json = await response.json()

        return [json as T, null]
    } catch(fetchError: any) {
        console.error(fetchError)

        return [null, customError]
    }
}