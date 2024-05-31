import {AdvancedType, BlockManager, IBlockData} from 'easy-email-core';
import {BlockAvatarWrapper, IconFont} from 'easy-email-editor';
import React, {useMemo, useState} from 'react';
import {getIconNameByBlockType, useExtensionProps} from "easy-email-extensions";
import {Collapse, Typography} from "antd";
import {CaretRightOutlined, CaretUpOutlined} from "@ant-design/icons";
const Blocks = () => {
    const {categories} = useExtensionProps();

    const defaultActiveKey = useMemo(
        () => [
            ...categories.filter((item) => item.active).map((item) => item.label),
        ],
        [categories]
    );
    const items = categories.map(c => {

        if (c.displayType === 'column') {
            return {
                key: c.label,
                label: c.label,
                children: c.blocks.map(b => {
                    return <LayoutItem key={b.title} title={b.title || ''} columns={b.payload}/>
                })
            }
        }
        if (c.displayType === 'custom') {
            return {
                key: c.label,
                label: c.label,
                children: c.blocks.map((item, index) => {
                    return <React.Fragment key={index}>{item}</React.Fragment>;
                })
            }
        }
        return {
            key: c.label,
            label: c.label,
            children: <div className={'flex flex-wrap'}>
                {c.blocks.map((item, index) => {
                    return <div className={'basis-1/3'}>
                        <BlockItem key={index} {...(item as any)} />
                    </div>;
                })}
            </div>
        }
    })
    return (
        <Collapse
            defaultActiveKey={defaultActiveKey}
            style={{paddingBottom: 30, minHeight: '100%'}}
            items={items}
        />
    )
}

function BlockItem({type, payload, title, filterType,}: {
    type: string;
    payload?: Partial<IBlockData>;
    title?: string;
    filterType: string | undefined;
}) {
    const block = BlockManager.getBlockByType(type);

    return (
        <div>
            <BlockAvatarWrapper type={type} payload={payload}>
                <div className={'flex justify-center'}>
                    <IconFont
                        style={{fontSize: 20}}
                        iconName={getIconNameByBlockType(type)}
                    />
                    <Typography.Text style={{marginTop: 10}}>
                        {title || block?.name}
                    </Typography.Text>
                </div>
            </BlockAvatarWrapper>
        </div>
    );
}

function LayoutItem({columns, title,}: { columns: string[][]; title: string; }) {
    const [visible, setVisible] = useState(false);

    return (
        <div>
            <p
                onClick={() => setVisible((v) => !v)}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                }}
            >
                <span>{title}</span>
                {columns.length > 1 && (
                    <span>{!visible ? <CaretRightOutlined/> : <CaretUpOutlined/>}</span>
                )}
            </p>
            {columns.map((item, index) => {
                const hide = !visible && index !== 0;
                const payload = {
                    type: AdvancedType.SECTION,
                    attributes: {},
                    children: item.map((col) => ({
                        type: AdvancedType.COLUMN,
                        attributes: {
                            width: col,
                        },
                        data: {
                            value: {},
                        },
                        children: [],
                    })),
                };

                return (
                    <div
                        key={index}
                        style={{
                            height: hide ? 0 : undefined,
                            overflow: 'hidden',
                            marginBottom: hide ? 0 : 20,
                        }}
                    >
                        <BlockAvatarWrapper type={AdvancedType.SECTION} payload={payload}>
                            <div
                                style={{
                                    border: '1px solid rgb(229, 229, 229)',
                                    width: '100%',
                                    padding: 10,
                                }}
                            >
                                <div
                                    style={{
                                        height: 40,
                                        border: '1px solid rgb(85, 85, 85)',
                                        borderRadius: 3,
                                        display: 'flex',
                                    }}
                                >
                                    {item.map((column, index) => {
                                        return (
                                            <div
                                                key={index}
                                                className={'flex items-center justify-center'}
                                                style={{
                                                    borderRight:
                                                        index === item.length - 1
                                                            ? undefined
                                                            : '1px solid rgb(85, 85, 85)',
                                                    height: 40,
                                                    width: column,
                                                }}
                                            ><span>{column}</span></div>
                                        );
                                    })}
                                </div>
                            </div>
                        </BlockAvatarWrapper>
                    </div>
                );
            })}
        </div>
    );
}

export default Blocks;