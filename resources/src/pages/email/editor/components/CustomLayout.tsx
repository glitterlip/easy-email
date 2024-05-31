import React, {useEffect} from "react";
import {ExtensionProps, ExtensionProvider, InteractivePrompt, MergeTagBadgePrompt,} from "easy-email-extensions";
import {useBlock, useEditorProps, useFocusBlockLayout, useFocusIdx} from "easy-email-editor";
import {Resizable} from "re-resizable";
import Components from "@/pages/email/editor/components/Components";
import VisualEditor from "@/pages/email/editor/components/VisualEditor";
import LocalHistory from "@/pages/email/editor/components/LocalHistory";
import {useEmailStore} from "@/stores/email";
import CloudVersion from "@/pages/email/editor/components/CloudVersion";
import dayjs from "dayjs";
import Comments from "@/pages/email/editor/components/Comments";
import Shares from "@/pages/email/editor/components/Shares";


export const CustomLayout: React.FC<ExtensionProps & { submit: () => void }> = props => {
    const {height: containerHeight} = useEditorProps();
    const {
        categories,
    } = props;
    const {
        localHistoryDrawer,
        setLocalHistoryDrawer,
        cloudVersionDrawer,
        setCloudVersionDrawer,
        commentsDrawer,
        setCommentsDrawer,
        sharesDrawer,
        setSharesDrawer
    } = useEmailStore()

    const email = useEmailStore(s => s.email)
    const {focusBlock, setFocusBlock} = useBlock();
    const {focusIdx, setFocusIdx} = useFocusIdx();
    const {focusBlockNode} = useFocusBlockLayout();
    useEffect(() => {
        // console.log(focusBlock, focusIdx, focusBlockNode)
    }, [focusBlock, focusIdx, focusBlockNode])
    return (
        <ExtensionProvider
            {...props}
            categories={categories}
        >
            <div className={'flex flex-col overflow-hidden w-full rounded'}>
                <div className={'bg-purple-400 text-white px-4 py-1 flex flex-col grow'}>
                    <div className={'text-lg text-bold text-white mt-4 '}>{email.name}</div>
                    <div className="flex text-sm text-gray-200 gap-2">
                        <span>Created At:{dayjs(email.created_at?.Time).format('MM-DD HH:mm')}</span>
                        {email.updated_at?.Valid ? <span>Updated At:{dayjs(email.updated_at?.Time).format('MM-DD HH:mm')}</span> : null}
                    </div>
                </div>
                <div className="flex min-h-screen border-2 border-t-0 border-solid border-purple-400">
                    <Resizable
                        className={'border-0 border-r-2 border-solid border-purple-400'}
                        defaultSize={{
                            width: '50%',
                            height: '100%'
                        }}
                        maxWidth="100%"
                        minWidth="1"
                    >
                        <VisualEditor/>
                    </Resizable>
                    <div className={'w-full min-w-1'}>
                        <Components submit={props.submit}/>
                    </div>
                </div>
            </div>
            <LocalHistory visible={localHistoryDrawer} setVisible={setLocalHistoryDrawer}/>
            <CloudVersion visible={cloudVersionDrawer} setVisible={setCloudVersionDrawer}/>
            <Comments visible={commentsDrawer} setVisible={setCommentsDrawer}/>
            <Shares visible={sharesDrawer} setVisible={setSharesDrawer}/>
            <InteractivePrompt/>
            <MergeTagBadgePrompt/>
        </ExtensionProvider>
    );
};
