import destr from 'destr'
import { joinURL } from '@nuxt/ufo'
import type { Fetch, RequestInfo, RequestInit, Response } from './types'
import { createFetchError } from './error'

export interface CreateFetchOptions { fetch: Fetch }

export type FetchRequest = RequestInfo

export interface FetchOptions extends RequestInit {
  baseURL?: string
  response?: boolean
}

export interface FetchResponse<T> extends Response { data?: T }

export interface $Fetch {
  <T = any>(request: FetchRequest, opts?: FetchOptions): Promise<T>
  raw<T = any>(request: FetchRequest, opts?: FetchOptions): Promise<FetchResponse<T>>
}

export function createFetch ({ fetch }: CreateFetchOptions): $Fetch {
  const raw: $Fetch['raw'] = async function (request, opts) {
    if (opts && opts.baseURL && typeof request === 'string') {
      request = joinURL(opts.baseURL, request)
    }
    const response: FetchResponse<any> = await fetch(request, opts)
    const text = await response.text()
    response.data = destr(text)
    if (!response.ok) {
      throw createFetchError(request, response)
    }
    return response
  }

  const $fetch = function (request, opts) {
    return raw(request, opts).then(r => r.data)
  } as $Fetch

  $fetch.raw = raw

  return $fetch
}
