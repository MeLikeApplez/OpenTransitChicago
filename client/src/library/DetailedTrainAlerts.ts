import { CustomerAlertsDetailedSchema } from '../pages/api/alerts/detailed'
import DetailedServiceAlerts from './DetailedServiceAlerts'
import Color, { type ColorInstance } from 'color'
import { type SeverityRating, type SeverityRatingMap } from './Constants'
import * as z from 'zod'

type InfoType = z.infer<typeof CustomerAlertsDetailedSchema>
type AlertType = InfoType['CTAAlerts']['Alert'][number]

export default class DetailedTrainAlerts {
    id: number
    headline: string
    shortDescription: string
    severityScore: number
    severityColor: ColorInstance
    severityRating: SeverityRating
    impact: string
    eventStart: Date | null
    eventEnd: Date | null
    TBD: boolean
    majorAlert: boolean
    impactedServices: DetailedServiceAlerts[]

    constructor(Alert: AlertType) {
        this.id = Number(Alert.AlertId)
        
        this.headline = Alert.Headline
        this.shortDescription = Alert.ShortDescription

        // 1-19    Accessibility and informational alerts
        // 20-39 Planned/anticipated events affecting bus and train service
        // 40-59 Minor delays and reroutes affecting bus and train service
        // 60-79 Significant delays and reroutes affecting bus and train service
        // 80-99 Major delays and service disruptions
        this.severityScore = Number(Alert.SeverityScore)
        this.severityColor = Color('#' + Alert.SeverityColor)
        this.severityRating = 'low'
        
        this.impact = Alert.Impact
        
        this.eventStart = Alert.EventStart !== null ? new Date(Alert.EventStart) : null
        this.eventEnd = Alert.EventEnd !== null ? new Date(Alert.EventEnd) : null
        
        this.TBD = Alert.TBD === '0'

        this.majorAlert = Alert.MajorAlert === '1'

        this.impactedServices = []

        const { low, moderate, medium, high, severe } = DetailedTrainAlerts.severityRange

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

        const services = Array.isArray(Alert.ImpactedService.Service) ? Alert.ImpactedService.Service : [Alert.ImpactedService.Service]

        for(let i = 0; i < services.length; i++) {
                const service = services[i]

                this.impactedServices.push(
                    new DetailedServiceAlerts(service)
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

    static sortBySeverity(alerts: DetailedTrainAlerts[]): SeverityRatingMap {
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