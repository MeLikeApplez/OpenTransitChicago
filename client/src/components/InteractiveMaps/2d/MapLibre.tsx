import { useEffect } from 'react'
import './MapLibre.scss'

import maplibregl, { LngLat, LngLatBounds } from 'maplibre-gl'

const MAP_CENTER_LNG = -87.77263451099884
const MAP_CENTER_LAT = 41.916187845609136
const MAP_CENTER = new LngLat(MAP_CENTER_LNG, MAP_CENTER_LAT)

const MAP_BOUNDS = new LngLatBounds(
    new LngLat(-88.245676, 42.472788),
    new LngLat(-86.976755, 41.371328)
)

export default function MapLibre() {
    function main() {
        const map = new maplibregl.Map({
            container: 'Map-Libre',
            center: MAP_CENTER,
            zoom: 8,
            style: {
                version: 8,
                sources: {
                    osm: {
                        type: 'raster',
                        tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
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
    }
 
    useEffect(() => {
        main()
    }, [])

    return <div id="Map-Libre"></div>
}