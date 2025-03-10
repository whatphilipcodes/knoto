import {
  Menu,
  Submenu,
  PredefinedMenuItem,
  MenuItem,
} from '@tauri-apps/api/menu';
import { emit } from '@tauri-apps/api/event';

export const createMacMenu = async () => {
  // predefined
  const separator = await PredefinedMenuItem.new({
    item: 'Separator',
  });

  // menu edits
  const menu = await Menu.default();
  const fileMenu = (await menu.removeAt(1)) as Submenu;
  await fileMenu.prepend(separator);
  const openAtlas = await MenuItem.new({
    id: 'openAtlas',
    text: 'Open Atlas...',
    accelerator: 'CmdOrCtrl+Alt+O',
    action: async () => await emit('menu:open-atlas'),
  });
  await fileMenu.prepend(openAtlas);
  await menu.insert(fileMenu, 1);

  const help = await menu.removeAt(5); // no help menu until implemented
  await help?.close();

  await menu.setAsAppMenu();

  const clear = async () => {
    await separator.close();
    await openAtlas.close();
    await fileMenu.close();
    await menu.close();
  };

  return clear;
};
