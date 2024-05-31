import {Template, useEmailStore} from "@/stores/email";
import {Button, Checkbox, message, Tag, Tooltip} from "antd";
import {request} from "@@/plugin-request";
import {history} from '@umijs/max';
import dayjs from "dayjs";
import {useState} from "react";
import { CheckboxChangeEventTarget } from "antd/es/checkbox/Checkbox";

const Screenshots = () => {
    const emailStore = useEmailStore();

    const [selected, setSelected] = useState<Array<Template>>([])
    let current;
    const isSuccessor = emailStore.email.pid
    if (isSuccessor) {
        current = `Screenshot of ${emailStore.email.parent?.name}`
    } else {
        current = `Original Template of ${emailStore.email.children ? emailStore.email.children.length : 0} screentshot`
    }
    const TakeScreenshot = () => {
        request('/email/create', {
            method: 'POST',
            data: {
                old: emailStore.email.pid || emailStore.email.id,
                name: `${emailStore.email.name}-${new Date().getTime()}`,
                content: emailStore.email.content
            }
        }).then((r) => {
            history.push('/email/editor?id=' + r.meta.id)
        })
    }
    const selectVersion = (target: CheckboxChangeEventTarget, item: Template) => {
        if (target.checked) {
            setSelected([...selected, item])
        } else {
            setSelected(selected.filter(i => i.id !== item.id))
        }
    }
    const compare = () => {
        emailStore.setComparing([emailStore.email,...selected])
    }
    return <div className={'flex flex-col'}>
        <div className="flex gap-4 flex-wrap">
            <span className={'basis-full'}>Current: {emailStore.email.name} {current}</span>
            <Tooltip title={'Take a screenshot of current template'}>
                <Button size={'small'} onClick={TakeScreenshot}>screentshot</Button>
            </Tooltip>
            <Tooltip title={'Select screenshots and compare'}>
                <Button size={'small'} onClick={compare}>compare</Button>
            </Tooltip>
        </div>

        <div className="flex flex-col">
            {emailStore.email.parent ?
                <div className="flex">
                    <Checkbox onChange={(e) => {
                        selectVersion(e.target, emailStore.email.parent)
                    }}></Checkbox>
                    <Screenshot screenshot={emailStore.email.parent} current={emailStore.email}/>
                </div>
                :
                null}
            {emailStore.email.children && emailStore.email.children.map((item, index) => {
                return <div className="flex">
                    <Checkbox onChange={(e) => {
                        selectVersion(e.target, item)
                    }}></Checkbox>
                    <Screenshot key={index} screenshot={item} current={emailStore.email}/>
                </div>
            })}
            {emailStore.email.siblings && emailStore.email.siblings.map((item, index) => {
                return <div className="flex">
                    <Checkbox onChange={(e) => {
                        selectVersion(e.target, item)
                    }}></Checkbox>
                    <Screenshot key={index} screenshot={item} current={emailStore.email}/>
                </div>
            })}
        </div>

    </div>
}

const Screenshot = ({screenshot, current}: { screenshot: Template, current: Template }) => {

    const emailStore = useEmailStore();
    return <div className={'flex flex-col p-4'}>
        <div><span className={'text-xl'}>{screenshot.name}</span> {screenshot.pid ? null :
            <div className={'inline-block'}><Tag color="#108ee9">Parent</Tag> <Button size={'small'} danger>Detach</Button></div>
        }</div>
        <div className="flex text-gray-500">
            Created at: {dayjs(screenshot.created_at?.Time).format('YYYY-MM-DD HH:mm')}
            Last modified: {dayjs(screenshot.updated_at?.Time || screenshot.created_at?.Time).format('YYYY-MM-DD HH:mm')}
        </div>
        <div className="flex gap-4">
            <Tooltip title={'Switch to it and start edit'}>
                <Button size={'small'} onClick={() => {
                    history.push('/email/editor?id=' + screenshot.id)
                }}>Switch</Button>
            </Tooltip>
            <Tooltip title={'overwrite target with current template'}>
                <Button size={'small'} onClick={() => {
                    request('/email/templates/' + screenshot.id, {
                        method: 'POST',
                        data: {
                            content: current.content,
                            name: current.name,
                        }
                    }).then(r => {
                        message.success('Overwritten')
                    })
                }}>Overwrite</Button>
            </Tooltip>
            <Tooltip title={'replace current template with selected one'}>
                <Button size={'small'} onClick={() => {
                    request('/email/templates/' + screenshot.id).then(r => {
                        emailStore.setEmail({...current, content: r.meta.content})
                        message.success('Replaced')
                    })
                }}>Replace</Button>
            </Tooltip>
            <Button size={'small'} danger>Delete</Button>
        </div>

    </div>
}

export default Screenshots