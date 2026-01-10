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
import { CardBasket } from "./components/view/CardBasket";
import { Order } from "./components/view/Order";
import { Contacts } from "./components/view/Contacts";

// ------------------------------- View (END) -------------------------------

// ------------------------------- Presenter (START) -------------------------------

import type { IProduct, IBuyer } from "../src/types";

// ------------------------------- Presenter (END) -------------------------------

// ------------------------------- View (START) -------------------------------

const events = new EventEmitter();

// ВРЕМЕННАЯ ПРОВЕРКА СОБЫТИЙ МОДЕЛЕЙ
// events.on('catalog:changed', (payload) => {
//   console.log('EVENT catalog:changed', payload);
// });
//
// events.on('catalog:select', (payload) => {
//   console.log('EVENT catalog:select', payload);
// });
//
// events.on('cart:changed', (payload) => {
//   console.log('EVENT cart:changed', payload);
// });
//
// events.on('buyer:changed', (payload) => {
//   console.log('EVENT buyer:changed', payload);
// });

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

// Тест: установим счётчик корзины
// page.render({ counter: 3 });
/*
// Тест: поведение модалки
events.on("basket:open", () => {
  const testContent = document.createElement("div");
  testContent.textContent = "Тестовое содержимое модалки";
  modal.open(testContent);
});
*/
events.on("modal:close", () => {
  modal.close();
});

/*

// === Тест: реальная карточка каталога ===

// Шаблон карточки каталога в index.html
const cardTemplate =
  document.querySelector<HTMLTemplateElement>('#card-catalog');

if (!cardTemplate) {
  throw new Error('Не найден шаблон карточки каталога #card-catalog');
}

function cloneCardTemplate(): HTMLElement {
  // говорим TS, что после проверки cardTemplate точно не null
  const fragment = cardTemplate!.content.cloneNode(true) as DocumentFragment;
  const cardElement = fragment.querySelector<HTMLElement>('.card');
  if (!cardElement) {
    throw new Error('В шаблоне карточки не найден элемент с классом .card');
  }
  return cardElement;
}

// Тестовые данные товара
const testProduct = {
  id: 'test',
  title: 'Тестовый товар',
  price: 100,
  category: 'другое',
  image: 'https://via.placeholder.com/200x200',
};

// Создаём одну карточку каталога и выводим её в Gallery
const cardElement = cloneCardTemplate();
const card = new CardCatalog(cardElement, events);
const cardDom = card.render(testProduct);

gallery.catalog = [cardDom];

// Тест: логируем выбор карточки
events.on('card:select', (product) => {
  console.log('card:select', product);
});

*/

// ------------------------------- View (END) -------------------------------

// Создаём модели
const catalog = new Catalog(events);
const cart = new Cart(events);
const buyer = new Buyer(events);

// ------------------------------- Presenter (START) -------------------------------

// Добавление товара в корзину из превью
events.on("preview:add-to-cart", (product: IProduct) => {
  cart.addItem(product);
  console.log("Cart items:", cart.getItems());
});

// Удаление товара из корзины
events.on("basket:item-remove", (payload: { id: string }) => {
  cart.removeItem(payload.id);
});

// Реакция интерфейса на изменение корзины
events.on("cart:changed", () => {
  page.render({
    counter: cart.getCount(),
  });

  // если модалка корзины открыта — перерендерим её
  const isBasketOpen = modalContainer.classList.contains("modal_active");
  if (isBasketOpen) {
    const basketElement = renderBasket();
    modal.open(basketElement);
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

  modal.open(previewDom);
});

//---------------------------------------------------------------------
function renderBasket() {
  const basketTemplate = document.querySelector<HTMLTemplateElement>("#basket");
  if (!basketTemplate) {
    throw new Error("Не найден шаблон корзины #basket");
  }

  const fragment = basketTemplate.content.cloneNode(true) as DocumentFragment;
  const basketElement = fragment.querySelector<HTMLElement>(".basket");
  const listElement = fragment.querySelector<HTMLUListElement>(".basket__list");
  const totalElement = fragment.querySelector<HTMLElement>(".basket__price");
  const orderButton =
    fragment.querySelector<HTMLButtonElement>(".basket__button");

  if (!basketElement || !listElement || !totalElement || !orderButton) {
    throw new Error("В шаблоне корзины нет необходимых элементов");
  }

  const items = cart.getItems();

  const itemTemplate =
    document.querySelector<HTMLTemplateElement>("#card-basket");
  if (!itemTemplate) {
    throw new Error("Не найден шаблон элемента корзины #card-basket");
  }

  const itemNodes = items.map((item, index) => {
    const itemFragment = itemTemplate.content.cloneNode(
      true
    ) as DocumentFragment;
    const itemElement =
      itemFragment.querySelector<HTMLElement>(".basket__item");
    if (!itemElement) {
      throw new Error("В шаблоне элемента корзины нет .basket__item");
    }

    const card = new CardBasket(itemElement, events);
    return card.render({
      id: item.id,
      title: item.title,
      price: item.price,
      category: item.category,
      image: item.image,
      description: item.description,
      index: index + 1,
    });
  });

  listElement.replaceChildren(...itemNodes);
  totalElement.textContent = `${cart.getTotal()} синапсов`;

  orderButton.addEventListener("click", () => {
    // шаблон формы заказа
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

    const orderView = new Order(orderElement, events);

    // заполним форму текущими данными покупателя и валидацией
    const data = buyer.getData();
    const errors = buyer.validate();
    const hasErrors = Object.keys(errors).length > 0;

    orderView.payment = data.payment;
    orderView.address = data.address;
    orderView.valid = !hasErrors;
    orderView.errors = hasErrors ? "Заполните способ оплаты и адрес" : "";

    modal.open(orderElement);
  });

  return basketElement;
}
//---------------------------------------------------------------------

// Открытие модалки корзины
events.on("basket:open", () => {
  const basketElement = renderBasket();
  modal.open(basketElement);
});

// Изменения формы заказа -> обновляем Buyer и валидацию
events.on<Partial<IBuyer>>("order:change", (data) => {
  buyer.setData(data);

  const buyerData = buyer.getData();

  const errors: Partial<Record<keyof IBuyer, string>> = {};
  if (!buyerData.payment) {
    errors.payment = "Не указан способ оплаты";
  }
  if (!buyerData.address) {
    errors.address = "Не указан адрес";
  }

  const hasErrors = Object.keys(errors).length > 0;

  events.emit("order:validate", {
    valid: !hasErrors,
    errors,
  });
});

//-----------------------_______-------------------

/*// Отправка формы заказа -> переходим к форме контактов
events.on("order:submit", () => {
  const errors = buyer.validate();
  const hasErrors = Object.keys(errors).length > 0;
  if (hasErrors) {
    events.emit("order:validate", {
      valid: false,
      errors,
    });
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

  const contactsView = new Contacts(contactsElement, events);

  const data = buyer.getData();
  const contactsErrors = buyer.validate();
  const contactsHasErrors = Object.keys(contactsErrors).length > 0;

  contactsView.email = data.email;
  contactsView.phone = data.phone;
  contactsView.valid = !contactsHasErrors;
  contactsView.errors = contactsHasErrors ? "Заполните email и телефон" : "";

  modal.open(contactsElement);
});*/

//-----------------------_______-------------------

events.on<Partial<IBuyer>>("contacts:change", (data) => {
  buyer.setData(data);

  const errors = buyer.validate();
  // здесь оставляем полную валидацию:
  // payment, address, email, phone
  const hasErrors = Object.keys(errors).length > 0;

  events.emit("contacts:validate", {
    valid: !hasErrors,
    errors,
  });
});

events.on("order:submit", () => {
  const data = buyer.getData();

  // ЛОКАЛЬНАЯ проверка только для шага заказа
  const errors: Partial<Record<keyof IBuyer, string>> = {};
  if (!data.payment) {
    errors.payment = "Не указан способ оплаты";
  }
  if (!data.address) {
    errors.address = "Не указан адрес";
  }

  const hasErrors = Object.keys(errors).length > 0;
  if (hasErrors) {
    events.emit("order:validate", {
      valid: !hasErrors,
      errors,
    });
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

  const contactsView = new Contacts(contactsElement, events);

  const contactsErrors = buyer.validate(); // здесь уже полная проверка
  const contactsHasErrors = Object.keys(contactsErrors).length > 0;

  contactsView.email = data.email;
  contactsView.phone = data.phone;
  contactsView.valid = !contactsHasErrors;
  contactsView.errors = contactsHasErrors ? "Заполните email и телефон" : "";

  modal.open(contactsElement);
});

events.on("contacts:submit", () => {
  const errors = buyer.validate();
  const hasErrors = Object.keys(errors).length > 0;
  if (hasErrors) {
    events.emit("contacts:validate", {
      valid: false,
      errors,
    });
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

      const descriptionElement = successElement.querySelector<HTMLElement>(
        ".order-success__description"
      );
      if (descriptionElement) {
        descriptionElement.textContent = `Списано ${result.total} синапсов`;
      }

      const closeButton = successElement.querySelector<HTMLButtonElement>(
        ".order-success__close"
      );
      if (closeButton) {
        closeButton.addEventListener("click", () => {
          modal.close();
        });
      }

      modal.open(successElement);
    })
    .catch((error) => {
      console.error("Ошибка при оформлении заказа:", error);
    });
});

// ------------------------------- Presenter (END) -------------------------------

// !!!!!ВРЕМЕННЫЕ ТЕСТЫ МОДЕЛЕЙ (убираем перед презентером)!!!!!

/*
console.log('=== ТЕСТ МОДЕЛИ CATALOG ===');

// setItems / getItems
catalog.setItems(apiProducts.items);
console.log('Catalog.getItems():', catalog.getItems());

// getItem
const firstId = apiProducts.items[0]?.id;
if (firstId) {
  console.log('Catalog.getItem(firstId):', catalog.getItem(firstId));
}

// setSelectedItem / getSelectedItem
if (firstId) {
  const product = catalog.getItem(firstId) ?? null;
  catalog.setSelectedItem(product);
  console.log('Catalog.getSelectedItem():', catalog.getSelectedItem());
}

console.log('=== ТЕСТ МОДЕЛИ CART ===');

// getItems (пустая корзина)
console.log('Cart.getItems() (пусто):', cart.getItems());
console.log('Cart.getTotal() (пусто):', cart.getTotal());
console.log('Cart.getCount() (пусто):', cart.getCount());

// addItem / hasItem
const firstProduct = apiProducts.items[0];
const secondProduct = apiProducts.items[1];

if (firstProduct) {
  cart.addItem(firstProduct);
  console.log('Cart.addItem(firstProduct)');
  console.log('Cart.hasItem(firstProduct.id):', cart.hasItem(firstProduct.id));
}

if (secondProduct) {
  cart.addItem(secondProduct);
  console.log('Cart.addItem(secondProduct)');
}

console.log('Cart.getItems():', cart.getItems());
console.log('Cart.getTotal():', cart.getTotal());
console.log('Cart.getCount():', cart.getCount());

// removeItem
if (firstProduct) {
  cart.removeItem(firstProduct.id);
  console.log('Cart.removeItem(firstProduct.id)');
  console.log('Cart.getItems() после удаления:', cart.getItems());
  console.log('Cart.getTotal() после удаления:', cart.getTotal());
  console.log('Cart.getCount() после удаления:', cart.getCount());
}

// clear
cart.clear();
console.log('Cart.clear()');
console.log('Cart.getItems() после очистки:', cart.getItems());

console.log('=== ТЕСТ МОДЕЛИ BUYER ===');

// getData / validate на пустых данных
console.log('Buyer.getData() (пусто):', buyer.getData());
console.log('Buyer.validate() (пусто):', buyer.validate());

// setData (частично)
buyer.setData({ email: 'test@test.ru' });
console.log('Buyer.setData({ email })');
console.log('Buyer.getData() после частичного setData:', buyer.getData());
console.log('Buyer.validate() после частичного setData:', buyer.validate());

// setData (полностью)
buyer.setData({
  payment: 'online',
  phone: '+71234567890',
  address: 'Spb, Nevsky 1',
});
console.log('Buyer.setData(все поля)');
console.log('Buyer.getData() (все поля):', buyer.getData());
console.log('Buyer.validate() (все поля):', buyer.validate());

// clear
buyer.clear();
console.log('Buyer.clear()');
console.log('Buyer.getData() после clear:', buyer.getData());

console.log('=== ТЕСТ СЛОЯ КОММУНИКАЦИИ ===');
*/

const api = new Api(API_URL);
const shopApi = new ShopApi(api);

shopApi
  .getProducts()
  .then((response) => {
    // console.log('ShopApi.getProducts() ответ сервера:', response);
    catalog.setItems(response.items);
    // console.log(
    //   'Catalog.getItems() после ShopApi.getProducts():',
    //   catalog.getItems(),
    // );
  })
  .catch((error) => {
    console.error(
      "Ошибка при запросе каталога через ShopApi.getProducts():",
      error
    );
  });
