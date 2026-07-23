import { expect, Response } from '@playwright/test';
import axios from '@/lib/api';
import { error } from '@/lib/log';
import { BASE_URL } from '@/config/app';

export async function worker(response: Response) {
  const url = response.url(); // urlMatches();
  const path = url.replace(BASE_URL, '');

  if (response.status() != 200 || path.includes('.')) return;

  let endpoint = null;

  switch (path) {
    case '/api/renja/dana_sub_bl/get_by_id_sub_bl':
      endpoint = '/api/anggaran/belanja/sub/dana';
      break;
    case '/api/renja/rinci_sub_bl/get_by_id_sub_bl':
      endpoint = '/api/anggaran/belanja/sub/rinci';
      break;
    case '/api/renja/subs_sub_bl/find_by_id_list':
      endpoint = '/api/anggaran/belanja/sub/sub';
      break;
    case '/api/renja/ket_sub_bl/find_by_id_list':
      endpoint = '/api/anggaran/belanja/sub/ket';
      break;
    case '/api/renja/sub_bl/list_belanja_by_tahun_daerah_unit':
      endpoint = '/api/anggaran/belanja/sub';
      break;
    case '/api/renja/sub_bl/list_skpd':
      endpoint = '/api/anggaran/skpd';
      break;
    default:
      break;
  }

  if (!endpoint) {
    // matchUrl('**/api/master/urusan/view/**', url) && (endpoint = '/api/master/urusan')
    // matchUrl('**/api/master/bidang_urusan/view/**', url) && (endpoint = '/api/master/urusanBidang')
    // matchUrl('**/api/master/skpd/view/**', url) && (endpoint = '/api/master/skpd')
    // matchUrl('**/api/master/program/view/**', url) && (endpoint = '/api/master/program')
    // matchUrl('**/api/master/giat/view/**', url) && (endpoint = '/api/master/giat')
    // matchUrl('**/api/master/sub_giat/view/**', url) && (endpoint = '/api/master/giatSub')
    // matchUrl('**/api/renja/sub_bl/view/**', url) && (endpoint = '/api/master/sub_bl')
    // '**/api/renja/sub_bl/view/**'
    //
  }

  if (endpoint) {
    try {
      const body = await response.json();
      await expect(body).toHaveProperty('data');

      const xhr = await axios.post(endpoint, {
        data:
          !Array.isArray(body.data) && Object.hasOwn(body.data, 'data')
            ? body.data?.data
            : body.data,
      });
      await expect(xhr.status).toBe(200);
      // OR
      // await expect.soft(xhr.status).toBe(200);
    } catch (e) {
      error('Getter.Error: ' + endpoint, e);
      throw new Error('Getter.Error');
    }
  }
}
