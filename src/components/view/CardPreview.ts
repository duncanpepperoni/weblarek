import type { IEvents } from "../base/Events";
import { Card, CardData } from "./Card";

export class CardPreview extends Card {
  protected product: CardData | null = null;
  protected textElement: HTMLElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    const textElement =
      this.container.querySelector<HTMLElement>(".card__text");
    if (!textElement) {
      throw new Error("CardPreview: не найден текстовый блок .card__text");
    }
    this.textElement = textElement;

    // Для превью обязательно есть кнопка
    if (!this.buttonElement) {
      throw new Error("CardPreview: не найдена кнопка карточки");
    }

    this.buttonElement.addEventListener("click", () => {
      if (this.product) {
        this.events.emit("preview:add-to-cart", this.product);
      }
    });
  }

  set text(value: string) {
    this.textElement.textContent = value;
  }

  render(data: CardData): HTMLElement {
    this.product = data;

    this.title = data.title;
    this.price = data.price;
    this.category = data.category;
    this.image = data.image;
    if (data.description) {
      this.text = data.description;
    }

    // подпись на кнопке — по умолчанию «В корзину»
    this.buttonLabel = "В корзину";

    return this.container;
  }
}
