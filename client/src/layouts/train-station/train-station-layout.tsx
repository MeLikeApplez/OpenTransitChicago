import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactElement } from 'react'
import './train-station-layout.scss'
import * as uuid from 'uuid'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faFaceFrown, faTrainSubway } from '@fortawesome/free-solid-svg-icons'

import Transit, { TrainArrival, type RouteDirectionCodeType } from '../../library/Transit'
import { CheckIcon, ClockIcon, ErrorIcon, LoadingIcon, WarningIcon } from '../../components/Icons/Icons'

export function StationTitle() {
    const [ stationLine, setStationLine ] = useState<ReactElement | string>(
        <>
            <LoadingIcon noPadding />
            <span>Loading Station Data...</span>
        </>
    )
    const [ stationName, setStationName ] = useState('')

    const [ stationBorderColor, setStationBorderColor ] = useState('')
    const [ stationLineColor, setStationLineColor ] = useState('')

    function invalidStation() {
        document.title = `Invalid Station`
        setStationLine(() => (
            <ErrorIcon noPadding>Invalid Station</ErrorIcon>
        ))
        setStationName(() => 'This station does not exist!')
    }

    async function main() {
        const mapId = new URLSearchParams(location.search).get('mapId')

        if(mapId === null) {
            console.error('Invalid mapId')

            invalidStation()

            return
        }

        const [ routes, routesError ] = await Transit.getAllTrainStationRoutes()
        
        if(routesError) {
            console.error(routesError)

            invalidStation()

            return
        }
        
        const station = routes.find(r => r.mapId === mapId)
        
        if(!station) {
            console.error('Cannot find station!')

            invalidStation()

            return
        }

        document.title = `${station.descriptiveName} Station`

        setStationName(() => document.title)
        setStationBorderColor(() => station.rgb.toRGBString())
        setStationLine(() => `${station.line ?? 'Unknown'} Line`)
        setStationLineColor(() => station.rgb.toRGBString())
    }
    
    useLayoutEffect(() =>{
        main()
    }, [])
    
    return <header className='station-title' style={{
        borderLeftColor: stationBorderColor
    }}>
        <div className='station-line' style={{
            color: stationLineColor
        }}>{ stationLine }</div>
        <div>{ stationName }</div>
    </header>
}

interface ServiceLineProps {
    name: string
    trains: TrainArrival[]
}

export function ServiceLine({ name, trains }: ServiceLineProps) {
    const [ trainElements, setTrainElements ] = useState<ReactElement[]>([])

    function redirect(train: TrainArrival) {
        const url = new URL(location.origin + '/train')

        url.searchParams.append('runNumber', train.runNumber)

        location.assign(url)
    }

    useLayoutEffect(() => {
        const elements: ReactElement[] = []
        for(let i = 0; i < trains.length; i++) {
            const train = trains[i]
            const { status, fault } = train.getTimeStatus()
            const eta = train.getETA()

            const bgRgb = train.rgb.clone().subtract(0, 0, 0, 0.2).toRGBAString()
            const bgRgbDim = train.rgb.clone().subtract(0, 0, 0, 0.7).toRGBAString()

            const statusIcon = status === 'DELAYED' ? <ErrorIcon /> : (
                fault ? <WarningIcon /> : <CheckIcon />
            )

            const etaDate = new Intl.DateTimeFormat('en-us', {
                timeStyle: 'short'
            }).format(train.arrivalTime)

            elements.push(
                <div key={uuid.v4()} className="train" style={{
                    animation: train.isDue() ? 'Flashing 1s infinite alternate ease-in-out' : 'none'
                }} onClick={() => redirect(train)}>
                    <div className="details" style={{
                        backgroundColor: bgRgb
                    }}>
                        <div className="line">{ train.line } Line #{ train.runNumber }</div>
                        <div className="name">{ train.bound }</div>
                        <div className="eta">{ eta }</div>
                    </div>
                    <div className="arrival" style={{
                        backgroundColor: bgRgbDim
                    }}>
                        <div className="status">
                            <span>{ status }</span>
                            { statusIcon }
                        </div>
                        <div className="eta-date" style={{
                            color: status === 'DELAYED' ?'rgb(250, 80, 80)' : '',
                            textDecoration: status === 'DELAYED' ? 'line-through' : ''
                        }}>
                            <span>{ etaDate }</span>
                            <ClockIcon style={{ padding: '0', paddingLeft: '12px' }}></ClockIcon>
                        </div>
                    </div>
                </div>
            )
        }

        setTrainElements(() => elements)
    }, [])
    
    return <article className="service-line">
        <h2>
            <FontAwesomeIcon icon={faTrainSubway}></FontAwesomeIcon>
            <span>{ name }</span>
        </h2>
        <div className="trains">
            { trainElements }
        </div>
    </article>
}

interface EmptyServiceLineProps {
    children?: any
}

export function EmptyServiceLine({ children }: EmptyServiceLineProps) {
    return <div className="empty-service-line">
        <ErrorIcon noPadding>
            <h1>{children}</h1>
        </ErrorIcon>
    </div>
}

const VISIBILITY_RELOAD_MS = 3000
const VISIBILITY_INTERVAL_MS = 30000
export function ServiceLineLayout() {
    const _visibilityTimer = useRef(0)
    const _visibilityInterval = useRef<any>(0)

    const [ serviceLineElements, setServiceLineElements ] = useState<ReactElement[]>([
        <LoadingIcon key={uuid.v4()} noPadding>
            <h1>Loading</h1>
        </LoadingIcon>
    ])

    async function main() {
        const mapId = new URLSearchParams(location.search).get('mapId')

        if(mapId === null) {
            document.onvisibilitychange = null
            clearInterval(_visibilityInterval.current)
            setServiceLineElements(() => [
                <EmptyServiceLine key={uuid.v4()}>Failed to fetch train arrivals!</EmptyServiceLine>
            ])

            console.error('Invalid mapId')

            return
        }

        const [ arrivals, arrivalsError ] = await Transit.getTrainArrivals(mapId)

        if(arrivalsError) {
            document.onvisibilitychange = null
            clearInterval(_visibilityInterval.current)
            setServiceLineElements(() => [
                <EmptyServiceLine key={uuid.v4()}>Failed to fetch train arrivals!</EmptyServiceLine>
            ])

            console.error(arrivalsError)
            
            return
        }

        if(arrivals.length === 0) {
            console.log(arrivals)

            setServiceLineElements(() => [
                <EmptyServiceLine key={uuid.v4()}>No trains found at this time...</EmptyServiceLine>
            ])

            return
        }

        interface BoundMapKey {
            towards: string
            routeDirectionCode: RouteDirectionCodeType
            trains: TrainArrival[]
        }

        const boundMap = new Map<string, BoundMapKey>()
        for(let i = 0; i < arrivals.length; i++) {
            const train = arrivals[i]

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
        }

        const boundMapValues = Array.from(boundMap.values())

        boundMapValues.sort((a, b) => a.routeDirectionCode < b.routeDirectionCode ? -1 : 1)

        const elements: ReactElement[] = []
        for(let i = 0; i < boundMapValues.length; i++) {
            const { towards, trains } = boundMapValues[i]

            trains.sort((a, b) => (a.line ?? '') < (b.line ?? '') ? -1 : 1)

            elements.push(
                <ServiceLine key={uuid.v4()} name={towards} trains={trains}></ServiceLine>
            )
        }

        setServiceLineElements(() => elements)
    }

    useEffect(() => {
        document.onvisibilitychange = () => {
            if(document.visibilityState === 'hidden') {
                clearInterval(_visibilityInterval.current)
                
                return
            }
            if(performance.now() - _visibilityTimer.current < VISIBILITY_RELOAD_MS) return
            
            clearInterval(_visibilityInterval.current)
            
            main()
            _visibilityInterval.current = setInterval(() => main(), VISIBILITY_INTERVAL_MS)

            _visibilityTimer.current = performance.now()
        }

        main()
        _visibilityInterval.current = setInterval(() => main(), VISIBILITY_INTERVAL_MS)
    }, [])

    return <section className='service-line-layout'>
        { serviceLineElements }
    </section>
}