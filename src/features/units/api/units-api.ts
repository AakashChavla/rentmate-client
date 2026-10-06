import type { components } from '../../../lib/api/schema';
import type { HttpClient, HttpResult } from '../../../lib/api/http-client';
import { UNIT_API, FLOOR_API, BED_API, propertyUnitPath } from '../../../config/unit.constants';
export type Unit = components['schemas']['UnitDto'];
export type Floor = components['schemas']['FloorDto'];
export type Bed = components['schemas']['BedDto'];
export type UnitInput = components['schemas']['UnitInputDto'];
export type UnitPatch = components['schemas']['UnitPatchDto'];
export type UnitConfig = components['schemas']['UnitConfigDto'];
export type BulkPattern = components['schemas']['BulkPatternDto'];
export type BulkResult = components['schemas']['BulkResultDto'];
export type BulkJob = components['schemas']['BulkJobDto'];
export type Occupancy = components['schemas']['OccupancyDto'];
export type FloorInput = components['schemas']['FloorInputDto'];
export interface UnitFilter {
  propertyId?: string | undefined;
  floorId?: string | undefined;
  status?: Unit['status'] | undefined;
  type?: Unit['type'] | undefined;
  search?: string | undefined;
  cursor?: string | undefined;
}
export interface UnitsApi {
  list(filter: UnitFilter): Promise<HttpResult<Unit[]>>;
  get(id: string): Promise<Unit>;
  create(property: string, input: UnitInput): Promise<Unit>;
  update(id: string, input: UnitPatch): Promise<Unit>;
  remove(id: string): Promise<void>;
  status(id: string, status: Unit['status'], expectedStatus: Unit['status']): Promise<Unit>;
  config(id: string): Promise<UnitConfig>;
  setConfig(id: string, input: Partial<UnitConfig>): Promise<UnitConfig>;
  floors(property: string): Promise<Floor[]>;
  createFloor(property: string, input: FloorInput): Promise<Floor>;
  updateFloor(id: string, input: Partial<FloorInput>): Promise<Floor>;
  removeFloor(id: string): Promise<void>;
  beds(unit: string): Promise<Bed[]>;
  createBed(unit: string, label: string): Promise<Bed>;
  updateBed(id: string, label: string): Promise<Bed>;
  bedStatus(id: string, status: Bed['status'], expectedStatus: Bed['status']): Promise<Bed>;
  removeBed(id: string): Promise<void>;
  bulk(property: string, input: BulkPattern): Promise<BulkResult>;
  job(property: string, id: string): Promise<BulkJob>;
  occupancy(property: string): Promise<Occupancy>;
}
export class HttpUnitsApi implements UnitsApi {
  public constructor(private readonly http: HttpClient) {}
  public list(filter: UnitFilter): Promise<HttpResult<Unit[]>> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filter)) if (value) query.set(key, String(value));
    return this.http.get<Unit[]>(UNIT_API + '?' + query.toString());
  }
  public async get(id: string): Promise<Unit> {
    return (await this.http.get<Unit>(UNIT_API + '/' + encodeURIComponent(id))).data;
  }
  public async create(property: string, input: UnitInput): Promise<Unit> {
    return (await this.http.post<Unit>(propertyUnitPath(property) + '/units', input)).data;
  }
  public async update(id: string, input: UnitPatch): Promise<Unit> {
    return (await this.http.patch<Unit>(UNIT_API + '/' + encodeURIComponent(id), input)).data;
  }
  public async remove(id: string): Promise<void> {
    await this.http.delete(UNIT_API + '/' + encodeURIComponent(id));
  }
  public async status(
    id: string,
    status: Unit['status'],
    expectedStatus: Unit['status'],
  ): Promise<Unit> {
    return (
      await this.http.patch<Unit>(UNIT_API + '/' + encodeURIComponent(id) + '/status', {
        status,
        expectedStatus,
      })
    ).data;
  }
  public async config(id: string): Promise<UnitConfig> {
    return (await this.http.get<UnitConfig>(UNIT_API + '/' + encodeURIComponent(id) + '/config'))
      .data;
  }
  public async setConfig(id: string, input: Partial<UnitConfig>): Promise<UnitConfig> {
    return (
      await this.http.patch<UnitConfig>(UNIT_API + '/' + encodeURIComponent(id) + '/config', input)
    ).data;
  }
  public async floors(property: string): Promise<Floor[]> {
    return (await this.http.get<Floor[]>(propertyUnitPath(property) + '/floors')).data;
  }
  public async createFloor(property: string, input: FloorInput): Promise<Floor> {
    return (await this.http.post<Floor>(propertyUnitPath(property) + '/floors', input)).data;
  }
  public async updateFloor(id: string, input: Partial<FloorInput>): Promise<Floor> {
    return (await this.http.patch<Floor>(FLOOR_API + '/' + encodeURIComponent(id), input)).data;
  }
  public async removeFloor(id: string): Promise<void> {
    await this.http.delete(FLOOR_API + '/' + encodeURIComponent(id));
  }
  public async beds(unit: string): Promise<Bed[]> {
    return (await this.http.get<Bed[]>(UNIT_API + '/' + encodeURIComponent(unit) + '/beds')).data;
  }
  public async createBed(unit: string, label: string): Promise<Bed> {
    return (
      await this.http.post<Bed>(UNIT_API + '/' + encodeURIComponent(unit) + '/beds', { label })
    ).data;
  }
  public async updateBed(id: string, label: string): Promise<Bed> {
    return (await this.http.patch<Bed>(BED_API + '/' + encodeURIComponent(id), { label })).data;
  }
  public async bedStatus(
    id: string,
    status: Bed['status'],
    expectedStatus: Bed['status'],
  ): Promise<Bed> {
    return (
      await this.http.patch<Bed>(BED_API + '/' + encodeURIComponent(id) + '/status', {
        status,
        expectedStatus,
      })
    ).data;
  }
  public async removeBed(id: string): Promise<void> {
    await this.http.delete(BED_API + '/' + encodeURIComponent(id));
  }
  public async bulk(property: string, input: BulkPattern): Promise<BulkResult> {
    return (await this.http.post<BulkResult>(propertyUnitPath(property) + '/units/bulk', input))
      .data;
  }
  public async job(property: string, id: string): Promise<BulkJob> {
    return (
      await this.http.get<BulkJob>(
        propertyUnitPath(property) + '/units/bulk/' + encodeURIComponent(id),
      )
    ).data;
  }
  public async occupancy(property: string): Promise<Occupancy> {
    return (await this.http.get<Occupancy>(propertyUnitPath(property) + '/occupancy')).data;
  }
}
