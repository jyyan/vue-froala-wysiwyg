"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = void 0;

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/json/stringify"));

var _froalaEditor = _interopRequireDefault(require("froala-editor"));

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

        this.currentConfig = this.config || this.defaultConfig;
        this.setContent(true); // Bind editor events.

        this.registerEvents();
        this.initListeners();
        this._editor = new _froalaEditor["default"](this.$el, this.currentConfig);
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