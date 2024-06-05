import {Button, Checkbox, Form, Input, message, Modal, Radio} from "antd";
import {request} from "@@/plugin-request";
import React, {useState} from "react";
import {Share, useEmailStore} from "@/stores/email";
import classNames from "classnames";
import {ApiResponse} from "@/types/api/general";

const ShareModal = () => {

    const [passwordDisabled, setPasswordDisabled] = useState(true)
    const emailStore = useEmailStore();
    const [shared, setShared] = useState<Share | null>(null)
    return <Modal open={true} footer={null} onCancel={(e) => {
        emailStore.setSharing(false)
    }}>
        <div className="flex flex-col">
            <div className={classNames({hidden: shared})}>
                <Form
                    layout={'vertical'}
                    initialValues={
                        {
                            permissions: ['view'],
                            expiration: "0"
                        }
                    }
                    onValuesChange={(c) => {
                        if ('needPassword' in c) {
                            setPasswordDisabled(c.needPassword ? false : true)
                        }
                    }}
                    onFinish={(b) => {
                        request<ApiResponse<null, Share>>('/email/share/create', {
                            method: 'POST',
                            data: {...b, id: emailStore.email.id, expiration: Number(b.expiration)}
                        }).then(r => {
                            if (r.success) {
                                setShared(r.meta)
                            } else {
                                message.error(r.errorMessage)
                            }
                        })
                    }}>
                    <Form.Item label="Expiration" name={'expiration'}>
                        <Radio.Group>
                            <Radio value={'7'}>7 days</Radio>
                            <Radio value={'30'}>30 days</Radio>
                            <Radio value={'0'}>Never Expire</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="Permissions" name={'permissions'}>
                        <Checkbox.Group>
                            <Checkbox value={'view'}>View</Checkbox>
                            <Checkbox value={'comment'}>Comment</Checkbox>
                            <Checkbox value={'fork'}>Fork</Checkbox>
                            <Checkbox value={'edit'}>Edit</Checkbox>
                        </Checkbox.Group>
                    </Form.Item>
                    <Form.Item valuePropName={'checked'} name={'needPassword'} label={'Password'}>
                        <Checkbox defaultChecked={false}>Need Password</Checkbox>
                    </Form.Item>
                    <Form.Item label={'Password'} name={'password'} hidden={passwordDisabled}>
                        <Input disabled={passwordDisabled} defaultValue={""}/>
                    </Form.Item>
                    <Form.Item>
                        <Button htmlType="submit" type="primary">Share</Button>
                    </Form.Item>
                </Form>
            </div>
            <div className={classNames({hidden: !shared})}>
                <div>
                    <p>Link: {`${window.location.protocol}//${window.location.host}/email/editor?shareId=${shared?.link}`}</p>
                    <p>Expires: {shared?.invalidated_at.Valid ? shared?.invalidated_at.Time : 'Never'}</p>
                    <p>Permissions: {shared?.meta.permissions.join(',')}</p>
                    <p>Password: {shared?.meta.password ? shared?.meta.password : 'Public no password'}</p>
                </div>
            </div>
        </div>
    </Modal>
}

export default ShareModal