import {AttributePanel, BlockLayer} from "easy-email-extensions";
import React, {useState} from "react";
import Blocks from "@/pages/email/editor/components/Blocks";
import CodeEditor from "@/pages/email/editor/components/CodeEditor";
import classNames from "classnames";
import {
    RiAppsLine,
    RiArrowGoBackFill,
    RiArrowGoForwardFill,
    RiCloudLine,
    RiLayoutHorizontalLine,
    RiLoopRightFill,
    RiSave3Fill,
    RiSettings2Fill,
    RiTerminalBoxLine
} from "@remixicon/react";
import {useBlock} from "easy-email-editor";

const Components = ({submit}: { submit: () => void }) => {
    const [activeTab, setActiveTab] = useState('config')
    const {redo, undo, redoable, undoable} = useBlock();
    const TabItems = [
        {
            title: 'Block',
            key: 'block',
            openType: 'tab',
            icon: <RiAppsLine/>
        },
        {
            title: 'Config',
            key: 'config',
            openType: 'tab',
            icon: <RiSettings2Fill/>
        },
        {
            title: 'Editor',
            key: 'editor',
            openType: 'tab',
            icon: <RiTerminalBoxLine/>
        },
        {
            title: 'Layer',
            key: 'layer',
            openType: 'tab',
            icon: <RiLayoutHorizontalLine/>
        },
    ]

    return <div className="flex flex-col ">
        <div className="bg-purple-400 text-white min-h-[70px]">
            <div className="flex justify-between">
                <div className={'px-2 gap-2 flex'}>
                    {TabItems.map(item => (
                        <div key={item.key} onClick={() => setActiveTab(item.key)}
                             className={classNames(item.key === activeTab ? 'bg-purple-600' : '', 'flex items-center px-2 py-1 rounded-lg cursor-pointer hover:bg-purple-500')}>{item.icon}{item.title}</div>
                    ))}
                </div>
                <div className="flex px-2 gap-2">
                    <span className={'p-1 rounded cursor-pointer hover:bg-purple-500'} onClick={undo}><RiArrowGoBackFill size={20}/></span>
                    <span className={'p-1 rounded cursor-pointer hover:bg-purple-500'} onClick={redo}><RiArrowGoForwardFill size={20}/></span>
                    <span className={'p-1 rounded cursor-pointer hover:bg-purple-500'} onClick={submit}><RiSave3Fill size={20}/></span>
                    <span className={'p-1 rounded cursor-pointer hover:bg-purple-500'}><RiLoopRightFill size={20}/></span>
                    <span className={'p-1 rounded cursor-pointer hover:bg-purple-500'}><RiCloudLine size={20}/></span>
                </div>
            </div>
        </div>
        <div className="flex flex-col draw">
            {activeTab === 'block' && <Blocks/>}
            {activeTab === 'config' && <AttributePanel/>}
            {activeTab === 'editor' && <CodeEditor/>}
            {activeTab === 'layer' && <BlockLayer/>}
        </div>
    </div>
}

export default Components;