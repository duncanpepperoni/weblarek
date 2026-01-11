import type { IEvents } from "../base/Events";
import { Card, CardData } from "./Card";

export interface CardBasketData extends CardData {
  index: number;
}

type RemoveHandler = () => void;

export class CardBasket extends Card {
  protected indexElement: HTMLElement;
  protected onRemove: RemoveHandler;

  constructor(
    container: HTMLElement,
    events: IEvents,
    onRemove: RemoveHandler
  ) {
    // пробрасываем events в базовый Card
    super(container, events);

    this.onRemove = onRemove;

    const indexElement = this.container.querySelector<HTMLElement>(
      ".basket__item-index"
    );
    if (!indexElement) {
      throw new Error("CardBasket: не найден .basket__item-index");
    }
    this.indexElement = indexElement;

    if (!this.buttonElement) {
      throw new Error(
        "CardBasket: не найдена кнопка удаления .card__button в корзине"
      );
    }

    this.buttonElement.addEventListener("click", () => {
      this.onRemove();
    });
  }

  set index(value: number) {
    this.indexElement.textContent = String(value);
  }

  render(data: CardBasketData): HTMLElement {
    this.title = data.title;
    this.price = data.price;
    this.index = data.index;

    return this.container;
  }
}
