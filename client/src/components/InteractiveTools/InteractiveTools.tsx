import './InteractiveTools.scss'

import * as uuid from 'uuid'

import { faMap, faStreetView, faWrench } from '@fortawesome/free-solid-svg-icons'

import { UnknownRGB } from '../../library/Colors'
import { Dropdown, DropdownItem } from '../Dropdown/Dropdown'

export default function InteractiveTools() {
    return import.meta.env.DEV ? <>
        <article className="interactive-tools">
            <Dropdown rgb={UnknownRGB} title='[IN DEVELOPMENT] Interactive Tools' icon={faWrench} collapsed>
                <DropdownItem rgb={UnknownRGB} icon={faMap} onClick={() => location.assign('/maps/2d')}>2D Map</DropdownItem>
                {/* <DropdownItem rgb={UnknownRGB} icon={faStreetView} onClick={() => location.assign('/maps/3d')}>3D Map</DropdownItem> */}
            </Dropdown>
        </article>
    </> : null
}