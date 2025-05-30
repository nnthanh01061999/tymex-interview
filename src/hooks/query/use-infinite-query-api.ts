import { apiConfig } from "@/configs/api"
import { RequestConfig } from "@/helpers/fetch/fetch.type"
import { sendRequest } from "@/helpers/fetch/send-request"
import { injectVariablesToPath } from "@/helpers/fetch/util"
import { toast } from "@/hooks/use-toast"
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions
} from "@tanstack/react-query"

type ApiKey = keyof typeof apiConfig

interface UseInfiniteQueryApiOptions<
  TData = unknown,
  TKey extends ApiKey = ApiKey
> extends Omit<RequestConfig<TData>, "method" | "url">,
    Omit<UseInfiniteQueryOptions<TData>, "queryKey"> {
  pathVariables?: TExtractParams<TKey>
  headers?: RequestConfig<any>["headers"]
  params?: RequestConfig<any>["params"]
  payload?: RequestConfig<any>["payload"]
  nextParamsIsData?: boolean
  onError?: (
    error: ReturnType<Awaited<typeof useInfiniteQuery>>["error"]
  ) => void
}

function useInfiniteQueryApi<TData = any, TKey extends ApiKey = ApiKey>(
  apiKey: TKey,
  opts?: UseInfiniteQueryApiOptions<TData, TKey>
) {
  const {
    pathVariables = {},
    initialPageParam,
    headers,
    params,
    payload,
    nextParamsIsData = false,
    onError,
    ...rest
  } = opts ?? {}
  const { url, options } = apiConfig[apiKey]
  const method = options.method
  const apiPath = pathVariables
    ? injectVariablesToPath(url, pathVariables)
    : url

  return useInfiniteQuery<TData>({
    queryKey: [
      `infinite-${apiKey}`,
      ...Object.values(pathVariables),
      { ...(initialPageParam || {}), _page: undefined, _limit: undefined },
      payload,
      params
    ],
    queryFn: ({ pageParam }) => {
      return sendRequest({
        method,
        throwError: true,
        url: apiPath,
        headers: {
          ...options.headers,
          ...headers
        },
        params: {
          ...(initialPageParam || {}),
          ...params,
          ...(nextParamsIsData ? {} : (pageParam as any))
        },
        payload: { ...payload, ...(nextParamsIsData ? (pageParam as any) : {}) }
      })
        .then((res) => {
          return res.responseData
        })
        .catch((error) => {
          if (onError) {
            onError?.(error)
          } else {
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive"
            })
          }
          throw error
        })
    },
    retry: false,
    ...(rest as unknown as any)
  })
}

export default useInfiniteQueryApi
