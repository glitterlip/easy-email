import {useAppStore} from "@/stores/app";

export const CheckLogin = () => {
    const appState = useAppStore.getState()

    return !!appState.user
}