import { createSignal, onMount } from 'solid-js'
import './MapLibre.scss'

import { Map as MapLibreGL, Marker } from 'maplibre-gl'
import { Flag, Menu, TrainTrack, TramFront } from 'lucide-solid'

import { 
    BlueRGB, BrownRGB, GreenRGB, PurpleRGB, YellowRGB, PinkRGB, OrangeRGB, RedRGB,
    PurpleExpressRGB
} from '../../library/Constants'
import CTA from '../../library/CTA'

interface MapNavigationProps {
    map: MapLibreGL
    trainStationMarkers: Marker[]
}

interface MapMenuOptionsProps extends MapNavigationProps {
    hidden?: boolean
}

function MapMenuOptions(props: MapMenuOptionsProps) {
    function inputCheckTrainLine(event: Event) {
        const checkbox = event.target as HTMLInputElement
        
        for(const station of props.trainStationMarkers) {
            const element = station.getElement()

            if(!element.classList.contains(checkbox.id)) {
                continue
            }

            element.style.display = checkbox.checked ? '' : 'none'
        }
    }

    return <div class='menu-options' style={{
        display: props.hidden ? 'none' : ''
    }}>
        <header>Train Stations</header>
        <div>
            <input type='checkbox' id='Red-Line' onchange={inputCheckTrainLine} checked />
            <label for='Red-Line'>
                <TrainTrack size='1rem' color={RedRGB.hex()} class='rail-icon' />
                Red Line
            </label>
        </div>
        <div>
            <input type='checkbox' id='Blue-Line' onchange={inputCheckTrainLine} checked />
            <label for='Blue-Line'>
                <TrainTrack size='1rem' color={BlueRGB.hex()} class='rail-icon' />
                Blue Line
            </label>
        </div>
        <div>
            <input type='checkbox' id='Brown-Line' onchange={inputCheckTrainLine} checked />
            <label for='Brown-Line'>
                <TrainTrack size='1rem' color={BrownRGB.hex()} class='rail-icon' />
                Brown Line
            </label>
        </div>
        <div>
            <input type='checkbox' id='Green-Line' onchange={inputCheckTrainLine} checked />
            <label for='Green-Line'>
                <TrainTrack size='1rem' color={GreenRGB.hex()} class='rail-icon' />
                Green Line
            </label>
        </div>
        <div>
            <input type='checkbox' id='Orange-Line' onchange={inputCheckTrainLine} checked />
            <label for='Orange-Line'>
                <TrainTrack size='1rem' color={OrangeRGB.hex()} class='rail-icon' />
                Orange Line
            </label>
        </div>
        <div>
            <input type='checkbox' id='Pink-Line' onchange={inputCheckTrainLine} checked />
            <label for='Pink-Line'>
                <TrainTrack size='1rem' color={PinkRGB.hex()} class='rail-icon' />
                Pink Line
            </label>
        </div>
        <div>
            <input type='checkbox' id='Purple-Line' onchange={inputCheckTrainLine} checked />
            <label for='Purple-Line'>
                <TrainTrack size='1rem' color={PurpleRGB.hex()} class='rail-icon' />
                Purple Line
            </label>
        </div>
        <div>
            <input type='checkbox' id='Purple-Express-Line' onchange={inputCheckTrainLine} checked />
            <label for='Purple-Express-Line'>
                <TrainTrack size='1rem' color={PurpleExpressRGB.hex()} class='rail-icon' />
                Purple Express Line
            </label>
        </div>
        <div>
            <input type='checkbox' id='Yellow-Line' onchange={inputCheckTrainLine} checked />
            <label for='Yellow-Line'>
                <TrainTrack size='1rem' color={YellowRGB.hex()} class='rail-icon' />
                Yellow Line
            </label>
        </div>
        {/* <header>Markers</header>
        <div>
            <input type='checkbox' id='show-trains' checked />
            <label for='show-trains'>
                <TramFront size='1rem' class='rail-icon' />
                Show Trains
            </label>
        </div> */}
    </div>
}

export default function MapNavigation(props: MapNavigationProps) {
    const [ isMenuHidden, setIsMenuHidden ] = createSignal(false)

    onMount(() => {

    })
    
    return <div class='Map-Navigation'>
        <div class="menu">
            <Menu class='menu-icon' onClick={() => setIsMenuHidden(prev => !prev)}></Menu>
            <MapMenuOptions {...props} hidden={isMenuHidden()} ></MapMenuOptions>
            
        </div>
    </div>
}