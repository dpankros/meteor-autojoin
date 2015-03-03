/**
 * Defines the startup of the package
 */
function onLoad() {
  SimpleSchema.extendOptions({
    autojoin: Match.Optional(Match.OneOf(Object, String))
  });
}

onLoad();


/**
 * Top-level AutoJoin object
 * @type {{}|*}
 */
AutoJoin = AutoJoin || {};


/**
 * Preferences.  Set the members of this object to change the default behavior
 * of AutoJoin
 * @type {{automatic: boolean, depth: number}}
 */
AutoJoin.prefs = prefs;


/**
 * Internal objects, functions, and properties.  Do not modify or use these
 * functions outside of the package
 * @type {_private|*}
 */
AutoJoin._private = _private;


/**
 * DO NOT CHANGE! The overridden Mongo functions
 * @type {Object}
 */
AutoJoin.__orig = __orig;

