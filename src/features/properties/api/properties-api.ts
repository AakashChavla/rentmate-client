import type { components } from '../../../lib/api/schema';
import type { HttpClient, HttpResult } from '../../../lib/api/http-client';
import { DOMAIN_API } from '../../../config/property.constants';
export type Property = components['schemas']['PropertyDto'];
export type PropertyConfig = components['schemas']['PropertyConfigDto'];
export type PropertyConfigPatch = components['schemas']['UpdatePropertyConfigDto'];
export type PropertyInput = components['schemas']['CreatePropertyDto'];
export type PropertyPatch = components['schemas']['UpdatePropertyDto'];
export interface PropertyFilter {
  type?: string | undefined;
  status?: string | undefined;
  search?: string | undefined;
  cursor?: string | undefined;
  mine?: boolean;
  propertyId?: string | undefined;
}
export interface PropertiesApi {
  list(filter: PropertyFilter): Promise<HttpResult<Property[]>>;
  get(id: string): Promise<Property>;
  create(input: PropertyInput): Promise<Property>;
  update(id: string, patch: PropertyPatch): Promise<Property>;
  remove(id: string): Promise<void>;
  config(id: string): Promise<PropertyConfig>;
  setConfig(id: string, input: PropertyConfigPatch): Promise<PropertyConfig>;
}
export class HttpPropertiesApi implements PropertiesApi {
  public constructor(private readonly http: HttpClient) {}
  public list(filter: PropertyFilter): Promise<HttpResult<Property[]>> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filter)) {
      if (value !== undefined && String(value)) query.set(key, String(value));
    }
    return this.http.get<Property[]>(DOMAIN_API.PROPERTIES + '?' + query.toString());
  }
  public async get(id: string): Promise<Property> {
    return (await this.http.get<Property>(this.path(id))).data;
  }
  public async create(input: PropertyInput): Promise<Property> {
    return (await this.http.post<Property>(DOMAIN_API.PROPERTIES, input)).data;
  }
  public async update(id: string, patch: PropertyPatch): Promise<Property> {
    return (await this.http.patch<Property>(this.path(id), patch)).data;
  }
  public async remove(id: string): Promise<void> {
    await this.http.delete(this.path(id));
  }
  public async config(id: string): Promise<PropertyConfig> {
    return (await this.http.get<PropertyConfig>(this.path(id) + '/config')).data;
  }
  public async setConfig(id: string, input: PropertyConfigPatch): Promise<PropertyConfig> {
    return (await this.http.patch<PropertyConfig>(this.path(id) + '/config', input)).data;
  }
  private path(id: string): string {
    return DOMAIN_API.PROPERTIES + '/' + encodeURIComponent(id);
  }
}
