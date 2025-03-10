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

  async connect(tries: number = 1000, delay: number = 500): Promise<boolean> {
    const endpoint = new URL('connect', this.url);
    for (let attempt = 1; attempt <= tries; attempt++) {
      try {
        const response = await fetch(endpoint);
        if (response.status === 200) {
          return true;
        }
      } catch (error) {
        if (attempt < tries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    return false;
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
