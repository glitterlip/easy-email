import {Button, message, Modal, Tabs} from "antd";
import React, {useState} from "react";
import {JsonToMjml} from "easy-email-core";
import {useEmailStore} from "@/stores/email";
import {CopyOutlined} from "@ant-design/icons";
import mjml from 'mjml-browser';

const ExportModal = (props: { setShowExportModal: (boolean) => void }) => {

    const [lang, setLang] = useState('json')

    const copy = () => {
        switch (lang) {
            case 'json':
                navigator.clipboard.writeText(JSON.stringify(useEmailStore.getState().email.content, null, 2)).then(() => {
                    message.success('JSON code Copied')
                }).catch(() => {
                    message.error('Failed to copy JSON code')
                })
                break;
            case 'mjml':
                navigator.clipboard.writeText(JsonToMjml({data: useEmailStore.getState().email.content})).then(() => {
                    message.success('MJML code Copied')
                }).catch(() => {
                    message.error('Failed to copy MJML code')
                })
                break
            case 'html':
                navigator.clipboard.writeText(JsonToMjml({data: useEmailStore.getState().email.content})).then(() => {
                    message.success('HTML code Copied')
                }).catch(() => {
                    message.error('Failed to copy HTML code')
                })

        }
    }
    return <Modal width={'80vw'} open={true} footer={null} onCancel={(e) => {
        props.setShowExportModal(false)
    }}>
        <Tabs type="card"
              className={'mt-8'}
              tabBarExtraContent={<Button onClick={copy} icon={<CopyOutlined/>}>Copy</Button>}
              defaultActiveKey="json"
              onChange={t => {
                  setLang(t)
              }}
              items={
                  [
                      {
                          label: 'JSON',
                          key: 'json',
                          children: <div className="mockup-code">
                        <pre>
                            <code>{JSON.stringify(useEmailStore.getState().email.content, null, 2)}</code>
                        </pre>
                          </div>
                      },
                      {
                          label: 'MJML',
                          key: 'mjml',
                          children: <div className="mockup-code">
                        <pre>
                            <code>{JsonToMjml({data: useEmailStore.getState().email.content})}</code>
                        </pre>
                          </div>
                      },
                      {
                          label: 'HTML',
                          key: 'html',
                          children: <div className="mockup-code">
                              <pre>{mjml(JsonToMjml({data: useEmailStore.getState().email.content})).html}</pre>
                          </div>
                      }
                  ]
              }/>
    </Modal>
}

export default ExportModal