"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

var _Object$defineProperties = require("@babel/runtime-corejs2/core-js/object/define-properties");

var _Object$getOwnPropertyDescriptors = require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors");

var _Object$getOwnPropertyDescriptor = require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor");

var _Object$getOwnPropertySymbols = require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols");

var _Object$keys = require("@babel/runtime-corejs2/core-js/object/keys");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/typeof"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/json/stringify"));

function ownKeys(object, enumerableOnly) { var keys = _Object$keys(object); if (_Object$getOwnPropertySymbols) { var symbols = _Object$getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return _Object$getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (_Object$getOwnPropertyDescriptors) { _Object$defineProperties(target, _Object$getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { _Object$defineProperty(target, key, _Object$getOwnPropertyDescriptor(source, key)); }); } } return target; }

/*
const FroalaEditor = require('@/../vendors/froala_editor_sources/js/froala_editor')

require('@/../vendors/froala_editor_sources/js/plugins.pkgd')
require('@/../vendors/froala_editor_sources/js/third_party/font_awesome')
// support for zh_tw
require('./froala_zh_tw.js')
*/
var FroalaEditor = require('froala-editor');

require('froala-editor/js/plugins.pkgd.min');

require('froala-editor/js/third_party/font_awesome.min.js'); // support for zh_tw


require('./froala_zh_tw.js');

var _default = function _default(Vue) {
  var Options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var froalaEditorFunctionality = {
    props: ['tag', 'value', 'config', 'onManualControllerReady'],
    watch: {
      value: function value() {
        this.model = this.value;
        this.updateValue();
      }
    },
    render: function render(createElement) {
      return createElement(this.currentTag, [this.$slots["default"]]);
    },
    created: function created() {
      this.currentTag = this.tag || this.currentTag;
      this.model = this.value;
    },
    // After first time render.
    mounted: function mounted() {
      if (this.SPECIAL_TAGS.indexOf(this.currentTag) != -1) {
        this.hasSpecialTag = true;
      }

      if (this.onManualControllerReady) {
        this.generateManualController();
      } else {
        this.createEditor();
      }
    },
    beforeDestroy: function beforeDestroy() {
      this.destroyEditor();
    },
    data: function data() {
      return {
        initEvents: [],
        // Tag on which the editor is initialized.
        currentTag: 'div',
        // Editor element.
        _editor: null,
        // Current config.
        currentConfig: null,
        // Editor options config
        defaultConfig: {
          immediateVueModelUpdate: false,
          vueIgnoreAttrs: null
        },
        editorInitialized: false,
        SPECIAL_TAGS: ['img', 'button', 'input', 'a'],
        INNER_HTML_ATTR: 'innerHTML',
        hasSpecialTag: false,
        model: null,
        oldModel: null
      };
    },
    methods: {
      updateValue: function updateValue() {
        if ((0, _stringify["default"])(this.oldModel) == (0, _stringify["default"])(this.model)) {
          return;
        }

        this.setContent();
      },
      createEditor: function createEditor() {
        if (this.editorInitialized) {
          return;
        }

        this.currentConfig = this.clone(this.config || this.defaultConfig);
        this.currentConfig = _objectSpread({}, this.currentConfig);
        this.setContent(true); // Bind editor events.

        this.registerEvents();
        this.initListeners();
        this._editor = new FroalaEditor(this.$el, this.currentConfig);
      },
      // Return clone object 
      clone: function clone(item) {
        var me = this;

        if (!item) {
          return item;
        } // null, undefined values check


        var types = [Number, String, Boolean],
            result; // normalizing primitives if someone did new String('aaa'), or new Number('444');

        types.forEach(function (type) {
          if (item instanceof type) {
            result = type(item);
          }
        });

        if (typeof result == "undefined") {
          if (Object.prototype.toString.call(item) === "[object Array]") {
            result = [];
            item.forEach(function (child, index, array) {
              result[index] = me.clone(child);
            });
          } else if ((0, _typeof2["default"])(item) == "object") {
            // testing that this is DOM
            if (item.nodeType && typeof item.cloneNode == "function") {
              result = item.cloneNode(true);
            } else if (!item.prototype) {
              // check that this is a literal
              if (item instanceof Date) {
                result = new Date(item);
              } else {
                // it is an object literal
                result = {};

                for (var i in item) {
                  result[i] = me.clone(item[i]);
                }
              }
            } else {
              if (false && item.constructor) {
                result = new item.constructor();
              } else {
                result = item;
              }
            }
          } else {
            result = item;
          }
        }

        return result;
      },
      setContent: function setContent(firstTime) {
        if (!this.editorInitialized && !firstTime) {
          return;
        }

        if (this.model || this.model == '') {
          this.oldModel = this.model;

          if (this.hasSpecialTag) {
            this.setSpecialTagContent();
          } else {
            this.setNormalTagContent(firstTime);
          }
        }
      },
      setNormalTagContent: function setNormalTagContent(firstTime) {
        var self = this;

        function htmlSet() {
          // Check if editor not null
          if (self._editor == null) return;
          if (self._editor.html != undefined) self._editor.html.set(self.model || ''); //This will reset the undo stack everytime the model changes externally. Can we fix this?

          if (self._editor.undo != undefined) {
            self._editor.undo.saveStep();

            self._editor.undo.reset();
          }
        }

        if (firstTime) {
          this.registerEvent('initialized', function () {
            htmlSet();
          });
        } else {
          htmlSet();
        }
      },
      setSpecialTagContent: function setSpecialTagContent() {
        var tags = this.model; // add tags on element

        if (tags) {
          for (var attr in tags) {
            if (tags.hasOwnProperty(attr) && attr != this.INNER_HTML_ATTR) {
              this.$el.setAttribute(attr, tags[attr]);
            }
          }

          if (tags.hasOwnProperty(this.INNER_HTML_ATTR)) {
            this.$el.innerHTML = tags[this.INNER_HTML_ATTR];
          }
        }
      },
      destroyEditor: function destroyEditor() {
        if (this._editor) {
          this.initEvents = [];

          this._editor.destroy();

          this.editorInitialized = false;
          this._editor = null;
        }
      },
      getEditor: function getEditor() {
        return this._editor;
      },
      generateManualController: function generateManualController() {
        var controls = {
          initialize: this.createEditor,
          destroy: this.destroyEditor,
          getEditor: this.getEditor
        };
        this.onManualControllerReady(controls);
      },
      updateModel: function updateModel() {
        var modelContent = '';

        if (this.hasSpecialTag) {
          var attributeNodes = this.$el[0].attributes;
          var attrs = {};

          for (var i = 0; i < attributeNodes.length; i++) {
            var attrName = attributeNodes[i].name;

            if (this.currentConfig.vueIgnoreAttrs && this.currentConfig.vueIgnoreAttrs.indexOf(attrName) != -1) {
              continue;
            }

            attrs[attrName] = attributeNodes[i].value;
          }

          if (this.$el[0].innerHTML) {
            attrs[this.INNER_HTML_ATTR] = this.$el[0].innerHTML;
          }

          modelContent = attrs;
        } else {
          var returnedHtml = this._editor.html.get();

          if (typeof returnedHtml === 'string') {
            modelContent = returnedHtml;
          }
        }

        this.oldModel = modelContent;
        this.$emit('input', modelContent);
      },
      initListeners: function initListeners() {
        var self = this;
        this.registerEvent('initialized', function () {
          // Editor initialized
          self.editorInitialized = true; // Check if editor not null and editor has events

          if (self._editor != null && self._editor.events) {
            // bind contentChange and keyup event to froalaModel
            self._editor.events.on('contentChanged', function () {
              self.updateModel();
            });

            if (self.currentConfig.immediateVueModelUpdate) {
              self._editor.events.on('keyup', function () {
                self.updateModel();
              });
            }
          }
        });
      },
      // register event on editor element
      registerEvent: function registerEvent(eventName, callback) {
        if (!eventName || !callback) {
          return;
        } // Initialized event.


        if (eventName == 'initialized') {
          this.initEvents.push(callback);
        } else {
          if (!this.currentConfig.events) {
            this.currentConfig.events = {};
          }

          this.currentConfig.events[eventName] = callback;
        }
      },
      registerEvents: function registerEvents() {
        // Handle initialized on its own.
        this.registerInitialized(); // Get current events.

        var events = this.currentConfig.events;

        if (!events) {
          return;
        }

        for (var event in events) {
          if (events.hasOwnProperty(event) && event != 'initialized') {
            this.registerEvent(event, events[event]);
          }
        }
      },
      registerInitialized: function registerInitialized() {
        var _this = this;

        // Bind initialized.
        if (!this.currentConfig.events) {
          this.currentConfig.events = {};
        } // Set original initialized event.


        if (this.currentConfig.events.initialized) {
          this.registerEvent('initialized', this.currentConfig.events.initialized);
        } // Bind initialized event.


        this.currentConfig.events.initialized = function () {
          for (var i = 0; i < _this.initEvents.length; i++) {
            _this.initEvents[i].call(_this._editor);
          }
        };
      }
    }
  };
  Vue.component('Froala', froalaEditorFunctionality);
  var froalaViewFunctionality = {
    props: ['tag', 'value'],
    watch: {
      value: function value(newValue) {
        this._element.innerHTML = newValue;
      }
    },
    created: function created() {
      this.currentTag = this.tag || this.currentTag;
    },
    render: function render(createElement) {
      return createElement(this.currentTag, {
        "class": 'fr-view'
      });
    },
    // After first time render.
    mounted: function mounted() {
      this._element = this.$el;

      if (this.value) {
        this._element.innerHTML = this.value;
      }
    },
    data: function data() {
      return {
        currentTag: 'div',
        _element: null
      };
    }
  };
  Vue.component('FroalaView', froalaViewFunctionality);
};

exports["default"] = _default;