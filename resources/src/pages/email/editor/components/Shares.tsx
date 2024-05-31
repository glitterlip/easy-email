import {Button, Drawer, Table, Tooltip} from "antd";
import dayjs from "dayjs";
import {Share, useEmailStore} from "@/stores/email";
import {ColumnsType} from "antd/es/table";

const Shares = ({visible, setVisible}: { visible: boolean, setVisible: (visible: boolean) => void }) => {

    const {email, sharesDrawer, setSharesDrawer, sharing, setSharing} = useEmailStore(s => s)


    const columns: ColumnsType<Share> = [
        {
            title: 'Created At',
            key: 'time',
            render: (r) => {
                return dayjs(r.created_at.Time).format('MM-DD HH:mm')
            }
        },
        {
            title: "Expiration",
            key: 'remark',
            render: (r) => {
                return r.invalidated_at.Valid ? dayjs(r.invalidated_at.Time).format('MM-DD HH:mm') : 'Never'
            }
        },
        {
            title: "Password",
            key: 'remark',
            render: (r) => {
                return r.meta.password || 'Public'
            }
        },
        {
            title: "Permissions",
            key: 'remark',
            render: (r) => {
                return r.meta.permissions.join(',')
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (r) => {
                let link = `${window.location.protocol}//${window.location.host}/email/editor?shareId=${r.link}`
                if (r.meta.password) {
                    link += '&pwd=' + r.meta.password
                }
                return <div className={'flex gap-4'}>
                    <Button size={'small'} danger>delete</Button>
                    {link}
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
            <Tooltip title={'Save current template as a screenshot'}>
                <Button size={'small'} onClick={() => {
                    setSharing(true)
                }}>Create new share link</Button>
            </Tooltip>
        </div>
        <Table
            dataSource={email.shares}
            columns={columns}
            rowKey={'id'}
            pagination={false}
        />
    </Drawer>
}


export default Shares