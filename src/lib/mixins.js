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
        loaded[key] = this.storage.getItem(key);
        return key;
      });
      console.log('Storage loadState', loaded);
      this.setState(loaded, cb);
    }
  }
}
