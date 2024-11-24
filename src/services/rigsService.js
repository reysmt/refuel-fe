// import axios from "axios";
import { axiosRigsInstance } from "./axiosService.js";



async function getAllRigPrices(){
    return await axiosRigsInstance().get('/prices').then(resp => resp.data);
}

async function getAllRigs(){
    const resp = await axiosRigsInstance().get('/rigs').then(resp => resp.data);
    return resp;
}

async function getNearbyRigsCsv(latitude, longitude, distanceThreshold){
    return await axiosRigsInstance().post('/check',{
        latitude: latitude,
        longitude: longitude,
        distanceThreshold: distanceThreshold
    }).then(resp => resp.data);
}

async function getNearbyRigs(latitude, longitude, distanceThreshold, token) {
  return await axiosRigsInstance(token)
    .post(
      '/service/check',
      {
        latitude: latitude,
        longitude: longitude,
        distanceThreshold: distanceThreshold
      }
    )
    .then((resp) => resp.data)
}

async function getFilteredRigs(rigsToShow, type){
    return await axiosRigsInstance().post('/filter',{
        rigsToShow: rigsToShow,
        type: type
    }).then(resp => resp.data);
}

async function checkReachability(){
    return await axiosRigsInstance().get('/test')
}


export{getAllRigPrices, getAllRigs, getNearbyRigs, getFilteredRigs, checkReachability, getNearbyRigsCsv}