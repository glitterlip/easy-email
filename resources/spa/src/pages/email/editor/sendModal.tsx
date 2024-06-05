import {Alert, Button, Form, Input, message, Modal} from "antd";
import {request} from "@@/plugin-request";
import React, {useState} from "react";
import {JsonToMjml} from "easy-email-core";
import {useEmailStore} from "@/stores/email";
import {SendOutlined} from "@ant-design/icons";

const SendModal = () => {
    const emailStore = useEmailStore();
    const [sending, setSending] = useState(false)
    return <Modal open={true} footer={null} onCancel={(e) => {
        emailStore.setSending(false)
    }}>
        <Form
            layout={'vertical'}
            onFinish={(b) => {

                setSending(true)
                request('/email/send', {
                    method: 'POST',
                    timeout: 1000 * 60,
                    data: {
                        id: emailStore.email.id,
                        email: b.email,
                        content: JsonToMjml({
                            data: emailStore.email.content,
                            mode: 'production'
                        })
                    }
                }).then(r => {
                    setSending(false)
                    emailStore.setSending(false)
                    return message.success('Email send successfully')
                })
            }}>

            <Form.Item name={'email'} label={'Email '}>
                <Input/>
            </Form.Item>
            <Alert className={'my-4 p-2'} message="This will send the email to the provided email address,only for preview purpose" type="info"
                   showIcon/>
            <Form.Item>
                <Button icon={<SendOutlined/>} loading={sending} htmlType="submit" type="primary">Send</Button>
            </Form.Item>
        </Form>
    </Modal>
}

export default SendModal