import { Component } from "../base/Component";
import type { IEvents } from "../base/Events";

interface PageData {
  counter: number;
}

export class Page extends Component<PageData> {
  protected events: IEvents;
  protected basketButton: HTMLElement;
  protected basketCounter: HTMLElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;

    const basketButton =
      this.container.querySelector<HTMLElement>(".header__basket");
    const basketCounter = this.container.querySelector<HTMLElement>(
      ".header__basket-counter"
    );

    if (!basketButton || !basketCounter) {
      throw new Error("Page: не найдены элементы корзины в шапке");
    }

    this.basketButton = basketButton;
    this.basketCounter = basketCounter;

    this.basketButton.addEventListener("click", () => {
      this.events.emit("basket:open");
    });
  }

  set counter(value: number) {
    this.basketCounter.textContent = String(value);
  }
}
