import { IProduct } from "../../types";
import type { IEvents } from "../base/Events";

export class Catalog {
  private items: IProduct[] = [];
  private selectedItem: IProduct | null = null;
  private events: IEvents;

  constructor(events: IEvents) {
    this.events = events;
  }

  setItems(items: IProduct[]): void {
    this.items = items;
    this.events.emit("catalog:changed", { items: this.items });
  }

  getItems(): IProduct[] {
    return this.items;
  }

  getItem(id: string): IProduct | undefined {
    return this.items.find((item) => item.id === id);
  }

  setSelectedItem(item: IProduct | null): void {
    this.selectedItem = item;
    this.events.emit("catalog:select", { selected: this.selectedItem });
  }

  getSelectedItem(): IProduct | null {
    return this.selectedItem;
  }
}
