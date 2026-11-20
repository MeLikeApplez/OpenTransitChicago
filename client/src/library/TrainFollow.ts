import { 
    type TrainLines, type RouteDirectionCodeType,
    BlueRGB, BrownRGB, GreenRGB, PurpleExpressRGB, PurpleRGB, YellowRGB, PinkRGB, OrangeRGB, RedRGB, UnknownRGB, 
} from './Constants'
import { TrainFollowSchema } from '../pages/api/train/follow'
import Color, { type ColorInstance } from 'color'
import * as z from 'zod'

type ETAType = z.infer<typeof TrainFollowSchema>['ctatt']['eta'][number]
type PositionType = z.infer<typeof TrainFollowSchema>['ctatt']['position']

export default class TrainFollow {
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
    rgb: ColorInstance

    constructor(station: ETAType, position: PositionType){
        this.arrivalTime = new Date(station.arrT)

        this.bound = station.destNm
        this.boundStopId = station.destSt

        this.heading = position.heading

        this.isApproaching = station.isApp === '1'
        this.isDelayed = station.isDly === '1'
        this.hasFault = station.isFlt === '1'
        this.onSchedule = station.isSch === '1'

        this.latitude = position.lat ? parseFloat(position.lat) : null
        this.longitude = position.lon ? parseFloat(position.lon) : null

        this.predictionTime = new Date(station.prdt)

        this.runNumber = station.rn
        this.line = null
        
        this.stationId = station.staId
        this.stationName = station.staNm

        this.routeDirectionCode = station.trDr as RouteDirectionCodeType
        this.serviceTowards = station.stpDe

        switch(station.rt) {
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

    static getColor(train: TrainFollow) {
        // @ts-ignore
        const _rgb = train.rgb.color as [number, number, number]

        return Color({ r: _rgb[0], g: _rgb[1], b: _rgb[2] })
    }

    static isDue(train: TrainFollow) {
        const timeLeft = TrainFollow.getTimeLeft(train)
        
        if(train.isDelayed || timeLeft <= 0) {
            return false
        } else if(train.isApproaching || timeLeft <= 0.5) {
            return true
        }

        return false
    }

    static getETA(train: TrainFollow) {
        const timeLeft = TrainFollow.getTimeLeft(train)
        const fault = train.hasFault ? '?' : ''
        
        if(train.isDelayed || timeLeft <= 0) {
            return 'Delayed' + fault
        } else if(train.isApproaching || timeLeft <= 0.5) {
            return 'Due' + fault
        }
        
        return `${Math.round(timeLeft)} min` + fault
    }

    static getTimeLeft(train: TrainFollow) {
        return (train.arrivalTime.getTime() - Date.now()) / 60000
    }

    static getTimeStatus(train: TrainFollow) {
        const timeLeft = TrainFollow.getTimeLeft(train)
        const delayed =train.isDelayed || timeLeft <= 0
        let status: 'ON-TIME' | 'DELAYED' = 'ON-TIME'

        if(delayed) {
            status = 'DELAYED' 
        }

        return {
            status: status,
            delayed: delayed,
            fault: train.hasFault
        }
    }
}