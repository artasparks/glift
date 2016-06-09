goog.provide('glift.api.Options');

/**
 * Option defaults. Sometimes I will refer to the a subset of these options as a
 * Glift Spec.
 *
 * Generally, there are three classes of options:
 *
 * 1. Manager Options. Meta options having to do with managing widgets.  These
 *    are generally at the top level.
 * 2. Display Options. Options having to do with how widgets are displayed
 * 3. SGF Options. Options having to do specifically with each SGF.
 *
 * Terminology:
 *  - I use SGF through this file and in Glift to refer to a go-data-file.  This
 *    is largely due to myopia early in the dev process. With the @api(1.X) in
 *    full sway, it's not easy to change this distinction. Regardless, it is
 *    possible that in the future, SGF strings and SGF URLs will grow to
 *    encompass other types go-data, like the Tygem .gib filetypes.
 *
 * API annotations:
 *
 *  - api:1.X Indicates an option supported for the lifetime of the 1.X
 *    release.
 *  - api:beta Indicates an option currently slated to become a 1.X option.
 *  - api:experimental Indicates an option in testing.
 *
 * @param {!glift.api.Options=} opt_o
 *
 * @constructor @final @struct
 */
glift.api.Options = function(opt_o) {
  var o = opt_o || {};

  /**
   * The sgf parameter can be one of the following:
   *  - An SGF in literal string form.
   *  - A URL to an SGF.
   *  - An SGF Object, with parameters specified in SGF Defaults
   *
   * If sgf is specified as an object in can contain any of the options
   * specified in sgfDefaults.  In addition, the follow parameters may be
   * specified:
   *  - sgfString: a literal SGF String
   *  - initialPosition: where to start in the SGF
   *  - url: a url to an SGF. see sgfDefaults for va
   *
   * As you might expect, if the user sets sgf to a literal string form or to a
   * url, it is transformed into an SGF object internally.
   *
   * Practically speaking, this value will always be undefined after the
   * glift.api.Options object construction since the 'SGF' will get stuffed into
   * the SGF Collection immediately and set to undefined.
   *
   * api:1.0
   *
   * @type {(string|glift.api.SgfOptions|undefined)}
   */
  this.sgf = o.sgf || undefined;

  /**
   * See: glift.api.sgfOptionDefaults and glift.api.SgfOptions
   * api:1.0
   *
   * @const
   * @type {!glift.api.SgfOptions}
   */
  this.sgfDefaults = new glift.api.SgfOptions(o.sgfDefaults);

  /**
   * The div id in which we create the go board.  The default is glift_display,
   * but this will almost certainly need to be set by the user.
   * api:1.0
   *
   * @const
   * @type {string}
   */
  this.divId = o.divId || 'glift_display';

  /**
   * The SGF collection represents a set of SGFs. Like the Sgf parameter, this
   * can take one of three values:
   * - An array of SGF objects. If the SGF param above is defined, the sgf
   *   collection will automatically become an array of size one containing the
   *   SGF element above.
   * - A URL (to load the collection asynchronously).  The received data must be
   *   a JSON array, containing a list of serialized SGF objects.
   *
   * Once an SGF Collection is loaded, Glift looks through each entry in the
   * collection.  If an SGF URL is found, the SGF is loaded in the background
   * and cached.
   * api:1.0
   *
   * @const
   * @type {!Array<!glift.api.SgfOptions|string>|string}
   */
  this.sgfCollection = o.sgfCollection || [];

  /**
   * An experimental feature. Create an association between.  This defines the
   * basis of the manager SGF cache.
   *
   * Expects the structure:
   *  {
   *    [name/alias]: <sgf string>
   *  }
   *
   * api:experimental
   *
   * @type {!Object<string>}
   */
  this.sgfMapping = o.sgfMapping || {};

  /**
   * Index into the above collection.  This is mostly useful for remembering
   * someone's position in the sgf collection.
   *
   * api:1.0
   *
   * @type {number}
   */
  this.initialIndex = o.initialIndex || 0;

  /**
   * If there are multiple SGFs in the SGF list, this flag indicates whether or
   * not to allow the user to go back to the beginnig (or conversely, the end).
   *
   * api:experimental
   *
   * @type {boolean}
   */
  this.allowWrapAround = !!o.allowWrapAround || false;

  /**
   * Wether or not to load the the collection in the background via XHR requests.
   *
   * api:beta
   *
   * @type {boolean}
   */
  this.loadCollectionInBackground =
      o.loadCollectionInBackground !== undefined ?
      !!o.loadCollectionInBackground : true;

  /**
   * Global metadata for this set of options or SGF collection.  These is not
   * meant to be used directly by Glift but by other programs utilizing Glift
   * and so the metadata has no expected structure.
   *
   * Note: This was created to be used by GPub.
   *
   * api:experimental
   *
   * @type {!Object|undefined}
   */
  this.metadata = o.metadata || undefined;

  /**
   * Hooks are places where users can provide custom functions to 'hook' into
   * Glift behavior.
   *
   * api:experimental
   *
   * @type {!glift.api.HookOptions}
   */
  this.hooks = new glift.api.HookOptions(o.hooks);

  /**
   * Miscellaneous options for display.
   * api:1.0
   *
   * @type {!glift.api.DisplayOptions}
   */
  this.display = new glift.api.DisplayOptions(o.display);

  /**
   * Default actions for stones. These are then used for defaults when the
   * SgfOptions are instantiated.
   * api:1.0
   *
   * @type {!glift.api.StoneActions}
   */
  this.stoneActions = new glift.api.StoneActions(o.stoneActions);

  /**
   * The actions for the icons.  See glift.api.iconActionDefaults.
   * api:1.0
   *
   * @type {!glift.api.IconActions}
   */
  this.iconActions = o.iconActions || {};

  for (var iconName in glift.api.iconActionDefaults) {
    if (!this.iconActions[iconName]) {
      this.iconActions[iconName] = glift.api.iconActionDefaults[iconName];
    }
  }
};
