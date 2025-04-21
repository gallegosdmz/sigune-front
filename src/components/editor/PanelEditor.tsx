import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LexicalEditor } from "lexical";

const editorConfig = {
    namespace: 'MyEditor',
    theme: {
        paragraph: 'editor-paragraph',
    },
    onError( error: Error ) {
        console.log('Lexical Error: ', error );
    },
    nodes: [],
};

type Props = {
    onChange?: ( editorState: string ) => void;
}

const PanelEditor: React.FC<Props> = ({ onChange }) => {
    return (
      <LexicalComposer initialConfig={editorConfig}>
        <div className="editor-container">
          <RichTextPlugin
            contentEditable={<ContentEditable className="editor-input" />}
            placeholder={<div className="editor-placeholder">Escribe aquí...</div>}
            ErrorBoundary={({ children }) => <>{children}</>}
          />
          <HistoryPlugin />
          <OnChangePlugin
            onChange={(editorState: any, editor: LexicalEditor) => {
              editor.update(() => {
                const json = editorState.toJSON();
                onChange?.(JSON.stringify(json));
              });
            }}
          />
        </div>
      </LexicalComposer>
    );
  };
  
  export default PanelEditor;

