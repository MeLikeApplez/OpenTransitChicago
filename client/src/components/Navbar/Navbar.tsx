import { useEffect, useState } from 'react'
import './Navbar.scss'

import * as uuid from 'uuid'


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faBars } from '@fortawesome/free-solid-svg-icons'

const MIN_ANIMATION_SCROLL_Y = 3
export default function Navbar() {
    const [ navOpacity, setNavOpacity ] = useState('')
    const [ toggleMenu, setToggleMenu ] = useState(false)

    function back() {
        history.back()
    }

    useEffect(() => {
        document.body.style.overflow = toggleMenu ? 'hidden' : ''
    }, [toggleMenu])

    useEffect(() => {
        window.onscroll = () => {
            const { scrollY } = window
            
            if(scrollY >= MIN_ANIMATION_SCROLL_Y) {
                setNavOpacity(() => '0.6')

                return
            }

            setNavOpacity(() => '1')
        }
    }, [])

    return <div className="Navbar">
        <nav style={{
            opacity: navOpacity,
            height: toggleMenu ? '100%' : ''
        }}>
            <div className="ui">
                <div className="icon" onClick={back}>
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span>Back</span>
                </div>
                
                <div className="icon" onClick={() => setToggleMenu(v => !v)}>
                    <span>Menu</span>
                    <FontAwesomeIcon icon={faBars} />
                </div>

            </div>
            <div className="menu" style={{
                display: !toggleMenu ? 'none' : ''
            }}>
                <div className='title'>Navigation Links</div>
                <a href="/">Train Stations</a>
                {/* <div className='title'>Tools</div> */}
            </div>
        </nav>
        <div className="space"></div>
    </div>
}