import { 
    type TrainLines, 
    BlueRGB, BrownRGB, GreenRGB, PurpleExpressRGB, PurpleRGB, YellowRGB, PinkRGB, OrangeRGB, RedRGB, UnknownRGB 
} from './Constants'
import { type ColorInstance } from 'color'
import * as z from 'zod'

// https://data.cityofchicago.org/Transportation/CTA-System-Information-List-of-L-Stops/8pix-ypme/data_preview
const TrainStationRoutesSchema = z.object({
    stop_id: z.string(),
    direction_id: z.string(),
    stop_name: z.string(),
    station_name: z.string(),
    station_descriptive_name: z.string(),
    map_id: z.string(),
    ada: z.boolean(),
    red: z.boolean(),
    blue: z.boolean(),
    g: z.boolean(),
    brn: z.boolean(),
    p: z.boolean(),
    pexp: z.boolean(),
    y: z.boolean(),
    pnk: z.boolean(),
    o: z.boolean(),
    location: z.object({
        latitude: z.string(),
        longitude: z.string(),
        human_address: z.string()
    })
})

export default class TrainStation {
    direction: string
    latitude: number
    longitude: number
    mapX: number
    mapY: number
    mapId: string
    stopId: string
    stopName: string
    name: string
    descriptiveName: string
    descriptiveInfo: string
    line: TrainLines
    rgb: ColorInstance
    
    constructor(station: z.infer<typeof TrainStationRoutesSchema>) {
        this.direction = station.direction_id

        this.latitude = parseFloat(station.location.latitude)
        this.longitude = parseFloat(station.location.longitude)

        this.mapX = !isNaN(this.longitude) ? (this.longitude + 180) / 360 : 0
        this.mapY = !isNaN(this.latitude) ? (-this.latitude + 90) / 180 : 0
    
        this.mapId = station.map_id
        this.stopId = station.stop_id
        this.stopName = station.stop_name

        this.name = station.station_name
        this.descriptiveName = station.station_descriptive_name
        this.descriptiveInfo = station.station_descriptive_name.match(/\(.*\)/g)?.[0] ?? ''
        
        if(station.blue) {
            this.line = 'Blue'
            this.rgb = BlueRGB
        } else if(station.g) {
            this.line = 'Green'
            this.rgb = GreenRGB
        } else if(station.brn) {
            this.line = 'Brown'
            this.rgb = BrownRGB
        } else if(station.p) {
            this.line = 'Purple'
            this.rgb = PurpleRGB
        } else if(station.pexp) {
            this.line = 'Purple-Express'
            this.rgb = PurpleExpressRGB
        } else if(station.y) {
            this.line = 'Yellow'
            this.rgb = YellowRGB
        } else if(station.pnk) {
            this.line = 'Pink'
            this.rgb = PinkRGB
        } else if(station.o) {
            this.line = 'Orange'
            this.rgb = OrangeRGB
        } else if(station.red) {
            this.line = 'Red'
            this.rgb = RedRGB
        }else {
            this.line = null
            this.rgb = UnknownRGB
        }
    }
}