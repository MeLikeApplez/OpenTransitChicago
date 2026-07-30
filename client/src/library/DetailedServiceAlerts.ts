import { CustomerAlertsDetailedServiceSchema } from '../pages/api/alerts/detailed'
import Color, { type ColorInstance } from 'color'
import * as z from 'zod'

export default class DetailedServiceAlerts {
    type: string
    typeDescription: string
    name: string
    id: string
    backColor: ColorInstance
    textColor: ColorInstance

    constructor(info: z.infer<typeof CustomerAlertsDetailedServiceSchema>) {
        this.type = info.ServiceType
        this.typeDescription = info.ServiceTypeDescription
        this.name = info.ServiceName
        this.id = info.ServiceId
        this.backColor = Color('#' + info.ServiceBackColor)
        this.textColor = Color('#' + info.ServiceTextColor)
    }
}