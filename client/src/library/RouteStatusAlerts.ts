import { CustomerAlertsRouteStatusSchema } from '../pages/api/alerts/route-status'
import Color, { type ColorInstance } from 'color'
import * as z from 'zod'

type InfoType = z.infer<typeof CustomerAlertsRouteStatusSchema>
type RouteInfoType = InfoType['CTARoutes']['RouteInfo'][number]

export default class RouteStatusAlerts {
    route: string
    color: ColorInstance
    textColor: ColorInstance
    serviceId: string
    status: string
    statusColor: ColorInstance

    constructor(RouteInfo: RouteInfoType) {
        this.route = RouteInfo.Route
        this.color = Color('#' + RouteInfo.RouteColorCode)
        this.textColor = Color('#' + RouteInfo.RouteTextColor)
        this.serviceId = RouteInfo.ServiceId
        this.status = RouteInfo.RouteStatus
        this.statusColor = Color('#' + RouteInfo.RouteStatusColor)
    }
}