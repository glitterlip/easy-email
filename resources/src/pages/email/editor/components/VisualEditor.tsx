import React, {useState} from 'react'
import {DesktopEmailPreview, EditEmailPreview, MobileEmailPreview} from "easy-email-editor";
import classNames from "classnames";
import {
    RiChat1Line,
    RiHistoryLine,
    RiMacLine,
    RiMailFill,
    RiShareForwardBoxFill,
    RiSmartphoneFill,
    RiStackFill,
    RiTerminalWindowLine
} from "@remixicon/react";
import {Template, useEmailStore} from "@/stores/email";
import {useAppStore} from "@/stores/app";
import {message} from "antd";
import {history, request} from '@umijs/max'
import {ApiResponseI} from "@/types/api/general";

const VisualEditor = () => {
    const emailStore = useEmailStore()
    const user = useAppStore(s => s.user)
    const authorized = !!user
    let TabItems = [
        {
            title: 'Editor',
            key: 'editor',
            openType: 'tab',
            icon: <RiTerminalWindowLine/>,
            disabled: () => false,
        },
        {
            title: 'PC',
            key: 'pcPreview',
            openType: 'tab',
            icon: <RiMacLine/>,
            disabled: () => false,

        },
        {
            title: 'Mobile',
            key: 'mobilePreview',
            openType: 'tab',
            icon: <RiSmartphoneFill/>,
            disabled: () => false,

        },
        {
            title: 'Share',
            key: 'share',
            openType: 'action',
            icon: <RiShareForwardBoxFill/>,
            action: () => {
                emailStore.setSharesDrawer(true)
            },
            disabled: () => {
                if (!authorized) {
                    return 'please loginin'
                }
                if (emailStore.sharedTemplate) {
                    return 'cant share a shared template'
                }
                return false;
            },

        },
        {
            title: 'Send',
            key: 'send',
            openType: 'action',
            icon: <RiMailFill/>,
            action: () => {
                emailStore.setSending(true)
            },
            disabled: () => {
                if (!authorized) {
                    return 'please loginin'
                }
                if (emailStore.sharedTemplate) {
                    return 'cant send a shared template,please fork then send'
                }
                return false
            }
        },
        {
            title: 'History',
            key: 'history',
            openType: 'action',
            icon: <RiHistoryLine/>,
            action: () => {
                emailStore.setLocalHistoryDrawer(true)
            },
            disabled: () => {
                return false
            }
        },
        {
            title: 'Versions',
            key: 'versions',
            openType: 'action',
            icon: <RiStackFill/>,
            action: () => {
                emailStore.setCloudVersionDrawer(true)
            },
            disabled: () => {
                if (!authorized) {
                    return 'please loginin'
                }
                if (emailStore.sharedTemplate) {
                    return 'versions are not shared'
                }
                return false
            }
        },
        {
            title: 'Comment',
            key: 'comment',
            openType: 'action',
            icon: <RiChat1Line/>,
            action: () => {
                emailStore.setCommentsDrawer(true)
            },
            disabled: () => {
                if (!authorized) {
                    return 'please loginin'
                }
                return false
            }
        },
        {
            title: 'Fork',
            key: 'fork',
            openType: 'action',
            icon: <RiChat1Line/>,
            action: () => {
                request<ApiResponseI<null, Template>>('/email/share/fork', {
                    method: "POST",
                    data: {
                        id: emailStore.sharedTemplate?.link,
                        password: emailStore.sharedTemplate?.verifiedPassword
                    }
                }).then(r => {
                    if (r.success) {
                        message.success('forked, now redirect to your own template').then(() => {
                            history.push('/email/editor?id=' + r.meta.id)
                        })

                    } else {
                        message.error(r.errorMessage)
                    }
                })
            },
            disabled: () => {
                if (!authorized) {
                    return 'please loginin'
                }
                if (!emailStore.sharedTemplate) {
                    return 'not a shared template'
                }
                return false
            }
        },
    ]

    if (!authorized) {
        TabItems.push({
            title: 'Login',
            key: 'login',
            openType: 'action',
            icon: <RiChat1Line/>,
            action: () => {
                history.push('/auth/login')
            },
            disabled: () => {
                return false
            }
        })
    }

    const [activeTab, setActiveTab] = useState('editor')
    return <div className="flex flex-col ">
        <div className="flex flex-col">
            <div className="flex flex-col">
                <div className="flex bg-purple-400 text-white min-h-[70px]">
                    <div className="px-2">
                        <div className={'flex flex-wrap gap-2'}>
                            {TabItems.map(item => (
                                <div key={item.key}
                                     onClick={() => {
                                         let msg = item.disabled()
                                         if (msg) {
                                             message.error(msg)
                                             return
                                         }
                                         switch (item.openType) {
                                             case 'tab':
                                                 setActiveTab(item.key)
                                                 break;
                                             case 'action':
                                                 typeof item.action == 'function' && item.action()
                                                 break;
                                             case 'drawer':
                                                 break;
                                         }
                                     }}
                                     className={classNames(item.key === activeTab ? 'bg-purple-600' : 'bg-purple-400', 'cursor-pointer hover:bg-purple-500 px-2 py-1 rounded-lg')}>
                                    <div className={'flex items-center '}>{item?.icon}{item.title}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {activeTab === 'editor' && <EditEmailPreview/>}
                {activeTab === 'pcPreview' && <DesktopEmailPreview/>}
                {activeTab === 'mobilePreview' && <MobileEmailPreview/>}
            </div>
        </div>
    </div>

}

export default VisualEditor