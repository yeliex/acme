import originFetch, { BodyInit, RequestInit as OriginInit, Headers, FetchError } from 'node-fetch';
import { get, pick } from 'lodash';
import { Stream } from 'stream';
import { format, parse } from 'url';
import * as Debug from 'debug';

export * from 'node-fetch';

const debug = {
    request: Debug('acme:core:fetch:request'),
    response: Debug('acme:core:fetch:response'),
    failed: Debug('acme:core:fetch:failed'),
};

export interface RequestInit extends Omit<OriginInit, 'body'> {
    query?: { [key: string]: string };
    params?: { [key: string]: string };
    body?: BodyInit | { [key: string]: any };
}

export default async function fetch<T>(url: string, init: RequestInit = {}): Promise<T> {
    init.headers = new Headers(init.headers || {});

    const { body } = init;

    if (body) {
        if (typeof body === 'object' && !(body instanceof Stream) && !(body instanceof Buffer)) {
            init.body = JSON.stringify(body);

            if (!init.headers.has('content-type')) {
                init.headers.set('content-type', 'application/json');
            }
        }
    }

    const urlParsed = parse(url, true);

    const urlStr = format({
        ...pick(urlParsed, ['protocol', 'host', 'auth', 'hash', 'pathname']),
        query: {
            ...urlParsed.query,
            ...(init.query || {}),
        },
    });

    delete init.query;

    debug.request(urlStr, JSON.stringify(init));

    const res = await originFetch(urlStr, init as OriginInit);

    let data: any = await res.text();

    try {
        data = JSON.parse(data);
    } catch (e) {
        debug.failed('[JSON FAILED]', urlStr, JSON.stringify(init), data);
    }

    if (res.status >= 400) {
        const message = get(data, 'message') || get(data, 'error') || get(data, 'Message') || `${res.status} ${res.statusText}`;

        const error = new FetchError(message, data.code || res.statusText);
        error.code = `${res.status}`;

        debug.failed(urlStr, JSON.stringify(init), error.code, error.message, JSON.stringify(data));

        throw error;
    }

    debug.response(urlStr, JSON.stringify(init), JSON.stringify(data));

    return data;
}
