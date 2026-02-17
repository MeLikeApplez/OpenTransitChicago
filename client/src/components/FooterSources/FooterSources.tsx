import './FooterSources.scss'

export default function FooterSources() {
    return <footer>
        <article className="sources">
            <a target='_blank' href='https://www.transitchicago.com/developers/traintracker/'>CTA Train Tracker API</a>
            <a target='_blank' href="https://www.transitchicago.com/developers/alerts/">CTA Customer Alerts API</a>
            <a target='_blank' href="https://www.transitchicago.com/data/">CTA Open Data</a>
            <a target='_blank' href='https://openweathermap.org/'>Open Weather Map</a>
            <a target='_blank' href='https://www.openstreetmap.org/'>Open Street Map</a>
            {/* <a target='_blank' href='https://leafletjs.com/'>Leaflet</a> */}
            <a target='_blank' href='https://maplibre.org/'>MapLibre</a>
            <a target='_blank' href='https://threejs.org/'>Three.js</a>
        </article>
    </footer>
}