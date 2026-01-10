import { Component } from "../base/Component";
import type { IEvents } from "../base/Events";
import { categoryMap } from "../../utils/constants";

export interface CardData {
  id: string;
  title: string;
  price: number | null;
  category: string;
  image: string;
  description?: string;
}

export class Card extends Component<CardData> {
  protected events: IEvents;
  protected titleElement: HTMLElement;
  protected priceElement: HTMLElement;
  protected categoryElement?: HTMLElement;
  protected imageElement?: HTMLImageElement;
  protected buttonElement?: HTMLButtonElement; // кнопка может отсутствовать

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;

    const titleElement =
      this.container.querySelector<HTMLElement>(".card__title");
    const priceElement =
      this.container.querySelector<HTMLElement>(".card__price");
    const categoryElement =
      this.container.querySelector<HTMLElement>(".card__category");
    const imageElement =
      this.container.querySelector<HTMLImageElement>(".card__image");
    const buttonElement =
      this.container.querySelector<HTMLButtonElement>(".card__button");

    // обязательно только заголовок и цена — они есть во всех шаблонах
    if (!titleElement || !priceElement) {
      throw new Error("Card: не найдены обязательные элементы карточки");
    }

    this.titleElement = titleElement;
    this.priceElement = priceElement;
    this.categoryElement = categoryElement || undefined;
    this.imageElement = imageElement || undefined;
    this.buttonElement = buttonElement || undefined;
  }

  set title(value: string) {
    this.titleElement.textContent = value;
  }

  set price(value: number | null) {
    if (value === null) {
      this.priceElement.textContent = "Бесценно";
    } else {
      this.priceElement.textContent = `${value} синапсов`;
    }
  }

  set category(value: string) {
    if (!this.categoryElement) {
      return;
    }

    this.categoryElement.textContent = value;

    this.categoryElement.className = this.categoryElement.className
      .split(" ")
      .filter((cls) => !cls.startsWith("card__category_"))
      .join(" ");

    const modifier = categoryMap[value as keyof typeof categoryMap];
    if (modifier) {
      this.categoryElement.classList.add(modifier);
    }
  }

  set image(value: string) {
    if (!this.imageElement) {
      return;
    }

    this.imageElement.src = value;
    this.imageElement.alt = this.titleElement.textContent || "";
  }

  set buttonLabel(value: string) {
    if (this.buttonElement) {
      this.buttonElement.textContent = value;
    }
  }

  set buttonDisabled(value: boolean) {
    if (this.buttonElement) {
      this.buttonElement.disabled = value;
    }
  }
}
