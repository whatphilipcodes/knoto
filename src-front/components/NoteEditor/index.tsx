import { type FC, useRef, useEffect, useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { CornerDownLeft } from 'lucide-react';
import {
  readTextFile,
  writeTextFile,
  BaseDirectory,
} from '@tauri-apps/plugin-fs';
import { sep } from '@tauri-apps/api/path';
import { listen } from '@tauri-apps/api/event';

import { $getRoot, LexicalEditor } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

// plugins
// import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';

// md support
import {
  TRANSFORMERS,
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from '@lexical/markdown';

// nodes
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';

// custom
import FileNamePlugin from './plugins/FileName';
import GracefulBlur from './plugins/GracefulBlur';
import theme from './theme';
import { useAtlasStore } from '../../store/atlasStore';

const onError = (error: Error) => {
  console.error(error);
};

const Placeholder = () => {
  return (
    <div className='pointer-events-none absolute left-4 top-6 flex flex-row items-center gap-4 opacity-50'>
      <div>filename</div>
      <div>+</div>
      <div className='flex h-4 items-center rounded-sm border p-2'>
        <CornerDownLeft size={12} />
      </div>
    </div>
  );
};

interface NoteEditorProps {
  baseDir?: BaseDirectory;
}

const NoteEditor: FC<NoteEditorProps> = ({ baseDir = BaseDirectory.Home }) => {
  const atlas = useAtlasStore();
  const editor = useRef<LexicalEditor>(null!);
  const initialConfig = {
    namespace: 'text-editor',
    theme,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListItemNode,
      ListNode,
      LinkNode,
      AutoLinkNode,
      CodeNode,
      CodeHighlightNode,
    ],
    onError,
  };

  const filePath = useMemo(() => {
    if (!atlas.activeNode) return null;
    return (
      atlas.atlasRootDir +
      sep() +
      atlas.atlasSubdirNotes +
      sep() +
      atlas.activeNode.filepath
    );
  }, [atlas.activeNode]);

  useEffect(() => {
    if (!editor.current || !filePath) return;
    const loadContent = async () => {
      try {
        const data = await readTextFile(filePath, { baseDir });
        editor.current.update(() => {
          $convertFromMarkdownString(data, TRANSFORMERS);
        });
      } catch (error) {
        console.log(error);
      }
    };
    loadContent();
  }, [filePath]);

  const saveContent = useDebouncedCallback(async () => {
    if (!filePath) return;

    editor.current.update(() => {
      const data = $convertToMarkdownString(TRANSFORMERS);
      writeTextFile(filePath, data, { baseDir });
    });
  }, 500);

  const onChange = () => {
    saveContent();
  };

  useEffect(() => {
    const asyncSetup = async () => {
      const asyncCleanup: (() => void)[] = [];
      asyncCleanup.push(await listen('atlas:new', newNote));
      asyncCleanup.push(await listen('fs:atlas-load', clearEditor));
      return asyncCleanup;
    };
    const asyncCleanup = asyncSetup();
    return () => {
      asyncCleanup.then((cfa) => cfa.forEach((f) => f()));
    };
  }, []);

  const clearEditor = () => {
    editor.current.update(() => {
      $getRoot().clear();
    });
  };

  const newNote = () => {
    console.log('new note');
  };

  return (
    <div data-info='editor-wrapper' className='relative h-full w-full'>
      <LexicalComposer initialConfig={initialConfig}>
        <EditorRefPlugin editorRef={editor} />
        <FileNamePlugin
          onFilenameChange={(name) => {
            console.log('filename: ', name);
          }}
        />
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={<Placeholder />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <OnChangePlugin onChange={onChange} />
        <HistoryPlugin />
        <AutoLinkPlugin matchers={MATCHERS} />
        <GracefulBlur />
      </LexicalComposer>
    </div>
  );
};

export default NoteEditor;

const URL_MATCHER =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const MATCHERS = [
  (text: string) => {
    const match = URL_MATCHER.exec(text);
    if (match === null) {
      return null;
    }
    const fullMatch = match[0];
    return {
      index: match.index,
      length: fullMatch.length,
      text: fullMatch,
      url: fullMatch.startsWith('http') ? fullMatch : `https://${fullMatch}`,
      // attributes: { rel: 'noreferrer', target: '_blank' }, // Optional link attributes
    };
  },
];
