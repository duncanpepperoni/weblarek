import { Component } from "../base/Component";
import type { IEvents } from "../base/Events";
import { CardBasket, CardBasketData } from "./CardBasket";
import type { IProduct } from "../../types";

interface BasketViewData {
  items: IProduct[];
  total: number;
}

export class Basket extends Component<BasketViewData> {
  private events: IEvents;
  private listElement: HTMLUListElement;
  private totalElement: HTMLElement;
  private orderButton: HTMLButtonElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;

    const listElement =
      this.container.querySelector<HTMLUListElement>(".basket__list");
    const totalElement =
      this.container.querySelector<HTMLElement>(".basket__price");
    const orderButton =
      this.container.querySelector<HTMLButtonElement>(".basket__button");

    if (!listElement || !totalElement || !orderButton) {
      throw new Error("Basket: не найдены элементы корзины");
    }

    this.listElement = listElement;
    this.totalElement = totalElement;
    this.orderButton = orderButton;

    this.orderButton.addEventListener("click", () => {
      this.events.emit("basket:order", {});
    });
  }

  render(data: BasketViewData): HTMLElement {
    const itemTemplate =
      document.querySelector<HTMLTemplateElement>("#card-basket");
    if (!itemTemplate) {
      throw new Error("Не найден шаблон #card-basket");
    }

    const nodes = data.items.map((item, index) => {
      const fragment = itemTemplate.content.cloneNode(true) as DocumentFragment;
      const itemElement = fragment.querySelector<HTMLElement>(".basket__item");
      if (!itemElement) {
        throw new Error("В шаблоне корзины нет .basket__item");
      }

      const card = new CardBasket(itemElement, this.events, () => {
        this.events.emit("basket:item-remove", { id: item.id });
      });

      const cardData: CardBasketData = {
        id: item.id,
        title: item.title,
        price: item.price,
        category: item.category,
        image: item.image,
        index: index + 1,
      };

      return card.render(cardData);
    });

    this.listElement.replaceChildren(...nodes);
    this.totalElement.textContent = `${data.total} синапсов`;

    return this.container;
  }
}
