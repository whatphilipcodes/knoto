import { type FC, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

interface GracefulBlurProps {
  events?: string[];
}

const GracefulBlur: FC<GracefulBlurProps> = ({
  events = ['atlas:blur-editor'],
}) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handleBlurEvent = () => {
      editor.update(() => {
        editor.blur();
      });
    };

    events.forEach((eventName) => {
      document.addEventListener(eventName, handleBlurEvent);
    });

    return () => {
      events.forEach((eventName) => {
        document.removeEventListener(eventName, handleBlurEvent);
      });
    };
  }, [editor, events]);

  return null;
};
export default GracefulBlur;
