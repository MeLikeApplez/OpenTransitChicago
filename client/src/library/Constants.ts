import Color, { type ColorInstance } from 'color'
import DetailedTrainAlerts from './DetailedTrainAlerts'

export const RedRGB = Color.rgb(198, 12, 48)
export const BlueRGB = Color.rgb(50, 135, 240)
export const BrownRGB = Color.rgb(98, 54, 27)
export const GreenRGB = Color.rgb(0, 155, 58)
export const OrangeRGB = Color.rgb(229, 70, 28)
export const PinkRGB = Color.rgb(226, 126, 166)
export const PurpleRGB = Color.rgb(82, 35, 152)
export const PurpleExpressRGB = Color.rgb(172, 135, 252)
export const YellowRGB = Color.rgb(249, 228, 0)
export const UnknownRGB = Color.rgb(200, 200, 200)

// https://www.transitchicago.com/developers/ttdocs/#_Toc296199907
export type TrainLines = 'Red' | 'Blue' | 'Brown' | 'Green' | 'Orange' | 'Pink' | 'Purple' | 'Purple-Express' | 'Yellow' | null
export type RouteDirectionCodeType = '1' | '5'
export type SeverityRating = 'low' | 'moderate' | 'medium' | 'high' | 'severe'
export interface SeverityRatingMap {
    low: DetailedTrainAlerts[]
    moderate: DetailedTrainAlerts[]
    medium: DetailedTrainAlerts[]
    high: DetailedTrainAlerts[]
    severe: DetailedTrainAlerts[]
    lowestRank: SeverityRating | null
    highestRank: SeverityRating | null
}

export function extractRGB(rgb: ColorInstance) {
    // @ts-ignore
    const _rgb = rgb.color as [number, number, number]
    
    return new Color({ r: _rgb[0], g: _rgb[1], b: _rgb[2] })
}