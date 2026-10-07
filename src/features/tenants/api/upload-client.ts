import { ApiError } from '../../../lib/api/api-error';
import { ERROR_CODES, HTTP_HEADERS, HTTP_METHODS, API_STATUS } from '../../../config/app.constants';
import { RENTAL_LIMIT as L } from '../../../config/lease.constants';
import type { RefreshCoordinator } from '../../../lib/api/refresh-coordinator';
const UPLOAD_FAILURE = { STATUS: 0, REQUEST_ID: null, TIMEOUT: 30000 } as const;
export interface UploadClient {
  post<T>(path: string, form: FormData, progress: (value: number) => void): Promise<T>;
}
export class BrowserUploadClient implements UploadClient {
  public constructor(
    private readonly base: string,
    private readonly locale: () => string,
    private readonly refresh?: RefreshCoordinator,
  ) {}
  public async post<T>(
    path: string,
    form: FormData,
    progress: (value: number) => void,
  ): Promise<T> {
    try {
      return await this.send<T>(path, form, progress);
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === API_STATUS.UNAUTHORIZED &&
        this.refresh?.enabled
      ) {
        await this.refresh.refresh();
        return this.send<T>(path, form, progress);
      }
      throw error;
    }
  }
  private send<T>(path: string, form: FormData, progress: (value: number) => void): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(HTTP_METHODS.POST, new URL(path, this.base));
      xhr.withCredentials = true;
      xhr.timeout = UPLOAD_FAILURE.TIMEOUT;
      xhr.ontimeout = () => {
        reject(
          new ApiError(ERROR_CODES.HTTP_ERROR, UPLOAD_FAILURE.STATUS, UPLOAD_FAILURE.REQUEST_ID),
        );
      };
      xhr.setRequestHeader(HTTP_HEADERS.ACCEPT_LANGUAGE, this.locale());
      xhr.setRequestHeader(HTTP_HEADERS.REQUEST_ID, crypto.randomUUID());
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) progress(Math.round((e.loaded / e.total) * L.PROGRESS));
      };
      xhr.onerror = () => {
        reject(
          new ApiError(ERROR_CODES.HTTP_ERROR, UPLOAD_FAILURE.STATUS, UPLOAD_FAILURE.REQUEST_ID),
        );
      };
      xhr.onload = () => {
        try {
          const body = JSON.parse(xhr.responseText) as {
            success?: boolean;
            data: T;
            error?: { code?: string; message?: string };
          };
          if (xhr.status < API_STATUS.BAD_REQUEST && body.success) {
            resolve(body.data);
          } else
            reject(
              new ApiError(
                body.error?.code ?? ERROR_CODES.HTTP_ERROR,
                xhr.status,
                xhr.getResponseHeader(HTTP_HEADERS.REQUEST_ID),
                body.error?.message,
              ),
            );
        } catch {
          reject(new ApiError(ERROR_CODES.HTTP_ERROR, xhr.status, UPLOAD_FAILURE.REQUEST_ID));
        }
      };
      xhr.send(form);
    });
  }
}
