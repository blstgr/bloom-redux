global.setImmediate = global.setImmediate ?? (callback => setTimeout(callback, 0));
