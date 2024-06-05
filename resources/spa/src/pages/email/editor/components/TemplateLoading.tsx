import {request, useSearchParams} from "@@/exports";
import {ApiResponseI} from "@/types/api/general";
import {Share, Template, useEmailStore} from "@/stores/email";
import React, {useEffect, useState} from "react";
import {Loading} from "react-daisyui";
import classNames from "classnames";

const TemplateLoading = () => {
    const emailStore = useEmailStore()
    const [searchParams, setSearchParams] = useSearchParams()
    const [share, setShare] = useState({
        pwd: '',
        needPassword: false,
        passwordErr: '',
        expired: false,
        notfound: false
    })

    const [loading, setLoading] = useState(true)
    useEffect(() => {
        if (searchParams.get('shareId')) {
            GetShare()
        }
    }, [searchParams.get('shareId')])

    const GetShare = () => {
        request<ApiResponseI<null, Share>>(`/email/share/detail`, {
            method: 'POST',
            data: {id: searchParams.get('shareId'), password: share.pwd ? share.pwd : searchParams.get("pwd")}
        }).then(r => {
            setLoading(false)
            if (r.success) {
                emailStore.setEmail(r.meta.template as Template)
                r.meta.verifiedPassword = share.pwd ? share.pwd : searchParams.get("pwd")
                emailStore.setSharedTemplate(r.meta as Share)
            } else {
                switch (r.errorCode) {
                    case 10419:
                        setShare({...share, expired: true})
                        break;
                    case 10404:
                        setShare({...share, notfound: true})
                        break;
                    default:
                        setShare({...share, needPassword: true, passwordErr: r.errorMessage as string})
                        break;
                }
            }
        })
    }
    return <div className={'flex flex-col justify-center items-center min-h-screen'}>
        <div>
            <div className="mx-auto mt-5 py-20 leading-6">
                <div
                    className={classNames({hidden: !share.needPassword}, "relative mx-auto flex w-full max-w-2xl items-center justify-between rounded-md border shadow-lg")}>
                    <input type="name" onChange={(e) => {
                        setShare({...share, pwd: e.target.value})
                    }} value={share.pwd} placeholder={'share password'} className="h-14 w-full rounded-md py-4 pr-40 px-4 outline-none focus:ring-2"/>
                    <div onClick={GetShare}
                         className="absolute right-0 mr-1 inline-flex h-12 items-center justify-center rounded-lg bg-gray-900 px-4 font-medium text-white focus:ring-4 hover:bg-gray-700">Confirm
                    </div>
                </div>
                <div role="alert" className={classNames("alert alert-error", {hidden: !share.expired})}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>Share Expired!</span>
                </div>
                <div role="alert" className={classNames("alert alert-error", {hidden: !share.notfound})}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>Share not found!</span>
                </div>

            </div>
        </div>
        <Loading className={loading ? '' : 'hidden'}/>
    </div>
}
export default TemplateLoading