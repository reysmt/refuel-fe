import { axiosAuthInstance } from "./axiosService.js";

async function validate(token){
    return await axiosAuthInstance().post('/validate', {
        token : token
    }).then(resp => resp.data)
}

async function info(token){
    return await axiosAuthInstance().post('/info', {
        token : token
    }).then(resp => resp.data)
}

async function authenticate(username, password){
    return await axiosAuthInstance().post('/authenticate',{
        username : username,
        password: password
    }).then(resp => resp.data)
}

export{validate, authenticate, info}