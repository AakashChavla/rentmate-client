import type { components } from '../../../lib/api/schema';
import type { HttpClient, HttpResult } from '../../../lib/api/http-client';
import type { UploadClient } from './upload-client';
import { RENTAL_API as A } from '../../../config/lease.constants';
export type Tenant = components['schemas']['TenantDto'];
export type TenantInput = components['schemas']['TenantInputDto'];
export type TenantPatch = components['schemas']['TenantPatchDto'];
export type TenantDocument = components['schemas']['DocumentDto'];
export type DocumentType = TenantDocument['type'];
import { rentalQuery, type RentalFilter } from '../../../lib/api/rental-query';
export { rentalQuery } from '../../../lib/api/rental-query';
export type { RentalFilter } from '../../../lib/api/rental-query';
export interface TenantsApi {
  list(filter: RentalFilter): Promise<HttpResult<Tenant[]>>;
  get(id: string): Promise<Tenant>;
  create(input: TenantInput): Promise<Tenant>;
  update(id: string, input: TenantPatch): Promise<Tenant>;
  review(id: string, status: Tenant['status'], reason?: string): Promise<Tenant>;
  invite(id: string): Promise<void>;
  documents(id: string): Promise<TenantDocument[]>;
  upload(
    id: string,
    type: DocumentType,
    file: File,
    progress: (n: number) => void,
  ): Promise<TenantDocument>;
  reviewDocument(
    id: string,
    status: TenantDocument['status'],
    reason?: string,
  ): Promise<TenantDocument>;
  download(id: string): Promise<{ url: string; expiresAt: string }>;
  removeDocument(id: string): Promise<void>;
}
export class HttpTenantsApi implements TenantsApi {
  public constructor(
    private readonly http: HttpClient,
    private readonly uploads: UploadClient,
  ) {}
  public list(filter: RentalFilter): Promise<HttpResult<Tenant[]>> {
    return this.http.get<Tenant[]>(A.TENANTS + rentalQuery(filter));
  }
  public async get(id: string): Promise<Tenant> {
    return (await this.http.get<Tenant>(A.TENANTS + '/' + encodeURIComponent(id))).data;
  }
  public async create(input: TenantInput): Promise<Tenant> {
    return (await this.http.post<Tenant>(A.TENANTS, input)).data;
  }
  public async update(id: string, input: TenantPatch): Promise<Tenant> {
    return (await this.http.patch<Tenant>(A.TENANTS + '/' + encodeURIComponent(id), input)).data;
  }
  public async review(id: string, status: Tenant['status'], reason?: string): Promise<Tenant> {
    return (
      await this.http.post<Tenant>(A.TENANTS + '/' + encodeURIComponent(id) + '/review', {
        status,
        ...(reason ? { reason } : {}),
      })
    ).data;
  }
  public async invite(id: string): Promise<void> {
    await this.http.post(A.TENANTS + '/' + encodeURIComponent(id) + '/invite');
  }
  public async documents(id: string): Promise<TenantDocument[]> {
    return (
      await this.http.get<TenantDocument[]>(A.TENANTS + '/' + encodeURIComponent(id) + '/documents')
    ).data;
  }
  public upload(
    id: string,
    type: DocumentType,
    file: File,
    progress: (n: number) => void,
  ): Promise<TenantDocument> {
    const form = new FormData();
    form.append('file', file);
    return this.uploads.post<TenantDocument>(
      A.TENANTS + '/' + encodeURIComponent(id) + '/documents/' + type,
      form,
      progress,
    );
  }
  public async reviewDocument(
    id: string,
    status: TenantDocument['status'],
    reason?: string,
  ): Promise<TenantDocument> {
    return (
      await this.http.post<TenantDocument>(A.DOCUMENTS + '/' + encodeURIComponent(id) + '/review', {
        status,
        ...(reason ? { reason } : {}),
      })
    ).data;
  }
  public async download(id: string): Promise<{ url: string; expiresAt: string }> {
    return (
      await this.http.get<{ url: string; expiresAt: string }>(
        A.DOCUMENTS + '/' + encodeURIComponent(id) + '/download',
      )
    ).data;
  }
  public async removeDocument(id: string): Promise<void> {
    await this.http.delete(A.DOCUMENTS + '/' + encodeURIComponent(id));
  }
}
