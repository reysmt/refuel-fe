import axios from 'axios'; // browser

function axiosRigsInstance(token){
    const rigsInstance = axios.create({
        baseURL: 'http://204.216.216.226:8080/api/rig/',
        // baseURL: 'http://192.168.1.87:8080/api/rig/',
        // baseURL: 'http://localhost:8080/api/rig/',
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
        baseURL: 'http://204.216.216.226:8080/api/auth/',
        // baseURL: 'http://192.168.1.87:8080/api/auth/',
        // baseURL: 'http://localhost:8080/api/auth/',
        timeout: 60000,
        headers: {'X-Custom-Header': 'Les-Header',
        'Content-Type':'application/json'
        }
    });
}

function axiosGmapInstance(token){
    return axios.create({
        baseURL: 'http://204.216.216.226:8080/api/gmap/',
        // baseURL: 'http://192.168.1.87:8080/api/gmap/',
        // baseURL: 'http://localhost:8080/api/gmap/',
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

