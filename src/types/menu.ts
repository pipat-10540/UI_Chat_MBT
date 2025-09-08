export type Menu = {
  id: number;
  title: string;
  path?: string;
  newTab: boolean;
  submenu?: Menu[];
  groupedSubmenu?: GroupedSubmenu[];
};
export interface GroupedSubmenu {
  groupTitle: string;
  items: Menu[];
}
