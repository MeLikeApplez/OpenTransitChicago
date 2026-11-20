import { createEffect, createRenderEffect, createSignal, For, Match, onMount, Show, Switch } from 'solid-js'
import { unwrap } from 'solid-js/store'
import './TrainFollow.scss'

import CTA from '../../library/CTA'
import type { JSX } from 'solid-js/h/jsx-runtime'
import Color, { type ColorInstance } from 'color'
import { MapPin, ChevronLeft, TriangleExclamationPoint, RefreshCw, Navigation, OctagonExclamationPoint, Search, TramFront, CheckIcon, ClockIcon, ChevronDown } from 'lucide-solid'
import type TrainStation from '../../library/TrainStation'
import type TrainArrival from '../../library/TrainArrivals'
import type { RouteDirectionCodeType } from '../../library/Constants'
import TrainFollowLib from '../../library/TrainFollow'

interface StationDetailsProps {
    station: TrainFollowLib | null
    loading?: boolean
    empty?: boolean
    error?: boolean
}

function StationDetails(props: StationDetailsProps) {
    const [ name, setName ] = createSignal('')
    const [ eta, setEta ] = createSignal('')
    const [ status, setStatus ] = createSignal('')
    const [ statusIcon, setStatusIcon ] = createSignal<any>()
    const [ time, setTime ] = createSignal('')

    function redirect() {
        if(!props.station) return
        const url = new URL(location.origin + '/train-station')

        url.searchParams.set('mapId', props.station.stationId)

        location.assign(url)
    }

    createRenderEffect(() => {
        if(props.error) {
            setName(() => 'Train may be changing numbers due to faults or delays! Please wait for new data to arrive!')
            setStatus(() => 'Failed to find train!')
            // setStatusIcon(() => <ErrorIcon noPadding />)
        } else if(props.empty) {
            setName(() => '')
            setStatus(() => '')
            // setStatusIcon(() => <></>)
        } else if(props.loading) {
            setName(() => '')
            setStatus(() => 'Loading')
            // setStatusIcon(() => <LoadingIcon noPadding />)
        } else if(props.station) {
            const { status, fault } = TrainFollowLib.getTimeStatus(props.station)

            const etaDate = new Intl.DateTimeFormat('en-us', {
                timeStyle: 'short'
            }).format(props.station.arrivalTime)

            const statusIcon = status === 'DELAYED' ? <OctagonExclamationPoint size='1.5rem' class='icon-error' /> : (
                fault ? <TriangleExclamationPoint size='1.5rem' /> : <CheckIcon stroke-width='2.5' class='icon-check' />
            )

            setName(() => props.station!.stationName)
            setEta(() => TrainFollowLib.getETA(props.station!))
            setStatus(() => status)
            setStatusIcon(() => statusIcon)
            setTime(() => etaDate)
        }
    })

    return <div class="station-details" style={{
        'grid-template-columns': (props.error || props.empty || props.loading) ? 'auto' : ''
    }}>
        <div class="name" onClick={redirect}>
            { name() }
        </div>
        <div class="eta">{ eta() }</div>
        <div class="status">
            <span>{ status() }</span>
            { statusIcon() }
        </div>
        <div class="time" style={{
            'color': status() === 'DELAYED' ?'rgb(250, 80, 80)' : 'rgb(119, 233, 104)',
            'text-decoration': status() === 'DELAYED' ? 'line-through' : ''
        }}>
            <span>{ time() }</span>
        </div>
    </div>
}

interface TrainFollowProps {
    // stations: TrainFollowLib[] | null | undefined
    runNumber: string
}

const VISIBILITY_RELOAD_MS = 3000
const VISIBILITY_INTERVAL_MS = 30000
const REFRESH_RATE_LIMIT_MS = 3000
const DELAYED_BG = ' rgb(77, 38, 39)'
export function TrainFollow(props: TrainFollowProps) {
    let _visibilityTimer = 0
    let _visibilityInterval = 0
    let _lastRefreshClick = 0

    const [ arrivalStation, setArrivalStation ] = createSignal<TrainFollowLib | null>(null)
    const [ nextStation, setNextStation ] = createSignal<TrainFollowLib | null>(null)
    const [ upcomingStations, setUpcomingStations ] = createSignal<{
        station: TrainFollowLib
        bg: string
        length: number
        index: number
    }[]>([])

    const [ serviceTowards, setServiceTowards ] = createSignal({ line: '...', to: '' })

    const [ arrivalStationTitle, setArrivalStationTitle ] = createSignal('...')
    const [ nextStationTitle, setNextStationTitle ] = createSignal('...')

    const [ arrivalStationBg, setArrivalStationBg ] = createSignal('')
    const [ nextStationBg, setNextStationBg ] = createSignal('')
    const [ trainColor, setTrainColor ] = createSignal('grey')

    const [ lastInfoUpdated, setLastInfoUpdated ] = createSignal({
        time: 'Refreshing',
        updating: true,
        now: 0,
        before: 0,
    })

    const [ arrivalStationStatus, setArrivalStationStatus ] = createSignal({ 
        loading: true,
        empty: false,
        error: false
     })

    const [ nextStationStatus, setNextStationStatus ] = createSignal({ 
        loading: true,
        empty: false,
        error: false
    })

    const [ documentTitle, setDocumentTitle ] = createSignal('Open Transit Chicago')

    function refreshingLastInfo() {
        setLastInfoUpdated(data => ({
            ...data,
            time: 'Refreshing',
            updating: true,
            now: Date.now()
        }))
    }

    function updateLastInfo() {
        const date = new Date()
        const currentTime = new Intl.DateTimeFormat('en-us', {
            timeStyle: 'short'
        }).format(date)

        setLastInfoUpdated(data => ({
            ...data,
            time: `Last Time Info Updated: ${currentTime}`,
            updating: false,
            now: date.getTime(),
            before: data.now
        }))
    }

    function showInvalidState(error: any) {
        setDocumentTitle('Open Transit Chicago')   

        clearInterval(_visibilityInterval)
        updateLastInfo()
        setArrivalStationTitle(() => '...')

        console.error(error)

        setArrivalStationStatus(data => ({
            ...data,
            error: true,
            loading: false
        }))

        setNextStationStatus(data => ({
            ...data,
            empty: true,
            loading: false
        }))
    }

      function refreshButton() {
        if(performance.now() - _lastRefreshClick <= REFRESH_RATE_LIMIT_MS) {
            return
        }

        clearInterval(_visibilityInterval)
        
        main(true)
        _visibilityInterval = setInterval(() => main(true), VISIBILITY_INTERVAL_MS)
        
        _visibilityTimer = performance.now()
        _lastRefreshClick = performance.now()
    }

    async function main(fetchNewData=false) {
        refreshingLastInfo()

        // let stations: TrainFollowProps['stations'] = props.stations

        // if(fetchNewData) {
        //     let [ _stations, _stationsError ] = await CTA.followTrain(props.runNumber)

        //     stations = _stationsError ? null : _stations
        // }

        const  [ stations ] = await CTA.followTrain(props.runNumber)

        if(!stations || stations instanceof Error) {            
            setUpcomingStations([])

            return showInvalidState(stations || 'Failed to find train!')
        }

        updateLastInfo()

        setArrivalStationStatus(data => ({
            ...data,
            loading: false
        }))

        setNextStationStatus(data => ({
            ...data,
            loading: false
        }))

        if(stations.length >= 1) {
            const station = stations[0]
            const { status } = TrainFollowLib.getTimeStatus(station)

            setArrivalStation(() => station)
        
            setServiceTowards(() => ({
                line: `${station.line} Line `,
                to: `to ${station.bound}`
            }))

            setTrainColor(() => TrainFollowLib.getColor(station).toString())
            setArrivalStationBg(() => status === 'DELAYED' ? DELAYED_BG : '')

            // document.title = `${station.stationName} | ${station.getETA()}`
            setDocumentTitle(`${station.stationName} | ${TrainFollowLib.getETA(station)}`)
        } else {
            setDocumentTitle('Open Transit Chicago')   

            return showInvalidState('Failed to find train!')
        }

        if(stations.length >= 2) {
            const station = stations[1]
            const { status } = TrainFollowLib.getTimeStatus(station)

            setNextStation(() => station)
            setNextStationBg(() => status === 'DELAYED' ? DELAYED_BG : '')
        }
        
        if(stations.length === 2) {
            setArrivalStationTitle(() => 'ARRIVING AT')
            setNextStationTitle(() => 'FINAL STOP')
        } else if(stations.length === 1) {
            setArrivalStationTitle(() => 'FINAL STOP')
            setNextStationTitle(() => '...')
        } else if(stations.length <= 0) {
            setArrivalStationTitle(() => '...')
            setNextStationTitle(() => '...')
        } else {
            setArrivalStationTitle(() => 'ARRIVING AT')
            setNextStationTitle(() => 'NEXT STOP')
        }

        if(stations.length >= 3) {
            const elements: {
                station: TrainFollowLib
                bg: string
                length: number
                index: number
            }[] = []
            for(let i = 2; i < stations.length; i++) {
                const station = stations[i]
                const { status } = TrainFollowLib.getTimeStatus(station)
                const bg =  status === 'DELAYED' ? DELAYED_BG : ''

                elements.push({
                    station, bg, length: stations.length, index: i
                })
            }

            setUpcomingStations(elements)
        }
    }

    createEffect(() => {
        document.title = documentTitle()
    })

    createRenderEffect(() => {
        main()
    })

    return <>
        <div class="station-layout" style={{
            'background-color': arrivalStationBg()
        }}>
            <header class='train-details'>
                <TramFront class='train-icon' size='3.75rem' style={{
                    'background-color': trainColor()
                }} />
                <div class="service-towards">
                    <span class="line">{ serviceTowards().line }</span>
                    <span class="to">{ serviceTowards().to }</span>
                </div>
                <div class="run-number">Train: #{ props.runNumber }</div>
            </header>
            <div class='title'>{ arrivalStationTitle() }</div>
            <StationDetails {...arrivalStationStatus()} station={arrivalStation()}></StationDetails>
        </div>
        <div class="station-layout" style={{
            'background-color': nextStationBg()
        }}>
            <div class='title'>{ nextStationTitle() }</div>
            <StationDetails {...nextStationStatus()} station={nextStation()}></StationDetails>
        </div>
        <div class="station-layout update-details" onclick={refreshButton}>
            <div class="details">
                <ClockIcon class='icon-clock' />
                <div>{ lastInfoUpdated().time }</div>
                {
                    lastInfoUpdated().updating ? (
                    <RefreshCw size='1.5rem' class='icon-refresh' />
                    ) : null
                }
            </div>
            <div class='refresh'>Click Here To Refresh</div>
        </div>
        <div class="station-layout">
            <h1 class='upcoming-stations-title'>
                <ChevronDown />
                <span>Upcoming Stations</span>
                <ChevronDown />
            </h1>
        </div>
        <For each={upcomingStations()}>
            { (subprops) => (
                <div class="station-layout" style={{
                    'background-color': subprops.bg
                }}>
                    { (subprops.index === subprops.length - 1) ? (
                        <div class='title'>FINAL STOP</div>
                    ) : null}
                    <StationDetails station={subprops.station}></StationDetails>
                </div>
            ) }
        </For>
    </>
}