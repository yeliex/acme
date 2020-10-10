import ACME from '../src';
import { DEFAULT_ENDPOINT_DRY_RUN } from '../src/const';

const acme = new ACME({
    dryRun: true,
});

describe('acme', () => {
    it('should init success', async () => {
        await acme.ready;
        expect(acme.directories instanceof Map).toBe(true);
        expect(acme.endpoint).toBe(DEFAULT_ENDPOINT_DRY_RUN);
    });

    it('should request success', async () => {
        const result = await acme.request('/directory');

        expect(typeof result).toBe('object');
        expect(result).toHaveProperty('newAccount');
    });

    it('should get directory', async () => {
        const result = await acme.directory();

        expect(typeof result).toBe('object');
        expect(result).toHaveProperty('newAccount');
    });
});
