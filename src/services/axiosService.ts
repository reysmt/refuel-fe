import axios, { type AxiosInstance, type AxiosResponse } from 'axios'

function axiosRigsInstance(token?: string): AxiosInstance {
  const headers: Record<string, string> = {
    'X-Custom-Header': 'Les-Header',
    'Content-Type': 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/rig/`,
    timeout: 60000,
    headers
  })
}

function axiosAuthInstance(): AxiosInstance {
  return axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/auth/`,
    timeout: 60000,
    headers: {
      'X-Custom-Header': 'Les-Header',
      'Content-Type': 'application/json'
    }
  })
}

function axiosGmapInstance(token?: string): AxiosInstance {
  const headers: Record<string, string> = {
    'X-Custom-Header': 'Les-Header',
    'Content-Type': 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/gmap/`,
    timeout: 60000,
    headers
  })
}

function axiosGmapTileReqCheck(session: string, key: string): AxiosInstance {
  return axios.create({
    baseURL: `https://tile.googleapis.com/v1/2dtiles/0/0/0?session=${session}&key=${key}`,
    timeout: 60000
  })
}

function axiosGetGeoIp(): Promise<AxiosResponse<any>> {
  return axios.get('https://geolocation-db.com/json/')
}

function axiosGmapReverseGeocoding(lat: number, lng: number, key: string): AxiosInstance {
  return axios.create({
    baseURL: `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`,
    timeout: 60000
  })
}

export {
  axiosRigsInstance,
  axiosAuthInstance,
  axiosGmapTileReqCheck,
  axiosGmapInstance,
  axiosGetGeoIp,
  axiosGmapReverseGeocoding
}
