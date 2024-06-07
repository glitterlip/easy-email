import type {RequestConfig} from '@umijs/max';
import {history} from '@umijs/max'
import {AxiosResponse} from "axios";
import {ApiResponse, ErrorShowType} from "@/types/api/general";
import {message, notification} from "antd";
import {GuestPaths} from "../config/routes";

export enum ErrorCode {

    Unauthorized = 10401
}

export const errorConfig: RequestConfig = {
        //我真的无法理解 errorHandler这个配置不就是处理错误的,怎么处理完了没catch还继续往外抛 那你skipErrorHandler 到底干嘛的
        requestInterceptors: [
            (url, options) => {
                if (options?.withoutToken) {
                    return {url, options}
                }
                const token = localStorage.getItem('token');
                return {
                    url,
                    options: {
                        ...options,
                        headers: {
                            Authorization: `Bearer ${token}`,
                            ...options.headers,
                        },
                    },
                };
            },
        ],

        responseInterceptors: [
            (response: AxiosResponse<ApiResponse<any, any>>) => {
                const config = response.config as RequestConfig;
                const {success, data, errorCode, errorMessage, showType, traceId, meta} = response.data;
                if (!success) {
                    if (errorCode === ErrorCode.Unauthorized) {
                        if (!GuestPaths.includes(window.location.pathname)) {
                            history.push('/auth/login')
                        }
                    }
                    if (config.skipErrorHandler) throw response;
                    switch (showType) {
                        case ErrorShowType.SILENT:
                            console.log(response.data)
                            break;
                        case ErrorShowType.WARN_MESSAGE:
                            message.warn(errorMessage);
                            break;
                        case ErrorShowType.ERROR_MESSAGE:
                            message.error(errorMessage);
                            break;
                        case ErrorShowType.NOTIFICATION:
                            notification.open({
                                description: errorMessage,
                                message: errorCode,
                            });
                            break;
                        case ErrorShowType.REDIRECT:
                            // TODO: redirect
                            break;
                        default:
                            message.error(errorMessage);

                    }
                }
                return response;
            },
        ],

    }
;
