import {Footer, Question, SelectLang} from '@/components';
import {LinkOutlined} from '@ant-design/icons';
import type {Settings as LayoutSettings} from '@ant-design/pro-components';
import {SettingDrawer} from '@ant-design/pro-components';
import type {RequestConfig, RunTimeLayoutConfig} from '@umijs/max';
import {history, Link} from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import {errorConfig} from './requestErrorConfig';
import {user} from './services/ant-design-pro/api';
import {useAppStore, User} from "@/stores/app";

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/auth/login';
const guestPaths = ['/email/editor', '/auth/login', '/auth/register'];

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
    settings?: Partial<LayoutSettings>;
    user?: API.CurrentUser;
    loading?: boolean;
    fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
    const fetchUserInfo = async (redirect = true) => {
        try {
            const msg = await user({
                skipErrorHandler: true,
            });
            useAppStore.setState({user: msg.meta as any as User})
            return msg.meta;
        } catch (error) {
            console.log(error)
            redirect && history.push(loginPath);
        }
        return undefined;
    };
    const {location} = history;

    if ([loginPath, ...guestPaths].includes(location.pathname)) {

        return {
            fetchUserInfo,
            user: await fetchUserInfo(false),
            settings: defaultSettings as Partial<LayoutSettings>,
        };
    }
    return {
        fetchUserInfo,
        user: await fetchUserInfo(true),
        settings: defaultSettings as Partial<LayoutSettings>,
    };
}

export const layout: RunTimeLayoutConfig = ({initialState, setInitialState}) => {
    return {
        actionsRender: () => [<Question key="doc"/>, <SelectLang key="SelectLang"/>],
        breakpoint: false,

        defaultCollapsed: true,
        footerRender: () => <Footer/>,
        onPageChange: () => {
            const {location} = history;
            // 如果没有登录，重定向到 login
            if (!initialState?.user && !guestPaths.includes(location.pathname)) {
                history.push(loginPath);
            }
        },
        bgLayoutImgList: [
            {
                src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
                left: 85,
                bottom: 100,
                height: '303px',
            },
            {
                src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
                bottom: -68,
                right: -45,
                height: '303px',
            },
            {
                src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
                bottom: 0,
                left: 0,
                width: '331px',
            },
        ],
        links: isDev
            ? [
                <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
                    <LinkOutlined/>
                    <span>OpenAPI 文档</span>
                </Link>,
            ]
            : [],
        menuHeaderRender: undefined,
        // 自定义 403 页面
        // unAccessible: <div>unAccessible</div>,
        // 增加一个 loading 的状态
        childrenRender: (children) => {
            // if (initialState?.loading) return <PageLoading />;
            return (
                <>
                    {children}
                    {isDev && (
                        <SettingDrawer
                            disableUrlParams
                            enableDarkTheme
                            settings={initialState?.settings}
                            onSettingChange={(settings) => {
                                setInitialState((preInitialState) => ({
                                    ...preInitialState,
                                    settings,
                                }));
                            }}
                        />
                    )}
                </>
            );
        },
        ...initialState?.settings,
    };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
    timeout: 10000,
    dataField: '',
    baseURL: 'http://127.0.0.1:1323/api',
    ...errorConfig,
};
