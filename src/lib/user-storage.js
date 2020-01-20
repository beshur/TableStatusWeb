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
    let raw = this.engine.getItem(this.prefix + key);
    let result = null;

    try {
      result = JSON.parse(raw);
    } catch(err) {
      console.log('UserStorage', this.prefix, key, err);
      result = raw;
    }

    return result;
  }

  setItem(key, value) {
    return this.engine.setItem(this.prefix + key, JSON.stringify(value));
  }
}
