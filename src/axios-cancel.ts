import axios, { type AxiosRequestConfig, type Canceler } from 'axios'
import { isFunction } from './is'

let pendingMap = new Map<string, Canceler>()

export const getPendingUrl = (config: AxiosRequestConfig) => {
  return [config.method, config.url, JSON.stringify(config.params), JSON.stringify(config.data)].join('&')
}

export class AxiosCanceler {
  addPending(config: AxiosRequestConfig) {
    this.removePending(config)
    const url = getPendingUrl(config)
    config.cancelToken =
      config.cancelToken ||
      new axios.CancelToken((cancel) => {
        if (!pendingMap.has(url)) {
          pendingMap.set(url, cancel)
        }
      })
  }

  removeAllPending() {
    pendingMap.forEach((cancel) => {
      cancel && isFunction(cancel) && cancel()
    })
    pendingMap.clear()
  }

  removePending(config: AxiosRequestConfig) {
    const url = getPendingUrl(config)

    if (pendingMap.has(url)) {
      const cancel = pendingMap.get(url)
      cancel && cancel(url)
      pendingMap.delete(url)
    }
  }

  reset(): void {
    pendingMap = new Map<string, Canceler>()
  }
}
