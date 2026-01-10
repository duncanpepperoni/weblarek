import { Component } from "../base/Component";
import type { IEvents } from "../base/Events";
import type { IBuyer } from "../../types";

interface ContactsViewData {
  email?: string;
  phone?: string;
  errors?: string;
  valid?: boolean;
}

export class Contacts extends Component<ContactsViewData> {
  protected events: IEvents;

  protected emailInput: HTMLInputElement;
  protected phoneInput: HTMLInputElement;
  protected submitButton: HTMLButtonElement;
  protected errorsElement: HTMLElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;

    const emailInput = this.container.querySelector<HTMLInputElement>(
      'input[name="email"]'
    );
    const phoneInput = this.container.querySelector<HTMLInputElement>(
      'input[name="phone"]'
    );
    const submitButton = this.container.querySelector<HTMLButtonElement>(
      'button[type="submit"]'
    );
    const errorsElement =
      this.container.querySelector<HTMLElement>(".form__errors");

    if (!emailInput || !phoneInput || !submitButton || !errorsElement) {
      throw new Error("Contacts: не найдены элементы формы");
    }

    this.emailInput = emailInput;
    this.phoneInput = phoneInput;
    this.submitButton = submitButton;
    this.errorsElement = errorsElement;

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

    this.events.on<{
      valid: boolean;
      errors: Partial<Record<keyof IBuyer, string>>;
    }>("contacts:validate", (data) => {
      this.valid = data.valid;
      const messages = Object.values(data.errors).filter(Boolean);
      this.errors = messages.join(", ");
    });
  }

  set errors(value: string | undefined) {
    this.errorsElement.textContent = value ?? "";
  }

  set valid(value: boolean | undefined) {
    this.submitButton.disabled = !value;
  }

  set email(value: string | undefined) {
    this.emailInput.value = value ?? "";
  }

  set phone(value: string | undefined) {
    this.phoneInput.value = value ?? "";
  }
}
