import { axiosGetGeoIp } from './axiosService'

async function getGeoIp(): Promise<any> {
  return await axiosGetGeoIp()
    .then((resp) => resp.data)
    .catch((error) => error)
}

export { getGeoIp }
