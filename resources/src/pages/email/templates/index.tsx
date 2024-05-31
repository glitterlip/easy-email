import React, {useCallback, useRef, useState} from 'react'
import {PageContainer} from "@ant-design/pro-components";
import {message, Pagination, Tabs, Tag, Tooltip} from "antd";
import {useHover, useRequest} from "ahooks";
import {RiFileCopy2Fill, RiHeartAdd2Fill, RiZoomInFill} from "@remixicon/react";
import classNames from "classnames";
import {Button, Input, Modal} from 'react-daisyui'
import {history, request} from '@umijs/max'
import {Template} from "@/stores/email";

const Templates = () => {

    return (<PageContainer className={'bg-white'}>
        <Tabs
            defaultActiveKey="templates"
            tabBarExtraContent={'Create New Email'}
            type="card"
            size={'large'}
            items={[
                {label: 'Templates', key: 'templates', children: <Emails type={'system'}/>},
                {label: 'Emails', key: 'emails', children: <Emails type={'user'}/>}
            ]}
        />
    </PageContainer>)
}

const Emails = ({type}: { type: 'system' | 'user' }) => {
    const [name, setName] = useState('')

    const [template, setTemplate] = useState<Template | null>(null)
    const {data, loading, params, run, error} = useRequest((params) => {
        return request('/email/templates', {params})
    }, {
        defaultParams: [{page: 1, type, pageSize: 12}]
    })

    const copy = useCallback(() => {
        request('/email/create', {
            method: 'POST',
            data: {
                old: template?.id,
                name
            }
        }).then(r => {
            history.push('/email/editor?id=' + r.meta.id)
        })
    }, [template])
    return <div>
        <Modal open={type == 'system' && !!template}>
            <Modal.Header className="font-bold">Hold on</Modal.Header>
            <Modal.Body>
                <div className="flex w-full component-preview p-4 items-center justify-center gap-2 font-sans">
                    <div className="form-control w-full max-w-xs">
                        <label className="label">
                            <span className="label-text">Email name</span>
                        </label>
                        <Input onChange={({target}) => {
                            setName(target.value)
                        }}/>
                    </div>
                </div>
                <div className="text-center">
                    Set the name of the new email to continue
                </div>
            </Modal.Body>
            <Modal.Actions>
                <Button onClick={copy} color="accent">Continue</Button>
                <Button onClick={() => {
                    setTemplate(null)
                }}>Cancel</Button>
            </Modal.Actions>
        </Modal>
        <div className="flex flex-row flex-wrap w-full gap-4 ">
            {data?.data?.map((item: any) => {
                return <Item key={item.id} item={item} create={() => {
                    if (type == 'system') {
                        setTemplate(item)
                    } else {
                        history.push('/email/editor?id=' + item.id)
                    }
                }}/>
            })}
        </div>
        <Pagination defaultCurrent={1} total={data?.meta?.total} pageSize={12} onChange={(p, ps) => {
            run({page: p, pageSize: ps, type})
        }}/>
    </div>

}
const Item = ({item, create}: { create: () => void, item: Template }) => {
    const hoverRef = useRef<HTMLDivElement>(null)

    const isHovering = useHover(hoverRef)
    const tools = <div className={'gap-2 flex justify-end w-full pr-4 pt-4'}>
        <Tooltip title={'copy and edit'}>
            <span className={'bg-white px-2 py-1 rounded-lg'}><RiFileCopy2Fill size={24}></RiFileCopy2Fill></span>
        </Tooltip>
        <Tooltip title={'like'}>
            <span className={'bg-white px-2 py-1 rounded-lg'}><RiHeartAdd2Fill size={24}></RiHeartAdd2Fill></span>
        </Tooltip>
        <Tooltip title={'preview'}>
            <span className={'bg-white px-2 py-1 rounded-lg'}><RiZoomInFill size={24}></RiZoomInFill></span>
        </Tooltip>
    </div>


    return <div className={'flex flex-col'} ref={hoverRef} >
        <div className={'w-[300px] h-[400px] overflow-y-scroll scrollbar-hide relative'}>
            <img width={300}
                 src="https://github.com/mjmlio/email-templates/raw/f5d18876ce2797f9d944a99318f010c6775b538c/thumbnails/amario.jpg"
                 className={'absolute top-0 left-0'}/>
            <div className={classNames("absolute h-full w-full flex-col z-100 bg-[#151515cc]", isHovering ? 'flex' : 'hidden')}>
                {tools}
                <div className={'px-4 py-2 flex flex-col gap-4 flex-1 justify-center'}>
                    <Button color="primary" className={'w-full'} onClick={() => {
                        create()
                    }}>Edit</Button>
                    <Button color="primary" className={'w-full'}>Preview</Button>
                </div>
            </div>
        </div>
        <div className={'p-4'}>
            <div className="flex"><span className={'text-xl'}>{item.name}</span></div>
            <div className="flex">
                <Tag color="magenta">magenta</Tag>
                <Tag color="magenta">magenta</Tag>
                <Tag color="magenta">magenta</Tag>
            </div>
        </div>
    </div>
}

export default Templates