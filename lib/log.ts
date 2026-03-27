import { Response, Request } from '@playwright/test';

export function log({ response, request }: { response?: Response; request?: Request }) {
    if (request) {
        console.log('>>', request.method(), request.url())
    }
    if (response) {
        if (response.url().includes('/api/')) {
            console.log('<<', response.status(), response.url())
        }
    }
}

export function debug(message: string, errors: any = null) {
    console.log('[DEBUG]: ' + message, errors)
}