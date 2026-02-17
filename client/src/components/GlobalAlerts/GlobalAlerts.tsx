import React, { useEffect, useRef, useState, type ReactElement } from 'react'
import './GlobalAlerts.scss'

import * as uuid from 'uuid'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faBell, faGear, faXmark } from '@fortawesome/free-solid-svg-icons'
import Transit, { CustomerAlertsDetailed, type SeverityRating, type SeverityRatingMap } from '../../library/Transit'
import { BellIcon, ErrorIcon, FaceMehIcon, LoadingIcon } from '../Icons/Icons'
import Overlay from '../Overlay/Overlay'
import { Dropdown, DropdownItem } from '../Dropdown/Dropdown'
import { Color, GreenRGB, OrangeRGB, PurpleExpressRGB, UnknownRGB, YellowRGB } from '../../library/Colors'

export function CustomerAlertsRouteStatus() {
    const [ routeStatusElements, setRouteStatusElements ] = useState<ReactElement[]>([
        <LoadingIcon key={uuid.v4()}>
            <h2>Loading Service Status...</h2>
        </LoadingIcon>
    ])

    async function main() {
        const [ routes, routesError ] = await Transit.getCustomerAlertsRouteStatus()
    
        if(routesError) {
            setRouteStatusElements(() => [
                <ErrorIcon key={uuid.v4()}>
                    <h2>Failed to load service status!</h2>
                </ErrorIcon>
            ])
            
            console.log(routesError)
            
            return
        }

        const elements: ReactElement[] = []
        for(let i = 0; i < routes.length; i++) {
            const { route, color, status, statusColor } = routes[i]

            const mainBorderRGB = color.clone().subtractScalar(0, 0.2).toRGBAString()
            const mainBg = color.clone().subtractScalar(0, 0.7).toRGBAString()

            const statusBorderRGB = statusColor.clone().subtractScalar(0, 0.3).toRGBAString()
            const statusBg = statusColor.clone().subtractScalar(0, 0.8).toRGBAString()

            elements.push(
                <div key={uuid.v4()} className="route" style={{
                    borderColor: mainBorderRGB,
                    backgroundColor: mainBg
                }}>
                    <div className='name'>{ route }</div>
                </div>
            )

            elements.push(
                <div key={uuid.v4()} className="route-small" style={{
                    borderColor: statusBorderRGB,
                    backgroundColor: statusBg
                }}>
                    <FontAwesomeIcon icon={faGear} />
                    <div className='name'>{ status }</div>
                </div>
            )
        }

        setRouteStatusElements(() => elements)
    }

    useEffect(() => {
        main()
    }, [])

    return <div className="customer-alerts-route-status">
        <div className='title'>
            <FontAwesomeIcon icon={faGear} />
            <span>Train Service Status</span>
        </div>
        { routeStatusElements }
    </div>
}

interface GlobalAlertsProps {
    showLoading?: boolean
    size?: 'half' | 'full'
    customer?: CustomerAlertProps
    weather?: WeatherAlertProps
}

interface CustomerAlertProps {
    severity?: SeverityRating[]
}

interface WeatherAlertProps {

}

export function GlobalAlertsHeader({ showLoading=true, size, customer, weather }: GlobalAlertsProps) {
    const [ isLoading, setIsLoading ] = useState(true)
    const [ isEnabled, setIsEnabled ] = useState(true)

    const [ bgColor, setBgColor ] = useState('rgb(15, 15, 17)')
    const [ headline, setHeadline ] = useState('')
    const [ header, setHeader ] = useState<ReactElement>(
        <LoadingIcon>
            Loading Customer Alerts
            {/* Loading Customer/Weather Alerts */}
        </LoadingIcon>
    )

    const [ enableOverlay, setEnableOverlay ] = useState(false)
    const [ customerDropdownItems, setCustomerDropdownItems ] = useState<ReactElement[]>([
        <LoadingIcon key={uuid.v4()}>
            <h2>Loading Customer Alerts...</h2>
        </LoadingIcon>        
    ])

    function onExitOverlay() {
        document.body.style.overflow = ''
        setEnableOverlay(() => false)
    }

    function onEnterOverlay() {
        document.body.style.overflow = 'hidden'
    }

    function enterOverlay() {
        setEnableOverlay(() => true)
    }

    async function loadWeatherAlerts() {

    }

    async function loadCustomerAlerts() {
        setIsLoading(() => true)

        const [ customerAlerts, customerAlertsError ] = await Transit.getCustomerAlertsDetailed()

        setIsLoading(() => false)
        if(customerAlertsError) {
            setHeader(() => (
                <ErrorIcon>
                    Failed to load customer alerts!
                </ErrorIcon>
            ))

            setBgColor(() => 'rgba(250, 80, 80, 0.2)')
            setHeadline(() => '')

            console.error(customerAlertsError)

            return
        }

        // highest to lowest
        customerAlerts.sort((a, b) => b.severityScore - a.severityScore)

        const severity = CustomerAlertsDetailed.sortBySeverity(customerAlerts)

        const customerAlertsElements: ReactElement[] = []
        for(let i = 0; i < customerAlerts.length; i++) {
            const details = customerAlerts[i]
            const impactedElements: ReactElement[] = []

            for(let j = 0; j < details.impactedServices.length; j++) {
                const service = details.impactedServices[j]

                impactedElements.push(
                    <span key={uuid.v4()} className="service" style={{
                        backgroundColor: service.backColor.toRGBString(),
                        color: service.textColor.toRGBString()
                    }}>
                        { service.name }
                    </span>
                )
            }

            customerAlertsElements.push(
                <DropdownItem key={uuid.v4()} rgb={details.severityColor}>
                    <div className='overlay-customer-alerts'>
                        <div className='severity'>Severity: { details.severityRating.toUpperCase() }</div>
                        <div className='headline'>{ details.headline }</div>
                        <div className="impacted">{ impactedElements }</div>
                        <div className='description'>{ details.shortDescription }</div>
                    </div>
                </DropdownItem>
            )
        }

        setCustomerDropdownItems(() => {
            return customerAlertsElements.length === 0 ? [
                <DropdownItem key={uuid.v4()} rgb={UnknownRGB}>
                    <FaceMehIcon noPadding>No customer alerts found...</FaceMehIcon>
                </DropdownItem>
            ] : customerAlertsElements
        })

        if(severity.highestRank !== null) {
            const amount = severity[severity.highestRank].length
            const rank = severity[severity.highestRank][0]
            
            if(customer && Array.isArray(customer.severity)) {
                if(!customer.severity.some(s => s === severity.highestRank)) {
                    setIsEnabled(() => false)

                    return
                }
            }

            const color = rank.severityColor.clone().subtractScalar(0, 0.2).toRGBAString()

            setHeadline(() => rank.shortDescription)
            setBgColor(() => color)
            setHeader(() => <>
                <BellIcon noPadding></BellIcon>
                <span>[{amount}] {rank.impact}</span>
            </>)
        } else {
            setHeadline(() => '')
            setBgColor(() => 'rgb(15, 15, 17)')
            setHeader(() => (
                <FaceMehIcon noPadding>No customer alerts</FaceMehIcon>
            ))
        }


    }

    useEffect(() => {
        loadCustomerAlerts()
        // loadWeatherAlerts()
    }, [])

    return <>
        <Overlay className='global-alerts-overlay' enabled={enableOverlay} onExit={onExitOverlay} onEnter={onEnterOverlay}>
            <nav className='global-alerts-nav'>
                <div className="ui">
                    <div className="icon" onClick={onExitOverlay}>
                        <FontAwesomeIcon icon={faXmark} />
                        <span>Exit</span>
                    </div>
                </div>
            </nav>

            <Dropdown rgb={OrangeRGB} title='Customer Alerts' collapsed collapsedHeight='75vh'>
                { customerDropdownItems }
            </Dropdown>
            {/* <Dropdown rgb={PurpleExpressRGB} title='Weather Alerts' collapsed>

            </Dropdown> */}
        </Overlay>
        <section className="global-alerts-header" data-half-size-width={size === 'half'} style={{
            backgroundColor: bgColor,
            display: (isLoading && !showLoading) || !isEnabled ? 'none' : ''
        }} onClick={enterOverlay}>
            <div className='title'>{ header }</div>
            <div className="headline">{ headline }</div>
        </section>
    </>
}