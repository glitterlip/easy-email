import React, {useCallback, useMemo, useState} from 'react'
import {Editor} from "@monaco-editor/react";
import {useBlock, useEditorContext, useEditorProps, useFocusIdx} from "easy-email-editor";
import {message} from "antd";
import {BasicType, BlockManager, getPageIdx, getParentByIdx, IBlockData, JsonToMjml} from "easy-email-core";
import {MjmlToJson} from "easy-email-extensions";
import {cloneDeep} from "lodash";
import {MjmlToHtml} from "@/utils/email";


const CodeEditor = () => {

    const [lang, setLang] = useState('JSON');

    const {setValueByIdx, focusBlock, values} = useBlock();
    const {focusIdx,setFocusIdx} = useFocusIdx();
    const {pageData} = useEditorContext();
    const {mergeTags} = useEditorProps();

    //update editor code after focus block change
    const [JsonCode, MjmlCode, HtmlCode] = useMemo(() => {
        if (!focusBlock) return ['', ''];
        let JsonCode = '';
        let MjmlCode = '';
        let HtmlCode = '';
        JsonCode = JSON.stringify(focusBlock, null, 2) || ''
        if (JsonCode && JsonCode.length) {
            MjmlCode = JsonToMjml({
                idx: focusIdx,
                data: focusBlock,
                context: pageData,
                mode: 'testing',
                dataSource: cloneDeep(mergeTags),
            });
            if (MjmlCode.includes('<mjml>')) {
                HtmlCode = MjmlToHtml(MjmlCode, {validationLevel: 'strict', beautify: true})
            } else {
                HtmlCode = 'a single block cant convert to html , select the page to see the html code'
            }
        }
        return [JsonCode, MjmlCode, HtmlCode];
    }, [focusBlock]);

    //update component after editor json code change
    const onJsonCodeChange = useCallback(
        (code: string) => {
            try {
                const parseValue = JSON.parse(code) as IBlockData;

                const block = BlockManager.getBlockByType(parseValue.type);
                if (!block) {
                    throw new Error(t('Invalid content'));
                }
                if (
                    !parseValue.data ||
                    !parseValue.data.value ||
                    !parseValue.attributes ||
                    !Array.isArray(parseValue.children)
                ) {
                    throw new Error(t('Invalid content'));
                }
                setValueByIdx(focusIdx, parseValue);
            } catch (error: any) {
                message.error(error?.message || error);
            }
        },
        [focusIdx, setValueByIdx],
    );

    //update component after editor mjml code change
    const onMjmlCodeChange = useCallback(
        (code: string) => {
            try {
                const parseValue = MjmlToJson(code);
                if (parseValue.type !== BasicType.PAGE) {
                    const parentBlock = getParentByIdx(values, focusIdx)!;
                    const parseBlock = BlockManager.getBlockByType(parseValue.type);

                    if (!parseBlock?.validParentType.includes(parentBlock?.type)) {
                        throw new Error(t('Invalid content'));
                    }
                } else if (focusIdx !== getPageIdx()) {
                    throw new Error(t('Invalid content'));
                }

                setValueByIdx(focusIdx, parseValue);
            } catch (error) {
                message.error(t('Invalid content'));
            }
        },
        [focusIdx, setValueByIdx, values],
    );


    const files = {
        'HTML': {
            name: 'email.html',
            language: 'html',
            value: HtmlCode,
        },
        'MJML': {
            name: 'email.mjml',
            language: 'mjml',
            value: MjmlCode,
        },
        'JSON': {
            name: 'email.json',
            language: 'json',
            value: JsonCode,
        },
    };
    const onSourceCodeChange = (v, e) => {
        switch (lang) {
            case 'JSON':
                onJsonCodeChange(v);
                break;
            case 'MJML':
                onMjmlCodeChange(v);
                break;
            default:
                break;
        }

    }
    const {name, language, value} = files[lang];

    return (
        <div className={'flex flex-col'}>
            <div className="flex justify-between bg-purple-400">
                <div className="px-4 py-1 flex text-white gap-4">
                    {Object.keys(files).map((key) => {
                        return <div key={key} className={lang === key ? 'bg-purple-600 p-1 rounded' : 'p-1'} onClick={() => {
                            setLang(key)
                        }}>
                            {key}
                        </div>
                    })}
                </div>
                <div className="flex px-4 text-white gap-4">
                    <div>Import</div>
                    <div>Export</div>
                </div>
            </div>
            <Editor
                height="80vh"
                options={{
                    fontSize: 16,
                }}
                value={value}
                onChange={onSourceCodeChange}
                theme="vs-dark"
                path={name}
                defaultLanguage={language}
                defaultValue={value}
            />
        </div>
    );
}

export default CodeEditor