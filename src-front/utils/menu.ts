import {
  Menu,
  Submenu,
  PredefinedMenuItem,
  MenuItem,
} from '@tauri-apps/api/menu';

export const createMenu = async () => {
  // predefined
  const seperator = await PredefinedMenuItem.new({
    item: 'Separator',
  });

  // menu edits
  const menu = await Menu.default();
  const filemenu = (await menu.removeAt(1)) as Submenu;
  await filemenu.prepend(seperator);
  const openCollection = await MenuItem.new({
    id: 'openCollection',
    text: 'Open Collection...',
    accelerator: 'CmdOrCtrl+Alt+O',
    action: () => console.log('open collection'),
  });
  await filemenu.prepend(openCollection);
  await menu.insert(filemenu, 1);

  const help = await menu.removeAt(5); // no help menu until implemented
  help?.close();

  await menu.setAsAppMenu();
};
