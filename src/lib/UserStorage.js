/**
 * localStorage wrapper
 */
export default class UserStorage {
  constructor(options) {
    this.prefix = options.prefix;

    if (typeof window !== 'undefined') {
      // ugly build hack
      this.engine = localStorage;
    } else {
      // mock
      this.engine = {
        getItem: () => undefined,
        setItem: () => undefined
      }
    }
  }

  getItem(key) {
    return this.engine.getItem(this.prefix + key);
  }

  setItem(key, value) {
    return this.engine.setItem(this.prefix + key, value);
  }
}
