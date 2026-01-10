import { Component } from "../base/Component";
import type { IEvents } from "../base/Events";

interface ModalData {}

export class Modal extends Component<ModalData> {
  protected events: IEvents;
  protected modal: HTMLElement;
  protected content: HTMLElement;
  protected closeButton: HTMLElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;

    this.modal = this.container;

    const content = this.modal.querySelector<HTMLElement>(".modal__content");
    const closeButton = this.modal.querySelector<HTMLElement>(".modal__close");

    if (!content || !closeButton) {
      throw new Error("Modal: не найдены .modal__content или .modal__close");
    }

    this.content = content;
    this.closeButton = closeButton;

    this.handleClose = this.handleClose.bind(this);

    this.modal.addEventListener("click", (event) => {
      if (event.target === this.modal) {
        this.handleClose();
      }
    });

    this.closeButton.addEventListener("click", this.handleClose);
  }

  protected handleClose() {
    this.events.emit("modal:close");
  }

  open(content: HTMLElement): void {
    this.content.replaceChildren(content);
    this.modal.classList.add("modal_active");
  }

  close(): void {
    this.modal.classList.remove("modal_active");
    this.content.replaceChildren();
  }
}
