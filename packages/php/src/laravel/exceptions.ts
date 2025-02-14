// Sourced from: https://github.com/unjs/h3/blob/main/src/error.ts
class Exception<DataT = unknown> extends Error {
  static __php_exception__ = true;
  statusCode = 500;
  fatal = false;
  statusMessage?: string;
  data?: DataT;
  cause?: unknown;

  constructor(message: string, opts: Partial<Pick<Exception<DataT>, 'data' | 'fatal' | 'cause' | 'message' | 'statusCode' | 'statusMessage'>> = {}) {
    // @ts-ignore https://v8.dev/features/error-cause
    super(message, opts);

    // Polyfill cause for other runtimes
    if (opts.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }

  toJSON() {
    const obj: Pick<Exception<DataT>, 'data' | 'message' | 'statusCode' | 'statusMessage'> = {
      message: this.message,
      statusCode: Exception.sanitizeStatusCode(this.statusCode, 500)
    };

    if (this.statusMessage) {
      obj.statusMessage = Exception.sanitizeStatusMessage(this.statusMessage);
    }
    if (this.data !== undefined) {
      obj.data = this.data;
    }

    return obj;
  }

  static isError<DataT = unknown>(input: any): input is Exception<DataT> {
    return input?.constructor?.__php_exception__ === true;
  }

  private static sanitizeStatusMessage(statusMessage = ''): string {
    return statusMessage.replace(/[^\t\u0020-\u007E]/g, '');
  }

  private static sanitizeStatusCode(
    statusCode?: string | number,
    defaultStatusCode = 200
  ): number {
    if (!statusCode) {
      return defaultStatusCode;
    }
    if (typeof statusCode === 'string') {
      statusCode = Number.parseInt(statusCode, 10);
    }
    if (statusCode < 100 || statusCode > 999) {
      return defaultStatusCode;
    }
    return statusCode;
  }
}

export class EncryptException extends Exception {}

export class DecryptException extends Exception {}

export class InvalidArgException extends Exception {}
