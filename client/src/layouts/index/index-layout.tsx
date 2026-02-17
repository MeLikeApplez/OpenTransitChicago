import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'
import './index-layout.scss'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMapLocationDot, faLocationDot, faLocationArrow, faWrench, faMagnifyingGlass, faMap, faCube, faStreetView } from '@fortawesome/free-solid-svg-icons'

import * as uuid from 'uuid'
import Transit, { 
    BlueRGB, BrownRGB, GreenRGB, OrangeRGB, PinkRGB, PurpleRGB, RedRGB, TrainStation, YellowRGB, 
    type TrainLines, PurpleExpressRGB 
} from '../../library/Transit'
import { Dropdown, DropdownItem } from '../../components/Dropdown/Dropdown'
import { ErrorIcon, LoadingIcon, WarningIcon } from '../../components/Icons/Icons'
import { Color, UnknownRGB } from '../../library/Colors'

interface StationGroupProps {
    rgb: Color
    children: string
    line: TrainLines
    routes: TrainStation[]
    error?: boolean
}

function StationGroup({ rgb, children, line, routes, error=false }: StationGroupProps) {
    const [ stationElements, setStationElements ] = useState<ReactElement[]>([
        <LoadingIcon key={uuid.v4()}>
            <h1>Loading Train Stations...</h1>
        </LoadingIcon>
    ])

    function redirect(station: TrainStation) {
        const url = new URL(location.href + './train-station')
        url.searchParams.set('mapId', station.mapId)

        location.assign(url)
    }

    useEffect(() => {
        if(error) {
            setStationElements(() => [
                <ErrorIcon key={uuid.v4()}>
                    <h1>Failed to fetch train station data...</h1>
                </ErrorIcon>
            ])


            return
        }
        
        if(routes.length === 0) return

        setStationElements(() => [])

        const stations = routes.filter(r => r.line === line)    
        
        const elements: ReactElement[] = []
        for(let i = 0; i < stations.length; i++) {
            const station = stations[i]
            
            elements.push(
                <DropdownItem key={uuid.v4()} rgb={rgb} icon={faLocationDot} onClick={() => redirect(station)}>
                    <div className="station-description">
                        <div>{ station.name }</div>
                        <div style={{ color: 'rgb(150, 150, 150)' }}>{ station.descriptiveInfo }</div>
                    </div>
                </DropdownItem>
            )
        }

        setStationElements(() => elements)
    }, [routes])

    return <Dropdown rgb={rgb} title={children}>
        { stationElements }
    </Dropdown>
}

interface GPSSortedTrainStationsProps {
    geoLocationData: GeolocationPosition | GeolocationPositionError | null
    routes: TrainStation[]
}

function GPSSortedTrainStations({ geoLocationData, routes }: GPSSortedTrainStationsProps) {
    const [ stationElements, setStationElements ] = useState<ReactElement[]>([
        <WarningIcon key={uuid.v4()}>
            <h2>Click the button "Locate" above to find the closest train stations near you</h2>
        </WarningIcon>
    ])

    function redirect(station: TrainStation) {
        const url = new URL(location.href + './train-station')
        url.searchParams.set('mapId', station.mapId)

        location.assign(url)
    }
    
    useEffect(() => {
        if(!geoLocationData) return

        setStationElements(() => [
            <LoadingIcon key={uuid.v4()}>
                <h1>Loading geolcation data...</h1>
            </LoadingIcon>
        ])

        if(geoLocationData instanceof GeolocationPositionError) {
            setStationElements(() =>[
                <ErrorIcon key={uuid.v4()}>
                    <h2>Geolocation failed! Enable location access on your device! Your device may not support this feature or may be blocking geolocation tracking!</h2>
                </ErrorIcon>
            ])

            return
        }

        setStationElements(() => [])

        const MEASUREMENT: 'kilometer' | 'mile' = 'mile'
        const MEASUREMENT_ABBRREVIATED = 'mi'
        const stations: {
            distance: number
            station: TrainStation
        }[] = []

        const { latitude, longitude } = geoLocationData.coords
        for(let i = 0; i < routes.length; i++) {
            const route = routes[i]
            const distance = Transit.calculateGeoDistance(latitude, longitude, route.latitude,route.longitude, MEASUREMENT)
            
            stations.push({
                distance: distance, 
                station: route
            })
        }

        stations.sort((a, b) =>a.distance < b.distance ? -1 : 1)

        for(let i = 0; i < stations.length; i++) {
            const { station, distance } = stations[i]
            const { rgb } = station

            setStationElements(elements => [
                ...elements,
                <DropdownItem key={uuid.v4()} rgb={station.rgb} icon={faLocationDot} onClick={() => redirect(station)}>
                    <div className="closest-station">
                        <div className='title'>
                            <div className="line" style={{
                                color: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
                            }}>{ station.line } Line</div>
                            &mdash;
                            <div className="distance">{ distance.toFixed(2) } { MEASUREMENT_ABBRREVIATED }</div>
                        </div>
                        <div className='station-description'>
                            <span>{ station.name }</span>
                            <span style={{ color: 'rgb(150, 150, 150)' }}>{ station.descriptiveInfo }</span>
                        </div>
                    </div>
                </DropdownItem>
            ])
        }

    }, [geoLocationData])

    return <Dropdown rgb={new Color(200, 200, 200)} title='Closest Stations' icon={faMagnifyingGlass} collapsed>
      { stationElements }  
    </Dropdown>
}

export default function TrainStations() {
    const [ stationRoutes, setStationRoutes ] = useState<TrainStation[]>([])
    const [ stationRoutesError, setStationRoutesError ] = useState<boolean>(false)

    const [ geoLocationData, setGeoLocationData ] = useState<GeolocationPosition | GeolocationPositionError | null>(null)

    async function main() {
        const [ routes, routesError ] = await Transit.getAllTrainStationRoutes()
        
        if(routesError) {
            setStationRoutesError(() => true)
            console.error('Failed to get train routes!')

            return
        }

        const existingStations = new Set()
        const filteredStations: TrainStation[] = []

        for(let i = 0; i < routes.length; i++) {
            const station = routes[i]

            // filter by coordinates, kinda questionable but works
            const { latitude, longitude } = station
            const coords = `${latitude}${longitude}`

            if(existingStations.has(coords)) {
            // if(existingStations.has(station.name)) {
                continue
            }

            // existingStations.add(station.name)
            existingStations.add(coords)

            filteredStations.push(station)
        }

        filteredStations.sort((a, b) => a.name > b.name ? 1 : -1)

        setStationRoutes(() => filteredStations)
    }

    function locateClosestStations() {
        navigator.geolocation.getCurrentPosition(setGeoLocationData, setGeoLocationData, {
            enableHighAccuracy: true
        })
    }
    
    useEffect(() => {
        main()
    }, [])

    return <section className="train-stations-container half-size">
        <header>
            <h1>
                <FontAwesomeIcon icon={faMapLocationDot} className='icon' />
                <span>Train Stations</span>
            </h1>
        </header>
        <article className="train-stations">
            <StationGroup routes={stationRoutes} error={stationRoutesError} rgb={RedRGB} line='Red'>Red Line</StationGroup>
            <StationGroup routes={stationRoutes} error={stationRoutesError} rgb={BlueRGB} line='Blue'>Blue Line</StationGroup>
            <StationGroup routes={stationRoutes} error={stationRoutesError} rgb={BrownRGB} line='Brown'>Brown Line</StationGroup>
            <StationGroup routes={stationRoutes} error={stationRoutesError} rgb={GreenRGB} line='Green'>Green Line</StationGroup>
            <StationGroup routes={stationRoutes} error={stationRoutesError} rgb={OrangeRGB} line='Orange'>Orange Line</StationGroup>
            <StationGroup routes={stationRoutes} error={stationRoutesError} rgb={PinkRGB} line='Pink'>Pink Line</StationGroup>
            <StationGroup routes={stationRoutes} error={stationRoutesError} rgb={PurpleRGB} line='Purple'>Purple Line</StationGroup>
            <StationGroup routes={stationRoutes} error={stationRoutesError} rgb={PurpleExpressRGB} line='Purple-Express'>Purple Express Line</StationGroup>
            <StationGroup routes={stationRoutes} error={stationRoutesError} rgb={YellowRGB} line='Yellow'>Yellow Line</StationGroup>
        </article>

        <header className='gps'>
            <div className='title'>
                <FontAwesomeIcon icon={faLocationDot} className='icon' />
                Find The Closest Train Station
            </div>
            <button className='locate' onClick={locateClosestStations}>
                <FontAwesomeIcon icon={faLocationArrow} />
                Click  Here To Locate
            </button>
        </header>

        <article className="train-stations">
            <GPSSortedTrainStations geoLocationData={geoLocationData} routes={stationRoutes}></GPSSortedTrainStations>
        </article>
    </section>
}