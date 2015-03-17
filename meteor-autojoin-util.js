util = {
  /**
   * deepDelete - finds a nested property (e.g. "prop1.prop2.5.name")
   * within an object (obj) and deletes it
   * @param {Object} obj - An object
   * @param {String} prop - the String name of a property that may be
   * nested within objects
   * @return {Boolean} the result of a delete operation on prop
   */
  deepDelete: function(obj, prop) {
    return util.deepDo(obj, prop, function(obj, prop) {
      return delete obj[prop];
    });
  },

  /**
   * deepSet - finds a nested property (e.g. "prop1.prop2.5.name")
   * within an object (obj) and sets it to value
   * @param {Object} obj - An object
   * @param {String} prop - the String name of a property that
   * may be nested within objects
   * @param {*} value - the value to set prop to
   * @return {Boolean} the result of a set operation on prop
   */
  deepSet: function(obj, prop, value) {
    return util.deepDo(obj, prop, function(obj, prop) {
      return obj[prop] = value;
    });
  },

  /**
   * deepGet - finds a nested property (e.g. "prop1.prop2.5.name") within an
   * object (obj) and returns it
   * @param {Object} obj - An object
   * @param {String} prop - the String name of a property that may be nested
   * within objects
   * @return {*} the value of prop
   */
  deepGet: function(obj, prop) {
    return util.deepDo(obj, prop, function(obj, prop) {
      return obj[prop];
    });
  },

  /**
   * deepFind - finds a nested property (e.g. "prop1.prop2.5.name") within an
   * object (obj) and returns obj
   * @param {Object} obj - An object
   * @param {String} prop - the String name of a property that may be nested
   * within objects
   * @return {Object} the object that CONTAINS prop.  If prop is
   * prop1.prop2.5.name, it will return array element 5
   */
  deepFind: function(obj, prop) {
    return util.deepDo(obj, prop, function(obj, prop) {
      return obj;
    });
  },

  /**
   * deepD0 - finds a nested property (e.g. "prop1.prop2.5.name") within
   * an object (obj) and executes a closure
   * @param {Object} obj - An object
   * @param {String} path - the String name of a property that may be
   * nested within objects
   * @param {function} closure - the closure to execute
   * @return {*} the return value of the closure
   * @this util
   */
  deepDo: function(obj, path, closure) {
    path = path.split('.');
    for (i = 0; i < path.length - 1; i++)
      obj = obj[path[i]];

    return closure.apply(this, [obj, path[i]]);
  }
};
