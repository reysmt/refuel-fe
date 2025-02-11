import { axiosGetGeoIp } from './axiosService'

async function getGeoIp() {
  return await axiosGetGeoIp()
    .then((resp) => resp.data)
    .catch(function (error) {
      return error;
    })
}

export { getGeoIp }
