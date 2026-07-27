import type { APIRoute } from 'astro'
import * as z from 'zod'

// https://docs.astro.build/en/guides/on-demand-rendering/#enabling-on-demand-rendering
export const prerender = false

const CustomerAlertsDetailedServiceSchema = z.object({
    ServiceType: z.string(),
    ServiceTypeDescription: z.string(),
    ServiceName: z.string(),
    ServiceId: z.string(),
    ServiceBackColor: z.string(),
    ServiceTextColor: z.string(),
    ServiceURL: z.object({
        "#cdata-section": z.string()
    })
})

// https://www.transitchicago.com/assets/1/6/cta_Customer_Alerts_API_Developer_Guide_and_Documentation_20160929.pdf
const CustomerAlertsDetailedSchema = z.object({
    CTAAlerts: z.object({
        TimeStamp: z.string(),
        ErrorCode: z.string(),
        ErrorMessage: z.nullable(z.string()),
        Alert: z.array(z.object({
            AlertId: z.string(),
            Headline: z.string(),
            ShortDescription: z.string(),
            FullDescription: z.object({
                "#cdata-section": z.string()
            }),
            SeverityScore: z.string(),
            SeverityColor: z.string(),
            SeverityCSS: z.string(),
            Impact: z.string(),
            EventStart: z.nullable(z.string()),
            EventEnd: z.nullable(z.string()),
            TBD: z.string(),
            MajorAlert: z.string(),
            AlertURL: z.object({
                "#cdata-section": z.string()
            }),
            ImpactedService: z.object({
                 Service: z.union([
                    z.array(CustomerAlertsDetailedServiceSchema),
                    CustomerAlertsDetailedServiceSchema
                ])
            })
        }))
    })
})

export const GET = (async (args) => {
    try {
        const ctaURL = new URL(import.meta.env.CTA_ALERT_DETAILED)

        const data = await (await fetch(ctaURL)).json()

        // Verify (throw error when failed)
        CustomerAlertsDetailedSchema.parse(data)

        return new Response(
            JSON.stringify(data)
    )
    } catch(error: any) {
        console.error(error)

        return new Response(null, {
            status: 500
        })
    }
}) satisfies APIRoute