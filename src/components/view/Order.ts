import { Component } from "../base/Component";
import type { IEvents } from "../base/Events";
import type { IBuyer, TPayment } from "../../types";

interface OrderViewData {
  payment?: TPayment | null;
  address?: string;
  errors?: string;
  valid?: boolean;
}

export class Order extends Component<OrderViewData> {
  protected events: IEvents;

  protected cardButton: HTMLButtonElement;
  protected cashButton: HTMLButtonElement;
  protected addressInput: HTMLInputElement;
  protected submitButton: HTMLButtonElement;
  protected errorsElement: HTMLElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;

    const cardButton = this.container.querySelector<HTMLButtonElement>(
      'button[name="card"]'
    );
    const cashButton = this.container.querySelector<HTMLButtonElement>(
      'button[name="cash"]'
    );
    const addressInput = this.container.querySelector<HTMLInputElement>(
      'input[name="address"]'
    );
    const submitButton =
      this.container.querySelector<HTMLButtonElement>(".order__button");
    const errorsElement =
      this.container.querySelector<HTMLElement>(".form__errors");

    if (
      !cardButton ||
      !cashButton ||
      !addressInput ||
      !submitButton ||
      !errorsElement
    ) {
      throw new Error("Order: не найдены элементы формы");
    }

    this.cardButton = cardButton;
    this.cashButton = cashButton;
    this.addressInput = addressInput;
    this.submitButton = submitButton;
    this.errorsElement = errorsElement;

    // выбор способа оплаты
    this.cardButton.addEventListener("click", () => {
      this.setPayment("online");
    });

    this.cashButton.addEventListener("click", () => {
      this.setPayment("cash");
    });

    // ввод адреса
    this.addressInput.addEventListener("input", () => {
      this.events.emit<Partial<IBuyer>>("order:change", {
        address: this.addressInput.value,
      });
    });

    // отправка формы
    this.container.addEventListener("submit", (event) => {
      event.preventDefault();
      this.events.emit("order:submit", {});
    });

    this.events.on<{
      valid: boolean;
      errors: Partial<Record<keyof IBuyer, string>>;
    }>("order:validate", (data) => {
      this.valid = data.valid;
      const messages = Object.values(data.errors).filter(Boolean);
      this.errors = messages.join(", ");
    });
  }

  protected setPayment(method: TPayment) {
    // визуальный активный статус кнопок
    this.cardButton.classList.toggle("button_alt-active", method === "online");
    this.cashButton.classList.toggle("button_alt-active", method === "cash");

    this.events.emit<Partial<IBuyer>>("order:change", {
      payment: method,
    });
  }

  set errors(value: string | undefined) {
    this.errorsElement.textContent = value ?? "";
  }

  set valid(value: boolean | undefined) {
    this.submitButton.disabled = !value;
  }

  set address(value: string | undefined) {
    this.addressInput.value = value ?? "";
  }

  set payment(value: TPayment | null | undefined) {
    if (!value) {
      this.cardButton.classList.remove("button_alt-active");
      this.cashButton.classList.remove("button_alt-active");
      return;
    }
    this.cardButton.classList.toggle("button_alt-active", value === "online");
    this.cashButton.classList.toggle("button_alt-active", value === "cash");
  }
}
