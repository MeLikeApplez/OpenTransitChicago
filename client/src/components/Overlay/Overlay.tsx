import { useEffect } from 'react'
import './Overlay.scss'

import * as uuid from 'uuid'

import {  } from '@fortawesome/react-fontawesome'
import {  } from '@fortawesome/free-solid-svg-icons'

interface OverlayProps {
    enabled: boolean
    onExit?: () => void
    onEnter?: () => void
    className?: string
    children?: any
}

export default function Overlay({ enabled, onEnter, onExit, className, children }: OverlayProps) {
    useEffect(() => {
        if(onExit && !enabled) onExit()
        if(onEnter && enabled) onEnter()
    }, [enabled])

    return <div className={`Overlay ${className || ''}`} style={{
        visibility: !enabled ? 'hidden' : 'visible',
        // display: !enabled ? 'none' : '',
    }}>
        { enabled ? children : null }
    </div>
}