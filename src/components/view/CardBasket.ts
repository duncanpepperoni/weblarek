import type { IEvents } from "../base/Events";
import { Card, CardData } from "./Card";

export interface CardBasketData extends CardData {
  index: number;
}

export class CardBasket extends Card {
  protected events: IEvents;
  protected indexElement: HTMLElement;
  protected product: CardBasketData | null = null;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);
    this.events = events;

    const indexElement = this.container.querySelector<HTMLElement>(
      ".basket__item-index"
    );
    if (!indexElement) {
      throw new Error("CardBasket: не найден .basket__item-index");
    }
    this.indexElement = indexElement;

    if (!this.buttonElement) {
      throw new Error("CardBasket: не найдена кнопка удаления .card__button");
    }

    this.buttonElement.addEventListener("click", () => {
      if (this.product) {
        this.events.emit("basket:item-remove", { id: this.product.id });
      }
    });
  }

  set index(value: number) {
    this.indexElement.textContent = String(value);
  }

  render(data: CardBasketData): HTMLElement {
    this.product = data;

    this.title = data.title;
    this.price = data.price;
    this.index = data.index;

    return this.container;
  }
}
