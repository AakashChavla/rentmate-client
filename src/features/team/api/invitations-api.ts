import type { components } from '../../../lib/api/schema';
import type { HttpClient, HttpResult } from '../../../lib/api/http-client';
import { DOMAIN_API } from '../../../config/property.constants';
export type Invitation = components['schemas']['InvitationDto'];
export type InviteInput = components['schemas']['CreateInvitationDto'];
export type AcceptInput = components['schemas']['AcceptInvitationDto'];
export type Accepted = components['schemas']['InvitationAcceptedDto'];
export interface InviteFilter {
  scopeId?: string | undefined;
  cursor?: string | undefined;
  status?: string | undefined;
}
export interface InvitationsApi {
  list(filter: InviteFilter): Promise<HttpResult<Invitation[]>>;
  create(input: InviteInput): Promise<Invitation>;
  resend(id: string): Promise<Invitation>;
  revoke(id: string): Promise<void>;
  accept(input: AcceptInput): Promise<Accepted>;
}
export class HttpInvitationsApi implements InvitationsApi {
  public constructor(private readonly http: HttpClient) {}
  public list(filter: InviteFilter): Promise<HttpResult<Invitation[]>> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filter)) {
      if (value) query.set(key, String(value));
    }
    return this.http.get<Invitation[]>(DOMAIN_API.INVITATIONS + '?' + query.toString());
  }
  public async create(input: InviteInput): Promise<Invitation> {
    return (await this.http.post<Invitation>(DOMAIN_API.INVITATIONS, input)).data;
  }
  public async resend(id: string): Promise<Invitation> {
    return (await this.http.post<Invitation>(this.path(id) + '/resend')).data;
  }
  public async revoke(id: string): Promise<void> {
    await this.http.delete(this.path(id));
  }
  public async accept(input: AcceptInput): Promise<Accepted> {
    return (await this.http.post<Accepted>(DOMAIN_API.INVITATIONS + '/accept', input)).data;
  }
  private path(id: string): string {
    return DOMAIN_API.INVITATIONS + '/' + encodeURIComponent(id);
  }
}
