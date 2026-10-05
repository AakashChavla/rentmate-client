import type { components } from '../../../lib/api/schema';
import type { HttpClient } from '../../../lib/api/http-client';
import { AUTH_API } from '../../../config/auth.constants';
export type Me = components['schemas']['MeDto'];
export type Registration = components['schemas']['RegisterDto'];
export type Credentials = components['schemas']['LoginDto'];
export interface AuthApi {
  me(): Promise<Me>;
  login(input: Credentials): Promise<Me>;
  logout(): Promise<void>;
  refresh(): Promise<void>;
  register(input: Registration): Promise<void>;
  verify(email: string, code: string): Promise<Me>;
  resend(email: string): Promise<void>;
  sendOtp(email: string): Promise<void>;
  verifyOtp(email: string, code: string): Promise<Me>;
  forgot(email: string): Promise<void>;
  reset(email: string, code: string, password: string): Promise<void>;
  change(currentPassword: string, password: string): Promise<void>;
}
export class HttpAuthApi implements AuthApi {
  public constructor(private readonly http: HttpClient) {}
  public async me(): Promise<Me> {
    return (await this.http.get<Me>(AUTH_API.ME)).data;
  }
  public async login(input: Credentials): Promise<Me> {
    return (await this.http.post<Me>(AUTH_API.LOGIN, input)).data;
  }
  public async logout(): Promise<void> {
    await this.http.post(AUTH_API.LOGOUT);
  }
  public async refresh(): Promise<void> {
    await this.http.post(AUTH_API.REFRESH);
  }
  public async register(input: Registration): Promise<void> {
    await this.http.post(AUTH_API.REGISTER, input);
  }
  public async verify(email: string, code: string): Promise<Me> {
    return (await this.http.post<Me>(AUTH_API.VERIFY, { email, code })).data;
  }
  public async resend(email: string): Promise<void> {
    await this.http.post(AUTH_API.RESEND, { email });
  }
  public async sendOtp(email: string): Promise<void> {
    await this.http.post(AUTH_API.OTP_SEND, { email });
  }
  public async verifyOtp(email: string, code: string): Promise<Me> {
    return (await this.http.post<Me>(AUTH_API.OTP_VERIFY, { email, code })).data;
  }
  public async forgot(email: string): Promise<void> {
    await this.http.post(AUTH_API.FORGOT, { email });
  }
  public async reset(email: string, code: string, password: string): Promise<void> {
    await this.http.post(AUTH_API.RESET, { email, code, password });
  }
  public async change(currentPassword: string, password: string): Promise<void> {
    await this.http.post(AUTH_API.CHANGE, { currentPassword, password });
  }
}
