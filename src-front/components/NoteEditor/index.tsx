import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

// plugins
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import GracefulBlur from './plugins/GracefulBlur';

// md support
// import {
//   TRANSFORMERS,
//   $convertFromMarkdownString,
//   $convertToMarkdownString,
// } from '@lexical/markdown';
// import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';

// nodes
import { HeadingNode } from '@lexical/rich-text';
// import { ListPlugin } from '@lexical/react/LexicalListPlugin';
// import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';

import theme from './theme';

const onError = (error: Error) => {
  console.error(error);
};

const Placeholder = () => {
  return (
    <div className='pointer-events-none absolute left-[1.125rem] top-[1.125rem] opacity-50'>
      Write something nice...
    </div>
  );
};

const NoteEditor = () => {
  const initialConfig = {
    namespace: 'text-editor',
    theme,
    onError,
    nodes: [HeadingNode],
  };

  return (
    <div data-info='editor-wrapper' className='relative h-full w-full'>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={<Placeholder />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        {/* <LinkPlugin /> */}
        {/* <ListPlugin /> */}
        {/* <MarkdownShortcutPlugin transformers={TRANSFORMERS} /> */}
        {/* <AutoFocusPlugin /> */}
        <HistoryPlugin />
        <GracefulBlur />
      </LexicalComposer>
    </div>
  );
};

export default NoteEditor;
