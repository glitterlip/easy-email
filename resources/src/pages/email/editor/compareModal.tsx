import {Modal, Tabs} from "antd";
import React from "react";
import {useEmailStore} from "@/stores/email";
import {JsonToMjml} from "easy-email-core";
import _ from "lodash";
import {MjmlToHtml} from "@/utils/email";

const CompareModal = ({close}: { close: () => void }) => {
    const templates = useEmailStore(s => s.comparing);

    return <Modal
        width={'100%'}
        open={true}
        footer={null} onCancel={close}>
        <div className="flex flex-wrap gap-4">
            {templates.map((item, index) => {
                const jsonContent = item.content
                const mjmlContent = JsonToMjml({
                    idx: null,
                    data: jsonContent,
                    mode: 'testing'
                })
                const htmlContent = MjmlToHtml(mjmlContent)

                return <Tabs
                    key={item.id}
                    type="card"
                    items={[
                        {
                            key: 'preview',
                            label: 'preview',
                            children: <div className="flex flex-col">
                                <div>{_.truncate(item.name)}</div>
                                <div className={'w-[320px]'} dangerouslySetInnerHTML={{
                                    __html: htmlContent
                                }}></div>
                            </div>
                        },
                        {
                            key: 'JSON',
                            label: 'JSON',
                            children: <div className="mockup-code w-[320px]">
                        <pre>
                            <code>{JSON.stringify(jsonContent, null, 2)}</code>
                        </pre>
                            </div>
                        },
                        {
                            key: 'MJML',
                            label: 'MJML',
                            children: <div className="mockup-code w-[320px]">
                        <pre>
                            <code>{mjmlContent}</code>
                        </pre>
                            </div>
                        },
                        {
                            key: 'HTML',
                            label: 'HTML',
                            children: <div className="mockup-code w-[320px]">
                                <pre>{htmlContent}</pre>
                            </div>
                        }
                    ]}
                />
            })}

        </div>

    </Modal>
}

export default CompareModal