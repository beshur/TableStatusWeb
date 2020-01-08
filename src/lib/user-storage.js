/**
 * localStorage wrapper
 */
export default class UserStorage {
  storage = localStorage;

  constructor(options) {
    this.prefix = options.prefix;
  }

  setItem(key, data) {
    return this.storage.setItem(this.prefix + key, data);
  }

  getItem(key) {
    return this.storage.getItem(this.prefix + key);
  }
}
