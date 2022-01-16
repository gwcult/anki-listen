import { gzipSync } from 'fflate';
import { Payload } from 'src/sync-client';

const enc = new TextEncoder();

export function createPayload(data: Record<string, any>): Payload {
    const jsonStr = JSON.stringify(data);
    const gzipped = gzipSync(enc.encode(jsonStr), {
        filename: 'file.json.gz',
    });
    const file = new Blob([gzipped]);
    return {
        c: 1,
        data: file
    };
}