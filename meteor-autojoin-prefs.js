/**
 * The default preferences.  These can be changed at startup or at any point at
 * runtime.  Only new queries will be affected by the change, but if you change
 * then frequently, you're probably better off using the find option equivalent.
 * @type {{automatic: boolean, depth: number}}
 */
prefs = {
  //Should we perform joins automatically when there is autojoin schema
  //information specified?
  automatic: true,

  //How deep to expand?
  //1 level is good for most cases and the default.
  //0 will not expand at all.
  //-1 (or any negative number) will go infinitely.  I don't recommend it.
  depth: 1

};
