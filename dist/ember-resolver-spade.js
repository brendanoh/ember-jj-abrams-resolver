// ==========================================================================
// Project:   Ember - JavaScript Application Framework
// Copyright: Copyright 2013 Stefan Penner and Ember App Kit Contributors
// License:   Licensed under MIT license
//            See https://raw.github.com/stefanpenner/ember-jj-abrams-resolver/master/LICENSE
// ==========================================================================


minispade.register('ember-resolver/container-debug-adapter', "(function() {/*globals define registry requirejs */\n\ndefine(\"container-debug-adapter\",\n  [],\n  function() {\n    \"use strict\";\n  /*\n   * This module defines a subclass of Ember.ContainerDebugAdapter that adds two\n   * important features:\n   *\n   *  1) is able provide injections to classes that implement `extend`\n   *     (as is typical with Ember).\n   */\n\n  var ContainerDebugAdapter = Ember.ContainerDebugAdapter.extend({\n    /**\n      The container of the application being debugged.\n      This property will be injected\n      on creation.\n\n      @property container\n      @default null \n    */\n    // container: null, LIVES IN PARENT\n\n    /**\n      The resolver instance of the application\n      being debugged. This property will be injected\n      on creation.\n\n      @property resolver\n      @default null\n    */\n    // resolver: null,  LIVES IN PARENT   \n    /**\n      Returns true if it is possible to catalog a list of available\n      classes in the resolver for a given type.\n\n      @method canCatalogEntriesByType\n      @param {string} type The type. e.g. \"model\", \"controller\", \"route\"\n      @return {boolean} whether a list is available for this type.\n    */\n    canCatalogEntriesByType: function(type) {\n      return true;\n    },\n\n    /**\n      Returns the available classes a given type.\n\n      @method catalogEntriesByType\n      @param {string} type The type. e.g. \"model\", \"controller\", \"route\"\n      @return {Array} An array of classes.\n    */\n    catalogEntriesByType: function(type) {\n      var entries = requirejs.entries, \n      module,\n      types = Ember.A();\n\n      for(var key in entries) {\n        if(entries.hasOwnProperty(key) && key.indexOf(type) !== -1)\n        {\n          // debugger\n\n          module = require(key, null, null, true);\n\n          if (module && module['default']) { module = module['default']; }\n          module.fullName = key;\n          types.push(module);  \n        }\n      }\n\n      return types;\n    }\n  });\n\n  ContainerDebugAdapter['default'] = ContainerDebugAdapter;\n  return ContainerDebugAdapter;\n});\n\n/*\n\n  1. Test to find this class\n  2. Test to Access the methods\n  3. Verify this build includes this / makes available\n  4. Add an Initializer to register this\n\n*/\n\n\n    // var moduleName, tmpModuleName, prefix, podPrefix, moduleRegistry;\n\n    // prefix = this.namespace.modulePrefix;\n    // podPrefix = this.namespace.podModulePrefix || prefix;\n    // moduleRegistry = requirejs._eak_seen;\n\n    // Ember.assert('module prefix must be defined', prefix);\n\n    // var pluralizedType = parsedName.type + 's';\n    // var name = parsedName.fullNameWithoutType;\n\n    // // lookup using POD formatting first\n    // tmpModuleName = podPrefix + '/' + name + '/' + parsedName.type;\n    // if (moduleRegistry[tmpModuleName]) {\n    //   moduleName = tmpModuleName;\n    // }\n\n    // // if not using POD format, use the custom prefix\n    // if (this.namespace[parsedName.type + 'Prefix']) {\n    //   prefix = this.namespace[parsedName.type + 'Prefix'];\n    // }\n\n    // // if router:main or adapter:main look for a module with just the type first\n    // tmpModuleName = prefix + '/' + parsedName.type;\n    // if (!moduleName && name === 'main' && moduleRegistry[tmpModuleName]) {\n    //   moduleName = prefix + '/' + parsedName.type;\n    // }\n\n    // // fallback if not type:main or POD format\n    // if (!moduleName) { moduleName = prefix + '/' +  pluralizedType + '/' + name; }\n\n    // // allow treat all dashed and all underscored as the same thing\n    // // supports components with dashes and other stuff with underscores.\n    // var normalizedModuleName = chooseModuleName(moduleRegistry, moduleName);\n\n    // if (moduleRegistry[normalizedModuleName]) {\n    //   var module = require(normalizedModuleName, null, null, true );/* force sync */\n\n  //     if (module && module['default']) { module = module['default']; }\n\n  //     if (module === undefined) {\n  //       throw new Error(\" Expected to find: '\" + parsedName.fullName + \"' within '\" + normalizedModuleName + \"' but got 'undefined'. Did you forget to `export default` within '\" + normalizedModuleName + \"'?\");\n  //     }\n\n  //     if (this.shouldWrapInClassFactory(module, parsedName)) {\n  //       module = classFactory(module);\n  //     }\n\n  //     logLookup(true, parsedName, moduleName);\n\n  //     return module;\n  // }\n\n\n\n})();\n//@ sourceURL=ember-resolver/container-debug-adapter");minispade.register('ember-resolver/core', "(function() {/*globals define registry requirejs */\n\ndefine(\"resolver\",\n  [],\n  function() {\n    \"use strict\";\n  /*\n   * This module defines a subclass of Ember.DefaultResolver that adds two\n   * important features:\n   *\n   *  1) The resolver makes the container aware of es6 modules via the AMD\n   *     output. The loader's _moduleEntries is consulted so that classes can be\n   *     resolved directly via the module loader, without needing a manual\n   *     `import`.\n   *  2) is able provide injections to classes that implement `extend`\n   *     (as is typical with Ember).\n   */\n\n  function classFactory(klass) {\n    return {\n      create: function (injections) {\n        if (typeof klass.extend === 'function') {\n          return klass.extend(injections);\n        } else {\n          return klass;\n        }\n      }\n    };\n  }\n\n  var underscore = Ember.String.underscore;\n  var classify = Ember.String.classify;\n  var get = Ember.get;\n\n  function parseName(fullName) {\n    /*jshint validthis:true */\n\n    var nameParts = fullName.split(\":\"),\n        type = nameParts[0], fullNameWithoutType = nameParts[1],\n        name = fullNameWithoutType,\n        namespace = get(this, 'namespace'),\n        root = namespace;\n\n    return {\n      fullName: fullName,\n      type: type,\n      fullNameWithoutType: fullNameWithoutType,\n      name: name,\n      root: root,\n      resolveMethodName: \"resolve\" + classify(type)\n    };\n  }\n\n  function chooseModuleName(moduleEntries, moduleName) {\n    var underscoredModuleName = Ember.String.underscore(moduleName);\n\n    if (moduleName !== underscoredModuleName && moduleEntries[moduleName] && moduleEntries[underscoredModuleName]) {\n      throw new TypeError(\"Ambiguous module names: `\" + moduleName + \"` and `\" + underscoredModuleName + \"`\");\n    }\n\n    if (moduleEntries[moduleName]) {\n      return moduleName;\n    } else if (moduleEntries[underscoredModuleName]) {\n      return underscoredModuleName;\n    } else {\n      return moduleName;\n    }\n  }\n\n  function logLookup(found, parsedName, moduleName) {\n    if (Ember.ENV.LOG_MODULE_RESOLVER) {\n      var symbol;\n\n      if (found) { symbol = '[✓]'; }\n      else       { symbol = '[ ]'; }\n\n      Ember.Logger.info(symbol, parsedName.fullName, new Array(40 - parsedName.fullName.length).join('.'), moduleName);\n    }\n  }\n\n  function resolveOther(parsedName) {\n    /*jshint validthis:true */\n\n    var moduleName, tmpModuleName, prefix, podPrefix, moduleEntries;\n\n    prefix = this.namespace.modulePrefix;\n    podPrefix = this.namespace.podModulePrefix || prefix;\n    moduleEntries = requirejs.entries;\n\n    Ember.assert('module prefix must be defined', prefix);\n\n    var pluralizedType = parsedName.type + 's';\n    var name = parsedName.fullNameWithoutType;\n\n    // lookup using POD formatting first\n    tmpModuleName = podPrefix + '/' + name + '/' + parsedName.type;\n    if (moduleEntries[tmpModuleName]) {\n      moduleName = tmpModuleName;\n    }\n\n    // if not using POD format, use the custom prefix\n    if (this.namespace[parsedName.type + 'Prefix']) {\n      prefix = this.namespace[parsedName.type + 'Prefix'];\n    }\n\n    // if router:main or adapter:main look for a module with just the type first\n    tmpModuleName = prefix + '/' + parsedName.type;\n    if (!moduleName && name === 'main' && moduleEntries[tmpModuleName]) {\n      moduleName = prefix + '/' + parsedName.type;\n    }\n\n    // fallback if not type:main or POD format\n    if (!moduleName) { moduleName = prefix + '/' +  pluralizedType + '/' + name; }\n\n    // allow treat all dashed and all underscored as the same thing\n    // supports components with dashes and other stuff with underscores.\n    var normalizedModuleName = chooseModuleName(moduleEntries, moduleName);\n\n    if (moduleEntries[normalizedModuleName]) {\n      var module = require(normalizedModuleName, null, null, true /* force sync */);\n\n      if (module && module['default']) { module = module['default']; }\n\n      if (module === undefined) {\n        throw new Error(\" Expected to find: '\" + parsedName.fullName + \"' within '\" + normalizedModuleName + \"' but got 'undefined'. Did you forget to `export default` within '\" + normalizedModuleName + \"'?\");\n      }\n\n      if (this.shouldWrapInClassFactory(module, parsedName)) {\n        module = classFactory(module);\n      }\n\n      logLookup(true, parsedName, moduleName);\n\n      return module;\n    } else {\n      logLookup(false, parsedName, moduleName);\n\n      return null;\n    }\n  }\n  // Ember.DefaultResolver docs:\n  //   https://github.com/emberjs/ember.js/blob/master/packages/ember-application/lib/system/resolver.js\n  var Resolver = Ember.Resolver.extend({\n    resolveOther: resolveOther,    \n    resolveTemplate: resolveOther,\n  /**\n    This method is called via the container's resolver method.\n    It parses the provided `fullName` and then looks up and\n    returns the appropriate template or class.\n\n    @method resolve\n    @param {String} fullName the lookup string\n    @return {Object} the resolved factory\n  */\n  resolve: function(fullName) {\n    var parsedName = this.parseName(fullName),\n        resolveMethodName = parsedName.resolveMethodName;\n\n    if (!(parsedName.name && parsedName.type)) {\n      throw new TypeError(\"Invalid fullName: `\" + fullName + \"`, must be of the form `type:name` \");\n    }\n\n    if (this[resolveMethodName]) {\n      var resolved = this[resolveMethodName](parsedName);\n      if (resolved) { return resolved; }\n    }\n    return this.resolveOther(parsedName);\n  },\n  /**\n    Returns a human-readable description for a fullName. Used by the\n    Application namespace in assertions to describe the\n    precise name of the class that Ember is looking for, rather than\n    container keys.\n\n    @protected\n    @param {String} fullName the lookup string\n    @method lookupDescription\n  */\n  lookupDescription: function(fullName) {\n    var parsedName = this.parseName(fullName);\n\n    if (parsedName.type === 'template') {\n      return \"template at \" + parsedName.fullNameWithoutType.replace(/\\./g, '/');\n    }\n\n    var description = parsedName.root + \".\" + classify(parsedName.name);\n    if (parsedName.type !== 'model') { description += classify(parsedName.type); }\n\n    return description;\n  },\n\n    makeToString: function(factory, fullName) {\n      return '' + this.namespace.modulePrefix + '@' + fullName + ':';\n    },\n    parseName: parseName,\n    shouldWrapInClassFactory: function(module, parsedName){\n      return false;\n    },\n    normalize: function(fullName) {\n      // replace `.` with `/` in order to make nested controllers work in the following cases\n      // 1. `needs: ['posts/post']`\n      // 2. `{{render \"posts/post\"}}`\n      // 3. `this.render('posts/post')` from Route\n      var split = fullName.split(':');\n      if (split.length > 1) {\n        return split[0] + ':' + Ember.String.dasherize(split[1].replace(/\\./g, '/'));\n      } else {\n        return fullName;\n      }\n    }\n  });\n\n  Resolver['default'] = Resolver;\n  return Resolver;\n});\n\n})();\n//@ sourceURL=ember-resolver/core");minispade.register('ember-resolver', "(function() {minispade.require('ember-resolver/core');\nminispade.require('ember-resolver/container-debug-adapter');\n\n})();\n//@ sourceURL=ember-resolver");