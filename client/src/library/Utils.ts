import * as v from 'valibot'

export type Promisified<TData, TError> = Promise<[TData, null] | [null, TError]>

export function Promisify<TData, TError>(promiseFunc: Promise<TData>, customError?: TError): Promisified<TData, TError> {
    return new Promise(res => {
        promiseFunc.then((value: TData) => {
            res([value, null])
        }).catch((promiseError: TError) => {
            const catchError = customError || promiseError

            console.error(catchError)

            res([null, catchError])
        })
    })    
}

export async function FetchJSON<T>(url: string | URL): Promisified<T, Error> {
    const [ response, responseError ] = await Promisify<Response, Error>(fetch(url))

    if(responseError) return [null, new Error(`Failed to fetch from ${url}!`)]
    
    return await Promisify<T, Error>(response.json())
}

export async function FetchAPIData<T>(url: string | URL, schema: any): Promisified<T, Error> {
    const [ response, responseError ] = await Promisify<Response, Error>(fetch(url))

    if(responseError) return [null, new Error(`Failed to fetch from ${url}!`)]
    const [ data, dataError ] = await Promisify<v.InferInput<typeof schema>, Error>(response.json())

    if(dataError) return [null, new Error(`Failed to parse json from ${url}!`)]
    // const verification = v.safeParse(schema, data)

    // if(!verification.success) return [null, new Error(`Schema verification failed from ${url}!`)]

    // return [verification.output, null]
    return [data, null]
}