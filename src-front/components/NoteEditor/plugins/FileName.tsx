import { useDebouncedCallback } from 'use-debounce';
import { type FC, useEffect, useState, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { useAtlasStore } from '../../../store/atlasStore';

interface FileNamePluginProps {
  onFilenameChange: (name: string) => void;
  filenameLengthLimit?: number;
}

const FileNamePlugin: FC<FileNamePluginProps> = ({
  onFilenameChange,
  filenameLengthLimit = 60,
}) => {
  const [editor] = useLexicalComposerContext();
  const [isFilenameTruncated, setIsFilenameTruncated] = useState(false);
  const [isFilenameInvalid, setIsFilenameInvalid] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const currentTitleTextRef = useRef<string>('');
  const currentFilenameRef = useRef<string>('');
  const atlas = useAtlasStore();

  const debouncedOnFilenameChange = useDebouncedCallback((filename: string) => {
    onFilenameChange(filename);
  }, 500);

  useEffect(() => {
    const removeUpdateListener = editor.registerUpdateListener(
      ({ editorState }) => {
        editorState.read(() => {
          const root = $getRoot();
          const firstChild = root.getFirstChild();
          const titleText = firstChild?.getTextContent();
          if (
            !firstChild ||
            !atlas.nodes ||
            titleText === currentTitleTextRef.current
          )
            return;

          currentTitleTextRef.current = titleText ?? '';
          const { filename, truncated, isValid } = processFilename(
            titleText ?? '',
          );

          const isValidFilename = isValid;
          setIsFilenameInvalid(!isValidFilename);

          const isDuplicateFilename =
            isValidFilename &&
            atlas.nodes.some((node) => node.filepath === `${filename}.md`);
          setIsDuplicate(isDuplicateFilename);

          setIsFilenameTruncated(truncated);

          if (
            filename !== currentFilenameRef.current &&
            isValidFilename &&
            !isDuplicateFilename
          ) {
            currentFilenameRef.current = filename;
            debouncedOnFilenameChange(filename);
          }
        });
      },
    );

    return removeUpdateListener;
  }, [editor, atlas.nodes, debouncedOnFilenameChange]);

  const processFilename = (text: string) => {
    const processedText = text
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^_a-zA-Z0-9-]/g, '')
      .replace(/-{2,}/g, '-')
      .toLowerCase();

    const isValid = processedText.length > 0 && !/^-+$/.test(processedText);
    const truncated = processedText.length > filenameLengthLimit;
    const filename = truncated
      ? processedText.slice(0, filenameLengthLimit)
      : processedText;

    return { filename, truncated, isValid };
  };

  const warningClasses =
    'twd flex items-center absolute bottom-4 left-4 h-10 rounded-md border border-rose-600 p-2 text-center text-rose-600';

  return (
    <>
      {isFilenameTruncated && (
        <div className={warningClasses}>
          filename exceeds max length of {filenameLengthLimit} and was truncated
        </div>
      )}
      {isFilenameInvalid && (
        <div className={warningClasses}>
          filename cannot be empty or contain only hyphens
        </div>
      )}
      {isDuplicate && (
        <div className={warningClasses}>filename already exists</div>
      )}
    </>
  );
};

export default FileNamePlugin;
