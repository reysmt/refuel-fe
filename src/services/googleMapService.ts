import {
  axiosGmapTileReqCheck,
  axiosGmapInstance,
  axiosGmapReverseGeocoding
} from './axiosService'

declare global {
  interface Window {
    initialize?: () => void
  }
}

let googleMapsPromise: Promise<void> | null = null

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (!googleMapsPromise) {
    googleMapsPromise = new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&callback=initialize&v=weekly`
      script.defer = true
      script.async = true
      document.head.appendChild(script)
      window.initialize = () => {
        resolve()
      }
    })
  }

  return googleMapsPromise
}

async function checkSessionMapTiles(session: string, key: string): Promise<any> {
  return await axiosGmapTileReqCheck(session, key)
    .get('')
    .then((resp) => resp.data)
    .catch((error) => {
      if (error.response) {
        console.log(error.response.data)
        console.log(error.response.status)
        console.log(error.response.headers)
        return error.response.data
      }

      if (error.request) {
        console.log(error.request)
        return error.request
      }

      console.log('Error', error.message)
      console.log(error.config)
      return error
    })
}

async function getLastValidSession(token: string): Promise<any> {
  return await axiosGmapInstance(token)
    .get('/getSession')
    .then((resp) => resp.data)
    .catch((error) => error)
}

async function getReverseGeocoding(lat: number, lng: number, key: string): Promise<any> {
  return await axiosGmapReverseGeocoding(lat, lng, key)
    .get('')
    .then((resp) => resp.data)
    .catch((error) => {
      if (error.response) {
        console.log(error.response.data)
        console.log(error.response.status)
        console.log(error.response.headers)
        return error.response.data
      }

      if (error.request) {
        console.log(error.request)
        return error.request
      }

      console.log('Error', error.message)
      console.log(error.config)
      return error
    })
}

export { loadGoogleMaps, checkSessionMapTiles, getLastValidSession, getReverseGeocoding }
export default { loadGoogleMaps, checkSessionMapTiles, getLastValidSession, getReverseGeocoding }