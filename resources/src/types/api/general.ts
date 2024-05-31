export enum ErrorShowType {
    SILENT = 0,
    WARN_MESSAGE = 1,
    ERROR_MESSAGE = 2,
    NOTIFICATION = 3,
    REDIRECT = 9,
}

export type ApiResponseI<D, M> = ApiResponse<D, M>

export interface ApiResponse<D, M = undefined> {
    success: boolean;
    data: D;
    meta: M;
    errorCode?: number;
    errorMessage?: string;
    showType?: ErrorShowType;
    traceId: string;
}

export interface Pagination<T> {
    items: Array<T>;
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
}