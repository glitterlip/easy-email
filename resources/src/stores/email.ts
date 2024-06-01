import {create} from "zustand";
import {request} from "@@/plugin-request";
import {RawGolangTime} from "@/stores/app";
import {IBlockData} from "easy-email-core";

export interface Template {
    id: number;
    user_id: number;
    name: string;
    content: any;
    meta: any;
    children: Array<Template>;
    siblings: Array<Template>;
    parent: Template;
    pid: number;
    created_at?: {
        Time: string,
        Valid: boolean
    },
    updated_at?: {
        Time: string,
        Valid: boolean
    };
    shares?: Array<Share>;
}

export interface Share {
    id: number;
    link: string;
    template_id: number;
    template?: Template;
    invalidated_at: RawGolangTime,
    meta: {
        password: string;
        permissions: Array<string>;
    };
    user_id: number;
    created_at: RawGolangTime;
    verifiedPassword?: string | null;
}

export interface CustomBlock {
    type: string,
    title: string,
    description: string,
    thumbnail: string,
    payload: Partial<IBlockData>
}

export interface EmailState {
    emailsPage: 1;
    templatesPage: 1;
    emails: Array<Template>;
    templates: Array<Template>;
    comparing: Array<Template>;
    setComparing: (templates: Array<Template>) => void;
    email: Template;
    getEmail: (id: number) => Promise<Template>;
    setEmail: (email: Template) => void;
    sharing: boolean;
    sending: boolean;
    setSharing: (sharing: boolean) => void;
    setSending: (sending: boolean) => void;
    localHistoryDrawer: boolean;
    setLocalHistoryDrawer: (show: boolean) => void;
    cloudVersionDrawer: boolean;
    setCloudVersionDrawer: (show: boolean) => void;
    commentsDrawer: boolean;
    setCommentsDrawer: (show: boolean) => void;
    sharesDrawer: boolean;
    setSharesDrawer: (show: boolean) => void;
    sharedTemplate: null | Share;
    setSharedTemplate: (share: null | Share) => void;
    blocks: Array<CustomBlock>;
    getBlocks: () => Promise<Array<CustomBlock>>;
}

export const useEmailStore = create<EmailState>()((set, get, store) => ({
        emailsPage: 1,
        templatesPage: 1,
        emails: [],
        templates: [],
        sharing: false,
        sending: false,
        sharedTemplate: null,
        setSharedTemplate: (template) => {
            set({sharedTemplate: template})
        },
        setSharing: (sharing: boolean) => {
            set({sharing: sharing})
        },
        setSending: (sending: boolean) => {
            set({sending: sending})
        },
        comparing: [],
        setComparing: (templates: Array<Template>) => {
            set({comparing: templates})
        },
        email: null,
        setEmail: async (email) => {
            set({email: {...email}})
        },
        getEmail: async (id: number) => {
            const {meta: email} = await request('/email/templates/' + id);
            return email;
        },
        localHistoryDrawer: false,
        setLocalHistoryDrawer: (show: boolean) => {
            set({localHistoryDrawer: show})
        },
        cloudVersionDrawer: false,
        setCloudVersionDrawer: (show: boolean) => {
            set({cloudVersionDrawer: show})
        },
        commentsDrawer: false,
        setCommentsDrawer: (show: boolean) => {
            set({commentsDrawer: show})
        },
        sharesDrawer: false,
        setSharesDrawer: (show: boolean) => {
            set({sharesDrawer: show})
        },
        blocks: [],
        getBlocks: async () => {
            const {data: blocks} = await request('/email/blocks');
            set({
                blocks: blocks.map(b => {
                    return {
                        ...b.meta,
                        type: b.content.type,
                        payload: b.content
                    }
                })
            })
            return blocks;
        }
    }
));
