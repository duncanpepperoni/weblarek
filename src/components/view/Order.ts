import type { IEvents } from "../base/Events";
import type { IBuyer, TPayment } from "../../types";
import { Form, FormViewState } from "./Form";

interface OrderViewData extends FormViewState {
  payment?: TPayment | null;
  address?: string;
}

export class Order extends Form<OrderViewData> {
  protected events: IEvents;

  protected cardButton: HTMLButtonElement;
  protected cashButton: HTMLButtonElement;
  protected addressInput: HTMLInputElement;

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

    if (!cardButton || !cashButton || !addressInput) {
      throw new Error("Order: не найдены элементы формы");
    }

    this.cardButton = cardButton;
    this.cashButton = cashButton;
    this.addressInput = addressInput;

    // выбор способа оплаты
    this.cardButton.addEventListener("click", () => {
      this.onPaymentChange("online");
    });

    this.cashButton.addEventListener("click", () => {
      this.onPaymentChange("cash");
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
  }

  protected onPaymentChange(method: TPayment) {
    this.events.emit<Partial<IBuyer>>("order:change", {
      payment: method,
    });
  }

  // визуальное состояние оплаты задаётся извне через сеттер payment
  set payment(value: TPayment | null | undefined) {
    if (!value) {
      this.cardButton.classList.remove("button_alt-active");
      this.cashButton.classList.remove("button_alt-active");
      return;
    }
    this.cardButton.classList.toggle("button_alt-active", value === "online");
    this.cashButton.classList.toggle("button_alt-active", value === "cash");
  }

  set address(value: string | undefined) {
    this.addressInput.value = value ?? "";
  }
}
