/**
 * Created by dpankros on 3/1/15.
 */


_private = _private || {};

/**
 * DO NOT CHANGE! The name of the container object for find queries
 * @type {string}
 */
_private.AUTOJOIN_CONTAINER = 'autojoin';


/**
 * DO NOT CHANGE!  The name of the property to specify depth
 * @type {string}
 */
_private.DEPTH_PROPERTY = 'depth';


/**
 * DO NOT CHANGE! The name of the property to specify whether to join
 * @type {string}
 */
_private.JOIN_PROPERTY = 'join';


/**
 * DO NOT CHANGE! The name of the property used to specify id
 * @type {string}
 */
_private.ID_PROPERTY = 'id';


/**
 * INTERNAL USE ONLY.  Returns the expanded defintion of one property
 * @param {String} prop - the property to expand
 * @param {String} propValue - the Initial value of the property
 * @param {Object} propSchema - the SimpleSchema definition for the property
 * @param {Number} depth - the maximum depth to expand
 * @return {Object} The exanded property
 */

_private.expandProp = function expandProp(prop, propValue, propSchema, depth) {
  if (!prop || !propValue) {
    return propValue;
  }
  if (!propSchema || !propSchema[_private.AUTOJOIN_CONTAINER]) {
    return prop;
  }

  var collection = propSchema[_private.AUTOJOIN_CONTAINER].collection;
  var id_key = propSchema[_private.AUTOJOIN_CONTAINER][_private.ID_PROPERTY] ?
    propSchema[_private.AUTOJOIN_CONTAINER][_private.ID_PROPERTY] : '_id';
  var query = {};
  query[id_key] = propValue;
  //expand the value
  return window[collection].findOne(query, {autojoin: {depth: depth - 1}});
};


/**
 * INTERNAL USE ONLY.  Creates a find option object
 * @param {Boolean=} opt_doJoin - Should we join?
 * @param {Boolean=} opt_depth - What depth
 * @return {Object} The option object
 */
_private.createFindOption = function createFindOption(opt_doJoin, opt_depth) {
  var opt = {};
  if (opt_depth == undefined && opt_doJoin == undefined) {
    return opt;
  }

  opt[_private.AUTOJOIN_CONTAINER] = {};
  var aj = opt[_private.AUTOJOIN_CONTAINER];
  if (opt_doJoin != undefined) {
    aj[_private.JOIN_PROPERTY] = opt_doJoin;
  }
  if (opt_depth != undefined) {
    aj[_private.DEPTH_PROPERTY] = opt_depth;
  }
  return opt;
};


/**
 * Expands a whole document
 * @param {Object} doc - the document
 * @param {Object} docSchema - the SimpleSchema defintion for the document
 * @param {Number} depth - the maximum depth to expand
 * @return {*} The expanded document
 */
_private.expandDoc = function expandDoc(doc, docSchema, depth) {
  if (!doc || !docSchema || depth === 0) {
    return doc;
  }
  var prop;
  for (prop in doc) {
    var propSchema = docSchema.getDefinition(prop);
    doc[prop] = _private.expandProp(prop, doc[prop], propSchema, depth);
  }
  return doc;
}
