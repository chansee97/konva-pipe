import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useMessage } from 'naive-ui'

const message = useMessage()

/**
 * @description: 封装axios请求类
 */
export default class createAxiosInstance {
  // axios 实例
  instance: AxiosInstance
  // 后台字段配置
  backendConfig: Service.BackendResultConfig
  // 基础配置
  axiosConfig: AxiosRequestConfig = {}

  constructor(
    axiosConfig: AxiosRequestConfig,
    backendConfig: Service.BackendResultConfig = {
      codeKey: 'code',
      dataKey: 'data',
      msgKey: 'msg',
      successCode: '200',
    },
  ) {
    this.backendConfig = backendConfig
    // 设置了axios实例上的一些默认配置,新配置会覆盖默认配置
    this.instance = axios.create({ timeout: 60000, ...axiosConfig })

    this.setInterceptor()
  }

  // 设置类拦截器
  setInterceptor() {
    this.instance.interceptors.request.use(
      (config) => {
        return config
      },
      (err: any) => Promise.reject(err),
    )
    this.instance.interceptors.response.use(
      // 因为接口的数据都在res.data下，所以直接返回res.data
      // 系统如果有自定义code也可以在这里处理
      (res: AxiosResponse) => {
        // apiData 是 API 返回的数据
        const apiData = res.data
        // 这个 Code 是和后端约定的业务 Code
        const code = String(res.data[this.backendConfig.codeKey])
        switch (code) {
          case this.backendConfig.successCode:
            // code === 200 代表没有错误,直接返回约定的数据内容
            return apiData[this.backendConfig.dataKey]
          default:
            // 不是正确的 Code,返回错误提示信息
            return Promise.reject(new Error(`Error:${this.backendConfig.dataKey}`))
        }
      },
      (err: any) => {
        // 这里用来处理http常见错误，进行全局提示
        let tip = ''
        switch (err.response.status) {
          case 400:
            tip = '请求错误(400)'
            break
          case 401:
            tip = '未授权，请重新登录(401)'
            // 这里可以做清空storage并跳转到登录页的操作
            break
          case 403:
            tip = '拒绝访问(403)'
            break
          case 404:
            tip = '请求出错(404)'
            break
          case 408:
            tip = '请求超时(408)'
            break
          case 500:
            tip = '服务器错误(500)'
            break
          case 501:
            tip = '服务未实现(501)'
            break
          case 502:
            tip = '网络错误(502)'
            break
          case 503:
            tip = '服务不可用(503)'
            break
          case 504:
            tip = '网络超时(504)'
            break
          case 505:
            tip = 'HTTP版本不受支持(505)'
            break
          default:
            tip = `连接出错(${err.response.status})!`
        }
        message.error(tip)
        // 这里是AxiosError类型，所以一般我们只reject我们需要的响应即可
        return Promise.reject(err.response)
      },
    )
  }
}
