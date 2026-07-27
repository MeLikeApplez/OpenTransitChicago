import { 
    type TrainLines, type RouteDirectionCodeType,
    BlueRGB, BrownRGB, GreenRGB, PurpleExpressRGB, PurpleRGB, YellowRGB, PinkRGB, OrangeRGB, RedRGB, UnknownRGB 
} from './Constants'
import { TrainFollowSchema } from '../pages/api/train/follow'
import { type ColorInstance } from 'color'
import * as z from 'zod'

export default class FollowTrain {
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

    constructor(train: z.infer<typeof TrainFollowSchema>){
        const eta = train.ctatt.eta[0]
        const position = train.ctatt.position

        this.arrivalTime = new Date(eta.arrT)

        this.bound = eta.destNm
        this.boundStopId = eta.destSt

        this.heading = position.heading

        this.isApproaching = eta.isApp === '1'
        this.isDelayed = eta.isDly === '1'
        this.hasFault = eta.isFlt === '1'
        this.onSchedule = eta.isSch === '1'

        this.latitude = position.lat ? parseFloat(position.lat) : null
        this.longitude = position.lon ? parseFloat(position.lon) : null

        this.predictionTime = new Date(eta.prdt)

        this.runNumber = eta.rn
        this.line = null
        
        this.stationId = eta.staId
        this.stationName = eta.staNm

        this.routeDirectionCode = eta.trDr as RouteDirectionCodeType
        this.serviceTowards = eta.stpDe

        switch(eta.rt) {
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