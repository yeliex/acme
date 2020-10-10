import * as Const from './const';
import { defaultsDeep } from 'lodash';
import fetch, { RequestInit, FetchError } from './lib/request';

export interface ACMEOptions {
    endpoint: string;
    dryRun: boolean;
}

type ACMEDirectory = 'keyChange' | 'newAccount' | 'newNonce' | 'newOrder' | 'revokeCert';

export type ACMEResponse<T = any> = {
    type: string;
    detail: string;
    status: number;
} & ({
    meta: any;
} & T);

export default class ACME {
    private readonly options: ACMEOptions;

    public directories: Map<ACMEDirectory, string>;

    public ready: Promise<void>;

    constructor(options: Partial<ACMEOptions> = {}) {
        if (!('dryRun' in options)) {
            options.dryRun = process.env.NODE_ENV !== 'production';
        }
        this.options = defaultsDeep(
            options,
            options.dryRun === true ? Const.DEFAULT_OPTIONS_DRY_RUN : Const.DEFAULT_OPTIONS,
        );
        this.ready = this.init();
    }

    public get endpoint() {
        return this.options.endpoint;
    }

    public get dryRun() {
        return this.options.dryRun;
    }

    private async init() {
        const res = await this.directory();

        this.directories = new Map(([
            'keyChange', 'newAccount', 'newNonce', 'newOrder', 'revokeCert',
        ] as ACMEDirectory[]).map((k) => [k, res[k]]));

        this.ready = Promise.resolve();
    }

    public async request<T = any>(url: string, init: RequestInit = {}): Promise<T> {
        if (!url.startsWith('http')) {
            url = `${this.endpoint}/${url.replace(/^\//, '/')}`;
        }

        const res = await fetch<ACMEResponse<T>>(url, init);

        if (res.status && res.status >= 400) {
            throw new FetchError(res.detail, res.type);
        }

        return res;
    }

    public async directory() {
        const res = await this.request<Record<ACMEDirectory, string>>('/directory');

        return res;
    }

    public async auth() {

    }
}
