import { IProduct } from "../../types";
import type { IEvents } from "../base/Events";

export class Cart {
  private items: IProduct[] = [];
  private events: IEvents;

  constructor(events: IEvents) {
    this.events = events;
  }

  getItems(): IProduct[] {
    return this.items;
  }

  addItem(item: IProduct): void {
    if (!this.hasItem(item.id)) {
      this.items.push(item);
      this.events.emit("cart:changed", { items: this.items });
    }
  }

  removeItem(id: string): void {
    this.items = this.items.filter((item) => item.id !== id);
    this.events.emit("cart:changed", { items: this.items });
  }

  clear(): void {
    this.items = [];
    this.events.emit("cart:changed", { items: this.items });
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => {
      return item.price != null ? sum + item.price : sum;
    }, 0);
  }

  getCount(): number {
    return this.items.length;
  }

  hasItem(id: string): boolean {
    return this.items.some((item) => item.id === id);
  }
}
