// import { $getRoot, $getSelection } from 'lexical';
// import { useEffect } from 'react';

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

import theme from './theme';

const onError = (error: Error) => {
  console.error(error);
};

const Placeholder = () => {
  return (
    <div className='pointer-events-none absolute left-[1.125rem] top-[1.125rem] opacity-50'>
      Start writing...
    </div>
  );
};

const TextEditor = () => {
  const initialConfig = {
    namespace: 'text-editor',
    theme,
    onError,
  };

  return (
    <div data-info='editor-wrapper' className='relative h-full w-full'>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={<Placeholder />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
      </LexicalComposer>
    </div>
  );
};

export default TextEditor;
