import { type FC, useRef, useEffect, useMemo, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { CornerDownLeft } from 'lucide-react';
import {
  readTextFile,
  writeTextFile,
  BaseDirectory,
} from '@tauri-apps/plugin-fs';
import { sep } from '@tauri-apps/api/path';
import { listen } from '@tauri-apps/api/event';

import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { $getRoot, LexicalEditor, $createParagraphNode } from 'lexical';

// plugins
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';

// md support
import {
  TRANSFORMERS,
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from '@lexical/markdown';

// nodes
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';

// custom
import { useAtlasStore } from '../../store/atlasStore';
import { useRename } from '../../hooks/useRename';
import GracefulBlur from './plugins/GracefulBlur';
import FileNamePlugin from './plugins/FileName';
import { NodeData } from '../../utils/types';
import theme from './theme';

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
  const { renameFile } = useRename(baseDir);

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

  const basePath = useMemo(() => {
    return atlas.atlasRootDir + sep() + atlas.atlasSubdirNotes + sep();
  }, [atlas.atlasRootDir, atlas.atlasSubdirNotes]);

  const loadContent = useCallback(
    async (tauriEvent: any) => {
      const node: NodeData = tauriEvent.payload.node;
      const filePath = basePath + node.filepath;
      if (!editor.current || !filePath) return;
      try {
        const data = await readTextFile(filePath, { baseDir });
        editor.current.update(() => {
          $convertFromMarkdownString(data, TRANSFORMERS);
        });
      } catch (error) {
        console.log(error);
      }
    },
    [basePath],
  );

  const clearEditor = useCallback(() => {
    editor.current.update(() => {
      $getRoot().clear().append($createParagraphNode());
    });
  }, []);

  const newNote = useCallback(() => {
    atlas.setActiveNode(null);
    clearEditor();
    console.log('new note');
  }, []);

  useEffect(() => {
    const asyncSetup = async () => {
      const asyncCleanup: (() => void)[] = [];
      asyncCleanup.push(await listen('atlas:new', newNote));
      asyncCleanup.push(await listen('atlas:open', loadContent));
      asyncCleanup.push(await listen('fs:atlas-load', clearEditor));
      return asyncCleanup;
    };
    const asyncCleanup = asyncSetup();
    return () => {
      asyncCleanup.then((cfa) => cfa.forEach((f) => f()));
    };
  }, [loadContent, newNote]);

  const saveContent = useDebouncedCallback(async () => {
    if (!basePath || !atlas.activeNode) return;
    const filePath = basePath + atlas.activeNode.filepath;
    editor.current.update(() => {
      const data = $convertToMarkdownString(TRANSFORMERS);
      writeTextFile(filePath, data, { baseDir });
    });
  }, 500);

  return (
    <div data-info='editor-wrapper' className='relative h-full w-full'>
      <LexicalComposer initialConfig={initialConfig}>
        <EditorRefPlugin editorRef={editor} />
        <FileNamePlugin onFilenameChange={renameFile} />
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={<Placeholder />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <OnChangePlugin onChange={saveContent} />
        <AutoLinkPlugin matchers={MATCHERS} />
        <HistoryPlugin />
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
