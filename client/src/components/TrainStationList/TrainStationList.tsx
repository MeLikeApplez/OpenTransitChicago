import { createEffect, createSignal, For, onMount, type Accessor } from 'solid-js'
import './TrainStationList.scss'

import CTA from '../../library/CTA'
import { BlueRGB, BrownRGB, GreenRGB, OrangeRGB, PinkRGB, PurpleRGB, RedRGB, YellowRGB, type TrainLines } from '../../library/Constants'
import type TrainStation from '../../library/TrainStation'
import type { JSX } from 'solid-js/h/jsx-runtime'
import Color, { type ColorInstance } from 'color'
import { MapPin, ChevronLeft, TriangleExclamationPoint, RefreshCw, Navigation, OctagonExclamationPoint, Search } from 'lucide-solid'

type TrainStationMap = Map<TrainLines, TrainStation[]>

interface TrainStationGroupProps {
    map: TrainStationMap
    line: TrainLines
    color: ColorInstance
    children: JSX.Element
}

function TrainStationGroup(props: TrainStationGroupProps) {
    const trainStations = () => props.map.get(props.line)!

    const [ isCollapsed, setIsCollapsed ] = createSignal(true)

    function toggleCollapse() {
        setIsCollapsed(v => !v)
    }

    return <div class="Train-Station-Group" style={{
        'grid-template-rows': isCollapsed() ? 'min-content 0fr' : 'min-content 1fr'
    }}>

        <div class='line' onclick={toggleCollapse} style={{
            "background-color": props.color.fade(0.75).toString(),
            "border-color": props.color.toString()
        }}>
            <span>{ props.line } Line</span>
            <ChevronLeft style={{
                "rotate": isCollapsed() ? '0deg' : '-90deg'
            }}></ChevronLeft>
        </div>

        <div class="train-station-list">
            { trainStations()?.length === 0 ? (
                <div class="name-no-hover" style={{
                        "background-color": props.color.fade(0.9).toString(),
                        "border-color": props.color.fade(0.5).toString()
                    }}>
                    <RefreshCw size='1.5rem' class='icon-refresh'></RefreshCw>
                    Loading {props.line} Line...
                </div>
            ) : (
                <For each={trainStations()}>
                    {(item, index) => (
                        <a class='name' href={`/arrivals?mapId=` + item.mapId} style={{
                            "background-color": props.color.fade(0.9).toString(),
                            "border-color": props.color.fade(0.5).toString()
                        }}>
                            <MapPin size='1.5rem' color={props.color.toString()} />
                            <div>
                                <span class='header'>{ item.name }</span>
                                <span class='descriptive-info'>{ item.descriptiveInfo }</span>
                            </div>
                        </a>
                    )}
                </For>
            )}
        </div>
    </div>
}

interface TrainStationGPSProps {
    stations: TrainStation[]
}

export function TrainStationGPS(props: TrainStationGPSProps) {
    const [ isCollapsed, setIsCollapsed ] = createSignal(false)
    const [ geoLocationData, setGeoLocationData ] = createSignal<GeolocationPosition | GeolocationPositionError | null>(null)
    const [ nearbyTrainStations, setNearbyTrainStations ] = createSignal<JSX.Element[]>([
        <div class="name-no-hover">
            <TriangleExclamationPoint size='1.5rem' color='rgb(250, 180, 80)'></TriangleExclamationPoint>
            Click the green "Locate" button above to find the closest train stations near you
        </div>
    ])

    function toggleCollapse() {
        setIsCollapsed(v => !v)
    }

    function locate() {
        setNearbyTrainStations([
            <div class="name-no-hover">
                <RefreshCw size='1.5rem' class='icon-refresh'></RefreshCw>
                Waiting for device location...
            </div>
        ])

        navigator.geolocation.getCurrentPosition(setGeoLocationData, setGeoLocationData, {
            enableHighAccuracy: true,
            maximumAge: 0
        })
    }

    createEffect(() => {
        const data = geoLocationData()

        if(data === null) return
        if(data instanceof GeolocationPositionError ) {
            setNearbyTrainStations([
                <div class="name-no-hover" style={{
                    "background-color": Color('rgb(250, 80, 80)').fade(0.9).toString(),
                    "border-color": Color('rgb(250, 80, 80)').fade(0.5).toString()
                }}>
                    <OctagonExclamationPoint size='1.5rem' class='icon-error'></OctagonExclamationPoint>
                    Failed to locate! Enable location access on your device. Your device may not support this feature or may be blocking geolocation tracking.
                </div>
            ])

            return
        }

        setNearbyTrainStations(() => [])

        const MEASUREMENT: 'kilometer' | 'mile' = 'mile'
        const stations: {
            distance: number
            station: TrainStation
        }[] = []

        const existingStations = new Set()

        const { latitude, longitude } = data.coords
        for(let i = 0; i < props.stations.length; i++) {
            const route = props.stations[i]
            const coords = `${route.latitude}${route.longitude}`

            // filter by coordinates, kinda questionable but works
            if(existingStations.has(coords)) {
                continue
            }

            existingStations.add(coords)

            const distance = CTA.calculateGeoDistance(latitude, longitude, route.latitude,route.longitude, MEASUREMENT)
            
            stations.push({
                distance: distance, 
                station: route
            })
        }

        stations.sort((a, b) =>a.distance < b.distance ? -1 : 1)

        for(let i = 0; i < stations.length; i++) {
            const { station, distance } = stations[i]
            // @ts-ignore
            // solidjs breaks it ???
            const _rgb = station.rgb.color as [number, number, number]
            const rgb = Color({ r: _rgb[0], g: _rgb[1], b: _rgb[2] })
                
            setNearbyTrainStations(elements => [...elements, 
                <a class='name-gps' href={`/arrivals?mapId=` + station.mapId} style={{
                    "background-color": rgb.fade(0.9).toString(),
                    "border-color": rgb.fade(0.5).toString()
                }}>
                    <MapPin size='1.5rem' color={rgb.toString()} />
                    <div>
                        <div class='header station-line' style={{
                            color: rgb.toString()
                        }}>
                            { station.descriptiveInfo }
                        </div>
                        <div class='name-distance'>
                            <span>{ station.name }</span>
                            &mdash;
                            <span class='distance'>{ distance.toFixed(2) } mi</span>
                        </div>
                        
                    </div>
                </a>
            ])
        }
    })

    return <>
        <button class='Locate-GPS' onclick={locate}>
            <h2>
                <Navigation size='1.5rem'></Navigation>
                Locate Nearby Train Stations
            </h2>
        </button>
        <div class="Train-Station-GPS"  style={{
            'grid-template-rows': isCollapsed() ? 'min-content 0fr' : 'min-content 1fr'
        }}>
            <div class='line' onclick={toggleCollapse} style={{
                "background-color": Color('rgb(150, 150, 150)').fade(0.75).toString(),
                "border-color": Color('rgb(150, 150, 150)').toString()
            }}>
                <span>Nearest Stations</span>
                <ChevronLeft style={{
                    "rotate": isCollapsed() ? '0deg' : '-90deg'
                }}></ChevronLeft>
            </div>    

            <div class="train-station-list">
                <For each={nearbyTrainStations()}>
                    {(item, index) => (
                        <>{ item } </>                        
                    )}
                </For>
            </div>

        </div>
    </>
}

const MIN_NUMBER_SEARCH = 100
const MAX_NUMBER_SEARCH = 999
const MAX_CHAR_LENGTH = 5
export function TrainNumberSearch() {
    let trainNumberElement!: HTMLInputElement
    let errorTimeoutId = -1

    const [ showError, setShowError ] = createSignal(false)

    function inputValidation(event: InputEvent) {
        if(!event.target) return
        
        const input = event.target as HTMLInputElement

        if(input.value.length >= 5) {
            input.value = input.value.slice(0, MAX_CHAR_LENGTH)
        }
    }

    function submitSearch() {
        const value = Number(trainNumberElement.value.slice(0, MAX_CHAR_LENGTH))

        if(isNaN(value)) {
            return
        }

        if(value < MIN_NUMBER_SEARCH || value > MAX_NUMBER_SEARCH) {
            clearTimeout(errorTimeoutId)

            setShowError(true)
            errorTimeoutId = setTimeout(() => {
                setShowError(false)
            }, 5000)
            
            return
        }

        location.assign('/train?runNumber=' + value)
    }

    return <div class="Train-Number-Search">
        <input ref={trainNumberElement} oninput={inputValidation} 
            type="number" min={MIN_NUMBER_SEARCH} max={MAX_NUMBER_SEARCH} 
            placeholder={`Number Range (${MIN_NUMBER_SEARCH}-${MAX_NUMBER_SEARCH})`} 
        />
        <button onclick={submitSearch}>
            <Search />
            Search
        </button>
        <div class="error-message" style={{
            display: !showError() ? 'none' : ''
        }}>
            <OctagonExclamationPoint size='1.5rem' class='icon-error'></OctagonExclamationPoint>
            Invalid Train Number!
        </div>
    </div>
}

interface TrainStationListProps {
    stations: TrainStation[]
}

export function TrainStationList(props: TrainStationListProps) {
    const [ trainStationMap, setTrainStationMap ] = createSignal<TrainStationMap>(new Map())

    createEffect(() => {
        const stationMap = new Map<TrainLines, TrainStation[]>()

        const existingStations = new Set()

        for(const station of props.stations) {
            if(!station.line) continue

            let storedStation = stationMap.get(station.line)

            if(!storedStation) {
                storedStation = []

                stationMap.set(station.line, storedStation)
            }

            if(existingStations.has(station.descriptiveName)) {
                continue
            }

            existingStations.add(station.descriptiveName)
            storedStation.push(station)
        }

        for(const [ line, stationList ] of stationMap) {
            stationList.sort((a, b) => a.name > b.name ? 1 : -1)
        }

        setTrainStationMap(stationMap)
    })

    
    return <div class="Train-Station-List">
        <TrainStationGroup map={trainStationMap()} color={RedRGB} line='Red'>Red Line</TrainStationGroup>
        <TrainStationGroup map={trainStationMap()} color={BlueRGB} line='Blue'>Blue Line</TrainStationGroup>
        <TrainStationGroup map={trainStationMap()} color={BrownRGB} line='Brown'>Brown Line</TrainStationGroup>
        <TrainStationGroup map={trainStationMap()} color={GreenRGB} line='Green'>Green Line</TrainStationGroup>
        <TrainStationGroup map={trainStationMap()} color={OrangeRGB} line='Orange'>Orange Line</TrainStationGroup>
        <TrainStationGroup map={trainStationMap()} color={PinkRGB} line='Pink'>Pink Line</TrainStationGroup>
        <TrainStationGroup map={trainStationMap()} color={PurpleRGB} line='Purple'>Purple Line</TrainStationGroup>
        <TrainStationGroup map={trainStationMap()} color={YellowRGB} line='Yellow'>Yellow Line</TrainStationGroup>
    </div>
}