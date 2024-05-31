import {Button, Drawer, Table, Tooltip} from "antd";
import dayjs from "dayjs";
import {useState} from "react";
import {Template, useEmailStore} from "@/stores/email";
import {JsonToMjml} from "easy-email-core";
import {ColumnsType} from "antd/es/table";
import {request} from "@@/plugin-request";
import {history} from '@umijs/max';
import {MjmlToHtml} from "@/utils/email";
import _ from 'lodash'

const Comments = ({visible, setVisible}: { visible: boolean, setVisible: (visible: boolean) => void }) => {

    const {email, setComparing} = useEmailStore(s => s)

    const [preview, setPreview] = useState<Template | null>(null)

    const [selected, setSelected] = useState<Array<Template>>([])
    let data = [
        ...(email.siblings ? email.siblings : []),
        ...(email.children ? email.children : []),
    ]
    if (email.parent) {
        data.push(email.parent)
    }
    data = _.sortBy(data, (r) => {
        return r.updated_at?.Time || r.created_at?.Time
    }).reverse()
    const TakeScreenshot = () => {
        const regex = /-\((\d+)\)$/;
        let result;

        if (regex.test(email.name)) {
            result = email.name.replace(regex, (match, p) => `-(${parseInt(p) + 1})`);
        } else {
            result = email.name + '-(1)';
        }
        request('/email/create', {
            method: 'POST',
            data: {
                old: email.pid || email.id,
                name: result,
                content: email.content
            }
        }).then((r) => {
            history.push('/email/editor?id=' + r.meta.id)
        })
    }
    const columns: ColumnsType<Template> = [
        {
            title: 'Time',
            key: 'time',
            render: (r) => {
                return dayjs(r.updated_at.Time || r.created_at.Time).format('MM-DD HH:mm')
            }
        },
        {
            title: "Remark",
            key: 'remark',
            render: (r) => {
                return r.name
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (r) => {
                return <div className={'flex gap-4'}>
                    <Button size={'small'} onClick={() => {
                        console.log(r)
                        setPreview(r)
                    }}>Preview</Button>
                    <Tooltip title={'Switch to it and start edit'}>
                        <Button size={'small'} onClick={() => {
                            history.push('/email/editor?id=' + r.id)
                        }}>Switch</Button>
                    </Tooltip>
                    <Button size={'small'} danger>Delete</Button>
                </div>
            }
        }
    ]

    return <Drawer
        title="Cloud Versions"
        closable={true}
        width={800}
        open={visible}
        onClose={() => {
            setVisible(false)
        }}
    >
        <div className="flex gap-4">
            <Button
                size={'small'}
                disabled={!selected.length}
                onClick={() => {
                    setComparing([...selected, email])
                }}>
                Compare
            </Button>
            <Tooltip title={'Save current template as a screenshot'}>
                <Button size={'small'} onClick={TakeScreenshot}>Save</Button>
            </Tooltip>

        </div>
        <Table
            dataSource={data}
            columns={columns}
            rowKey={'id'}
            pagination={false}
            rowSelection={{
                type: 'checkbox',
                onChange: (selectedRowKeys, selectedRows) => {
                    setSelected(selectedRows)
                }

            }}
        />

        <Drawer
            title={preview && ("Preview:" + preview.name)}
            width={600}
            open={!!preview}
            onClose={() => {
                setPreview(null)
            }}
            closable={true}
        >
            {preview && <div dangerouslySetInnerHTML={{
                __html: MjmlToHtml(JsonToMjml({
                    idx: null,
                    mode: 'testing',
                    data: preview.content,
                }))
            }}></div>}
        </Drawer>

    </Drawer>
}


export default Comments