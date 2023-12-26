export interface KV {
  set(key: string, value: string, ttl_in_seconds?: number): Promise<void>;
  get(key: string): Promise<string | null>;
}

export class InMemoryKV implements KV {
  private cache = new Map<
    string,
    { value: string; timestamp: number | undefined }
  >();
  async set(
    key: string,
    value: string,
    ttl_in_seconds?: number | undefined
  ): Promise<void> {
    this.cache.set(key, {
      value,
      timestamp: ttl_in_seconds ? Date.now() + ttl_in_seconds * 1000 : undefined
    });
  }

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);

    if (!item) return null;

    if (item.timestamp !== undefined && item.timestamp < Date.now()) {
      return null;
    }

    return item.value;
  }
}
