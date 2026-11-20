import { createEffect, createRenderEffect, createSignal, For, Match, onMount, Show, Switch } from 'solid-js'
import { unwrap } from 'solid-js/store'
import './TrainArrivals.scss'

import CTA from '../../library/CTA'
import type { JSX } from 'solid-js/h/jsx-runtime'
import Color, { type ColorInstance } from 'color'
import { MapPin, ChevronLeft, TriangleExclamationPoint, RefreshCw, Navigation, OctagonExclamationPoint, Search, TramFront, CheckIcon, ClockIcon } from 'lucide-solid'
import type TrainStation from '../../library/TrainStation'
import type TrainArrival from '../../library/TrainArrivals'
import type { RouteDirectionCodeType } from '../../library/Constants'
import TrainFollow from '../../library/TrainFollow'

interface ServiceTorwardsGroupProps {
    towards: string
    routeDirectionCode: RouteDirectionCodeType
    trains: TrainArrival[]
    station: TrainStation | null | undefined
}

function ServiceTorwardsGroup(props: ServiceTorwardsGroupProps) {
    // @ts-ignore
    const _rgb = props.station.rgb.color as [number, number, number]
    const bgColor = Color({ r: _rgb[0], g: _rgb[1], b: _rgb[2] }).darken(0.2)

    function redirect(runNumber: string) {
        if(!props.station) return
        const url = new URL(location.origin + '/train')

        url.searchParams.set('runNumber', runNumber)

        location.assign(url)
    }

    return <div class="Service-Towards-Group">
        <header>
            <TramFront></TramFront>
            { props.towards }
        </header>
        <For each={props.trains}>
            {(train) => {
                const etaDate = new Intl.DateTimeFormat('en-us', {
                    timeStyle: 'short'
                }).format(train.arrivalTime)
                const { status } = TrainFollow.getTimeStatus(train)
                const statusIcon = status === 'ON-TIME' ? <CheckIcon stroke-width='2.5' class='icon-check' /> : <OctagonExclamationPoint stroke-width='2.5' class='icon-error' />

                return (
                    <div class="train" style={{
                        animation: TrainFollow.isDue(train) ? 'Flashing 1s infinite alternate ease-in-out' : 'none'
                    }} onclick={() => redirect(train.runNumber)}>
                        <div class="details" style={{
                            'background-color': bgColor.toString()
                        }}>
                            <div class="line">{ train.line } Line #{ train.runNumber }</div>
                            <div class="name">{ train.bound }</div>
                            <div class="eta">{ TrainFollow.getETA(train) }</div>
                        </div>

                        <div class="arrival" style={{
                            'background-color': bgColor.darken(0.6).toString()
                        }}>
                            <div class="status">
                                <span>{ status }</span>
                                { statusIcon }
                            </div>
                            <div class="eta-date" style={{
                                color: status === 'DELAYED' ?'rgb(250, 80, 80)' : '',
                                'text-decoration': status === 'DELAYED' ? 'line-through' : ''
                            }}>
                                <span>{ etaDate }</span>
                                <ClockIcon stroke-width='2.5' class='icon-clock' style={{ padding: '0 0.5rem' }}></ClockIcon>
                            </div>
                        </div>
                    </div>
                )
            }}
        </For>
    </div>
}

interface TrainArrivalListProps {
    // arrivals: TrainArrival[] | null
    station: TrainStation | null | undefined
}

interface BoundMap {
    towards: string
    routeDirectionCode: RouteDirectionCodeType
    trains: TrainArrival[]
}

const VISIBILITY_RELOAD_MS = 3000
const VISIBILITY_INTERVAL_MS = 30000
export function TrainArrivalList(props: TrainArrivalListProps) {
    let _visibilityTimer = -1
    let _visibilityInterval = -1
    
    const [ serviceTo, setServiceTo ] = createSignal<BoundMap[]>([], { equals: false })
    const [ loadingStatus, setLoadingStatus ] = createSignal<'ready' | 'loading' | 'error'>('loading')
    
    async function refresh(fetchNewArrivals=false) {
        // fetchNewArrivals = true
        // let arrivals = props.arrivals

        // if(fetchNewArrivals) {
        //     const [ newArrivals, newArrivalsError ] = await CTA.getTrainArrivals(props.station!.mapId)
            
        //     arrivals = newArrivals
        // } else {
        //     setLoadingStatus('loading')
        // }
        
        if(!fetchNewArrivals) setLoadingStatus('loading')

        const [ arrivals ] = await CTA.getTrainArrivals(props.station!.mapId)

        if(!arrivals) {
            setLoadingStatus('error')

            return
        }

        const boundMap = new Map<RouteDirectionCodeType, BoundMap>()
        for(const train of arrivals) {
            if(!boundMap.has(train.routeDirectionCode)) {
                boundMap.set(train.routeDirectionCode, {
                    towards: train.serviceTowards,
                    routeDirectionCode: train.routeDirectionCode,
                    trains: [train]
                })

                continue
            }

            const bound = boundMap.get(train.routeDirectionCode)
            
            if(!bound) continue
        
            bound.trains.push(train)
            
            setLoadingStatus('ready')
        }

        const boundMapValues = Array.from(boundMap.values())

        boundMapValues.sort((a, b) => a.routeDirectionCode < b.routeDirectionCode ? -1 : 1)

        setServiceTo(boundMapValues)
    }
    
    createRenderEffect(() => {
        refresh()
    })

    onMount(() => {
        document.onvisibilitychange = () => {
            if(document.visibilityState === 'hidden') {
                clearInterval(_visibilityInterval)
                
                return
            }
            if(performance.now() - _visibilityTimer < VISIBILITY_RELOAD_MS) return
            
            clearInterval(_visibilityInterval)
            
            if(_visibilityInterval !== -1) refresh(true)
            _visibilityInterval = setInterval(() => refresh(true), VISIBILITY_INTERVAL_MS)

            _visibilityTimer = performance.now()
        }

        if(_visibilityInterval !== -1) refresh(true)
        _visibilityInterval = setInterval(() => refresh(true), VISIBILITY_INTERVAL_MS)
    })
    
    return <div class="Train-Arrival-List">
        <Switch fallback={0}>
            <Match when={loadingStatus() === 'loading'}>
                <h1 class='loading'>
                    <RefreshCw size='2rem' class='icon-refresh'></RefreshCw>
                    Loading Train Data...
                </h1>
            </Match>
            <Match when={loadingStatus() === 'ready'}>
                <For each={serviceTo()}>
                    {
                        (item) => <ServiceTorwardsGroup trains={item.trains} towards={item.towards} 
                            routeDirectionCode={item.routeDirectionCode} station={props.station}></ServiceTorwardsGroup>
                    }
                </For>
            </Match>
            <Match when={loadingStatus() === 'error'}>
                <h1 class='error'>
                    <OctagonExclamationPoint size='2rem' class='icon-error'></OctagonExclamationPoint>
                    Failed to find trains! Service may be unavailable...
                </h1>
            </Match>
        </Switch>
    </div>
}

interface TrainArrivalTitleProps {
    station: TrainStation | null | undefined
}

export function TrainArrivalTitle(props: TrainArrivalTitleProps) {
    const [ color, setColor ] = createSignal(Color('rgb(25, 25, 25)'))
    const [ descriptiveInfo, setDescriptiveInfo ] = createSignal('')
    const [ stationName, setStationName ] = createSignal('')
    const [ hasFailed, setHasFailed ] = createSignal(false)
    
    createRenderEffect(() => {
        if(!props.station) {
            console.error('Cannot find station!')
            setHasFailed(true)

            return
        }

        // @ts-ignore
        const _rgb = props.station.rgb.color as [number, number, number]

        setColor(Color({ r: _rgb[0], g: _rgb[1], b: _rgb[2] }))
        setDescriptiveInfo(props.station.descriptiveInfo)
        setStationName(props.station.name + ' Station')
    })

    return <header class='Train-Arrival-Title' style={{
        'border-color': color().toString()
    }}>
        <Switch fallback={
            <h1 class='loading'>
                <RefreshCw size='2rem' class='icon-refresh'></RefreshCw>
                Loading Station Data...
            </h1>
        }>
            <Match when={!hasFailed() && stationName().length !== 0}>
                <div class='descriptive-info' style={{
                    color: color().toString()
                }}>{ descriptiveInfo() }</div> 
                <div>{ stationName() }</div>
            </Match>
            <Match when={hasFailed()}>
                <h1 class='error'>
                    <OctagonExclamationPoint size='2rem' class='icon-error'></OctagonExclamationPoint>
                    Failed to find station!
                </h1>
            </Match>
        </Switch>
    </header>
}