import {create} from "zustand";

export interface User {
    id: number;
    name: string;
    email: string;
}
export interface RawGolangTime{
    Time:string;
    Valid: boolean;
}
export interface AppState {
    user: User | undefined;
}

export const useAppStore = create<AppState>()((set, get, store) => ({
        user: undefined,
    }
));
