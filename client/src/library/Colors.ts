export class Color extends Array {
    constructor(r: number, g: number, b: number, a: number=1) {
        super()

        this[0] = r
        this[1] = g
        this[2] = b
        this[3] = a
    }

    static parseHex(hex: string | number) {
        const value = parseInt(String(hex), 16)

        const r = (value & 0xFF0000) >> 16
        const g = (value & 0x00FF00) >> 8
        const b = (value & 0x0000FF)

        return new Color(r, g, b)
    }

    add(r: number, g: number, b: number, a: number=0) {
        this[0] += r
        this[1] += g
        this[2] += b
        this[3] += a

        this.clamp()

        return this
    }

    addScalar(rgb: number, a: number=0) {
        return this.add(rgb, rgb, rgb, a)
    }

    subtract(r: number, g: number, b: number, a: number=0) {
        this[0] -= r
        this[1] -= g
        this[2] -= b
        this[3] -= a

        this.clamp()

        return this
    }

    subtractScalar(rgb: number, a: number=0) {
        return this.subtract(rgb, rgb, rgb, a)
    }

    clamp() {
        this[0] = this[0] < 0 ? 0 : (this[0] > 255 ? 255 : this[0])
        this[1] = this[1] < 0 ? 0 : (this[1] > 255 ? 255 : this[1])
        this[2] = this[2] < 0 ? 0 : (this[2] > 255 ? 255 : this[2])
        this[3] = this[3] < 0 ? 0 : (this[3] > 255 ? 255 : this[3])
    }

    toRGBAString() {
        const [ r, g, b, a ] = this

        return `rgba(${r}, ${g}, ${b}, ${a})`
    }

    toRGBString() {
        const [ r, g, b ] = this

        return `rgb(${r}, ${g}, ${b})`
    }
    
    clone() {
        return new Color(this[0], this[1], this[2], this[3])
    }
}

export const RedRGB: Color = new Color(198, 12, 48)
export const BlueRGB: Color = new Color(50, 135, 240)
export const BrownRGB: Color = new Color(98, 54, 27)
export const GreenRGB: Color = new Color(0, 155, 58)
export const OrangeRGB: Color = new Color(229, 70, 28)
export const PinkRGB: Color = new Color(226, 126, 166)
export const PurpleRGB: Color = new Color(82, 35, 152)
export const PurpleExpressRGB: Color = new Color(172, 135, 252)
export const YellowRGB: Color = new Color(249, 227, 0)
export const UnknownRGB: Color = new Color(200, 200, 200)