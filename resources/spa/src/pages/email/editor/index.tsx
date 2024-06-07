import React, {useEffect} from 'react';
import {AdvancedType, BasicType, BlockManager} from 'easy-email-core';
import {EmailEditorProvider} from 'easy-email-editor';
import {ExtensionProps} from 'easy-email-extensions';
import {useSearchParams} from "@umijs/max";
import 'easy-email-editor/lib/style.css';
import 'easy-email-extensions/lib/style.css';
import '@arco-themes/react-easy-email-theme/css/arco.css';
import {useEmailStore} from "@/stores/email";
import {message} from "antd";
import ShareModal from "@/pages/email/editor/shareModal";
import SendModal from "@/pages/email/editor/sendModal";
import {useRafInterval} from "ahooks";
import CompareModal from "@/pages/email/editor/compareModal";
import {CustomLayout} from "@/pages/email/editor/components/CustomLayout";
import {db} from "@/stores/db";
import _ from 'lodash'
import {CreateBlock, SaveEmailCloud, UploadEmailImage} from "@/services/email/emailService";
import TemplateLoading from "@/pages/email/editor/components/TemplateLoading";
import {useAppStore} from "@/stores/app";

const Editor = () => {
    const emailStore = useEmailStore();
    const [searchParams, setSearchParams] = useSearchParams()
    const user = useAppStore(s => s.user)
    const authorized = !!user

    useEffect(() => {
        if (searchParams.get('id')) {
            emailStore.getEmail(Number(searchParams.get('id'))).then((e) => {
                if (e) {
                    emailStore.setEmail(e)
                }
            });
        }

    }, [searchParams.get('id'), searchParams.get('shareId')]);

    const closeComparingModal = () => {
        emailStore.setComparing([])
    }
    useEffect(() => {
        emailStore.getBlocks()
    }, [])
    // @ts-ignore
    const categories: ExtensionProps['categories'] = [
        {
            label: 'Content',
            active: true,
            blocks: [
                {
                    type: AdvancedType.TEXT,
                },
                {
                    type: AdvancedType.IMAGE,
                    payload: {attributes: {padding: '0px 0px 0px 0px'}},
                },
                {
                    type: AdvancedType.BUTTON,
                },
                {
                    type: AdvancedType.SOCIAL,
                },
                {
                    type: AdvancedType.DIVIDER,
                },
                {
                    type: AdvancedType.SPACER,
                },
                {
                    type: AdvancedType.HERO,
                },
                {
                    type: AdvancedType.WRAPPER,
                },
            ],
        },
        {
            label: 'Layout',
            active: true,
            displayType: 'column',
            blocks: [
                {
                    title: '2 columns',
                    payload: [
                        ['50%', '50%'],
                        ['33%', '67%'],
                        ['67%', '33%'],
                        ['25%', '75%'],
                        ['75%', '25%'],
                    ],
                },
                {
                    title: '3 columns',
                    payload: [
                        ['33.33%', '33.33%', '33.33%'],
                        ['25%', '25%', '50%'],
                        ['50%', '25%', '25%'],
                    ],
                },
                {
                    title: '4 columns',
                    payload: [['25%', '25%', '25%', '25%']],
                },
            ],
        },
        {
            label: 'Custome Blocks',
            active: true,
            displayType: 'widget',
            blocks: emailStore.blocks ? emailStore.blocks : []
        }
    ];
    if (!emailStore.email) {
        return <TemplateLoading/>
    }
    return (
        <div>
            {emailStore.sharing ? <ShareModal/> : null}
            {emailStore.sending ? <SendModal/> : null}
            {emailStore.comparing.length ? <CompareModal close={closeComparingModal}/> : null}
            <EmailEditorProvider
                data={{
                    subject: 'Welcome to Easy-email',
                    subTitle: 'Nice to meet you!',
                    content: BlockManager.getBlockByType(BasicType.PAGE)!.create(emailStore.email.content),
                }}
                height={'calc(100vh - 115px)'}
                autoComplete
                dashed={false}
                onSubmit={authorized ? SaveEmailCloud : () => {
                    message.error('please login first')
                }}
                onUploadImage={UploadEmailImage}
                onAddCollection={CreateBlock}
            >
                {(p, {submit}) => {

                    // useRafInterval(() => {
                    //     submit()
                    // }, 1000 * 60 * 5);
                    useRafInterval(() => {
                        db.emails.add({
                            remoteId: emailStore.email.id,
                            time: new Date().getTime(),
                            email: _.omit(emailStore.email, ['siblings', 'parent', 'children'])
                        }).then(() => {
                            db.emails.where('time').below(new Date().getTime() - 1000 * 60 * 60 * 24 * 7).delete()
                            message.success('mail saved to local')
                        })

                    }, 1000 * 60 * 3)
                    return (
                        <>
                            <CustomLayout
                                submit={submit}
                                categories={categories}>
                            </CustomLayout>
                        </>

                    );
                }}
            </EmailEditorProvider>
        </div>
    );
}


export default Editor;