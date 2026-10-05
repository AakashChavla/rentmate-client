import type { components } from '../../../lib/api/schema';
import type { HttpClient } from '../../../lib/api/http-client';
import { DOMAIN_API } from '../../../config/property.constants';
export type Organization = components['schemas']['OrganizationDto'];
export type OrganizationPatch = components['schemas']['OrganizationUpdateDto'];
export interface OrganizationApi {
  get(): Promise<Organization>;
  update(input: OrganizationPatch): Promise<Organization>;
}
export class HttpOrganizationApi implements OrganizationApi {
  public constructor(private readonly http: HttpClient) {}
  public async get(): Promise<Organization> {
    return (await this.http.get<Organization>(DOMAIN_API.ORGANIZATION)).data;
  }
  public async update(input: OrganizationPatch): Promise<Organization> {
    return (await this.http.patch<Organization>(DOMAIN_API.ORGANIZATION, input)).data;
  }
}
