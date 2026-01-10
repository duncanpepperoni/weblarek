import { IBuyer, TPayment } from "../../types";
import type { IEvents } from "../base/Events";

export class Buyer {
  private payment: TPayment | null = null;
  private email = "";
  private phone = "";
  private address = "";
  private events: IEvents;

  constructor(events: IEvents) {
    this.events = events;
  }

  setData(data: Partial<IBuyer>): void {
    if (data.payment !== undefined) {
      this.payment = data.payment;
    }
    if (data.email !== undefined) {
      this.email = data.email;
    }
    if (data.phone !== undefined) {
      this.phone = data.phone;
    }
    if (data.address !== undefined) {
      this.address = data.address;
    }

    this.events.emit("buyer:changed", this.getData());
  }

  getData(): IBuyer {
    return {
      payment: this.payment as TPayment,
      email: this.email,
      phone: this.phone,
      address: this.address,
    };
  }

  clear(): void {
    this.payment = null;
    this.email = "";
    this.phone = "";
    this.address = "";

    this.events.emit("buyer:changed", this.getData());
  }

  validate(): Partial<Record<keyof IBuyer, string>> {
    const errors: Partial<Record<keyof IBuyer, string>> = {};

    if (!this.payment) {
      errors.payment = "Не выбран способ оплаты";
    }
    if (!this.address) {
      errors.address = "Не указан адрес доставки";
    }
    if (!this.email) {
      errors.email = "Не указан email";
    }
    if (!this.phone) {
      errors.phone = "Не указан телефон";
    }

    return errors;
  }
}
