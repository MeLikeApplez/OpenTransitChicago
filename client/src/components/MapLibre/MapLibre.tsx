import { createSignal, onMount } from 'solid-js'

import './MapLibre.scss'

import { setWorkerUrl, Map as MapLibreGL, LngLat, LngLatBounds, Marker, Popup, NavigationControl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

import CTA from '../../library/CTA'
import MapNavigation from './MapNavigation'

// import { Map as MapTiler, MapStyle, config } from '@maptiler/sdk'
// import '@maptiler/sdk/dist/maptiler-sdk.css'

// config.apiKey = import.meta.env.PUBLIC_WEATHER_API_KEY

setWorkerUrl(workerUrl)

// Raster Tile Providers
// https://wiki.openstreetmap.org/wiki/Raster_tile_providers

// Weather Layer
// https://www.maptiler.com/weather/
// https://docs.maptiler.com/sdk-js/examples/weather-radar/

const MAP_CENTER_LNG = -87.77263451099884
const MAP_CENTER_LAT = 41.916187845609136
const MAP_CENTER = new LngLat(MAP_CENTER_LNG, MAP_CENTER_LAT)

const MAP_BOUNDS = new LngLatBounds(
    new LngLat(-88.245676, 42.472788),
    new LngLat(-86.976755, 41.371328),
)

// const MAP_TILES = 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
const MAP_TILES = `https://api.maptiler.com/maps/openstreetmap-dark/{z}/{x}/{y}.png?key=${import.meta.env.PUBLIC_WEATHER_API_KEY}`

export const TRAIN_RAILS_ID = 'train-rail'

export default function MapLibre() {
    let map!: MapLibreGL
    const [ trainStationMarkers, setTrainStationMarkers ] = createSignal<Marker[]>([])

    async function loadTrainRails() {
        const [ trainRails, trainRailsError ] = await CTA.getTrainRailLines()

        if(!trainRails || trainRailsError) {
            console.error(trainRailsError)
            
            return
        }

        const railFeatures = []            
        for(const rail of trainRails) {
            railFeatures.push({
                type: 'Feature',
                properties: {
                    color: rail.color.toString(),
                    line: rail.line
                },
                geometry: {
                    type: 'LineString',
                    coordinates: rail.coordinates
                }
            })
        }

        map.addSource(TRAIN_RAILS_ID, {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                // @ts-ignore
                features: railFeatures
            }
        })

        map.addLayer({
            id: TRAIN_RAILS_ID,
            type: 'line',
            source: TRAIN_RAILS_ID,
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': ['get', 'color'],
                'line-width': 4
            }
        })
    }

    async function loadTrainStations() {
        const [ trainStations, trainStationsError ] = await CTA.getAllTrainStationRoutes()

        if(!trainStations || trainStationsError) {
            console.error(trainStationsError)

            return
        }

        const tempTrainStationMarkers = []
        for(const station of trainStations) {
            if(!station.line) {
                continue
            }

            const marker = new Marker({
                    color: station.rgb.hex(),
                    className: `${station.line}-Line`
                })
                const popup = new Popup({
                    offset: 25
                })
                const popupElement = document.createElement('div')
    
                popupElement.id = 'marker'
                popup.setHTML(`
                    <h1>${station.name} Station</h1>
                    <h3>${station.descriptiveInfo}</h3> 
                `)
    
                marker.setPopup(popup)
                marker.setLngLat([station.longitude, station.latitude])
                marker.addTo(map)
                
                tempTrainStationMarkers.push(marker)

                // marker.getElement().style.display = 'none'

                if(!station.line) {
                    console.log(station)
                }
            }

            setTrainStationMarkers(tempTrainStationMarkers)
    }

    // function hideTrainRails(hidden: boolean) {
    //     map.setLayoutProperty(TRAIN_RAILS_ID, 'visibility', hidden ? 'none' : 'visible')
    // }

    onMount(() => {
        map = new MapLibreGL({
            container: 'Map-Libre',
            center: MAP_CENTER,
            zoom: 10,
            // bounds: MAP_BOUNDS,
            style: {
                version: 8,
                sources: {
                    osm: {
                        type: 'raster',
                        tiles: [MAP_TILES],
                        tileSize: 256,
                        attribution: '&copy; OpenStreetMap Contributors',
                        maxzoom: 19
                    },
                },
                layers: [
                    {
                        id: 'osm',
                        type: 'raster',
                        source: 'osm'
                    }
                ],
            },
        })

        map.addControl(new NavigationControl({
            visualizePitch: true,
            visualizeRoll: true,
            showZoom: true,
            showCompass: true
        }))

        map.on('load', () => {
            loadTrainStations()
            loadTrainRails()
        })
    })

    return <>
        <div id="Map-Libre"></div>
        <MapNavigation map={map} trainStationMarkers={trainStationMarkers()}></MapNavigation>
    </>
}