import {EditorState, EditorView, basicSetup} from "@codemirror/basic-setup"
import {javascript} from "@codemirror/lang-javascript"
import {python} from "@codemirror/lang-python"

let editor = new EditorView({
  state: EditorState.create({
    extensions: [basicSetup, python()]
  }),
  parent: document.body
})

window.CM = {}
window.CM["@codemirror/basic-setup"] = {EditorState, EditorView, basicSetup}
window.CM["@codemirror/lang-python"] = {python}


// const { EditorState,/* EditorView,*/ basicSetup } = CM["@codemirror/basic-setup"];
// const { EditorView, keymap } = CM["@codemirror/view"];
// const { python, pythonLanguage } = CM["@codemirror/lang-python"];
// const { defaultTabBinding } = CM["@codemirror/commands"];