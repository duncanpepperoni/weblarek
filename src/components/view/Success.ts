import { Component } from "../base/Component";
import type { IEvents } from "../base/Events";

interface SuccessViewData {
  total: number;
}

export class Success extends Component<SuccessViewData> {
  protected events: IEvents;
  protected descriptionElement: HTMLElement;
  protected closeButton: HTMLButtonElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;

    const descriptionElement = this.container.querySelector<HTMLElement>(
      ".order-success__description"
    );
    const closeButton = this.container.querySelector<HTMLButtonElement>(
      ".order-success__close"
    );

    if (!descriptionElement || !closeButton) {
      throw new Error("Success: не найдены элементы окна успешного заказа");
    }

    this.descriptionElement = descriptionElement;
    this.closeButton = closeButton;

    this.closeButton.addEventListener("click", () => {
      this.events.emit("success:close", {});
    });
  }

  render(data: SuccessViewData): HTMLElement {
    this.descriptionElement.textContent = `Списано ${data.total} синапсов`;
    return this.container;
  }
}
