import * as v from 'valibot'
import { FetchAPIData, Promisify, type Promisified } from "./Utils"
import { Color } from './Colors'
import { CustomerAlertsDetailedSchema, CustomerAlertsDetailedServiceSchema, CustomerAlertsRouteStatusSchema, 
    TrainArrivalsSchema, TrainFollowSchema, TrainRailLinesGeoJSONSchema, TrainStationRoutesSchema } from './Schema'

const { PUBLIC_API_DEV, PUBLIC_API_PROD } = import.meta.env
const PUBLIC_API = import.meta.env.DEV ? PUBLIC_API_DEV : PUBLIC_API_PROD

export const RedRGB: Color = new Color(198, 12, 48)
export const BlueRGB: Color = new Color(50, 135, 240)
export const BrownRGB: Color = new Color(98, 54, 27)
export const GreenRGB: Color = new Color(0, 155, 58)
export const OrangeRGB: Color = new Color(229, 70, 28)
export const PinkRGB: Color = new Color(226, 126, 166)
export const PurpleRGB: Color = new Color(82, 35, 152)
export const PurpleExpressRGB: Color = new Color(172, 135, 252)
export const YellowRGB: Color = new Color(249, 227, 0)
export const UnknownRGB: Color = new Color(200, 200, 200)

export type TrainLines = 'Red' | 'Blue' | 'Brown' | 'Green' | 'Orange' | 'Pink' | 'Purple' | 'Purple-Express' | 'Yellow' | null

export class TrainStation {
    direction: string
    latitude: number
    longitude: number
    mapX: number
    mapY: number
    mapId: string
    stopId: string
    stopName: string
    name: string
    descriptiveName: string
    descriptiveInfo: string
    line: TrainLines
    rgb: Color
    
    constructor(station: v.InferInput<typeof TrainStationRoutesSchema.item>) {
        this.direction = station.direction_id
        
        this.latitude = parseFloat(station.location.latitude)
        this.longitude = parseFloat(station.location.longitude)

        this.mapX = !isNaN(this.longitude) ? (this.longitude + 180) / 360 : 0
        this.mapY = !isNaN(this.latitude) ? (-this.latitude + 90) / 180 : 0
    
        this.mapId = station.map_id
        this.stopId = station.stop_id
        this.stopName = station.stop_name

        this.name = station.station_name
        this.descriptiveName = station.station_descriptive_name
        this.descriptiveInfo = station.station_descriptive_name.match(/\(.*\)/g)?.[0] ?? ''
        
        if(station.blue) {
            this.line = 'Blue'
            this.rgb = BlueRGB
        } else if(station.g) {
            this.line = 'Green'
            this.rgb = GreenRGB
        } else if(station.brn) {
            this.line = 'Brown'
            this.rgb = BrownRGB
        } else if(station.p) {
            this.line = 'Purple'
            this.rgb = PurpleRGB
        } else if(station.pexp) {
            this.line = 'Purple-Express'
            this.rgb = PurpleExpressRGB
        } else if(station.y) {
            this.line = 'Yellow'
            this.rgb = YellowRGB
        } else if(station.pnk) {
            this.line = 'Pink'
            this.rgb = PinkRGB
        } else if(station.o) {
            this.line = 'Orange'
            this.rgb = OrangeRGB
        } else if(station.red) {
            this.line = 'Red'
            this.rgb = RedRGB
        }else {
            this.line = null
            this.rgb = UnknownRGB
        }
    }
}

export type RouteDirectionCodeType = '1' | '5'

export class TrainArrival {
    arrivalTime: Date
    bound: string
    boundStopId: string
    heading: string | null
    isApproaching: boolean
    isDelayed: boolean
    hasFault: boolean
    onSchedule: boolean
    latitude: number | null
    longitude: number | null
    predictionTime: Date
    runNumber: string
    line: TrainLines
    stationId: string
    stationName: string
    routeDirectionCode: RouteDirectionCodeType
    serviceTowards: string
    rgb: Color

    constructor(train: v.InferInput<typeof TrainArrivalsSchema.entries.ctatt.entries.eta.item>){
        this.arrivalTime = new Date(train.arrT)

        this.bound = train.destNm
        this.boundStopId = train.destSt

        this.heading = train.heading

        this.isApproaching = train.isApp === '1'
        this.isDelayed = train.isDly === '1'
        this.hasFault = train.isFlt === '1'
        this.onSchedule = train.isSch === '1'

        this.latitude = train.lat ? parseFloat(train.lat) : null
        this.longitude = train.lon ? parseFloat(train.lon) : null

        this.predictionTime = new Date(train.prdt)

        this.runNumber = train.rn
        this.line = null
        
        this.stationId = train.staId
        this.stationName = train.staNm

        this.routeDirectionCode = train.trDr as RouteDirectionCodeType
        this.serviceTowards = train.stpDe

        switch(train.rt) {
            case 'Red':
                this.rgb = RedRGB
                this.line = 'Red'

                break
            case 'Blue':
                this.rgb = BlueRGB
                this.line = 'Blue'

                break
            case 'Brn':
                this.rgb = BrownRGB
                this.line = 'Brown'

                break
            case 'G':
                this.rgb = GreenRGB
                this.line = 'Green'

                break
            case 'Org':
                this.rgb = OrangeRGB
                this.line = 'Orange'

                break
            case 'Pink':
                this.rgb = PinkRGB
                this.line = 'Pink'

                break
            case 'P':
                this.rgb = PurpleRGB
                this.line = 'Purple'

                break
            case 'Y':
                this.rgb = YellowRGB
                this.line = 'Yellow'

                break
            default:
                this.rgb = UnknownRGB
                this.line = null

                break
        }
    }

    isDue() {
        const timeLeft = this.getTimeLeft()
        
        if(this.isDelayed || timeLeft <= 0) {
            return false
        } else if(this.isApproaching || timeLeft <= 0.5) {
            return true
        }

        return false
    }

    getETA() {
        const timeLeft = this.getTimeLeft()
        const fault = this.hasFault ? '?' : ''
        
        if(this.isDelayed || timeLeft <= 0) {
            return 'Delayed' + fault
        } else if(this.isApproaching || timeLeft <= 0.5) {
            return 'Due' + fault
        }
        
        return `${Math.round(timeLeft)} min` + fault
    }

    getTimeLeft() {
        return (this.arrivalTime.getTime() - Date.now()) / 60000
    }

    getTimeStatus() {
        const timeLeft = this.getTimeLeft()
        const delayed =this.isDelayed || timeLeft <= 0
        let status: 'ON-TIME' | 'DELAYED' = 'ON-TIME'

        if(delayed) {
            status = 'DELAYED' 
        }

        return {
            status: status,
            delayed: delayed,
            fault: this.hasFault
        }
    }
}

export class FollowTrain {
    arrivalTime: Date
    bound: string
    boundStopId: string
    heading: string | null
    isApproaching: boolean
    isDelayed: boolean
    hasFault: boolean
    onSchedule: boolean
    latitude: number | null
    longitude: number | null
    predictionTime: Date
    runNumber: string
    line: TrainLines
    stationId: string
    stationName: string
    routeDirectionCode: RouteDirectionCodeType
    serviceTowards: string
    rgb: Color

    constructor(train: v.InferInput<typeof TrainFollowSchema.entries.ctatt.entries.eta.item>, position: v.InferInput<typeof TrainFollowSchema.entries.ctatt.entries.position>){
        this.arrivalTime = new Date(train.arrT)

        this.bound = train.destNm
        this.boundStopId = train.destSt

        this.heading = position.heading

        this.isApproaching = train.isApp === '1'
        this.isDelayed = train.isDly === '1'
        this.hasFault = train.isFlt === '1'
        this.onSchedule = train.isSch === '1'

        this.latitude = position.lat ? parseFloat(position.lat) : null
        this.longitude = position.lon ? parseFloat(position.lon) : null

        this.predictionTime = new Date(train.prdt)

        this.runNumber = train.rn
        this.line = null
        
        this.stationId = train.staId
        this.stationName = train.staNm

        this.routeDirectionCode = train.trDr as RouteDirectionCodeType
        this.serviceTowards = train.stpDe

        switch(train.rt) {
            case 'Red Line':
                this.rgb = RedRGB
                this.line = 'Red'

                break
            case 'Blue Line':
                this.rgb = BlueRGB
                this.line = 'Blue'

                break
            case 'Brown Line':
                this.rgb = BrownRGB
                this.line = 'Brown'

                break
            case 'Green Line':
                this.rgb = GreenRGB
                this.line = 'Green'

                break
            case 'Orange Line':
                this.rgb = OrangeRGB
                this.line = 'Orange'

                break
            case 'Pink Line':
                this.rgb = PinkRGB
                this.line = 'Pink'

                break
            case 'Purple Line':
                this.rgb = PurpleRGB
                this.line = 'Purple'

                break
            case 'Yellow Line':
                this.rgb = YellowRGB
                this.line = 'Yellow'

                break
            default:
                this.rgb = UnknownRGB
                this.line = null

                break
        }
    }

    isDue() {
        const timeLeft = this.getTimeLeft()
        
        if(this.isDelayed || timeLeft <= 0) {
            return false
        } else if(this.isApproaching || timeLeft <= 0.5) {
            return true
        }

        return false
    }

    getETA() {
        const timeLeft = this.getTimeLeft()
        const fault = this.hasFault ? '?' : ''
        
        if(this.isDelayed || timeLeft <= 0) {
            return 'Delayed' + fault
        } else if(this.isApproaching || timeLeft <= 0.5) {
            return 'Due' + fault
        }
        
        return `${Math.round(timeLeft)} min` + fault
    }

    getTimeLeft() {
        return (this.arrivalTime.getTime() - Date.now()) / 60000
    }

    getTimeStatus() {
        const timeLeft = this.getTimeLeft()
        const delayed =this.isDelayed || timeLeft <= 0
        let status: 'ON-TIME' | 'DELAYED' = 'ON-TIME'

        if(delayed) {
            status = 'DELAYED' 
        }

        return {
            status: status,
            delayed: delayed,
            fault: this.hasFault
        }
    }
}

export class CustomerAlertRouteStatus {
    route: string
    color: Color
    textColor: Color
    serviceId: string
    status: string
    statusColor: Color

    constructor(info: v.InferInput<typeof CustomerAlertsRouteStatusSchema.entries.CTARoutes.entries.RouteInfo.item>) {
        this.route = info.Route
        this.color = Color.parseHex('0x' + info.RouteColorCode)
        this.textColor = Color.parseHex('0x' + info.RouteTextColor)
        this.serviceId = info.ServiceId
        this.status = info.RouteStatus
        this.statusColor = Color.parseHex(info.RouteStatusColor)
    }
}

export class CustomerAlertsDetailedService {
    type: string
    typeDescription: string
    name: string
    id: string
    backColor: Color
    textColor: Color

    constructor(info: v.InferInput<typeof CustomerAlertsDetailedServiceSchema>) {
        this.type = info.ServiceType
        this.typeDescription = info.ServiceTypeDescription
        this.name = info.ServiceName
        this.id = info.ServiceId
        this.backColor = Color.parseHex('0x' + info.ServiceBackColor)
        this.textColor = Color.parseHex('0x' + info.ServiceTextColor)
    }
}

export type SeverityRating = 'low' | 'moderate' | 'medium' | 'high' | 'severe'

export interface SeverityRatingMap {
    low: CustomerAlertsDetailed[]
    moderate: CustomerAlertsDetailed[]
    medium: CustomerAlertsDetailed[]
    high: CustomerAlertsDetailed[]
    severe: CustomerAlertsDetailed[]
    lowestRank: SeverityRating | null
    highestRank: SeverityRating | null
}

export class CustomerAlertsDetailed {
    id: number
    headline: string
    shortDescription: string
    severityScore: number
    severityColor: Color
    severityRating: SeverityRating
    impact: string
    eventStart: Date | null
    eventEnd: Date | null
    TBD: boolean
    majorAlert: boolean
    impactedServices: CustomerAlertsDetailedService[]

    constructor(info: v.InferInput<typeof CustomerAlertsDetailedSchema.entries.CTAAlerts.entries.Alert.item>) {
        this.id = Number(info.AlertId)
        
        this.headline = info.Headline
        this.shortDescription = info.ShortDescription

        // 1-19    Accessibility and informational alerts
        // 20-39 Planned/anticipated events affecting bus and train service
        // 40-59 Minor delays and reroutes affecting bus and train service
        // 60-79 Significant delays and reroutes affecting bus and train service
        // 80-99 Major delays and service disruptions
        this.severityScore = Number(info.SeverityScore)
        this.severityColor = Color.parseHex('0x' + info.SeverityColor)
        this.severityRating = 'low'
        
        this.impact = info.Impact
        
        this.eventStart = info.EventStart !== null ? new Date(info.EventStart) : null
        this.eventEnd = info.EventEnd !== null ? new Date(info.EventEnd) : null
        
        this.TBD = info.TBD === '0'

        this.majorAlert = info.MajorAlert === '1'

        this.impactedServices = []

        const { low, moderate, medium, high, severe } = CustomerAlertsDetailed.severityRange

        if(this.severityScore >= low[0] && this.severityScore <= low[1]) {
            this.severityRating = 'low'
        } else if(this.severityScore >= moderate[0] && this.severityScore <= moderate[1]) {
            this.severityRating = 'moderate'
        } else if(this.severityScore >= medium[0] && this.severityScore <= medium[1]) {
            this.severityRating = 'medium'
        } else if(this.severityScore >= high[0] && this.severityScore <= high[1]) {
            this.severityRating = 'high'
        } else if(this.severityScore >= severe[0] && this.severityScore <= severe[1]) {
            this.severityRating = 'severe'
        }

        const services = Array.isArray(info.ImpactedService.Service) ? info.ImpactedService.Service : [info.ImpactedService.Service]

        for(let i = 0; i < services.length; i++) {
                const service = services[i]

                this.impactedServices.push(
                    new CustomerAlertsDetailedService(service)
                )
        }
    }

    static severityRange = {
        low: [1, 19],
        moderate: [20, 39],
        medium: [40, 59],
        high: [60, 79],
        severe: [80, 99],
    }

    static sortBySeverity(alerts: CustomerAlertsDetailed[]): SeverityRatingMap {
        const severity: SeverityRatingMap = {
            low: [],
            moderate: [],
            medium: [],
            high: [],
            severe: [],
            lowestRank: null,
            highestRank: null,
        }

        for(let i = 0; i < alerts.length; i++) {
            const details = alerts[i]

            switch(details.severityRating) {
                case 'low':
                    severity.low.push(details)

                    break
                case 'moderate':
                    severity.moderate.push(details)

                    break
                case 'medium':
                    severity.medium.push(details)

                    break
                case 'high':
                    severity.high.push(details)

                    break
                case 'severe':
                    severity.severe.push(details)

                    break
            }
        }

        if(severity.low.length >= 2) severity.low.sort((a, b) => b.severityScore - a.severityScore)
        if(severity.moderate.length >= 2) severity.moderate.sort((a, b) => b.severityScore - a.severityScore)
        if(severity.medium.length >= 2) severity.medium.sort((a, b) => b.severityScore - a.severityScore)
        if(severity.high.length >= 2) severity.high.sort((a, b) => b.severityScore - a.severityScore)
        if(severity.severe.length >= 2) severity.severe.sort((a, b) => b.severityScore - a.severityScore)

        if(severity.low.length !== 0) {
            severity.lowestRank = 'low'
        } else if(severity.moderate.length !== 0) {
            severity.lowestRank = 'moderate'
        } else if(severity.medium.length !== 0) {
            severity.lowestRank = 'medium'
        } else if(severity.high.length !== 0) {
            severity.lowestRank = 'high'
        } else if(severity.severe.length !== 0) {
            severity.lowestRank = 'severe'
        }

        if(severity.severe.length !== 0) {
            severity.highestRank = 'severe'
        } else if(severity.high.length !== 0) {
            severity.highestRank = 'high'
        } else if(severity.medium.length !== 0) {
            severity.highestRank = 'medium'
        } else if(severity.moderate.length !== 0) {
            severity.highestRank = 'moderate'
        } else if(severity.low.length !== 0) {
            severity.highestRank = 'low'
        }


        return severity
    }
}

export class TrainRail {
    coordinates: number[][]
    color: Color
    description: string
    legend: string
    // lines: string
    line: TrainLines
     detailedLine: string

    constructor(rail: v.InferInput<typeof TrainRailLinesGeoJSONSchema.entries.features.item>) {
        this.coordinates = rail.geometry.coordinates[0]
        this.description = rail.properties.description
        this.legend = rail.properties.legend
        this.detailedLine = rail.properties.lines
        this.line = null

        switch(rail.properties.legend.toUpperCase()) {
            case 'BL':
                this.color = BlueRGB
                this.line = 'Blue'
                break
            case 'BR':
                this.color = BrownRGB
                this.line = 'Brown'
                break
            case 'GR':
                this.color = GreenRGB
                this.line = 'Green'
                break
            case 'OR':
                this.color = OrangeRGB
                this.line = 'Orange'
                break
            case 'PK':
                this.color = PinkRGB
                this.line = 'Pink'
                break
            case 'PR':
                this.color = PurpleRGB
                this.line = 'Purple'
                break
            case 'RD':
                this.color = RedRGB
                this.line = 'Red'
                break
            case 'YL':
                this.color = YellowRGB
                this.line = 'Yellow'
                break
            default:
                this.color = UnknownRGB
        }
    }
}

interface TRANSIT_CACHE {
    trainStationRoutes: TrainStation[] | null
    alertsDetailed: any | null
    geoTrainRails: v.InferInput<typeof TrainRailLinesGeoJSONSchema> | null
    trainRails: TrainRail[] | null
}

export default class Transit {
    static CACHE: TRANSIT_CACHE = {
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

    // https://stackoverflow.com/a/60465578/13159492
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

    static getTrainRailColor(rail: v.InferInput<typeof TrainRailLinesGeoJSONSchema.entries.features.item>) {
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

    static async getTrainRailLines(cache=true): Promisified<TrainRail[], Error> {
        if(cache && Transit.CACHE.trainRails) {
            return [Transit.CACHE.trainRails, null]
        }

        const railLinesURL = location.origin + '/CTA_RailLines.geojson'
        const [ railLinesJSON, railLinesJSONError ] = await FetchAPIData<v.InferInput<typeof TrainRailLinesGeoJSONSchema>>(railLinesURL, TrainRailLinesGeoJSONSchema)
        
        if(railLinesJSONError) return [null, railLinesJSONError]

        const rails: TrainRail[] = []
        for(let i = 0; i < railLinesJSON.features.length; i++) {
            const rail = railLinesJSON.features[i]

            rails.push(
                new TrainRail(rail)
            )
        }

        if(cache) Transit.CACHE.trainRails = rails

        return [rails, null]
    }

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

    static async getCustomerAlertsDetailed(cache=true): Promisified<CustomerAlertsDetailed[], Error> {
        if(cache && this.CACHE.alertsDetailed) {
            return [this.CACHE.alertsDetailed, null]
        }
        
        const url = new URL(PUBLIC_API + '/alerts/detailed')
        
        const [ info, infoError ] = await FetchAPIData<v.InferInput<typeof CustomerAlertsDetailedSchema>>(url, CustomerAlertsDetailedSchema)

        if(infoError) return [null, infoError]

        const alerts: CustomerAlertsDetailed[] = []
        for(let i = 0; i < info.CTAAlerts.Alert.length; i++) {
            const data = info.CTAAlerts.Alert[i]

            alerts.push(
                new CustomerAlertsDetailed(data)
            )
        }

        if(cache) this.CACHE.alertsDetailed = alerts

        return [alerts, null]
    }

    static async getCustomerAlertsRouteStatus(): Promisified<CustomerAlertRouteStatus[], Error> {
        const url = new URL(PUBLIC_API + '/alerts/route-status')
        
        const [ data, dataError ] = await FetchAPIData<v.InferInput<typeof CustomerAlertsRouteStatusSchema>>(url, CustomerAlertsRouteStatusSchema)

        if(dataError) return [null, dataError]

        const routes = []
        for(let i = 0; i < data.CTARoutes.RouteInfo.length; i++) {
            const route = data.CTARoutes.RouteInfo[i]

            routes.push(
                new CustomerAlertRouteStatus(route)
            )
        }

        return [routes, null]
    }

    static async followTrain(runNumber: string | number): Promisified<FollowTrain[], Error> {
        const url = new URL(PUBLIC_API + '/train/follow')

        url.searchParams.append('runNumber', String(runNumber))

        const [ data, dataError ] = await FetchAPIData<v.InferInput<typeof TrainFollowSchema>>(url, TrainFollowSchema)

        if(dataError) return [null, dataError]

        const stations = []
        for(let i = 0; i < data.ctatt.eta.length; i++) {
            const station = data.ctatt.eta[i]

            stations.push(
                new FollowTrain(station, data.ctatt.position)
            )
        }

        return [stations, null]
    }

    static async getTrainArrivals(mapId: string | number): Promisified<TrainArrival[], Error> {
        const url = new URL(PUBLIC_API + '/train/arrivals')

        url.searchParams.append('mapId', String(mapId))

        const [ data, dataError ] = await FetchAPIData<v.InferInput<typeof TrainArrivalsSchema>>(url, TrainArrivalsSchema)

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

    static async getAllTrainStationRoutes(cache=true): Promisified<TrainStation[], Error> {
        if(cache && this.CACHE.trainStationRoutes) {
            return [this.CACHE.trainStationRoutes, null]
        }
        
        const importData = import('./CTA-Routes.json')

        interface ModuleData {
            default: v.InferInput<typeof TrainStationRoutesSchema>
        }

        const [ data, dataError ] = await Promisify<ModuleData, Error>(importData)

        if(dataError) return [null, dataError]
        const { success, output } = v.safeParse(TrainStationRoutesSchema, data.default)

        if(!success) return [null, new Error('Train Station verification failed!')]

        const stations: TrainStation[] = []
        for(let i = 0; i < output.length; i++) {
            const station = new TrainStation(output[i])

            stations[i] = station
        }

        if(cache) this.CACHE.trainStationRoutes = stations

        return [stations, null]
    }
}