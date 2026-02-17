import { type CSSProperties } from 'react'
import './Icon.scss'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faBell, faCheckCircle, faCircleExclamation, faClock, faFaceMeh, faSync, faTriangleExclamation, type IconDefinition } from '@fortawesome/free-solid-svg-icons'

interface BasicIconProps {
    style?: CSSProperties
    children?: any
    noPadding?: boolean
}

interface BaseIconProps {
    icon: IconDefinition
    style?: CSSProperties
    className?: string
    children?: any
    noPadding?: boolean
}

export function FaceMehIcon({ style={}, children, noPadding }: BasicIconProps) {
    return <BaseIcon style={style} icon={faFaceMeh} noPadding={noPadding} className='face-meh-icon'>
        { children }
    </BaseIcon>
}

export function BellIcon({ style={}, children, noPadding }: BasicIconProps) {
    return <BaseIcon style={style} icon={faBell} noPadding={noPadding}>
        { children }
    </BaseIcon>
}

export function ClockIcon({ style={}, children, noPadding }: BasicIconProps) {
    return <BaseIcon style={style} icon={faClock} noPadding={noPadding} className='clock-icon'>
        { children }
    </BaseIcon>
}

export function CheckIcon({ style={}, children, noPadding }: BasicIconProps) {
    return <BaseIcon style={style} icon={faCheckCircle} noPadding={noPadding} className='check-icon'>
        { children }
    </BaseIcon>
}

export function ErrorIcon({ style={}, children, noPadding }: BasicIconProps) {
    return <BaseIcon style={style} icon={faCircleExclamation} noPadding={noPadding} className='error-icon'>
        { children }
    </BaseIcon>
}

export function WarningIcon({ style={}, children, noPadding }: BasicIconProps) {
    return <BaseIcon style={style} icon={faTriangleExclamation} noPadding={noPadding} className='warning-icon'>
        { children }
    </BaseIcon>
}

export function LoadingIcon({ style={}, children, noPadding }: BasicIconProps) {
    return <BaseIcon style={style} icon={faSync} noPadding={noPadding} className='loading-icon'>
        { children }
    </BaseIcon>
}

export function BaseIcon({ icon, style={}, className='', noPadding, children }: BaseIconProps) {
    return <div className={`fa-icon-group ${noPadding ? 'no-padding' : ''}`} style={style}>
        <FontAwesomeIcon icon={icon} className={`fa-icon ${className}`} />
        { children }
    </div>
}