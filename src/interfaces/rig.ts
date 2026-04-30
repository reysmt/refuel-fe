export interface RigFuelType {
  rigFuelTypeDescription: string
  rigFuelTypeId: number
}

export interface RigPrice {
  price: number
  rigFuelType: RigFuelType
  self?: boolean
  date?: string | number | Date
}

export interface RigItem {
  rigId: string
  rigName?: string
  rigType?: string
  latitude?: number
  longitude?: number
  province?: string
  flag?: string
  manager?: string
  address?: string
  municipality?: string
}

export interface RigWrapper {
  rig: RigItem
  rigPrices: RigPrice[]
  [key: string]: any
}

export interface RigsState {
  rigs: RigWrapper[]
}

export interface RigsToShowState {
  rigsToShow: RigWrapper[]
}

export interface RigsTypeState {
  type: string | null
}

export interface AllRigsTypeState {
  allTypes: string[]
}