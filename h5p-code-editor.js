/**
 * Code editor widget module
 *
 * @param {jQuery} $
 */

H5PEditor.widgets.codeEditor = H5PEditor.codeEditor = (function ($) {

  /**
   * Creates an input to write code with highlight.
   *
   * @param {mixed} parent
   * @param {object} field
   * @param {mixed} params
   * @param {function} setValue
   * @returns {C}
   */
  function C(parent, field, params, setValue) {
    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;
  }

  /**
   * Append the field to the wrapper.
   *
   * @param {jQuery} $wrapper
   * @returns {undefined}
   */
  C.prototype.appendTo = function ($wrapper) {
    const that = this;

    this.$item = $(this.createHtml()).appendTo($wrapper);
    this.$item.addClass('h5p-code-editor');
    this.$inputs = this.$item.find('input');
    this.editor = CodeMirror(this.$item.find('.h5p-code-editor-editor')[0], {
      value: CodeMirror.H5P.decode(this.params || ''),
      keyMap: 'sublime',
      tabSize: 2,
      indentWithTabs: true,
      lineNumbers: true,
      lineWrapping: true,
      matchBrackets: true,
      matchTags: {
        bothTags: true
      },
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      styleActiveLine: {
        nonEmpty: true
      },
      showHint: true,
      extraKeys: {
        'F11': function (cm) {
          cm.setOption('fullScreen', !cm.getOption('fullScreen'));
        },
        'Esc': function (cm) {
          if (cm.getOption('fullScreen')) {
            cm.setOption('fullScreen', false);
          }
          else {
            // The user pressed the escape key, tab will now tab to the next element
            // instead of adding a tab in the code. This is important for accessibility
            // The tab behaviour will revert to default the next time the editor is focused.
            if (!cm.state.keyMaps.some(x => x.name === 'tabAccessibility')) {
              cm.addKeyMap({
                'name': 'tabAccessibility',
                'Tab': false,
                'Shift-Tab': false
              });
            }
          }
        },
        'Ctrl-Space': 'autocomplete'
      }
    });

    this.editor.refresh(); // required to avoid bug where line number overlap code that might happen in some condition

    this.editor.on('focus', function (cm) { // On focus, make tab add tab in editor
      cm.removeKeyMap('tabAccessibility');
    });

    this.editor.on('change', function () {
      C.saveChange(that);
    });

    // Check if the language attribute is set and is a path.
    // If this is the case, set the field in a variable and
    // add a watcher to call the applyLanguage function each
    // time the field value is modified.
    if (this.field.language && this.field.language[0] === '.') {
      let fieldPath = this.field.language;
      // language is a path, it should start with ./ or ../
      // if it start with ./ we remove this part because findField doesn't handle it
      if (fieldPath[1] === '/') {
        fieldPath = fieldPath.substring(2);
      }
      this.languageField = H5PEditor.findField(fieldPath, this.parent);
      if (this.languageField === false) {
        this.field.language = 'null';
      }
      else {
        if (this.languageField.field.type === 'text' && this.languageField.changeCallbacks) {
          this.languageField.changeCallbacks.push(function () {
            that.applyLanguage();
          });
        }
        else {
          H5PEditor.followField(this.parent, fieldPath, function () {
            that.applyLanguage();
          });
        }
      }
    }

    this.applyLanguage();

    this.$errors = this.$item.children('.h5p-errors');

  };

  /**
   * Apply the language to the code editor.
   * By default, the code editor language will be set to 'HTML'
   * You can choose to set an other language by setting the language attribute
   * You can for example set language to "Python".
   * You can also set the language attribute to a path to an other field
   * like a text or select field. The language will be set to the value of this field
   * In order to do that, your path need to start with a dot. If you other field
   * is at the same depth-level, use the ./ notation. For exemple ""./language"
   * Be warned that the other field need to be before the code editor field.
   */
  C.prototype.applyLanguage = function () {
    if (this.field.language) {
      if (this.languageField) {
        this.setLanguage(this.languageField.value);
      }
      else {
        this.setLanguage(this.field.language);
      }
    }
    else {
      this.setLanguage('HTML');
    }
  };

  /**
   * Set the editor language to mode.
   * The mode argument can either be a language name like "Python"
   * or a mime type like "text/javascript". It will check if the
   * language is supported by codemirror, and load the required
   * javascript files if they aren't already loaded.
   * @param {string} mode 
   */
  C.prototype.setLanguage = function (mode) {
    if (mode === 'null') {
      this.editor.setOption('mode', null);
      return;
    }
    let modeInfo = CodeMirror.findModeByName(mode) || CodeMirror.findModeByMIME(mode);
    if (modeInfo) {
      this.editor.setOption('mode', modeInfo.mime); // set the mode by using mime because it allow variation (like typescript which is a variation of javascript)
      CodeMirror.autoLoadMode(this.editor, modeInfo.mode, {
        // The CodeMirror.autoLoad function is a little tricky.
        // It has to be called after the mode have been set.
        // It will load the required javascript files if they
        // aren't already loaded and then will then re-set the mode
        // to it's current value to trigger a refresh. It does not
        // set the mode to the value passed in argument, this has
        // to be done before.
        path: function (mode) { // path is safe because mode is from modeInfo.mime
          return H5P.getLibraryPath('CodeMirror-1.0') + '/mode/' + mode + '/' + mode + '.js';
        }
      });
    }
    else {
      this.editor.setOption('mode', null); // Set the language to null which will not apply any syntax highlighting.
    }
  };

  /**
   * Creates HTML for the widget.
   */
  C.prototype.createHtml = function () {
    const id = H5PEditor.getNextFieldId(this.field);
    return H5PEditor.createFieldMarkup(this.field, '<div class="h5p-code-editor-editor"></div>', id);
  };

  /**
   * Save changes
   */
  C.saveChange = function (that) {
    that.params = CodeMirror.H5P.encode(that.editor.getValue());
    that.setValue(that.field, that.params);
  };

  /**
   * Validate the current values.
   */
  C.prototype.validate = function () {
    return true;
  };

  /**
   * Remove this item.
   */
  C.prototype.remove = function () {
    this.$item.remove();
  };

  /**
   * Local translate function.
   *
   * @param {Atring} key
   * @param {Object} params
   * @returns {@exp;H5PEditor@call;t}
   */
  C.t = function (key, params) {
    return H5PEditor.t('H5PEditor.CodeEditor', key, params);
  };

  return C;
})(H5P.jQuery);