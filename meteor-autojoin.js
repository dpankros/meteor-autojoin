/**
 * Defines the startup of the package
 */
function onLoad() {
  SimpleSchema.extendOptions({
    autojoin: Match.Optional(Match.OneOf(Object, String))
  });
}

onLoad();


var prefs = {
  joinWhenSpecified: true,
  joinDepth:1
}


var private = private || {};
/**
 * Returns the expanded defintion of one property
 * @param {String} prop - the property to expand
 * @param {String} propValue - the Initial value of the property
 * @param {Object} propSchema - the SimpleSchema definition for the property
 * @return {Object} The exanded property
 */

private.expandProp = function expandProp(prop, propValue, propSchema) {
  if (!prop || !propValue) {
    return propValue;
  }
  if (!propSchema || !propSchema['autojoin']) {
    return prop;
  }

  var collection = propSchema['autojoin'].collection;
  var id_key = propSchema['autojoin'].id ? propSchema['autojoin'].id : '_id';
  var query = {};
  query[id_key] = propValue;
  //expand the value
  return window[collection].findOne(query);
}


/**
 * Expands a whole document
 * @param {Object} doc - the document
 * @param {Object} docSchema - the SimpleSchema defintion for the document
 * @return {*} The expanded document
 */
private.expandDoc = function expandDoc(doc, docSchema) {
  if (!doc || !docSchema) {
    return doc;
  }
  var prop;
  for (prop in doc) {
    var propSchema = docSchema.getDefinition(prop);
    doc[prop] = private.expandProp(prop, doc[prop], propSchema);
  }
  return doc;
}


AutoJoin = AutoJoin || {};
AutoJoin.prefs = prefs;
AutoJoin.private = private;

/*
 * schema should be somethign like

 BookSchema = new SimpleSchema({
 title: {
 type: String,
 label: "Title",
 max: 200
 },
 author: {
 type: String,
 label: "Author",
 autojoin: {
 collection: Authors,
 id:_id; //default
 }
 });
 */


var __origMongoCollectionFind = Mongo.Collection.prototype.find;
var __origMongoCollectionFindOne = Mongo.Collection.prototype.findOne;


/**
 * Updated definition for basic Collection.findOne
 * @param {String} sel - A selector
 * @param {Object} opt - Options
 * @return {*}
 * @this Mongo.Collection
 */
Mongo.Collection.prototype.findOne = function findOneWithJoin(sel, opt) {
  var self = this;
  var doJoin = AutoJoin.prefs.joinWhenSpecified;

  if (opt && opt.hasOwnProperty('autojoin')) {
    doJoin = opt['autojoin'];
    delete opt['autojoin'];
  }

  var result = __origMongoCollectionFindOne.apply(this, arguments);
  var ss = this.simpleSchema();

  if (doJoin && ss) {
    result = AutoJoin.private.expandDoc(result, ss);
  }

  return result;
};


/**
 * Extends the meteor defintion of find
 * @param {(Object|String)} sel
 * @param {Object} opt
 * @return {*}
 * @this Mongo.Collection
 */
Mongo.Collection.prototype.find = function findWithJoin(sel, opt) {
  var self = this;
  var doJoin = AutoJoin.prefs.joinWhenSpecified;

  if (opt && opt.hasOwnProperty('autojoin')) {
    doJoin = opt['autojoin'];
    delete opt['autojoin'];
  }

  var result = __origMongoCollectionFind.apply(this, arguments);

  if (doJoin) {
    //add the schema to the cursor for later access, if needed
    result.__afSchema = this.simpleSchema();
  }
  return result;
};


var __origMongoCursorFetch = Mongo.Cursor.fetch;
var __origMongoCursorForEach = Mongo.Cursor.forEach;
var __origMongoCursorMap = Mongo.Cursor.map;


/**
 * Expand the docs when fetching
 * @return {*}
 * @this Mongo.Cursor
 */
Mongo.Cursor.fetch = function fetchWithJoin() {
  var result = __origMongoCursorFetch.apply(this, arguments);
  if (!this.__afSchema) {
    return result;
  }
  var newArray = [];
  var i;
  var doc;
  for (i = 0; i < result.length; i++) {
    doc = result[i];
    newArray.push(AutoJoin.private.expandDoc(doc, this.__afSchema));
  }
  return newArray;
};


/**
 * Intercepts call to forEach and wraps the callback so that expansion occurs
 * before the original callback is called
 * @param {function} callback - a callback function
 * @param {Object=} opt_thisArg - a value for 'this'
 * @return {*}
 * @this Mongo.Cursor
 */
Mongo.Cursor.forEach = function forEachWithjoin(callback, opt_thisArg) {
  if (!this.__afSchema) {
    return __origMongoCursorForEach(arguments, this);
  }

  var wrappedCallback = function(obj, ndx, cursor) {
    obj = AutoJoin.private.expandDoc(obj, this.__afSchema);
    return callback.apply(obj, this);
  };
  arguments[0] = wrappedCallback;
  return __origMongoCursorForEach.apply(this, arguments);
};


/**
 * Intercepts call to map and wraps the callback so that expansion occurs before
 * the original callback is called.
 * @param {function} callback - a callback function
 * @param {Object=} opt_thisArg - a value for 'this'
 * @return {Array|*} the resulting array with callback applied to each element
 * @this Mongo.Cursor
 */
Mongo.Cursor.map = function mapWithJoin(callback, opt_thisArg) {
  if (!this.__afSchema) {
    return __origMongoCursorMap(arguments, this);
  }

  var wrappedCallback = function(obj, ndx, cursor) {
    obj = AutoJoin.private.expandDoc(obj, this.__afSchema);
    return callback.apply(obj, this);
  };
  arguments[0] = wrappedCallback;
  return __origMongoCursorMap.apply(this, arguments);
};
