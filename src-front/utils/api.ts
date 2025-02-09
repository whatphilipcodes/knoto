export class ApiClient {
  url: URL;

  constructor(
    protocol: string,
    hostname: string,
    port: string | number,
    apiName?: string,
    apiVersion?: string,
  ) {
    this.url = new URL(`${protocol}://${hostname}:${port}`);
    this.url.pathname = `${apiName || 'api'}/${apiVersion || 'v1'}/`;
  }

  async testConnection(): Promise<string> {
    const endpoint = new URL('connect', this.url);
    const response = await fetch(endpoint);
    return await response.text();
  }
}
