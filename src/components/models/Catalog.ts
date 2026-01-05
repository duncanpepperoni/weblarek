import { IProduct } from "../../types";

export class Catalog {
  private items: IProduct[] = [];
  private selectedItem: IProduct | null = null;

  constructor() {}

  setItems(items: IProduct[]): void {
    this.items = items;
  }

  getItems(): IProduct[] {
    return this.items;
  }

  getItem(id: string): IProduct | undefined {
    return this.items.find((item) => item.id === id);
  }

  setSelectedItem(item: IProduct | null): void {
    this.selectedItem = item;
  }

  getSelectedItem(): IProduct | null {
    return this.selectedItem;
  }
}
