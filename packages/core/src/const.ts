import { ACMEOptions } from './acme';

export const DEFAULT_ENDPOINT = 'https://acme-v02.api.letsencrypt.org';

export const DEFAULT_ENDPOINT_DRY_RUN = 'https://acme-staging-v02.api.letsencrypt.org';

export const DEFAULT_OPTIONS: ACMEOptions = {
    endpoint: DEFAULT_ENDPOINT,
    dryRun: false,
};

export const DEFAULT_OPTIONS_DRY_RUN: ACMEOptions = {
    ...DEFAULT_OPTIONS,
    endpoint: DEFAULT_ENDPOINT_DRY_RUN,
    dryRun: true,
};
