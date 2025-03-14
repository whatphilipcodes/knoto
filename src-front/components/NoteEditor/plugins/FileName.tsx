import { useDebouncedCallback } from 'use-debounce';
import { type FC, useEffect, useState, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';
import { useAtlasStore } from '../../../store/atlasStore';

interface FileNamePluginProps {
  onChangeImmediate: (name: string) => void;
  onValidFilenameChange: (name: string) => void;
  filenameLengthLimit?: number;
  debounceTime?: number;
}
const FileNamePlugin: FC<FileNamePluginProps> = ({
  onChangeImmediate,
  onValidFilenameChange,
  filenameLengthLimit = 60,
  debounceTime = 500,
}) => {
  const [editor] = useLexicalComposerContext();
  const [isFilenameTruncated, setIsFilenameTruncated] = useState(false);
  const [isFilenameInvalid, setIsFilenameInvalid] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const currentTitleTextRef = useRef<string>('');
  const atlas = useAtlasStore();

  const debouncedOnValidFilenameChange = useDebouncedCallback(
    (filename: string) => {
      onValidFilenameChange(filename);
    },
    debounceTime,
  );

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
            // !atlas.activeNode ||
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
            filename !== atlas.activeNode?.filepath &&
            atlas.nodes.some((node) => node.filepath === filename);
          setIsDuplicate(isDuplicateFilename);
          setIsFilenameTruncated(truncated);
          onChangeImmediate(filename);

          if (
            atlas.activeNode &&
            filename !== atlas.activeNode?.filepath &&
            isValidFilename &&
            !isDuplicateFilename
          ) {
            debouncedOnValidFilenameChange(filename);
          }
        });
      },
    );

    return removeUpdateListener;
  }, [editor, debouncedOnValidFilenameChange, atlas]);

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
      ? `${processedText.slice(0, filenameLengthLimit)}.md`
      : `${processedText}.md`;

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
