import  Vue  from "vue";
import axios from "axios";
import VueAxios from "vue-axios";
// import { AxiosResponse, AxiosRequestConfig } from "axios";
import Store from '@/store'
Vue.use(VueAxios, axios)
const EventBus = new Vue();
export default class ApiService {
  constructor(apiUrl) {
    this.server= apiUrl ? apiUrl : null
  }
  setHeader(type) {
    let headers = null
    if(type=='json' || type=='query'){
      headers= 'application/json'
    }
    else if(type === 'formData') {
      headers= 'application/json, text/plain, */*d'
    }
    else if(type === 'urlEncoded') {
      headers= 'application/x-www-form-urlencoded'
    }
    Vue.axios.defaults.headers.common["Content-Type"] = headers
    Vue.axios.defaults.headers.common["Access-Control-Allow-Origin"] = '*'
  }
  createFormData(params){

    let formData = null
    if(params){
      if(params.type=='json'){
        formData =params.items;
      }else if(params.type=='query'){
        formData =params.items
      }else{
        if(params.type === 'formData') {
          formData = new FormData()
        }else if(params.type === 'urlEncoded'){
          formData = new URLSearchParams()
        }
        Object.keys(params.items).forEach(element => {
          if(params.items[element]){
            if(Array.isArray(params.items[element])) {
              params.items[element].forEach(xx => {
               formData.append(element, xx);
              });
            }else{
              formData.append(element, params.items[element]);
            }
          }
        });
      }
      this.setHeader(params.type)
    }
    return formData
  }
  setPayload(type,payload){
    let log= payload.log||'شناسایی نشد';
    let progress =  0
    let cancelTokenSource = axios.CancelToken.source()
    let target = payload.targets || null;
    Vue.axios.defaults.cancelToken = cancelTokenSource.token
    Store.commit('setApiInfo',{
      job:payload.id,
      progress:progress,
      cancelToken:cancelTokenSource,
      type:type,
      server:this.server,
      target:target,
      params:payload
    })
    if(payload.progressBar) {
      Vue.axios.defaults.onUploadProgress =  function(progressEvent) {
        var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        percentCompleted ?  Store.commit('setProgress',{
          job:payload.id,
          percent:percentCompleted,
        }) : null
      }
    }
  }
  errorHandler(error, showServerMessage, job) {
    let message = null
    let st = false;
    Store.dispatch('apiError',job)
    if(error.response && error.response.status==401){
      message = 'نشست شما منقضی شد.مجدد لاگین کنید'
      st = true
    }else if(error.response && error.response.status==404){
      message = 'سرویس شناسایی نشد'
    }else if(error.response && showServerMessage){
      message = error.response.data.message
    }else if(showServerMessage){
      message = error
    }
    if(message=='Cancel'){
      EventBus.$notif({
        type:'info',
        title:'عملیات لغو شد',
        timer:2000
      })
    }else if(message=='' || message=='Error: Network Error'){
      EventBus.$notif({
        type:'error',
        title:'خطا در سرور',
        timer:2000
      })
    }else{
      EventBus.$alert({
        type:'error',
        title:'هـشدار',
        text:message,
        denyButton:{
          label:'متوجه شدم'
        },
        willClose(){
          st ? window.location.href ="/user/login" : null
        }
      })
    }
  }
  successHandler(response,job){
    Store.dispatch('apiSuccess',{
      job:job,
      result:response
    })
  }
  checkToken(notTok){
    let setToken = true
    notTok ? setToken = false : null
    setToken ? Vue.axios.defaults.headers.common["Authorization"] = `bearer `+ Store.getters.getToken : Vue.axios.defaults.headers.common["Authorization"] = null
  }
  async get(payload) {
    let url =this.server + payload.method;
    let params = this.createFormData(payload.params)
    this.checkToken(payload.notSetToken)
    this.setPayload('get',payload)
    return new Promise((resolve, reject) => {
      Vue.axios.get(url, { params: params})
        .then((response) =>{
          this.successHandler(response.data,payload.id)
          resolve(response.data)}
        ).catch((error) =>  {
          this.errorHandler(error, true, payload.id)
          reject(error)
        });
    });
  }
  async post(payload){
    let url =this.server + payload.method;
    let params = this.createFormData(payload.params)
    this.checkToken(payload.notSetToken)
    this.setPayload('post',payload)
    return new Promise((resolve, reject) => {
      Vue.axios.post(url, params)
        .then((response) =>{
          this.successHandler(response.data,payload.id)
          resolve(response.data)}
        ).catch((error) =>  {
          this.errorHandler(error, true, payload.id)
          reject(error)
        });
    });
  }
  async put(payload){
    let url =this.server + payload.method;
    let params = this.createFormData(payload.params)
    this.checkToken(payload.notSetToken)
    this.setPayload('put',payload)
    return new Promise((resolve, reject) => {
      Vue.axios.put(url, params)
        .then((response) =>{
          this.successHandler(response.data,payload.id)
          resolve(response.data)}
        ).catch((error) =>  {
          this.errorHandler(error, true, payload.id)
          reject(error)
        });
    });
  }
  async delete(payload){
    let url =this.server + payload.method;
    let params = this.createFormData(payload.params)
    this.checkToken(payload.notSetToken)
    this.setPayload('delete',payload)
    return new Promise((resolve, reject) => {
      Vue.axios.delete(url, { data: params })
        .then((response) =>{
          this.successHandler(response.data,payload.id)
          resolve(response.data)}
        ).catch((error) =>  {
          this.errorHandler(error, true, payload.id)
          reject(error)
        });
    });
  }
}

// export default {
//   install: function(Vue, option = {name:'$apiService',apiUrl:null}) {
//     alert(option.name)
//     Vue.use(VueAxios, axios)
//     Object.defineProperty(Vue.prototype, option.name , { value: new ApiService({serverUrl:option.apiUrl}) });
//   }
// }

//export default ApiService;


// if(payload.checkPersian){
//   let text = payload.result.data.JSON.stringify(payload.result.data)
//   text = text.replaceAll('ي','ی',text)
//   text = text.replaceAll('ك','ک',text)
//   payload.result.data = JSON.parse(text)
// }


// state.processing = false
//     let target = payload.payload.loadingTarget;
//     if(target){
//       if(payload.hideReloadButton){
//         stop_taget_loading(target)
//       }else{
//         state.notSuccessApi[payload.id]= payload.payload
//         set_error_taget_loading(target,payload.id)
//       }
//     }
//     if(payload.error){
//       payload.error(payload.status,payload.message)
//     }else{
//       if(payload.showServerMessage){
//         if(payload.status==401){
//           payload.message = 'نشست شما منقضی شد.مجدد لاگین کنید',
//           commit('Alert',{
//             type:'error',
//             text:payload.message,
//             timer: 0,
//             CancelButton:{
//               label:'متوجه شدم',
//               function(){
//                 window.location.replace(FORNT_URL)
//               }
//             }
//           })
//         }else{
//           if(payload.status==404){
//             payload.message = 'سرویس شناسایی نشد'
//           }
//           commit('Alert',{
//             type:'error',
//             text:payload.message,
//             timer: 0,
//             CancelButton:{
//               label:'متوجه شدم'
//             }
//           })
//         }
//       }
//     }
