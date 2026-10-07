import type { components } from '../../../lib/api/schema';
import type { HttpClient, HttpResult } from '../../../lib/api/http-client';
import { rentalQuery, type RentalFilter } from '../../../lib/api/rental-query';
import { RENTAL_API as A } from '../../../config/lease.constants';
export type Lease = components['schemas']['LeaseDto'];
export type LeaseSummary = components['schemas']['LeaseSummaryDto'];
export type LeaseInput = components['schemas']['LeaseInputDto'];
export interface LeasesApi {
  list(filter: RentalFilter): Promise<HttpResult<LeaseSummary[]>>;
  get(id: string): Promise<Lease>;
  create(input: LeaseInput): Promise<Lease>;
  available(input: LeaseInput): Promise<{ available: boolean }>;
  deposit(id: string, reference: string): Promise<Lease>;
  renew(id: string, input: LeaseInput): Promise<Lease>;
  terminate(id: string, reason: string): Promise<Lease>;
}
export class HttpLeasesApi implements LeasesApi {
  public constructor(private readonly http: HttpClient) {}
  public list(filter: RentalFilter): Promise<HttpResult<LeaseSummary[]>> {
    return this.http.get<LeaseSummary[]>(A.LEASES + rentalQuery(filter));
  }
  public async get(id: string): Promise<Lease> {
    return (await this.http.get<Lease>(A.LEASES + '/' + encodeURIComponent(id))).data;
  }
  public async create(input: LeaseInput): Promise<Lease> {
    return (await this.http.post<Lease>(A.LEASES, input)).data;
  }
  public async available(input: LeaseInput): Promise<{ available: boolean }> {
    return (await this.http.post<{ available: boolean }>(A.LEASES + '/availability', input)).data;
  }
  public async deposit(id: string, reference: string): Promise<Lease> {
    return (
      await this.http.post<Lease>(A.LEASES + '/' + encodeURIComponent(id) + '/deposit', {
        reference,
      })
    ).data;
  }
  public async renew(id: string, input: LeaseInput): Promise<Lease> {
    return (await this.http.post<Lease>(A.LEASES + '/' + encodeURIComponent(id) + '/renew', input))
      .data;
  }
  public async terminate(id: string, reason: string): Promise<Lease> {
    return (
      await this.http.post<Lease>(A.LEASES + '/' + encodeURIComponent(id) + '/terminate', {
        reason,
      })
    ).data;
  }
}
