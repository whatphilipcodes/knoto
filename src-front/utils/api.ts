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

  async connect(): Promise<string> {
    const endpoint = new URL('connect', this.url);
    const response = await fetch(endpoint);
    return await response.text();
  }

  async get(endpoint: string): Promise<any> {
    const url = new URL(endpoint, this.url);
    const response = await fetch(url);
    return await response.json();
  }

  async post(endpoint: string, data: any): Promise<any> {
    const url = new URL(endpoint, this.url);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  async put(endpoint: string, data: any): Promise<any> {
    const url = new URL(endpoint, this.url);
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  }

  async delete(endpoint: string): Promise<any> {
    const url = new URL(endpoint, this.url);
    const response = await fetch(url, {
      method: 'DELETE',
    });
    return await response.json();
  }
}
