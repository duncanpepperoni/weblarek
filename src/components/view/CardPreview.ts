import type { IEvents } from "../base/Events";
import { Card, CardData } from "./Card";

export class CardPreview extends Card {
  protected textElement: HTMLElement;

  // флаги состояния для кнопки
  protected _inCart = false;
  protected _canPurchase = true;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);

    const textElement =
      this.container.querySelector<HTMLElement>(".card__text");
    if (!textElement) {
      throw new Error("CardPreview: не найден текстовый блок .card__text");
    }
    this.textElement = textElement;

    if (!this.buttonElement) {
      throw new Error("CardPreview: не найдена кнопка карточки");
    }

    this.buttonElement.addEventListener("click", () => {
      if (!this.id) {
        return;
      }
      this.events.emit("preview:button-click", { id: this.id });
    });
  }

  set text(value: string) {
    this.textElement.textContent = value;
  }

  // товар уже в корзине
  set inCart(value: boolean) {
    this._inCart = value;
    if (!this.buttonElement) return;

    if (!this._canPurchase) {
      // если товар недоступен, состояние корзины не имеет смысла
      return;
    }

    this.buttonElement.textContent = value ? "Удалить из корзины" : "В корзину";
  }

  // можно ли купить товар (price !== null)
  set canPurchase(value: boolean) {
    this._canPurchase = value;
    if (!this.buttonElement) return;

    if (!value) {
      this.buttonElement.disabled = true;
      this.buttonElement.textContent = "Недоступно";
    } else {
      this.buttonElement.disabled = false;
      // восстановим подпись в зависимости от того, в корзине ли товар
      this.buttonElement.textContent = this._inCart
        ? "Удалить из корзины"
        : "В корзину";
    }
  }

  render(data: CardData): HTMLElement {
    this.id = data.id; // сохраняем id в базовый Card

    this.title = data.title;
    this.price = data.price;
    this.category = data.category;
    this.image = data.image;
    if (data.description) {
      this.text = data.description;
    }

    // базовое состояние кнопки при открытии превью
    this._inCart = false;
    this._canPurchase = true;
    if (this.buttonElement) {
      this.buttonElement.disabled = false;
      this.buttonElement.textContent = "В корзину";
    }

    return this.container;
  }
}
