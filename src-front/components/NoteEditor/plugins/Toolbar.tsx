import { FC } from 'react';
import Button from '../../Primitives/Button';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import {
  Undo,
  Redo,
  Bold,
  Italic,
  // Underline,
  Strikethrough,
  Trash2,
} from 'lucide-react';

import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import { useCallback, useEffect, useRef, useState } from 'react';

const LowPriority = 1;

type ToolbarProps = {
  onDelete: () => void;
};

const Toolbar: FC<ToolbarProps> = ({ onDelete }) => {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null!);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  // const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      // setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority,
      ),
    );
  }, [editor, $updateToolbar]);

  const baseClasses = 'twd h-8 w-8 px-0';

  return (
    <>
      <div
        className='toolbar flex flex-row content-between border-b border-neutral-700 p-2'
        ref={toolbarRef}
      >
        <div className='flex w-full flex-row gap-2'>
          <Button
            disabled={!canUndo}
            onClick={() => {
              editor.dispatchCommand(UNDO_COMMAND, undefined);
            }}
            variant='secondary'
            className={baseClasses}
            aria-label='Undo'
          >
            <Undo size={16} />
          </Button>
          <Button
            disabled={!canRedo}
            onClick={() => {
              editor.dispatchCommand(REDO_COMMAND, undefined);
            }}
            variant='secondary'
            className={baseClasses}
            aria-label='Redo'
          >
            <Redo size={16} />
          </Button>
          <Button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
            }}
            variant='secondary'
            className={baseClasses + (isBold ? ' dark:bg-neutral-700' : '')}
            aria-label='Format Bold'
          >
            <Bold size={16} />
          </Button>
          <Button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
            }}
            variant='secondary'
            className={baseClasses + (isItalic ? ' dark:bg-neutral-700' : '')}
            aria-label='Format Italics'
          >
            <Italic size={16} />
          </Button>
          {/* underline is not supported by default markdown */}
          {/* <Button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
            }}
            variant='secondary'
            className={
              baseClasses + (isUnderline ? ' dark:bg-neutral-700' : '')
            }
            aria-label='Format Underline'
          >
            <Underline size={16} />
          </Button> */}
          <Button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
            }}
            variant='secondary'
            className={
              baseClasses + (isStrikethrough ? ' dark:bg-neutral-700' : '')
            }
            aria-label='Format Strikethrough'
          >
            <Strikethrough size={16} />
          </Button>
        </div>
        <div>
          <Button
            onClick={() => {
              document.dispatchEvent(new CustomEvent('atlas:blur-editor'));
              setIsDeleteModalOpen(true);
            }}
            className={
              baseClasses +
              ' dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-700/20 dark:active:bg-neutral-700/40'
            }
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className='absolute inset-0 z-50 flex items-center justify-center rounded-md bg-neutral-950/60'>
          <div className='rounded-md bg-neutral-900 p-6'>
            <h3 className='mb-4 text-lg font-medium'>Delete Node</h3>
            <p className='mb-4'>
              Are you sure you want to purge this? The action cannot be undone.
            </p>
            <div className='flex justify-end gap-2'>
              <Button
                onClick={() => setIsDeleteModalOpen(false)}
                variant='secondary'
                className='h-10'
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  onDelete();
                }}
                variant='primary'
                className='h-10 dark:border-rose-600 dark:text-rose-600 dark:hover:bg-rose-600/20'
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Toolbar;
