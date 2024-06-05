import {Button, Drawer, Table} from "antd";
import dayjs from "dayjs";
import {useEffect, useState} from "react";
import {useEmailStore} from "@/stores/email";
import {db, EmailModel} from "@/stores/db";
import {JsonToMjml} from "easy-email-core";
import {ColumnsType} from "antd/es/table";
import {IBlockData} from "easy-email-core/lib/typings";
import {MjmlToHtml} from "@/utils/email";

const LocalHistory = ({visible, setVisible}: { visible: boolean, setVisible: (visible: boolean) => void }) => {

    const emailStore = useEmailStore(s => s)
    const [pageMeta, setPageMeta] = useState<{
        pageSize: number,
        current: number,
        data: Array<EmailModel>,
        total: number
    }>({
        pageSize: 10,
        current: 1,
        data: [],
        total: 0
    })
    const [preview, setPreview] = useState<EmailModel | null>(null)
    const query = async (page: number) => {
        const c = db.emails.where({'remoteId': emailStore.email.id})
        const total = await c.count()
        const data = await c.reverse().offset(10 * (page - 1)).limit(10).toArray()
        setPageMeta({
            ...pageMeta,
            current: page,
            data, total,
        })
    }
    useEffect(() => {
        if (visible) {
            query(1)
        }
    }, [visible])
    const columns: ColumnsType<EmailModel> = [
        {
            title: 'time',
            key: 'time',
            render: (r) => {
                return dayjs(r.time).format('MM-DD HH:mm')
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (r) => {
                return <div className={'flex gap-4'}>
                    <Button size={'small'} onClick={() => {
                        setPreview(r)
                    }}>Preview</Button>
                    <Button size={'small'}>Restore</Button>
                    <Button size={'small'} danger>Delete</Button>
                </div>
            }
        }
    ]

    return <Drawer
        title="Local Historys"
        closable={true}
        width={600}
        open={visible}
        onClose={() => {
            setVisible(false)
        }}
    >
        <Table
            dataSource={pageMeta.data}
            columns={columns}
            rowKey={'time'}
            pagination={{
                ...pageMeta,
                showSizeChanger: false,
                onChange: (p, ps) => {
                    query(p)
                }
            }}/>

        <Drawer
            title={preview && ("Preview:" + dayjs(preview.time).format('MM-DD HH:mm'))}
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
                    data: preview.email.content as IBlockData,
                    mode: 'testing'
                }))
            }}></div>}
        </Drawer>

    </Drawer>
}


export default LocalHistory