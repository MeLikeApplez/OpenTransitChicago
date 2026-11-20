import type { APIRoute } from 'astro'
import * as z from 'zod'

// https://docs.astro.build/en/guides/on-demand-rendering/#enabling-on-demand-rendering
export const prerender = false

// https://www.transitchicago.com/developers/ttdocs/#followapi
export const TrainFollowSchema = z.object({
    ctatt: z.object({
        tmst: z.string(),
        errCd: z.string(),
        errNm: z.nullable(z.string()),
        position: z.object({
            lat: z.nullable(z.string()), lon: z.nullable(z.string()),
            heading: z.nullable(z.string()),
        }),
        eta: z.array(z.object({
            staId: z.string(), stpId: z.string(), staNm: z.string(), stpDe: z.string(),
            rn: z.string(), rt: z.string(),
            destSt: z.string(), destNm: z.string(),
            trDr: z.string(),
            prdt: z.string(),
            arrT: z.string(),
            isApp: z.string(), isSch: z.string(), isDly: z.string(), isFlt: z.string(),
            flags: z.nullable(z.string()),
        }))
    })
})

export const GET = (async ({ url }) => {
    const runNumber = Number(url.searchParams.get('runNumber') ?? NaN)

    if(isNaN(runNumber)) {
        return new Response(null, {
            status: 400,
            statusText: '"runNumber" query is incorrect or missing!'
        })
    }

    try {
        const ctaURL = new URL(import.meta.env.CTA_FOLLOW)

        ctaURL.searchParams.append('key', import.meta.env.CTA_KEY)
        ctaURL.searchParams.append('runnumber', String(runNumber))

        const data = await (await fetch(ctaURL)).json()

        // Verify (throw error when failed)
        const verifiedData = TrainFollowSchema.parse(data)

        return new Response(
            JSON.stringify(verifiedData), {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                    'Netlify-CDN-Cache-Control': 'no-store'
                }
            }
        )
    } catch(error: any) {
        console.error(error)

        return new Response(null, {
            status: 500
        })
    }
}) satisfies APIRoute