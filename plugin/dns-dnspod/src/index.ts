import { DNSPluginBase, DomainInfo, DomainRecord } from '@acmejs/core';
import DNSPod from 'dnspod.js';
import { isPlainObject } from 'lodash';
import * as assert from 'assert';

interface DnsPodOption {
    accessToken: string;
    accessTokenId: string;
}

export default class ACMEDNSPluginDnsPod extends DNSPluginBase {
    public static validateOption(option: DnsPodOption) {
        assert(isPlainObject(option), 'option should be plain object');
        const { accessToken, accessTokenId } = option;
        assert(typeof accessToken === 'string' && accessToken !== '', 'accessToken must be non-empty string');
        assert(typeof accessTokenId === 'string' && accessTokenId !== '', 'accessTokenId must be non-empty string');
    }

    // 主域的NS请求验证token是否有效
    public static async preValidate(option: DnsPodOption, domain: DomainInfo): Promise<boolean> {
        const instance = new ACMEDNSPluginDnsPod(option);

        // 只要请求能成功就没问题
        await instance.query(domain);

        return true;
    }

    private readonly dnspod: DNSPod;

    constructor(options: DnsPodOption) {
        super();
        ACMEDNSPluginDnsPod.validateOption(options);

        const { accessToken, accessTokenId } = options;

        this.dnspod = new DNSPod({
            accessToken,
            accessTokenId,
        });
    }

    public async query(domain: DomainInfo): Promise<DomainRecord[]> {
        const { list } = await this.dnspod.Record.List({
            domain: domain.domain,
            subDomain: domain.subDomain,
            recordType: domain.type,
        });

        return list.map((item: any) => {
            return {
                id: item.id,
                name: item.name,
                type: item.type,
                ttl: Number(item.ttl),
                value: item.value,
                weight: item.weight ? Number(item.weight) : undefined,
                mx: Number(item.mx),
                enabled: item.enabled === '1' || item.enabled === 1,
                gmtUpdated: new Date(item.updated_on),
            };
        });
    }

    // 搜索所有相关记录一起删除
    public async destroy(domain: DomainInfo): Promise<void> {

    };

    // 搜索所有相关记录一起更新
    public async update(domain: DomainInfo, value: string): Promise<void> {

    }
}
