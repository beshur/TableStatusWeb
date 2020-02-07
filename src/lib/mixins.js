import UserStorage from './user-storage';

/**
 * Mixin that allows to save state in persistent storage and restore it on load
 */

export function StorageMixin(prefix) {
  return {
    storage: new UserStorage({prefix}),
    saveState: function(data, cb) {
      this.setState(data, cb);

      for (const prop in data) {
        this.storage.setItem(prop, data[prop]);
      }
    },
    loadState: function(keys, cb) {
      const loaded = {};
      keys.map(key => {
        let value = this.storage.getItem(key)
        if (value !== null) {
          loaded[key] = value;
        }
        return key;
      });
      console.log('Storage loadState', loaded);
      this.setState(loaded, cb);
    }
  }
}
