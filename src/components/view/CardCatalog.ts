import type { IEvents } from "../base/Events";
import { Card, CardData } from "./Card";

export class CardCatalog extends Card {
  protected product: CardData | null = null;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    this.container.addEventListener("click", () => {
      if (this.product) {
        this.events.emit("card:select", this.product);
      }
    });
  }

  render(data?: Partial<CardData>): HTMLElement {
    if (data) {
      this.product = {
        id: data.id ?? "",
        title: data.title ?? "",
        price: data.price ?? null,
        category: data.category ?? "",
        image: data.image ?? "",
      };

      if (data.title !== undefined) this.title = data.title;
      if (data.price !== undefined) this.price = data.price;
      if (data.category !== undefined) this.category = data.category;
      if (data.image !== undefined) this.image = data.image;
    }

    return this.container;
  }
}
