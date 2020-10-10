export interface DomainInfo {
    domain: string;
    subDomain?: string;
    type?: string;
}

export interface DomainRecord {
    id: string;
    name: string;
    type: string;
    ttl: number;
    value: string;
    weight: number;
    mx: number;
    enabled: boolean;
    gmtUpdated: Date;
}

export default abstract class ACMEDNSPluginBase {
    public abstract async query(domain: DomainInfo): Promise<DomainRecord[]>

    public abstract async destroy(domain: DomainInfo): Promise<void>

    public abstract async update(domain: DomainInfo, value: string): Promise<void>
}
