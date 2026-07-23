import { Response, Request } from '@playwright/test';

export function log({
  response,
  request,
}: {
  response?: Response;
  request?: Request;
}) {
  if (request) {
    console.log('>>', request.method(), request.url());
  }
  if (response) {
    if (response.url().includes('/api/')) {
      console.log('<<', response.status(), response.url());
    }
  }
}

export function debug(message: string, ...data: any[]) {
  console.debug(new Date().toLocaleString(), ' [DEBUG]: ' + message, ...data);
}

export function error(message: string, ...data: any[]) {
  console.error(new Date().toLocaleString(), ' [ERROR]: ' + message, ...data);
}

export function info(message: string, ...data: any[]) {
  console.info(new Date().toLocaleString(), ' [INFO]: ' + message, ...data);
}
