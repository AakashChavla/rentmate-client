import type { components } from '../../../lib/api/schema';
import type { HttpClient, HttpResult } from '../../../lib/api/http-client';
import { USER_API, ROLES_API, PERMISSIONS_API, ROLE_SCOPE } from '../../../config/auth.constants';
export type User = components['schemas']['UserDto'];
export type ProfilePatch = components['schemas']['ProfileDto'];
export type UserPatch = components['schemas']['UpdateUserDto'];
export type RoleAssignment = components['schemas']['RoleAssignmentDto'];
export interface UserFilters {
  search: string;
  status: string;
  cursor?: string;
}
export interface UsersApi {
  list(filters: UserFilters): Promise<HttpResult<User[]>>;
  get(id: string): Promise<User>;
  profile(patch: ProfilePatch): Promise<User>;
  update(id: string, patch: UserPatch): Promise<User>;
  assign(id: string, role: string): Promise<void>;
  remove(id: string, assignment: string): Promise<void>;
  roles(): Promise<string[]>;
  permissions(): Promise<string[]>;
}
export class HttpUsersApi implements UsersApi {
  public constructor(private readonly http: HttpClient) {}
  public list(filters: UserFilters): Promise<HttpResult<User[]>> {
    const query = new URLSearchParams();
    if (filters.search) query.set('search', filters.search);
    if (filters.status) query.set('status', filters.status);
    if (filters.cursor) query.set('cursor', filters.cursor);
    return this.http.get<User[]>(`${USER_API}?${query.toString()}`);
  }
  public async get(id: string): Promise<User> {
    return (await this.http.get<User>(`${USER_API}/${id}`)).data;
  }
  public async profile(patch: ProfilePatch): Promise<User> {
    return (await this.http.patch<User>(`${USER_API}/me`, patch)).data;
  }
  public async update(id: string, patch: UserPatch): Promise<User> {
    return (await this.http.patch<User>(`${USER_API}/${id}`, patch)).data;
  }
  public async assign(id: string, role: string): Promise<void> {
    await this.http.post(`${USER_API}/${id}/roles`, { role, scope: ROLE_SCOPE.ORGANIZATION });
  }
  public async remove(id: string, assignment: string): Promise<void> {
    await this.http.delete(`${USER_API}/${id}/roles/${assignment}`);
  }
  public async roles(): Promise<string[]> {
    return (await this.http.get<string[]>(ROLES_API)).data;
  }
  public async permissions(): Promise<string[]> {
    return (await this.http.get<string[]>(PERMISSIONS_API)).data;
  }
}
