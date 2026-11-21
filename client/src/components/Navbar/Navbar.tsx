import { createEffect, createRenderEffect, createSignal, Match, onMount, Show, Switch } from 'solid-js'
import './Navbar.scss'

import { ArrowLeft, Menu, Home, OctagonExclamationPoint, TriangleExclamationPoint, Info, Bell } from 'lucide-solid'
import CTA from '../../library/CTA'
import type DetailedTrainAlerts from '../../library/DetailedTrainAlerts'
import type { SeverityRating } from '../../library/Constants'
import Color from 'color'

interface NavbarProps {
    trainAlerts: DetailedTrainAlerts[] | null
}

const MIN_ANIMATION_SCROLL_Y = 3
const THRESHOLD_SEVERITY_SCORE = 60
export default function Navbar(props: NavbarProps) {
    const [ navOpacity, setNavOpacity ] = createSignal('')
    const [ toggleMenu, setToggleMenu ] = createSignal(false)
    const [ topTrainAlert, setTopTrainAlert ] = createSignal<DetailedTrainAlerts | null>(null)

    function back() {
        history.back()
    }

    function redirect() {
        location.assign('/global-alerts')
    }

    createRenderEffect(() => {
        if(THRESHOLD_SEVERITY_SCORE < 40) {
            throw Error('THRESHOLD_SEVERITY_SCORE must be 40 or higher!')
        }

        if(!props.trainAlerts) {
            return
        }

        let maxSeverityScore = 0
        let topAlert: DetailedTrainAlerts | null = null
        for(const details of props.trainAlerts) {
            if(maxSeverityScore < details.severityScore) {
                maxSeverityScore = details.severityScore
                topAlert = details
            }
        }

        if(maxSeverityScore > THRESHOLD_SEVERITY_SCORE) {
            setTopTrainAlert(topAlert)
        } else {
            setTopTrainAlert(null)
        }
    })

    createEffect(() => {
        document.body.style.overflow = toggleMenu() ? 'hidden' : ''
    })

    onMount(() => {
        window.onscroll = () => {
            const { scrollY } = window
            
            if(scrollY >= MIN_ANIMATION_SCROLL_Y) {
                setNavOpacity(() => '0.6')

                return
            }

            setNavOpacity(() => '1')
        }
    })

    return <div class="Navbar">
        <nav style={{
            opacity: navOpacity(),
            height: toggleMenu() ? '100%' : ''
        }}>
            <div class="ui">
                <div class="icon" onclick={back}>
                    <ArrowLeft></ArrowLeft>
                    <span>Back</span>
                </div>
                
                <div class="icon" onclick={() => setToggleMenu(v => !v)}>
                    <span>Menu</span>
                    <Menu></Menu>
                </div>
            </div>

            <div class="menu" style={{
                display: !toggleMenu() ? 'none' : ''
            }}>
                <div class='title'>Navigation Links</div>
                <a href="/"><Home color='rgb(213, 135, 98)' />Home / Train Stations</a>
                <a href="/global-alerts"><Bell size="2rem" class='icon-warning' />Global Alerts</a>
            </div>
        </nav>
        <div class="space"></div>
        <Show when={topTrainAlert()}>
            {
                (details) => {
                    const { eventStart, eventEnd, severityColor } = details()
                    const startTime = eventStart ? new Intl.DateTimeFormat('en-us', {
                        timeStyle: 'short',
                        dateStyle: 'short'
                    }).format(eventStart) : ''
                    const endTime = eventEnd ? new Intl.DateTimeFormat('en-us', {
                        timeStyle: 'short',
                        dateStyle: 'short'
                    }).format(eventEnd) : ''
                    const dot = startTime || endTime ? '\u00b7' : ''
                    const dash = (startTime && endTime) ? '-' : ''

                    const timeString = `${dot} ${startTime} ${dash} ${endTime}`
                    // @ts-ignore
                    const _rgb = severityColor.color as [number, number, number]
                    const brightenSeverityColor = Color({ r: _rgb[0], g: _rgb[1], b: _rgb[2] }).lighten(1).toString()

                    return <div class="global-alerts-container" onclick={redirect}>
                        <div class="details" style={{
                            'background-color': severityColor.toString()
                        }}>
                            <div class='impact'>
                                <Switch>
                                    <Match when={details().severityRating === 'medium'}>
                                        <Info size='1.75rem' color={brightenSeverityColor.toString()} ></Info>
                                    </Match>
                                    <Match when={details().severityRating === 'high'}>
                                        <TriangleExclamationPoint size='1.75rem' color={brightenSeverityColor.toString()} ></TriangleExclamationPoint>
                                    </Match>
                                    <Match when={details().severityRating === 'severe'}>
                                        <OctagonExclamationPoint size='1.75rem'color={brightenSeverityColor.toString()} ></OctagonExclamationPoint>
                                    </Match>
                                </Switch>
                                { details().impact }
                            </div>
                            <div class='headline'>{ details().headline }</div>
                            <div class='time'>CTA Service Alert { timeString }</div>
                        </div>
                </div>
                }
            }
        </Show>
    </div>
}