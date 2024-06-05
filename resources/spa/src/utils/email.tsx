import React from 'react';
import mjml from "mjml-browser";


export const MjmlToHtml = (mjmlString: string, options?: {
    beautify?: boolean;
    minify?: boolean;
    keepComments?: boolean;
    validationLevel: 'strict' | 'soft' | 'skip';
}): string => {
    return mjml(mjmlString, options).html;
}