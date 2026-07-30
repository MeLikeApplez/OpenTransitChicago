import {
    type TrainLines,
    BlueRGB, BrownRGB, GreenRGB, PurpleExpressRGB, PurpleRGB, YellowRGB, PinkRGB, OrangeRGB, RedRGB, UnknownRGB
 } from './Constants'
import { type ColorInstance } from 'color'
import * as z from 'zod'

export const TrainRailLinesGeoJSONSchema = z.object({
    features: z.array(z.object({
        geometry: z.object({
            coordinates: z.array(z.array(z.array(z.number()))),
            type: z.string()
        }),
        properties: z.object({
            ':created_at': z.string(),
            ':id': z.string(),
            ':updated_at': z.string(),
            ':version': z.string(),
            description: z.string(),
            legend: z.string(),
            lines: z.string(),
            shape_len: z.string(),
            type: z.string(),
        }),
        type: z.string()
    })),
    type: z.string()
})

type RailFeatures = z.infer<typeof TrainRailLinesGeoJSONSchema>['features'][number]

export default class TrainRail {
    coordinates: number[][]
    color: ColorInstance
    description: string
    legend: string
    // lines: string
    line: TrainLines
     detailedLine: string

    constructor(rail: RailFeatures) {
        this.coordinates = rail.geometry.coordinates[0]
        this.description = rail.properties.description
        this.legend = rail.properties.legend
        this.detailedLine = rail.properties.lines
        this.line = null

        switch(rail.properties.legend.toUpperCase()) {
            case 'BL':
                this.color = BlueRGB
                this.line = 'Blue'
                break
            case 'BR':
                this.color = BrownRGB
                this.line = 'Brown'
                break
            case 'GR':
                this.color = GreenRGB
                this.line = 'Green'
                break
            case 'OR':
                this.color = OrangeRGB
                this.line = 'Orange'
                break
            case 'PK':
                this.color = PinkRGB
                this.line = 'Pink'
                break
            case 'PR':
                this.color = PurpleRGB
                this.line = 'Purple'
                break
            case 'RD':
                this.color = RedRGB
                this.line = 'Red'
                break
            case 'YL':
                this.color = YellowRGB
                this.line = 'Yellow'
                break
            default:
                this.color = UnknownRGB
        }
    }
}