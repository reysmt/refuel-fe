import { axiosAuthInstance } from './axiosService'

async function validate(token: string): Promise<any> {
  return await axiosAuthInstance()
    .post('/validate', { token })
    .then((resp) => resp.data)
}

async function info(token: string): Promise<any> {
  return await axiosAuthInstance()
    .post('/info', { token })
    .then((resp) => resp.data)
}

async function authenticate(username: string, password: string): Promise<any> {
  return await axiosAuthInstance()
    .post('/authenticate', { username, password })
    .then((resp) => resp.data)
    .catch((error) => error)
}

export { validate, authenticate, info }