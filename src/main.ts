import "./scss/styles.scss";

import { Catalog } from "../src/components/models/Catalog";
import { Cart } from "../src/components/models/Cart";
import { Buyer } from "../src/components/models/Buyer";
import { Api } from "../src/components/base/Api";
import { API_URL } from "../src/utils/constants";
import { ShopApi } from "../src/components/api/ShopApi";

// ------------------------------- View (START) -------------------------------

import { EventEmitter } from "./components/base/Events";
import { Page } from "./components/view/Page";
import { Modal } from "./components/view/Modal";
import { Gallery } from "./components/view/Gallery";
import { CardCatalog } from "./components/view/CardCatalog";
import { CardPreview } from "./components/view/CardPreview";
import { Contacts } from "./components/view/Contacts";
import { Basket } from "./components/view/Basket";
import { Success } from "./components/view/Success";
import { Order } from "./components/view/Order";

// ------------------------------- View (END) -------------------------------

// ------------------------------- Presenter (START) -------------------------------

import type { IProduct, IBuyer } from "../src/types";

// ------------------------------- Presenter (END) -------------------------------

// ------------------------------- View (START) -------------------------------

const events = new EventEmitter();

// Корневые элементы из index.html
const pageContainer = document.body;
const modalContainer = document.querySelector<HTMLElement>(".modal");
const galleryContainer = document.querySelector<HTMLElement>(".gallery");

if (!modalContainer || !galleryContainer) {
  throw new Error("Не найдены .modal или .gallery в разметке");
}

// Инициализация классов представления
const page = new Page(pageContainer, events);
const modal = new Modal(modalContainer, events);
const gallery = new Gallery(galleryContainer);

events.on("modal:close", () => {
  modal.close();
  // сбрасываем ссылки на view, которые показывались в модалке
  basketView = null;
  orderView = null;
  contactsView = null;
});

// отдельный обработчик закрытия окна успеха
events.on("success:close", () => {
  modal.close();
});

// ------------------------------- View (END) -------------------------------

// Создаём модели
const catalog = new Catalog(events);
const cart = new Cart(events);
const buyer = new Buyer(events);

// ссылки на активные формы
let orderView: Order | null = null;
let contactsView: Contacts | null = null;
// ссылка на открытую корзину
let basketView: Basket | null = null;

// ------------------------------- Presenter (START) -------------------------------

// Удаление товара из корзины
events.on("basket:item-remove", (payload: { id: string }) => {
  cart.removeItem(payload.id);
});

// Реакция интерфейса на изменение корзины
events.on("cart:changed", () => {
  page.render({
    counter: cart.getCount(),
  });

  // если корзина открыта — перерисуем её
  if (basketView) {
    const items = cart.getItems();
    const total = cart.getTotal();
    basketView.render({ items, total });
  }
});

// Презентер: обработка изменения каталога
events.on("catalog:changed", (payload: { items: IProduct[] }) => {
  const cards = payload.items.map((item) => {
    // клонируем шаблон карточки
    const template =
      document.querySelector<HTMLTemplateElement>("#card-catalog");
    if (!template) {
      throw new Error("Не найден шаблон карточки каталога #card-catalog");
    }

    const fragment = template.content.cloneNode(true) as DocumentFragment;
    const cardElement = fragment.querySelector<HTMLElement>(".card");
    if (!cardElement) {
      throw new Error("В шаблоне карточки не найден элемент с классом .card");
    }

    // создаём карточку и рендерим
    const card = new CardCatalog(cardElement, events);
    return card.render({
      id: item.id,
      title: item.title,
      price: item.price,
      category: item.category,
      image: item.image,
    });
  });

  gallery.catalog = cards;
});

// Презентер: открытие превью товара в модалке
events.on("card:select", (product: IProduct) => {
  const template = document.querySelector<HTMLTemplateElement>("#card-preview");
  if (!template) {
    throw new Error("Не найден шаблон карточки превью #card-preview");
  }

  const fragment = template.content.cloneNode(true) as DocumentFragment;
  const cardElement = fragment.querySelector<HTMLElement>(".card");
  if (!cardElement) {
    throw new Error("В шаблоне превью не найден элемент с классом .card");
  }

  const preview = new CardPreview(cardElement, events);

  const previewDom = preview.render({
    id: product.id,
    title: product.title,
    price: product.price,
    category: product.category,
    image: product.image,
    description: product.description,
  });

  const inCart = cart.getItems().some((item) => item.id === product.id);
  const canPurchase = product.price !== null;

  preview.inCart = inCart;
  preview.canPurchase = canPurchase;

  modal.open(previewDom);
});

// Открытие модалки корзины
events.on("basket:open", () => {
  const basketTemplate = document.querySelector<HTMLTemplateElement>("#basket");
  if (!basketTemplate) {
    throw new Error("Не найден шаблон корзины #basket");
  }

  const fragment = basketTemplate.content.cloneNode(true) as DocumentFragment;
  const basketElement = fragment.querySelector<HTMLElement>(".basket");
  if (!basketElement) {
    throw new Error("В шаблоне корзины нет .basket");
  }

  // создаём представление корзины и сохраняем ссылку
  basketView = new Basket(basketElement, events);

  const items = cart.getItems();
  const total = cart.getTotal();

  const basketDom = basketView.render({ items, total });

  modal.open(basketDom);
});

// Кнопка в превью: добавить/удалить из корзины
events.on("preview:button-click", (payload: { id: string }) => {
  const product = catalog.getItems().find((item) => item.id === payload.id);
  if (!product || product.price === null) {
    return;
  }

  const inCart = cart.getItems().some((item) => item.id === product.id);

  if (inCart) {
    cart.removeItem(product.id);
  } else {
    cart.addItem(product);
  }

  // после действия закрываем модалку превью, чтобы UI не расходился с состоянием
  modal.close();
});

// Кнопка "Оформить" в корзине
events.on("basket:order", () => {
  const orderTemplate = document.querySelector<HTMLTemplateElement>("#order");
  if (!orderTemplate) {
    throw new Error("Не найден шаблон формы заказа #order");
  }

  const orderFragment = orderTemplate.content.cloneNode(
    true
  ) as DocumentFragment;
  const orderElement = orderFragment.querySelector<HTMLElement>("form.form");
  if (!orderElement) {
    throw new Error("В шаблоне заказа нет form.form");
  }

  orderView = new Order(orderElement, events);

  // начальное состояние на основе Buyer
  const data = buyer.getData();
  const errors = buyer.validate();
  const stepErrors: Partial<Record<keyof IBuyer, string>> = {
    payment: errors.payment,
    address: errors.address,
  };
  const hasErrors = Object.values(stepErrors).some(Boolean);

  orderView.payment = data.payment;
  orderView.address = data.address;
  orderView.valid = !hasErrors;
  orderView.errors = hasErrors
    ? Object.values(stepErrors).filter(Boolean).join(", ")
    : "";

  const orderDom = orderView.render({});
  modal.open(orderDom);
});

// Изменения формы заказа -> обновляем Buyer и сразу обновляем Order
events.on<Partial<IBuyer>>("order:change", (data) => {
  buyer.setData(data);

  const errors = buyer.validate();

  // для шага заказа учитываем только payment и address
  const stepErrors: Partial<Record<keyof IBuyer, string>> = {
    payment: errors.payment,
    address: errors.address,
  };

  const hasErrors = Object.values(stepErrors).some(Boolean);

  if (orderView) {
    // подсветка способа оплаты, если поменяли payment
    if (data.payment) {
      orderView.payment = data.payment;
    }

    orderView.valid = !hasErrors;
    orderView.errors = hasErrors
      ? Object.values(stepErrors).filter(Boolean).join(", ")
      : "";
  }
});

// Изменения формы контактов -> обновляем Buyer и сразу обновляем Contacts
events.on<Partial<IBuyer>>("contacts:change", (data) => {
  buyer.setData(data);

  const errors = buyer.validate();
  const hasErrors = Object.values(errors).some(Boolean);

  if (contactsView) {
    contactsView.valid = !hasErrors;
    contactsView.errors = hasErrors
      ? Object.values(errors).filter(Boolean).join(", ")
      : "";
  }
});

events.on("order:submit", () => {
  const errors = buyer.validate();

  // ЛОКАЛЬНАЯ проверка только для шага заказа (payment + address)
  const stepErrors: Partial<Record<keyof IBuyer, string>> = {
    payment: errors.payment,
    address: errors.address,
  };

  const hasErrors = Object.values(stepErrors).some(Boolean);

  if (hasErrors) {
    if (orderView) {
      orderView.valid = false;
      orderView.errors = Object.values(stepErrors).filter(Boolean).join(", ");
    }
    return;
  }

  // открываем форму контактов
  const contactsTemplate =
    document.querySelector<HTMLTemplateElement>("#contacts");
  if (!contactsTemplate) {
    throw new Error("Не найден шаблон формы контактов #contacts");
  }

  const contactsFragment = contactsTemplate.content.cloneNode(
    true
  ) as DocumentFragment;
  const contactsElement =
    contactsFragment.querySelector<HTMLElement>("form.form");
  if (!contactsElement) {
    throw new Error("В шаблоне контактов нет form.form");
  }

  contactsView = new Contacts(contactsElement, events);

  const data = buyer.getData();
  const contactsErrors = buyer.validate(); // полная проверка
  const contactsHasErrors = Object.values(contactsErrors).some(Boolean);

  contactsView.email = data.email;
  contactsView.phone = data.phone;
  contactsView.valid = !contactsHasErrors;
  contactsView.errors = contactsHasErrors
    ? Object.values(contactsErrors).filter(Boolean).join(", ")
    : "";

  const contactsDom = contactsView.render({});
  modal.open(contactsDom);
});

events.on("contacts:submit", () => {
  const errors = buyer.validate();
  const hasErrors = Object.values(errors).some(Boolean);

  if (hasErrors) {
    if (contactsView) {
      contactsView.valid = false;
      contactsView.errors = Object.values(errors).filter(Boolean).join(", ");
    }
    return;
  }

  const buyerData = buyer.getData();
  const items = cart.getItems();

  const orderRequest = {
    payment: buyerData.payment!,
    email: buyerData.email!,
    phone: buyerData.phone!,
    address: buyerData.address!,
    total: cart.getTotal(),
    items: items.map((item) => item.id),
  };

  shopApi
    .createOrder(orderRequest)
    .then((result) => {
      // очищаем данные
      cart.clear();
      buyer.clear();

      // пересчёт счётчика
      page.render({ counter: 0 });

      // показываем успех
      const successTemplate =
        document.querySelector<HTMLTemplateElement>("#success");
      if (!successTemplate) {
        throw new Error("Не найден шаблон успеха #success");
      }

      const successFragment = successTemplate.content.cloneNode(
        true
      ) as DocumentFragment;
      const successElement =
        successFragment.querySelector<HTMLElement>(".order-success");
      if (!successElement) {
        throw new Error("В шаблоне успеха нет .order-success");
      }

      const successView = new Success(successElement, events);
      const successDom = successView.render({ total: result.total });

      modal.open(successDom);
    })
    .catch((error) => {
      console.error("Ошибка при оформлении заказа:", error);
    });
});

// ------------------------------- Presenter (END) -------------------------------

const api = new Api(API_URL);
const shopApi = new ShopApi(api);

shopApi
  .getProducts()
  .then((response) => {
    catalog.setItems(response.items);
  })
  .catch((error) => {
    console.error(
      "Ошибка при запросе каталога через ShopApi.getProducts():",
      error
    );
  });
