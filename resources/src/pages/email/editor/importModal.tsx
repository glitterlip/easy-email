import {Button, Input, message, Modal, Tabs} from "antd";
import React, {useState} from "react";
import {CopyOutlined} from "@ant-design/icons";
import {MjmlToJson} from "easy-email-extensions";
import {useEmailStore} from "@/stores/email";

const {TextArea} = Input;

const ImportModal = (props: { setShowImportModal: (boolean) => void }) => {
    const emailStore = useEmailStore();

    const [lang, setLang] = useState('json')

    const [code, setCode] = useState('')

    const importCode = () => {
        switch (lang) {
            case 'json':
                emailStore.setEmail({...emailStore.email, content: JSON.parse(code)})
                break;
            case 'mjml':
                emailStore.setEmail({...emailStore.email, content: MjmlToJson({data: code})})
                break

        }
        props.setShowImportModal(false)
        message.success('Import success')
    }
    return <Modal width={'80vw'} open={true} footer={null} onCancel={(e) => {
        props.setShowImportModal(false)
    }}>
        <Tabs type="card"
              className={'mt-8'}
              tabBarExtraContent={<Button onClick={importCode} icon={<CopyOutlined/>}>Import {lang.toUpperCase()} code</Button>}
              defaultActiveKey="json"
              onChange={t => {
                  setLang(t)
              }}
              items={
                  [
                      {
                          label: 'JSON',
                          key: 'json',
                          children: <div className="mockup-code scrollbar-hide">
                              <TextArea
                                  className={'scrollbar-hide'}
                                  style={{
                                      backgroundColor: '#2b3440',
                                      placeholderColor: '#d7dde4',
                                      color: '#d7dde4',
                                      border: 'none'
                                  }}
                                  value={code}
                                  onChange={(e) => setCode(e.target.value)}
                                  placeholder="Paste your json code here"
                                  autoSize={{minRows: 30}}
                              />
                          </div>
                      },
                      {
                          label: 'MJML',
                          key: 'mjml',
                          children: <div className="mockup-code">
                              <TextArea
                                  className={'scrollbar-hide'}
                                  style={{
                                      backgroundColor: '#2b3440',
                                      placeholderColor: '#d7dde4',
                                      color: '#d7dde4',
                                      border: 'none'
                                  }}
                                  value={code}
                                  onChange={(e) => setCode(e.target.value)}
                                  placeholder="Paste your json code here"
                                  autoSize={{minRows: 30}}
                              />
                          </div>
                      },
                  ]
              }/>
    </Modal>
}

export default ImportModal