import * as v from 'valibot'

export const TrainRailLinesGeoJSONSchema = v.object({
    features: v.array(v.object({
        geometry: v.object({
            coordinates: v.array(v.array(v.array(v.number()))),
            type: v.string()
        }),
        properties: v.object({
            ':created_at': v.string(),
            ':id': v.string(),
            ':updated_at': v.string(),
            ':version': v.string(),
            description: v.string(),
            legend: v.string(),
            lines: v.string(),
            shape_len: v.string(),
            type: v.string(),
        }),
        type: v.string()
    })),
    type: v.string()
})

export const CustomerAlertsDetailedServiceSchema = v.object({
    ServiceType: v.string(),
    ServiceTypeDescription: v.string(),
    ServiceName: v.string(),
    ServiceId: v.string(),
    ServiceBackColor: v.string(),
    ServiceTextColor: v.string(),
    ServiceURL: v.object({
        "#cdata-section": v.string()
    })
})

// https://www.transitchicago.com/assets/1/6/cta_Customer_Alerts_API_Developer_Guide_and_Documentation_20160929.pdf
export const CustomerAlertsDetailedSchema = v.object({
    CTAAlerts: v.object({
        TimeStamp: v.string(),
        ErrorCode: v.string(),
        ErrorMessage: v.nullable(v.string()),
        Alert: v.array(v.object({
            AlertId: v.string(),
            Headline: v.string(),
            ShortDescription: v.string(),
            FullDescription: v.object({
                "#cdata-section": v.string()
            }),
            SeverityScore: v.string(),
            SeverityColor: v.string(),
            SeverityCSS: v.string(),
            Impact: v.string(),
            EventStart: v.nullable(v.string()),
            EventEnd: v.nullable(v.string()),
            TBD: v.string(),
            MajorAlert: v.string(),
            AlertURL: v.object({
                "#cdata-section": v.string()
            }),
            ImpactedService: v.object({
                 Service: v.union([
                    v.array(CustomerAlertsDetailedServiceSchema),
                    CustomerAlertsDetailedServiceSchema
                ])
            })
        }))
    })
})

// https://www.transitchicago.com/assets/1/6/cta_Customer_Alerts_API_Developer_Guide_and_Documentation_20160929.pdf
export const CustomerAlertsRouteStatusSchema = v.object({
    CTARoutes: v.object({
        TimeStamp: v.string(),
        ErrorCode: v.string(),
        ErrorMessage: v.nullable(v.string()),
        RouteInfo: v.array(v.object({
            Route: v.string(),
            RouteColorCode: v.string(),
            RouteTextColor: v.string(),
            ServiceId: v.string(),
            RouteURL: v.object({
                "#cdata-section": v.string()
            }),
            RouteStatus: v.string(),
            RouteStatusColor: v.string()
        }))
    })
})

// https://data.cityofchicago.org/Transportation/CTA-System-Information-List-of-L-Stops/8pix-ypme/data_preview
export const TrainStationRoutesSchema = v.array(
    v.object({
        stop_id: v.string(),
        direction_id: v.string(),
        stop_name: v.string(),
        station_name: v.string(),
        station_descriptive_name: v.string(),
        map_id: v.string(),
        ada: v.boolean(),
        red: v.boolean(),
        blue: v.boolean(),
        g: v.boolean(),
        brn: v.boolean(),
        p: v.boolean(),
        pexp: v.boolean(),
        y: v.boolean(),
        pnk: v.boolean(),
        o: v.boolean(),
        location: v.object({
            latitude: v.string(),
            longitude: v.string(),
            human_address: v.string()
        })
    })
)

// https://www.transitchicago.com/developers/ttdocs/#_Toc296199903
export const TrainArrivalsSchema = v.object({
    ctatt: v.object({
        tmst: v.string(),
        errCd: v.string(),
        errNm: v.nullable(v.string()),
        eta: v.array(v.object({
            staId: v.string(), stpId: v.string(), staNm: v.string(), stpDe: v.string(),
            rn: v.string(), rt: v.string(),
            destSt: v.string(), destNm: v.string(),
            trDr: v.string(),
            prdt: v.string(),
            arrT: v.string(),
            isApp: v.string(), isSch: v.string(), isDly: v.string(), isFlt: v.string(),
            flags: v.nullable(v.string()),
            lat: v.nullable(v.string()), lon: v.nullable(v.string()),
            heading: v.nullable(v.string()),
        }))
    })
})

// https://www.transitchicago.com/developers/ttdocs/#followapi
export const TrainFollowSchema = v.object({
    ctatt: v.object({
        tmst: v.string(),
        errCd: v.string(),
        errNm: v.nullable(v.string()),
        position: v.object({
            lat: v.nullable(v.string()), lon: v.nullable(v.string()),
            heading: v.nullable(v.string()),
        }),
        eta: v.array(v.object({
            staId: v.string(), stpId: v.string(), staNm: v.string(), stpDe: v.string(),
            rn: v.string(), rt: v.string(),
            destSt: v.string(), destNm: v.string(),
            trDr: v.string(),
            prdt: v.string(),
            arrT: v.string(),
            isApp: v.string(), isSch: v.string(), isDly: v.string(), isFlt: v.string(),
            flags: v.nullable(v.string()),
        }))
    })
})

// https://www.transitchicago.com/develope rs/ttdocs/#locations
export const TrainLocations = v.object({
    ctatt: v.object({
        tmst: v.string(),
        errCd: v.string(),
        errNm: v.nullable(v.string()),
        route: v.array(v.object({
            train: v.array(v.object({
                rn: v.string(),
                destSt: v.string(), destNm: v.string(),
                trDr: v.string(),
                nextStaId: v.string(), nextStpId: v.string(), nextStaNm: v.string(),
                prdt: v.string(),
                arrT: v.string(),
                isApp: v.string(), isDly: v.string(),
                flags: v.nullable(v.string()),
                lat: v.nullable(v.string()), lon: v.nullable(v.string()),
                heading: v.nullable(v.string()),
            }))
        }))
    })
})
