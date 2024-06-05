import {request} from "@@/plugin-request";
import {message} from "antd";
import {useEmailStore} from "@/stores/email";
import {CollectedBlock, IEmailTemplate} from "easy-email-editor";

export const SaveEmailCloud = (vs: IEmailTemplate) => {
    const state = useEmailStore.getState()
    request('/email/templates/' + state.email?.id, {
        method: 'POST',
        data: {
            content: vs.content,
            name: state.email?.name,
        }
    }).then(r => {
        state.getEmail(state.email?.id).then(e => {
            state.setEmail(e)
        })
        state.setEmail({...state.email, content: vs.content})

        return message.success('Saved to cloud')
    })
}

export const UploadEmailImage = async (file: Blob) => {
    let data = new FormData()
    data.append('file', file)
    data.append("type", "email")
    return request('/file/upload', {
        method: "POST",
        data: data
    }).then(r => {
        if (r.success) {
            return r.meta.path
        } else {
            message.error(`Upload failed:  ${r.errorMessage} (${r.errorCode})`)
        }
    })
}

export const CreateBlock = async (block: CollectedBlock) => {
    request('/email/block', {
        method: 'POST',
        data: {
            content: block.data,
            meta: {
                title: block.label,
                description: block.helpText,
                id: block.id,
                thumbnail: block.thumbnail,
            }
        }
    }).then(r => {
        if (r.success) {
            message.success('Create block success')
        } else {
            message.error(`Create block failed:  ${r.errorMessage} (${r.errorCode})`)
        }
    })
}