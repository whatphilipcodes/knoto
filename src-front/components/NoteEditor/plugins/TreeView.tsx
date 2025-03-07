import type { JSX } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { TreeView as TreeViewComponent } from '@lexical/react/LexicalTreeView';

const TreeView = (): JSX.Element => {
  const [editor] = useLexicalComposerContext();
  return (
    <TreeViewComponent
      viewClassName='tree-view-output'
      treeTypeButtonClassName='debug-treetype-button'
      timeTravelPanelClassName='debug-timetravel-panel'
      timeTravelButtonClassName='debug-timetravel-button'
      timeTravelPanelSliderClassName='debug-timetravel-panel-slider'
      timeTravelPanelButtonClassName='debug-timetravel-panel-button'
      editor={editor}
    />
  );
};

export default TreeView;
