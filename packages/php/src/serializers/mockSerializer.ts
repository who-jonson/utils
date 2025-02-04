export class MockSerializer {
  /**
   * Serialize
   *
   * @param data
   */
  serialize(data: any): string {
    return JSON.stringify(data);
  }

  /**
   * Unserialize
   *  if cannot unserialize return data untouched
   *
   * @param data
   */
  unserialize<T>(data: any): T {
    try {
      return JSON.parse(data);
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (e) {
      return data;
    }
  }
}
