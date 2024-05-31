import {Footer} from '@/components';
import {login} from '@/services/ant-design-pro/api';
import {GithubOutlined, GoogleOutlined, LockOutlined, UserOutlined,} from '@ant-design/icons';
import {LoginForm, ProFormCheckbox, ProFormText,} from '@ant-design/pro-components';
import {FormattedMessage, Helmet, history, request, useModel} from '@umijs/max';
import {Tabs} from 'antd';
import {createStyles} from 'antd-style';
import React, {useEffect, useState} from 'react';
import Settings from '../../../../config/defaultSettings';
import {ApiResponse} from "@/types/api/general";
import {useRequest} from 'ahooks'

const useStyles = createStyles(({token}) => {
    return {
        action: {
            marginLeft: '8px',
            color: 'rgba(0, 0, 0, 0.2)',
            fontSize: '24px',
            verticalAlign: 'middle',
            cursor: 'pointer',
            transition: 'color 0.3s',
            '&:hover': {
                color: token.colorPrimaryActive,
            },
        },
        lang: {
            width: 42,
            height: 42,
            lineHeight: '42px',
            position: 'fixed',
            right: 16,
            borderRadius: token.borderRadius,
            ':hover': {
                backgroundColor: token.colorBgTextHover,
            },
        },
        container: {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'auto',
            backgroundImage:
                "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
            backgroundSize: '100% 100%',
        },
    };
});

const ActionIcons = () => {
    const {styles} = useStyles();
    return (
        <>
            <GithubOutlined key="AlipayCircleOutlined" className={styles.action}/>
            <GoogleOutlined key="TaobaoCircleOutlined" className={styles.action}/>
        </>
    );
};

const Login: React.FC = () => {
    const [type, setType] = useState<string>('login');
    const {initialState, setInitialState} = useModel('@@initialState');
    const {styles} = useStyles();

    const {data, run, runAsync: authAsync, error, loading} = useRequest<ApiResponse<any>>((values) => {
        return request(`/auth/${type}`, {
            method: 'POST',
            data: values
        })
    }, {
        manual: true
    })
    useEffect(() => {
        initialState.fetchUserInfo().then(r => {

            if (r && r.user) {
                setInitialState((s) => ({
                    ...s,
                    currentUser: r.user,
                }));

                // history.push('/email/templates')
            }
        })
    }, [])


    const handleSubmit = async (values: { email: string, password: string }) => {
        authAsync(values).then((res) => {
            if (res.success) {
                localStorage.setItem('token', res.meta.token)
                initialState.fetchUserInfo().then(r => {
                    setInitialState((s) => ({
                        ...s,
                        currentUser: r.user,
                    }));
                    history.push('/email/templates')
                })


            }
        })
    };

    return (
        <div className={styles.container}>
            <Helmet>
                <title>
                    Login - {Settings.title}
                </title>
            </Helmet>
            <div
                style={{
                    flex: '1',
                    padding: '32px 0',
                }}
            >
                <LoginForm
                    contentStyle={{
                        minWidth: 280,
                        maxWidth: '75vw',
                    }}
                    logo={<img alt="logo" src="/logo.svg"/>}
                    title="Login"
                    subTitle={'Login'}
                    initialValues={{
                        autoLogin: true,
                    }}
                    actions={[
                        <FormattedMessage
                            key="loginWith"
                            id="pages.login.loginWith"
                            defaultMessage="其他登录方式"
                        />,
                        <ActionIcons key="icons"/>,
                    ]}
                    onFinish={async (values) => {
                        await handleSubmit(values);
                    }}
                >
                    <Tabs
                        activeKey={type}
                        onChange={setType}
                        centered
                        items={[
                            {
                                key: 'login',
                                label: 'Login',
                            },
                            {
                                key: 'register',
                                label: 'Register',
                            },
                        ]}
                    />

                    {type === 'login' && (
                        <>
                            <ProFormText
                                name="email"
                                fieldProps={{
                                    size: 'large',
                                    prefix: <UserOutlined/>,
                                }}
                                rules={[
                                    {
                                        required: true,
                                        message: (
                                            <FormattedMessage
                                                id="pages.login.username.required"
                                                defaultMessage="请输入用户名!"
                                            />
                                        ),
                                    },
                                ]}
                            />
                            <ProFormText.Password
                                name="password"
                                fieldProps={{
                                    size: 'large',
                                    prefix: <LockOutlined/>,
                                }}

                                rules={[
                                    {
                                        required: true,
                                        message: (
                                            <FormattedMessage
                                                id="pages.login.password.required"
                                                defaultMessage="请输入密码！"
                                            />
                                        ),
                                    },
                                ]}
                            />
                        </>
                    )}
                    {type === 'register' && (
                        <>
                            <ProFormText
                                fieldProps={{
                                    size: 'large',
                                    prefix: <UserOutlined/>,
                                }}
                                name="email"
                            />
                            <ProFormText.Password
                                name="password"
                                fieldProps={{
                                    size: 'large',
                                    prefix: <LockOutlined/>,
                                }}
                                rules={[
                                    {
                                        required: true,
                                        message: (
                                            <FormattedMessage
                                                id="pages.login.password.required"
                                                defaultMessage="请输入密码！"
                                            />
                                        ),
                                    },
                                ]}
                            />
                        </>
                    )}
                    <div
                        style={{
                            marginBottom: 24,
                        }}
                    >
                        <ProFormCheckbox noStyle name="autoLogin">
                            <FormattedMessage id="pages.login.rememberMe" defaultMessage="自动登录"/>
                        </ProFormCheckbox>
                        <a
                            style={{
                                float: 'right',
                            }}
                        >
                            <FormattedMessage id="pages.login.forgotPassword" defaultMessage="忘记密码"/>
                        </a>
                    </div>
                </LoginForm>
            </div>
            <Footer/>
        </div>
    );
};

export default Login;
