import { axiosGmapTileReqCheck, axiosGmapInstance } from "./axiosService";

let googleMapsPromise;

function loadGoogleMaps(apiKey) {
  if (!googleMapsPromise) {
    googleMapsPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&callback=initialize&v=weekly`;
      // console.log(script.src)
      script.defer = true;
      script.async = true;
      document.head.appendChild(script);
      window.initialize = () => {
        resolve();
      };
    });
  }
  return googleMapsPromise;
}

async function checkSessionMapTiles(session, key){
  return await axiosGmapTileReqCheck(session, key).get('').then(resp => resp.data).catch(
    function (error){
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        return error.response.data
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
        return error.request
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
      console.log(error.config);
      
    }
  );
}

async function getLastValidSession(token){
  return await axiosGmapInstance(token).get('/getSession')
    .then(resp => resp.data)
    .catch(function(error){
    return error;
});
}

export default {loadGoogleMaps, checkSessionMapTiles, getLastValidSession};