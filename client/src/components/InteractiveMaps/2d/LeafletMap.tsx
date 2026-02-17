import { useEffect, useRef, useState } from 'react'
import './LeafletMap.scss'
import pinSVG from './pin.svg?raw'

import * as uuid from 'uuid'

import {  } from '@fortawesome/react-fontawesome'
import {  } from '@fortawesome/free-solid-svg-icons'

// https://leafletjs.com/examples.html
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import Transit, { type TrainLines } from '../../../library/Transit'

const TILE_OPEN_STREET_MAP = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
const TILE_OPEN_RAIL_MAP =L.tileLayer('http://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png')
const maxZoom = 17
const minZoom = 11

const MAP_CENTER_X = 41.916187845609136
const MAP_CENTER_Y = -87.77263451099884

const MAP_BOUNDS = new L.LatLngBounds(
    new L.LatLng(42.472788, -88.245676),
    new L.LatLng(41.371328, -86.976755)
)

interface InteractiveMap2DProps {

}

export default function InteractiveMap2D({}: InteractiveMap2DProps) {
    const mapRef = useRef<L.Map | null>(null)
    
    async function createStations(map: L.Map) {
        const [ routes, routesError ] = await Transit.getAllTrainStationRoutes()

        if(routesError) {
            console.log(routesError)
            
            return
        }

        interface PinMapValues {
            icon: L.DivIcon
            layers: L.Layer[]
        }

        const existingPins = new Map<TrainLines, PinMapValues>()

        for(let i = 0; i < routes.length; i++) {
            const station = routes[i]
            const color = station.rgb.clone().addScalar(50).toRGBString()
            const className = `pin-icon-${station.line}`

            const redirectURL = `/train-station?mapId=${station.mapId}`
            const popupData = `
                <a href="${redirectURL.toString()}">${station.descriptiveName}</a>
            `

            if(station.line === null) continue

            if(!existingPins.has(station.line)) {
                existingPins.set(station.line, {
                    icon: L.divIcon({
                    html: `
                        <style>
                            .${className} path {
                                fill: ${color} !important;
                            }
                        </style>
                        <div class="${className}">
                            ${pinSVG}
                        </div>
                    `,
                    iconAnchor: L.point(0, 40),
                    popupAnchor: L.point(20, -20),
                    className: className,
                }),
                    layers: []
                })
            } 

            const pin = existingPins.get(station.line) as PinMapValues
            const marker = L.marker([station.latitude, station.longitude], {
                icon: pin.icon
            }).bindPopup(popupData)

            pin.layers.push(marker)
        }

        const overlay: Record<string, L.LayerGroup> = {}
        for(const [ line,  details ] of existingPins) {
            if(line === null) continue

            overlay[line] = L.layerGroup(details.layers)
        }

        L.control.layers({}, overlay, {
            sortLayers: true
        }).addTo(map)
    }

    async function createRails(map: L.Map) {
        const [ rails, railsError ] = await Transit.getGeoTrailRailLines()
        if(railsError) {
            console.error(railsError)

            return
        }

        for(let i = 0; i < rails.features.length; i++) {
            const rail = rails.features[i]
            const color = Transit.getTrainRailColor(rail)

            // @ts-ignore
            L.geoJSON(rail, {
                style: {
                    color: color.toRGBString(),
                    weight: 4
                }
            }).addTo(map)
        }
    }

    function main() {
        let map = null

        if(mapRef.current === null) {
            map = L.map('interactive-map-2d', {
                center: [MAP_CENTER_X, MAP_CENTER_Y],
                zoom: 11,
                maxBounds: MAP_BOUNDS,
                maxZoom, minZoom,
                attributionControl: false,
            })

            map.zoomControl.setPosition('topright')
            TILE_OPEN_STREET_MAP.addTo(map)
        // TILE_OPEN_RAIL_MAP.addTo(map)

            mapRef.current = map
        } else {
            map = mapRef.current
        }

        createRails(map)
        createStations(map)
    }

    useEffect(() => {
        if(!import.meta.env.DEV) return

        main()
    }, [])

    return <div id='interactive-map-2d'></div>
}