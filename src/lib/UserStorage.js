/**
 * localStorage wrapper
 */
export default class UserStorage {
  constructor() {
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
    return this.engine.getItem(key);
  }

  setItem(key, value) {
    return this.engine.setItem(key, value);
  }
}
