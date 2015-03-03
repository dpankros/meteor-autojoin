/**
 * Pointers to original functions that will be wrapped.
 * @type {Function}
 */
var __orig = {
  MongoCollectionFind: Mongo.Collection.prototype.find,
  MongoCollectionFindOne: Mongo.Collection.prototype.findOne,
  MongoCursorFetch: Mongo.Collection.Cursor.prototype.fetch,
  MongoCursorForEach: Mongo.Collection.Cursor.prototype.forEach,
  MongoCursorMap: Mongo.Collection.Cursor.prototype.map
};

/**
 * Updated definition for basic Collection.findOne
 * @param {String} sel - A selector
 * @param {Object} opt - Options
 * @return {*}
 * @this external Mongo.Collection
 */
Mongo.Collection.prototype.findOne = function findOneWithJoin(sel, opt) {
  var self = this;
  var doJoin = AutoJoin.prefs.automatic;
  var depth = AutoJoin.prefs.depth;

  if (opt && opt.hasOwnProperty(AutoJoin._private.AUTOJOIN_CONTAINER)) {
    var aj = opt[AutoJoin._private.AUTOJOIN_CONTAINER];
    if (aj.hasOwnProperty(AutoJoin._private.JOIN_PROPERTY)) {
      doJoin = aj[AutoJoin._private.JOIN_PROPERTY];
    }
    if (aj.hasOwnProperty(AutoJoin._private.DEPTH_PROPERTY)) {
      depth = aj[AutoJoin._private.DEPTH_PROPERTY];
    }
    delete opt[AutoJoin._private.AUTOJOIN_CONTAINER];
  }

  var result = AutoJoin.__orig.MongoCollectionFindOne.apply(this, arguments);
  var ss = this.simpleSchema();

  if (doJoin && ss) {
    result = AutoJoin._private.expandDoc(result, ss, depth);
  }

  return result;
};


/**
 * Extends the meteor defintion of find
 * @param {(Object|String)} sel
 * @param {Object} opt
 * @return {*}
 * @this external Mongo.Collection
 */
Mongo.Collection.prototype.find = function findWithJoin(sel, opt) {
  var self = this;
  var doJoin = AutoJoin.prefs.automatic;
  var depth = AutoJoin.prefs.depth;

  //determine if we should join and the depth, then delete the options for it
  if (opt && opt.hasOwnProperty(AutoJoin._private.AUTOJOIN_CONTAINER)) {
    var aj = opt[AutoJoin._private.AUTOJOIN_CONTAINER];
    if (aj.hasOwnProperty(AutoJoin._private.JOIN_PROPERTY)) {
      doJoin = aj[AutoJoin._private.JOIN_PROPERTY];
    }
    if (aj.hasOwnProperty(AutoJoin._private.DEPTH_PROPERTY)) {
      depth = aj[AutoJoin._private.DEPTH_PROPERTY];
    }
    delete opt[AutoJoin._private.AUTOJOIN_CONTAINER];
  }

  var result = AutoJoin.__orig.MongoCollectionFind.apply(this, arguments);

  if (doJoin) {
    //add the schema to the cursor for later access, if we are doing a join
    result.__afSchema = this.simpleSchema();
    result.__ajDepth = depth;
  } else {
    result.__ajDepth = 0;
  }

  return result;
};


/**
 * Expand the docs when fetching
 * @return {*}
 * @this external Mongo.Cursor
 */
Mongo.Collection.Cursor.prototype.fetch = function fetchWithJoin() {
  var result = AutoJoin.__orig.MongoCursorFetch.apply(this, arguments);
  if (this.__afSchema) {
    var newArray = [];
    for (var i = 0; i < result.length; i++) {
      var doc = result[i];
      newArray.push(
          AutoJoin._private.expandDoc(doc, this.__afSchema, this.__ajDepth)
      );
    }
    result = newArray;
  }
  return result;
};


/**
 * Intercepts call to forEach and wraps the callback so that expansion occurs
 * before the original callback is called
 * @param {function} callback - a callback function
 * @param {Object=} opt_thisArg - a value for 'this'
 * @return {*}
 * @this external Mongo.Cursor
 */
Mongo.Collection.Cursor.prototype.forEach =
    function forEachWithJoin(callback, opt_thisArg) {
      var self = this;
      if (this.__afSchema) {
        var wrappedCallback = function(obj, ndx, cursor) {
          var depth = this.__ajDepth.copy();
          obj = AutoJoin._private.expandDoc(obj, this.__afSchema, depth);
          return callback.apply(obj, this);
        };
        arguments[0] = wrappedCallback;
      }
      return AutoJoin.__orig.MongoCursorForEach.apply(this, arguments);
    };


/**
 * Intercepts call to map and wraps the callback so that expansion occurs before
 * the original callback is called.
 * @param {function} callback - a callback function
 * @param {Object=} opt_thisArg - a value for 'this'
 * @return {Array|*} the resulting array with callback applied to each element
 * @this external Mongo.Cursor
 */
Mongo.Collection.Cursor.prototype.map =
    function mapWithJoin(callback, opt_thisArg) {
      if (!this.__afSchema) {
        return AutoJoin.__orig.MongoCursorMap(this, arguments);
      }
      var wrappedCallback = function(obj, ndx, cursor) {
        var depth = this.__ajDepth.copy();
        obj = AutoJoin._private.expandDoc(obj, this.__afSchema, depth);
        return callback.apply(obj, this);
      };
      arguments[0] = wrappedCallback;
      return AutoJoin.__orig.MongoCursorMap.apply(this, arguments);
    };
