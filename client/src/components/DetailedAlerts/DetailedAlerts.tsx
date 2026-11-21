import { createEffect, createRenderEffect, createSignal, For, Match, onMount, Show, Switch } from 'solid-js'
import './DetailedAlerts.scss'

import CTA from '../../library/CTA'
import type { JSX } from 'solid-js/h/jsx-runtime'
import Color, { type ColorInstance } from 'color'
import { MapPin, ChevronLeft, TriangleExclamationPoint, RefreshCw, Navigation, OctagonExclamationPoint, Search, TramFront, CheckIcon, ClockIcon, Info, Bell } from 'lucide-solid'
import type TrainStation from '../../library/TrainStation'
import type TrainArrival from '../../library/TrainArrivals'
import { extractRGB, type RouteDirectionCodeType } from '../../library/Constants'
import type DetailedTrainAlerts from '../../library/DetailedTrainAlerts'
import type RouteStatusAlerts from '../../library/RouteStatusAlerts'

interface DetailedAlertsProps {
    trainAlerts: DetailedTrainAlerts[] | null
    routeStatus: RouteStatusAlerts[] | null
}

export function DetailedAlerts(props: DetailedAlertsProps) {
    const [ trainAlerts, setTrainAlerts ] = createSignal<DetailedTrainAlerts[]>([])

    createRenderEffect(() => {
        if(!props.trainAlerts) return

        setTrainAlerts([])

        for(const details of props.trainAlerts) {
            // R = train service, T = train station, B = bus service
            if(!details.impactedServices.some(v => v.type === 'R' || v.type === 'T')) {
                continue
            }

            setTrainAlerts(prev => [
                ...prev, details
            ])
        }

        setTrainAlerts(prev => {
            prev.sort((a, b) => b.severityScore - a.severityScore)
            
            return prev
        })
    })

    return <div class="Detailed-Alerts">
        <div class="route">
            <For each={props.routeStatus}>
                {(line) => {
                    const color = extractRGB(line.color)
                    const statusColor = extractRGB(line.statusColor)
                    const statusLowerCase = line.status.toLowerCase()

                    return <div class="line" style={{
                            'border-color': color.toString()
                        }}>
                        <div class='name' style={{
                            'background-color': color.fade(0.8).toString(),
                            'border-color': color.toString()
                        }}>{ line.route }</div>
                        <div class='status'>
                            <Switch fallback={
                                <div class='dot' style={{
                                    'background-color': statusColor.toString()
                                }}></div>
                            }>
                                <Match when={statusLowerCase === 'normal service'}>
                                    <CheckIcon stroke-width='2.5' class='icon-check' />
                                </Match>
                                <Match when={statusLowerCase === 'planned work'}>
                                    <Info color='rgb(80, 120, 250)' />
                                </Match>
                                <Match when={statusLowerCase === 'minor delays'}>
                                    <TriangleExclamationPoint class='icon-warning' />
                                </Match>
                            </Switch>
                            { line.status }
                        </div>
                    </div>
                }}
            </For>
        </div>
        <div class='alerts'>
            <For each={trainAlerts()}>
                {(train) => {
                    const color = extractRGB(train.severityColor)
                    const brightenSeverityColor = color.lighten(1).toString()

                    return <div class='details' style={{
                            'border-color': train.severityScore > 20 ? color.toString() : ''
                        }}>
                        <div class="headline">
                            <Switch>
                                <Match when={train.severityRating === 'medium'}>
                                     <Bell size="2rem" class='icon-warning' />
                                </Match>
                                <Match when={train.severityRating === 'high'}>
                                    <TriangleExclamationPoint size='1.75rem' color={brightenSeverityColor.toString()} ></TriangleExclamationPoint>
                                </Match>
                                <Match when={train.severityRating === 'severe'}>
                                    <OctagonExclamationPoint size='1.75rem'color={brightenSeverityColor.toString()} ></OctagonExclamationPoint>
                                </Match>
                            </Switch>
                            { train.headline }
                        </div>
                        <h3>
                            <Info color='rgb(80, 120, 250)' />
                            { train.impact }
                        </h3>
                        <div class='impacted-services'>
                            <For each={train.impactedServices}>
                                {(service) => {
                                    const serviceColor = extractRGB(service.backColor)
                                    const textColor = extractRGB(service.textColor)

                                    return <div class="service" style={{
                                        'background-color': serviceColor.toString(),
                                        'color': textColor.toString()
                                    }}>
                                        { service.name }
                                    </div>
                                }}
                            </For>
                        </div>
                        <div>{ train.shortDescription }</div>
                    </div>
                }}
            </For>
        </div>
    </div>
}