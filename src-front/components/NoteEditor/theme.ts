import type { EditorThemeClasses } from 'lexical';

const theme: EditorThemeClasses = {
  root: 'twd h-full w-full p-4 rounded-md border border-neutral-700 focus:border-teal-500 focus:outline-none',
  link: 'twd cursor-pointer',
  text: {
    bold: 'twd font-semibold',
    underline: 'twd underline',
    italic: 'twd italic',
    strikethrough: 'twd line-through',
    underlineStrikethrough: 'twd underline-line-through',
  },
};
export default theme;
