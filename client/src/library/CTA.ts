import {
    BlueRGB, BrownRGB, GreenRGB, PurpleExpressRGB, PurpleRGB, YellowRGB, PinkRGB, OrangeRGB, RedRGB, UnknownRGB
 } from './Constants'
import TrainStation, { TrainStationRoutesSchema } from './TrainStation'
import TrainRail, { TrainRailLinesGeoJSONSchema  } from './TrainRail'
import JSONFetch from './JSONFetch'
import * as z from 'zod'

import { TrainFollowSchema } from '../pages/api/train/follow'
import {TrainArrivalsSchema } from '../pages/api/train/arrivals'
import TrainFollow from './TrainFollow'
import TrainArrival from './TrainArrivals'
import type { CustomerAlertsRouteStatusSchema } from '../pages/api/alerts/route-status'
import RouteStatusAlerts from './RouteStatusAlerts'
import type { CustomerAlertsDetailedSchema } from '../pages/api/alerts/detailed'
import DetailedTrainAlerts from './DetailedTrainAlerts'

const PUBLIC_API = import.meta.env.DEV ? import.meta.env.PUBLIC_API_DEV : import.meta.env.PUBLIC_API_PROD

interface CTA_CACHE {
    trainStationRoutes: TrainStation[] | null
    alertsDetailed: any | null
    geoTrainRails: z.infer<typeof TrainRailLinesGeoJSONSchema> | null
    trainRails: TrainRail[] | null
}

export default class CTA {
    static CACHE: CTA_CACHE = {
        trainStationRoutes: null,
        alertsDetailed: null,
        geoTrainRails: null,
        trainRails: null
    }

    // https://stackoverflow.com/a/1020202/13159492
    static calculateCartesianFromLatLng(latitude: number, longitude: number, width: number, height: number) {
        const y = (latitude + 90) * (height / 180)
        const x = (longitude + 180) * (width / 360)
        return { x, y }
    }

    /**
     * @link {https://stackoverflow.com/a/60465578/13159492}
     */
    static calculateGeoDistance(lat1: number, lon1: number, lat2: number, lon2: number, unit: 'kilometer' | 'mile') {
        if ((lat1 == lat2) && (lon1 == lon2)) return 0
        const radlat1 = Math.PI * lat1/180
        const radlat2 = Math.PI * lat2/180
        const theta = lon1-lon2
        const radtheta = Math.PI * theta/180
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
        
        if (dist > 1) dist = 1
        
        dist = Math.acos(dist)
        dist *= 180/Math.PI
        dist *= 60 * 1.1515
        
        if (unit=="kilometer") {
            dist *= 1.609344
        } else if (unit=="mile") {
            // dist *= 0.8684 * 1.151
            dist *= 0.9995284
        }

        return dist
    }

    static getTrainRailColor(rail: z.infer<typeof TrainRailLinesGeoJSONSchema>['features'][number]) {
        switch(rail.properties.legend.toUpperCase()) {
            case 'BL':
                return BlueRGB
            case 'BR':
                return BrownRGB
            case 'GR':
                return GreenRGB
            case 'OR':
                return OrangeRGB
            case 'PK':
                return PinkRGB
            case 'PR':
                return PurpleRGB
            case 'RD':
                return RedRGB
            case 'YL':
                return YellowRGB
            default:
                return UnknownRGB
        }
    }

    static async getTrainRailLines(cache=true) {
        if(cache && CTA.CACHE.trainRails) {
            return [CTA.CACHE.trainRails, null]
        }

        const railLinesJSONData = (await import('../assets/CTA-RailLines.json'))
        const railLinesJSON = railLinesJSONData.default as z.infer<typeof TrainRailLinesGeoJSONSchema>

        const rails: TrainRail[] = []
        for(let i = 0; i < railLinesJSON.features.length; i++) {
            const rail = railLinesJSON.features[i]

            rails.push(
                new TrainRail(rail)
            )
        }

        if(cache) CTA.CACHE.trainRails = rails

        return [rails, null]
    }

    /*
    static async getGeoTrailRailLines(cache=true): Promisified<v.InferInput<typeof TrainRailLinesGeoJSONSchema>, Error> {
        if(cache && Transit.CACHE.geoTrainRails) {
            return [Transit.CACHE.geoTrainRails, null]
        }

        const railLinesURL = location.origin + '/CTA_RailLines.geojson'
        const [ railLinesJSON, railLinesJSONError ] = await FetchAPIData<v.InferInput<typeof TrainRailLinesGeoJSONSchema>>(railLinesURL, TrainRailLinesGeoJSONSchema)
        
        if(railLinesJSONError) return [null, railLinesJSONError]

        if(cache) Transit.CACHE.geoTrainRails = railLinesJSON

        return [railLinesJSON, null]
    }
    */

    static async getDetailedTrainAlerts(cache=true) {
        if(cache && this.CACHE.alertsDetailed) {
            return [this.CACHE.alertsDetailed, null]
        }
        
        const url = new URL(PUBLIC_API + '/alerts/detailed')
        
        const [ info, infoError ] = await JSONFetch<z.infer<typeof CustomerAlertsDetailedSchema>>(url)

        if(infoError) return [null, infoError]

        const alerts: DetailedTrainAlerts[] = []
        for(let i = 0; i < info.CTAAlerts.Alert.length; i++) {
            const data = info.CTAAlerts.Alert[i]

            alerts.push(
                new DetailedTrainAlerts(data)
            )
        }

        if(cache) this.CACHE.alertsDetailed = alerts

        return [alerts, null]
    }

    static async getRouteStatusAlerts() {
        const url = new URL(PUBLIC_API + '/alerts/route-status')
        
        const [ data, dataError ] = await JSONFetch<z.infer<typeof CustomerAlertsRouteStatusSchema>>(url)

        if(dataError) return [null, dataError]

        const routes = []
        for(let i = 0; i < data.CTARoutes.RouteInfo.length; i++) {
            const route = data.CTARoutes.RouteInfo[i]

            routes.push(
                new RouteStatusAlerts(route)
            )
        }

        return [routes, null]
    }

    static async followTrain(runNumber: string | number) {
        const url = new URL(PUBLIC_API + '/train/follow')

        url.searchParams.append('runNumber', String(runNumber))

        const [ data, dataError ] = await JSONFetch<z.infer<typeof TrainFollowSchema>>(url)

        if(dataError) return [null, dataError]

        const stations = []
        for(let i = 0; i < data.ctatt.eta.length; i++) {
            const { eta, position } = data.ctatt

            stations.push(
                new TrainFollow(eta[i], position)
            )
        }

        return [stations, null]
    }

    static async getTrainArrivals(mapId: string | number) {
        const url = new URL(PUBLIC_API + '/train/arrivals')

        url.searchParams.append('mapId', String(mapId))

        const [ data, dataError ] = await JSONFetch<z.infer<typeof TrainArrivalsSchema>>(url)

        if(dataError) return [null, dataError]

        const arrivals = []
        for(let i = 0; i < data.ctatt.eta.length; i++) {
            const arrival = data.ctatt.eta[i]

            arrivals.push(
                new TrainArrival(arrival)
            )
        }

        return [arrivals, null]
    }

    static async getAllTrainStationRoutes(cache=true) {
        if(cache && this.CACHE.trainStationRoutes) {
            return [this.CACHE.trainStationRoutes, null]
        }
        
        const importData = (await import('../assets/CTA-Routes.json'))
        const routes = (importData.default) as z.infer<typeof TrainStationRoutesSchema>[]

        const stations: TrainStation[] = []
        for(let i = 0; i < routes.length; i++) {
            const station = new TrainStation(routes[i])

            stations[i] = station
        }

        if(cache) this.CACHE.trainStationRoutes = stations

        return [stations, null]
    }
}