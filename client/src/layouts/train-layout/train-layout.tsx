import { useEffect, useRef, useState, type ReactElement } from 'react'
import './train-layout.scss'
import * as uuid from 'uuid'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faTrain } from '@fortawesome/free-solid-svg-icons'

import Transit, { FollowTrain } from '../../library/Transit'
import { CheckIcon, ClockIcon, ErrorIcon, LoadingIcon, WarningIcon } from '../../components/Icons/Icons'
import { GlobalAlertsHeader } from '../../components/GlobalAlerts/GlobalAlerts'

interface StationDetailsProps {
    station: FollowTrain | null
    loading?: boolean
    empty?: boolean
    error?: boolean
}

function StationDetails({ station, loading, empty, error }: StationDetailsProps) {
    const [ name, setName ] = useState('')
    const [ eta, setEta ] = useState('')
    const [ status, setStatus ] = useState('')
    const [ statusIcon, setStatusIcon ] = useState<ReactElement>()
    const [ time, setTime ] = useState('')

    function redirect() {
        if(!station) return
        const url = new URL(location.origin + '/train-station')

        url.searchParams.set('mapId', station.stationId)

        location.assign(url)
    }


    useEffect(() => {
        if(error) {
            setName(() => 'Train may be changing numbers due to faults or delays! Please wait for new data to arrive!')
            setStatus(() => 'Failed to find train!')
            setStatusIcon(() => <ErrorIcon noPadding />)
        } else if(empty) {
            setName(() => '')
            setStatus(() => '')
            setStatusIcon(() => <></>)
        } else if(loading) {
            setName(() => '')
            setStatus(() => 'Loading')
            setStatusIcon(() => <LoadingIcon noPadding />)
        } else if(station) {
            const { status, fault } = station.getTimeStatus()

            const etaDate = new Intl.DateTimeFormat('en-us', {
                timeStyle: 'short'
            }).format(station.arrivalTime)

            const statusIcon = status === 'DELAYED' ? <ErrorIcon noPadding /> : (
                fault ? <WarningIcon noPadding /> : <CheckIcon noPadding />
            )

            setName(() => station.stationName)
            setEta(() => station.getETA())
            setStatus(() => status)
            setStatusIcon(() => statusIcon)
            setTime(() => etaDate)
        }
    }, [station, loading, empty, error])

    return <div className="station-details" style={{
        gridTemplateColumns: (error || empty || loading) ? 'auto' : ''
    }}>
        <div className="name" onClick={redirect}>
            { name }
        </div>
        <div className="eta">{ eta }</div>
        <div className="status">
            <span>{ status }</span>
            { statusIcon }
        </div>
        <div className="time" style={{
            color: status === 'DELAYED' ?'rgb(250, 80, 80)' : 'rgb(119, 233, 104)',
            textDecoration: status === 'DELAYED' ? 'line-through' : ''
        }}>
            <span>{ time }</span>
        </div>
    </div>
}

const VISIBILITY_RELOAD_MS = 3000
const VISIBILITY_INTERVAL_MS = 30000
const REFRESH_RATE_LIMIT_MS = 3000
const DELAYED_BG = ' rgb(77, 38, 39)'
export default function TrainLayout() {
    const _visibilityTimer = useRef(0)
    const _visibilityInterval = useRef<any>(0)
    const _lastRefreshClick = useRef(0)

    const [ arrivalStation, setArrivalStation ] = useState<FollowTrain | null>(null)
    const [ nextStation, setNextStation ] = useState<FollowTrain | null>(null)
    const [ upcomingStations, setUpcomingStations ] = useState<ReactElement[]>([])

    const [ serviceTowards, setServiceTowards ] = useState({ line: '...', to: '' })
    const [ trainRunNumber, setTrainRunNumber ] = useState('...')

    const [ arrivalStationTitle, setArrivalStationTitle ] = useState('...')
    const [ nextStationTitle, setNextStationTitle ] = useState('...')

    const [ arrivalStationBg, setArrivalStationBg ] = useState('')
    const [ nextStationBg, setNextStationBg ] = useState('')
    const [ trainColor, setTrainColor ] = useState('grey')

    const [ lastInfoUpdated, setLastInfoUpdated ] = useState({
        time: 'Refreshing',
        updating: true,
        now: 0,
        before: 0,
    })

    const [ arrivalStationStatus, setArrivalStationStatus ] = useState({ 
        loading: true,
        empty: false,
        error: false
     })
    const [ nextStationStatus, setNextStationStatus ] = useState({ 
        loading: true,
        empty: false,
        error: false
    })

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
        clearInterval(_visibilityInterval.current)
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
        if(performance.now() - _lastRefreshClick.current <= REFRESH_RATE_LIMIT_MS) {
            return
        }

        clearInterval(_visibilityInterval.current)
        
        main()
        _visibilityInterval.current = setInterval(() => main(), VISIBILITY_INTERVAL_MS)
        
        _visibilityTimer.current = performance.now()
        _lastRefreshClick.current = performance.now()
    }

    async function main() {
        refreshingLastInfo()

        const runNumber = new URLSearchParams(location.search).get('runNumber')

        if(runNumber === null) {
            return showInvalidState('Invalid runNumber')
        }

        setTrainRunNumber(() => runNumber)

        const [ stations, stationsError ] = await Transit.followTrain(runNumber)

        if(stationsError) {
            setUpcomingStations(() => [])

            return showInvalidState(stationsError)
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
            const { status } = station.getTimeStatus()

            setArrivalStation(() => station)
        
            setServiceTowards(() => ({
                line: `${station.line} Line `,
                to: `to ${station.bound}`
            }))

            setTrainColor(() => station.rgb.toRGBString())
            setArrivalStationBg(() => status === 'DELAYED' ? DELAYED_BG : '')

            document.title = `${station.stationName} | ${station.getETA()}`
        }

         if(stations.length >= 2) {
            const station = stations[1]
            const { status } = station.getTimeStatus()

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
            const elements: ReactElement[] = []
            for(let i = 2; i < stations.length; i++) {
                const station = stations[i]
                const { status } = station.getTimeStatus()
                const bg =  status === 'DELAYED' ? DELAYED_BG : ''

                elements.push(
                    <div key={uuid.v4()} className="station-layout" style={{
                        backgroundColor: bg
                    }}>
                        { i === stations.length - 1 ? (
                            <div className='title'>FINAL STOP</div>
                        ) : null}
                        <StationDetails station={station}></StationDetails>
                    </div>
                )
            }

            setUpcomingStations(() => elements)
        }
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

    return <>
        <GlobalAlertsHeader showLoading={false} customer={{
            severity: ['severe']
        }}></GlobalAlertsHeader>

        <div className="station-layout" style={{
            backgroundColor: arrivalStationBg
        }}>
            <header className='train-details'>
                <FontAwesomeIcon icon={faTrain} className='train-icon' style={{
                    backgroundColor: trainColor
                }} />
                <div className="service-towards">
                    <span className="line">{ serviceTowards.line }</span>
                    <span className="to">{ serviceTowards.to }</span>
                </div>
                <div className="run-number">Train: #{ trainRunNumber }</div>
            </header>
            <div className='title'>{ arrivalStationTitle }</div>
            <StationDetails {...arrivalStationStatus} station={arrivalStation}></StationDetails>
        </div>
        <div className="station-layout" style={{
            backgroundColor: nextStationBg
        }}>
            <div className='title'>{ nextStationTitle }</div>
            <StationDetails {...nextStationStatus} station={nextStation}></StationDetails>
        </div>
        <div className="station-layout update-details" onClick={refreshButton}>
            <div className="details">
                <ClockIcon noPadding />
                <div>{ lastInfoUpdated.time }</div>
                {
                    lastInfoUpdated.updating ? (
                        <LoadingIcon />
                    ) : null
                }
            </div>
            <div className='refresh'>Click Here To Refresh</div>
        </div>
        {/* <GlobalInfo></GlobalInfo>
        <Tools></Tools> */}
        <div className="station-layout">
            <h1 className='upcoming-stations-title'>
                <FontAwesomeIcon icon={faChevronDown} />
                <span>Upcoming Stations</span>
                <FontAwesomeIcon icon={faChevronDown} />
            </h1>
        </div>
        { upcomingStations }
    </>
}