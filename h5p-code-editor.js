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

    let editor = CodeMirror(this.$item.find('.h5p-code-editor-editor')[0], {
      value: "test=5",
      mode: "python",
      lineNumbers: true,
      lineWrapping: true,
      matchBrackets: true,
      foldGutter: true,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      styleActiveLine: {
        nonEmpty: true
      },
      showHint: true,
      extraKeys: {
        "F11": function (cm) {
          cm.setOption("fullScreen", !cm.getOption("fullScreen"));
        },
        "Esc": function (cm) {
          if (cm.getOption("fullScreen")) {
            cm.setOption("fullScreen", false);
          } else { // the user pressed the escape key, now tab will tab to the next element for accessibility
            if (!cm.state.keyMaps.some(x => x.name == 'tabAccessibility')) {
              cm.addKeyMap({
                'name': 'tabAccessibility',
                'Tab': false,
                'Shift-Tab': false
              });
            }
          }
        },
        "Ctrl-Space": "autocomplete"
      }
    });

    editor.on('focus', function (cm) { // On focus, make tab add tabb in editor
      cm.removeKeyMap('tabAccessibility');
    });

    window.toto = editor;

    //H5P.getLibraryPath(this.parent.currentLibrary);

    //H5PEditor.libraryCache[this.parent.currentLibrary].javascript.filter;


    CodeMirror.autoLoadMode(editor, "python", {
      path: function (mode) {
        if (!/^[a-z0-9.-]+$/i.test(mode)) mode = 'htmlmixed'; // security
        return H5P.getLibraryPath('H5PEditor.CodeEditor-1.0') + '/lib/codemirror/mode/' + mode + '/' + mode + '.js';
      }
    });

    // alert(editor.state.doc.toString())

    /* todo : say that echap then tab */

    this.$inputs.eq(0).keydown(function (e) {

      C.saveChange(that);

    });

    this.$errors = this.$item.children('.h5p-errors');

  };

  /**
   * Creates HTML for the widget.
   */
  C.prototype.createHtml = function () {
    const id = H5PEditor.getNextFieldId(this.field);
    const descriptionId = (this.field.description !== undefined ? H5PEditor.getDescriptionId(id) : undefined);
    const codeInput = H5PEditor.createText(this.params !== undefined ? this.params.keys : undefined, undefined, C.t('shortcut'), id, descriptionId);
    return H5PEditor.createFieldMarkup(this.field, /* codeInput */'<div class="h5p-code-editor-editor"></div>', id);

  };

  /**
   * Save changes
   */
  C.saveChange = function (that) {
    that.params = that.$inputs.eq(0).val();
    that.setValue(that.field, that.params);
  };

  /**
   * Validate the current values.
   */
  C.prototype.validate = function () {
    // Check if all fields have been filled
    if (this.params === undefined) {
      this.$errors.append(H5PEditor.createError(C.t('error:mustBeFilled')));
    }

    return H5PEditor.checkErrors(this.$errors, this.$inputs, true);
  };

  /**
   * Remove this item.
   */
  C.prototype.remove = function () {
    this.$item.remove();
  };

  /**
   * Automatically translate some of the key code to a more readable content
   * For example
   *   Control key will be shown as Ctrl
   *   Letter key will be shown as uppercase (i.e. "a" will be shown as "A")
   */
  C.getKeyText = function (key) {
    const keyTranslation = {
      'Control': C.t('keys:Control')
    };

    if (keyTranslation.hasOwnProperty(key)) {
      return keyTranslation[key];
    }

    if ((/^[a-z]$/).test(key)) {
      return key.toUpperCase();
    }

    return key;

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