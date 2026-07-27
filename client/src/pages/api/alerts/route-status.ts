import type { APIRoute } from 'astro'
import * as z from 'zod'

// https://docs.astro.build/en/guides/on-demand-rendering/#enabling-on-demand-rendering
export const prerender = false

// https://www.transitchicago.com/assets/1/6/cta_Customer_Alerts_API_Developer_Guide_and_Documentation_20160929.pdf
export const CustomerAlertsRouteStatusSchema = z.object({
    CTARoutes: z.object({
        TimeStamp: z.string(),
        ErrorCode: z.string(),
        ErrorMessage: z.nullable(z.string()),
        RouteInfo: z.array(z.object({
            Route: z.string(),
            RouteColorCode: z.string(),
            RouteTextColor: z.string(),
            ServiceId: z.string(),
            RouteURL: z.object({
                "#cdata-section": z.string()
            }),
            RouteStatus: z.string(),
            RouteStatusColor: z.string()
        }))
    })
})

export const GET = (async (args) => {
    try {
        const ctaURL = new URL(import.meta.env.CTA_ALERT_ROUTE_STATUS)

        const data = await (await fetch(ctaURL)).json()

        // Verify (throw error when failed)
        const verifiedData = CustomerAlertsRouteStatusSchema.parse(data)

        return new Response(
            JSON.stringify(verifiedData)
    )
    } catch(error: any) {
        console.error(error)

        return new Response(null, {
            status: 500
        })
    }
}) satisfies APIRoute