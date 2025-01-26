import axios from 'axios'; // browser

function axiosRigsInstance(token){
    const rigsInstance = axios.create({
        baseURL: 'https://refuelapi.com:8443/api/rig/',
        timeout: 60000,
        headers: {'X-Custom-Header': 'Les-Header',
        'Content-Type':'application/json',
        'Authorization': 'Bearer ' + token
        }
    });
    return rigsInstance;
}

function axiosAuthInstance(){
    return axios.create({
        baseURL: 'https://refuelapi.com:8443/api/auth/',
        timeout: 60000,
        headers: {'X-Custom-Header': 'Les-Header',
        'Content-Type':'application/json'
        }
    });
}

function axiosGmapInstance(token){
    return axios.create({
        baseURL: 'https://refuelapi.com:8443/api/gmap/',
        timeout: 60000,
        headers: {'X-Custom-Header': 'Les-Header',
        'Content-Type':'application/json',
        'Authorization': 'Bearer ' + token
        }
    });
}

function axiosGmapTileReqCheck(session, key){
    return axios.create({
        baseURL: 'https://tile.googleapis.com/v1/2dtiles/0/0/0?session=' + session + '&key=' + key,
        timeout: 60000
    })
  }


export {axiosRigsInstance, axiosAuthInstance, axiosGmapTileReqCheck, axiosGmapInstance}

