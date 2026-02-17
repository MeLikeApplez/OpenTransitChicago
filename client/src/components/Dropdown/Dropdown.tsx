import { useState, type ReactElement, type CSSProperties, useEffect, type MouseEvent } from 'react'
import './Dropdown.scss'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faLocationDot, faLock, type IconDefinition } from '@fortawesome/free-solid-svg-icons'
import type { Color } from '../../library/Colors'

interface DropdownItemProps {
    rgb: Color
    onClick?: (event: MouseEvent<HTMLDivElement>) => void
    icon?: IconDefinition
    title?: string
    className?: string
    children?: any
}

export function DropdownItem({ rgb, onClick, icon, title='', className, children }: DropdownItemProps) {
    return <div className={`name ${className || ''}`} style={{
        '--line-default': `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
        '--line-shaded': `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${SHADED_OPACITY})`,
        '--line-dark': `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${DARK_OPACITY})`,
        '--line-faint': `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${FAINT_OPACITY})`,
    } as CSSProperties} onClick={onClick}>
        {
            icon ? (
                <FontAwesomeIcon icon={icon} className='icon' />
            ) : (
                <></>
            )
        }
        <span>{ title }</span>
        { children }
    </div>
}

interface DropdownProps {
    rgb: Color
    onClick?: (event: MouseEvent<HTMLDivElement>) => void
    collapsed?: boolean
    collapsedHeight?: string
    icon?: IconDefinition
    title: string
    enabled?: boolean
    className?: string
    children?: any
}

export const SHADED_OPACITY = 0.6
export const DARK_OPACITY = 0.2
export const FAINT_OPACITY = 0.05
export function Dropdown({ rgb, onClick, icon, title, enabled=true, collapsedHeight, collapsed=false, className, children }: DropdownProps) {
    const [ isCollapsed, setIsCollapsed ] = useState(collapsed)

    function collapse() {
        if(!enabled) return

        setIsCollapsed(v => !v)
    }

    useEffect(() => {
        if(enabled) {
            setIsCollapsed(() => collapsed)

            return
        }

        setIsCollapsed(() => false)
    }, [enabled])

    return <div className={`dropdown ${className || ''}`} style={{
        '--line-default': `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
        '--line-shaded': `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${SHADED_OPACITY})`,
        '--line-dark': `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${DARK_OPACITY})`,
        '--line-faint': `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${FAINT_OPACITY})`,
        gridTemplateRows: !isCollapsed ? 'min-content 0fr' : 'min-content 1fr'
    } as CSSProperties} onClick={onClick}>
        <header className='content' onClick={collapse}>
            <div>
                    {
                    icon ? (
                        <FontAwesomeIcon icon={icon} className='header-icon' />
                    ) : (
                        <></>
                    )
                }
                <span>{ title }</span>
            </div>
            {
                enabled ? (
                    <FontAwesomeIcon icon={faChevronLeft} className='icon' style={{ rotate: isCollapsed ? '-90deg' : '0deg' }} />
                ) : (
                    <FontAwesomeIcon icon={faLock} className='icon' />
                )
            }
        </header>
        <div className='collapsed-names' style={{
            maxHeight: collapsedHeight || '40vh'
        }}>
            { children }
        </div>
    </div>
}
