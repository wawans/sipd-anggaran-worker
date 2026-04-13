import { isString, trimString, trimStringWithEllipsis } from './stringUtils';
import { isRegExp, isObject, isError, } from './rtti';
import { urlMatches, urlMatchesEqual } from './urlMatch';

export function trimUrl(param: any): string | undefined {
    if (isRegExp(param))
        return `/${trimStringWithEllipsis(param.source, 50)}/${param.flags}`;
    if (isString(param))
        return `"${trimStringWithEllipsis(param, 50)}"`;
}

export function matchUrl(urlOrPredicate: string | RegExp, responseUrl: string, baseURL: string | null = null): boolean {
    const base = (process.env.BASE_URL as string) ?? 'https://sipd-ri.kemendagri.go.id';

    return urlMatches(baseURL ?? base, responseUrl, urlOrPredicate);
}
