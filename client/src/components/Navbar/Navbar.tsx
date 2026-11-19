import { createEffect, createSignal, onMount } from 'solid-js'
import './Navbar.scss'

import { ArrowLeft, Menu, Home } from 'lucide-solid'

const MIN_ANIMATION_SCROLL_Y = 3
export default function Navbar() {
    const [ navOpacity, setNavOpacity ] = createSignal('')
    const [ toggleMenu, setToggleMenu ] = createSignal(false)

    function back() {
        history.back()
    }

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
                <a href="/"><Home/>Home</a>
                {/* <div class='title'>Tools</div> */}
            </div>
        </nav>
        <div class="space"></div>
    </div>
}