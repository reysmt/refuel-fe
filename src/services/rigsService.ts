import { axiosRigsInstance } from './axiosService'

async function getAllRigPrices(): Promise<any> {
  return await axiosRigsInstance().get('/prices').then((resp) => resp.data)
}

async function getAllRigs(): Promise<any> {
  return await axiosRigsInstance().get('/rigs').then((resp) => resp.data)
}

async function getNearbyRigsCsv(
  latitude: number,
  longitude: number,
  distanceThreshold: number
): Promise<any> {
  return await axiosRigsInstance().post('/check', {
    latitude,
    longitude,
    distanceThreshold
  }).then((resp) => resp.data)
}

async function getNearbyRigs(
  latitude: number,
  longitude: number,
  distanceThreshold: number,
  token: string
): Promise<any> {
  return await axiosRigsInstance(token)
    .post('/service/check', {
      latitude,
      longitude,
      distanceThreshold
    })
    .then((resp) => resp.data)
    .catch((error) => error)
}

async function getFilteredRigs(rigsToShow: unknown[], type: string): Promise<any> {
  return await axiosRigsInstance()
    .post('/filter', {
      rigsToShow,
      type
    })
    .then((resp) => resp.data)
}

async function getRigPriceHistoryByRigId(rigId: string, token: string): Promise<any> {
  return await axiosRigsInstance(token)
    .get(`/service/history/${rigId}`)
    .then((resp) => resp.data)
}

async function checkReachability(): Promise<any> {
  return await axiosRigsInstance().get('/test')
}

export {
  getAllRigPrices,
  getAllRigs,
  getNearbyRigs,
  getFilteredRigs,
  checkReachability,
  getNearbyRigsCsv,
  getRigPriceHistoryByRigId
}