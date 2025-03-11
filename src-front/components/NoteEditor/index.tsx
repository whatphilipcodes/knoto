import { type FC, useRef, useEffect, useMemo } from 'react';
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
import GracefulBlur from './plugins/GracefulBlur';
import theme from './theme';
import { useAtlasStore } from '../../store/atlasStore';

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

interface NoteEditorProps {
  filePath?: string;
  baseDir?: BaseDirectory;
}

const NoteEditor: FC<NoteEditorProps> = ({
  filePath = 'test.md',
  baseDir = BaseDirectory.Home,
}) => {
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

  const full_filePath = useMemo(() => {
    return (
      atlas.atlasRootDir + sep() + atlas.atlasSubdirNotes + sep() + filePath
    );
  }, [atlas.atlasRootDir]);

  useEffect(() => {
    if (!editor.current) return;
    async function loadContent() {
      const mdContent = await readTextFile(full_filePath, { baseDir });
      editor.current.update(() => {
        $convertFromMarkdownString(mdContent, TRANSFORMERS);
      });
    }
    loadContent();
  }, [full_filePath]);

  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  const onChange = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      editor.current.update(() => {
        const updatedMd = $convertToMarkdownString(TRANSFORMERS);
        writeTextFile(full_filePath, updatedMd, { baseDir });
      });
    }, 500);
  };

  useEffect(() => {
    const asyncSetup = async () => {
      const asyncCleanup: (() => void)[] = [];
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

  return (
    <div data-info='editor-wrapper' className='relative h-full w-full'>
      <LexicalComposer initialConfig={initialConfig}>
        <EditorRefPlugin editorRef={editor} />
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
