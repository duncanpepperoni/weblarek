import type { IEvents } from "../base/Events";
import type { IBuyer } from "../../types";
import { Form, FormViewState } from "./Form";

interface ContactsViewData extends FormViewState {
  email?: string;
  phone?: string;
}

export class Contacts extends Form<ContactsViewData> {
  protected events: IEvents;

  protected emailInput: HTMLInputElement;
  protected phoneInput: HTMLInputElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;

    const emailInput = this.container.querySelector<HTMLInputElement>(
      'input[name="email"]'
    );
    const phoneInput = this.container.querySelector<HTMLInputElement>(
      'input[name="phone"]'
    );

    if (!emailInput || !phoneInput) {
      throw new Error("Contacts: не найдены элементы формы");
    }

    this.emailInput = emailInput;
    this.phoneInput = phoneInput;

    this.emailInput.addEventListener("input", () => {
      this.events.emit<Partial<IBuyer>>("contacts:change", {
        email: this.emailInput.value,
      });
    });

    this.phoneInput.addEventListener("input", () => {
      this.events.emit<Partial<IBuyer>>("contacts:change", {
        phone: this.phoneInput.value,
      });
    });

    this.container.addEventListener("submit", (event) => {
      event.preventDefault();
      this.events.emit("contacts:submit", {});
    });
  }

  set email(value: string | undefined) {
    this.emailInput.value = value ?? "";
  }

  set phone(value: string | undefined) {
    this.phoneInput.value = value ?? "";
  }
}
