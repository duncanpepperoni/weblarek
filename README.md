https://github.com/duncanpepperoni/weblarek

# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Vite

Структура проекта:

- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом
- src/components/models/ — папка с моделями данных
- src/components/api/ — папка со слоем коммуникации (работа с сервером)

Важные файлы:

- index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/main.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск

Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run dev
```

или

```
yarn
yarn dev
```

## Сборка

```
npm run build
```

или

```
yarn build
```

# Интернет-магазин «Web-Larёk»

«Web-Larёk» — это интернет-магазин с товарами для веб-разработчиков, где пользователи могут просматривать товары, добавлять их в корзину и оформлять заказы. Сайт предоставляет удобный интерфейс с модальными окнами для просмотра деталей товаров, управления корзиной и выбора способа оплаты, обеспечивая полный цикл покупки с отправкой заказов на сервер.

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP (Model-View-Presenter), которая обеспечивает четкое разделение ответственности между классами слоев Model и View. Каждый слой несет свой смысл и ответственность:

Model - слой данных, отвечает за хранение и изменение данных.  
View - слой представления, отвечает за отображение данных на странице.  
Presenter - презентер содержит основную логику приложения и отвечает за связь представления и данных.

Взаимодействие между классами обеспечивается использованием событийно-ориентированного подхода. Модели и Представления генерируют события при изменении данных или взаимодействии пользователя с приложением, а Презентер обрабатывает эти события используя методы как Моделей, так и Представлений.

### Базовый код

#### Класс Component

Является базовым классом для всех компонентов интерфейса.
Класс является дженериком и принимает в переменной `T` тип данных, которые могут быть переданы в метод `render` для отображения.

Конструктор:  
`constructor(container: HTMLElement)` - принимает ссылку на DOM элемент за отображение, которого он отвечает.

Поля класса:  
`container: HTMLElement` - поле для хранения корневого DOM элемента компонента.

Методы класса:  
`render(data?: Partial<T>): HTMLElement` - Главный метод класса. Он принимает данные, которые необходимо отобразить в интерфейсе, записывает эти данные в поля класса и возвращает ссылку на DOM-элемент. Предполагается, что в классах, которые будут наследоваться от `Component` будут реализованы сеттеры для полей с данными, которые будут вызываться в момент вызова `render` и записывать данные в необходимые DOM элементы.  
`setImage(element: HTMLImageElement, src: string, alt?: string): void` - утилитарный метод для модификации DOM-элементов `<img>`

#### Класс Api

Содержит в себе базовую логику отправки запросов.

Конструктор:  
`constructor(baseUrl: string, options: RequestInit = {})` - В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.

Поля класса:  
`baseUrl: string` - базовый адрес сервера  
`options: RequestInit` - объект с заголовками, которые будут использованы для запросов.

Методы:  
`get(uri: string): Promise<object>` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер  
`post(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<object>` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.  
`handleResponse(response: Response): Promise<object>` - защищенный метод проверяющий ответ сервера на корректность и возвращающий объект с данными полученный от сервера или отклоненный промис, в случае некорректных данных.

#### Класс EventEmitter

Брокер событий реализует паттерн "Наблюдатель", позволяющий отправлять события и подписываться на события, происходящие в системе. Класс используется для связи слоя данных и представления.

Конструктор класса не принимает параметров.

Поля класса:  
`_events: Map<string | RegExp, Set<Function>>)` - хранит коллекцию подписок на события. Ключи коллекции - названия событий или регулярное выражение, значения - коллекция функций обработчиков, которые будут вызваны при срабатывании события.

Методы класса:  
`on<T extends object>(event: EventName, callback: (data: T) => void): void` - подписка на событие, принимает название события и функцию обработчик.  
`emit<T extends object>(event: string, data?: T): void` - инициализация события. При вызове события в метод передается название события и объект с данными, который будет использован как аргумент для вызова обработчика.  
`trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие с передачей в него данных из второго параметра.

### Данные

Слой данных описывает структуры, с которыми работает интернет‑магазин: товары каталога, данные покупателя и объекты для взаимодействия с API. Все описанные ниже интерфейсы и типы находятся в файле src/types/index.ts.

**Интерфейс товара IProduct**

Товар — основная сущность каталога интернет‑магазина, содержащая данные для отображения и расчёта стоимости заказа.

```javascript
interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}
```

- id — уникальный идентификатор товара, используется для поиска, работы с корзиной и формирования заказа.
- description — текстовое описание товара, отображается в модальном окне карточки.
- image — путь к изображению товара.
- title — название товара, отображается в каталоге и карточке товара.
- category — категория товара, используемая для отображения типа товара в интерфейсе.
- price — цена товара, может быть null, если товар недоступен для покупки (в этом случае кнопка покупки блокируется).

**Тип способа оплаты TPayment**

Способ оплаты определяет, как пользователь будет платить за заказ, и используется в данных покупателя и теле заказа.

```javascript
type TPayment = "online" | "cash";
```

- 'online' — оплата онлайн (карта или другой безналичный способ).
- 'cash' — оплата наличными при получении.

**Интерфейс покупателя IBuyer**

Покупатель агрегирует данные, которые пользователь вводит при оформлении заказа.

```javascript
interface IBuyer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
}
```

- payment — выбранный способ оплаты, соответствует типу TPayment.
- email — адрес электронной почты покупателя, используется для связи и подтверждения заказа.
- phone — телефон покупателя.
- address — адрес доставки заказа, без этого поля заказ не может быть оформлен.

**Интерфейс ответа списка товаров IProductsResponse**

При загрузке каталога сервер возвращает обёртку с количеством товаров и массивом объектов IProduct.

```javascript
interface IProductsResponse {
  total: number;
  items: IProduct[];
}
```

- total — общее количество товаров в каталоге на стороне сервера.
- items — массив товаров в формате IProduct, который используется моделью каталога и представлением для отрисовки карточек.

**Интерфейс тела заказа IOrderRequest**

Тело запроса на создание заказа соответствует формату POST /order.

```javascript
interface IOrderRequest {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}
```

- payment — способ оплаты, выбранный пользователем.
- email — e‑mail покупателя.
- phone — телефон покупателя.
- address — адрес доставки.
- total — итоговая сумма заказа, рассчитанная на клиенте на основе цен товаров в корзине.
- items — массив идентификаторов товаров, которые входят в заказ.

**Интерфейс ответа на создание заказа IOrderResponse**

Ответ сервера после успешного оформления заказа содержит идентификатор и итоговую сумму.

```javascript
interface IOrderResponse {
  id: string;
  total: number;
}
```

- id — уникальный идентификатор созданного заказа на стороне сервера.
- total — финальная сумма заказа, подтверждённая сервером.

### Модели данных

**Модель каталога Catalog**

Модель Catalog хранит список всех товаров и выбранный товар для детального просмотра.

Конструктор:

`constructor()` — создаёт пустой каталог с пустым списком товаров и без выбранного товара.

Поля:

`private items: IProduct[]` — массив всех товаров каталога.

`private selectedItem: IProduct | null` — текущий выбранный товар или null.

Методы:

`setItems(items: IProduct[]): void` — сохраняет массив товаров.

`getItems(): IProduct[]` — возвращает текущий массив товаров.

`getItem(id: string): IProduct | undefined` — возвращает товар по id или undefined.

`setSelectedItem(item: IProduct | null): void` — устанавливает выбранный товар.

`getSelectedItem(): IProduct | null` — возвращает выбранный товар.

**Модель каталога Cart**

Модель Cart хранит товары, которые пользователь добавил в корзину, и предоставляет методы для управления ими и расчёта суммы.

Конструктор:

`constructor()` — создаёт пустую корзину без товаров.

Поля:

`private items: IProduct[]` — массив товаров в корзине.

Методы:

`getItems(): IProduct[]` — возвращает список товаров корзины.

`addItem(item: IProduct): void` — добавляет товар в корзину.

`removeItem(id: string): void` — удаляет товар по id.

`clear(): void` — очищает корзину.

`getTotal(): number` — возвращает суммарную стоимость всех товаров (товары с price === `null можно не учитывать).

`getCount(): number`— возвращает количество товаров в корзине.

`hasItem(id: string): boolean` — проверяет наличие товара по id.

**Модель каталога Buyer**

Модель Buyer хранит данные покупателя и выполняет их базовую валидацию перед оформлением заказа.

Конструктор:

`constructor()` — создаёт модель с пустыми полями покупателя и без выбранного способа оплаты.

Поля:

`private payment: TPayment | null` — способ оплаты.

`private email: string` — e‑mail.

`private phone: string` — телефон.

`private address: string` — адрес доставки.

Методы:

`setData(data: Partial<IBuyer>): void` — обновляет одно или несколько полей, не очищая остальные.

`getData(): IBuyer` — возвращает актуальные данные покупателя.

`clear(): void` — сбрасывает все поля модели.

`validate(): Partial<Record<keyof IBuyer, string>>` — проверяет поля на пустые значения и возвращает объект с ошибками по полям, при отсутствии ошибок возвращает пустой объект.

### Слой коммуникации

Слой коммуникации отвечает за работу с API сервера и реализован отдельным классом.

**Класс ShopApi**

Конструктор:

`constructor(api: IApi)` — принимает объект, реализующий интерфейс IApi (базовый клиент с настроенным baseUrl).

Поля:

`private api: IApi` — транспорт для выполнения HTTP‑запросов (get/post).

Методы:

`getProducts(): Promise<IProductsResponse>` - выполняет GET запрос на /product/. Возвращает объект IProductsResponse с полями total и items: IProduct[].

`createOrder(order: IOrderRequest): Promise<IOrderResponse>` - выполняет POST запрос на /order. Принимает данные заказа в формате IOrderRequest. Возвращает IOrderResponse с идентификатором заказа id и финальной суммой total.

### Слой представления (View)

Слой представления отвечает за отображение сайта по вёрстке и макету. Каждый класс отвечает за один блок разметки, не хранит данные и не содержит бизнес‑логику. В ответ на действия пользователя классы генерируют события, которые обрабатываются в презентере.

**Базовый класс Component<T>**

Базовый класс для всех классов представления. Хранит корневой DOM‑элемент и реализует общий метод `render`.

Конструктор:

`constructor(container: HTMLElement)` — принимает корневой DOM‑элемент класса.

Поля:

`protected readonly container: HTMLElement` — корневой элемент.

Методы:

`render(data?: Partial<T>): HTMLElement` — обновляет состояние экземпляра по данным `data` через соответствующие сеттеры и возвращает корневой элемент.

**Класс Page**

Класс страницы. Отвечает за шапку и счётчик товаров в корзине.

Конструктор:

`constructor(container: HTMLElement, events: IEvents)` — принимает корневой элемент страницы и брокер событий.

Поля:

`protected events: IEvents` — брокер событий.

`protected basketButton: HTMLElement` — иконка корзины.

`protected basketCounter: HTMLElement` — счётчик товаров.

Методы:

`set counter(value: number): void` — устанавливает значение счётчика товаров в корзине.

События:

Клик по `basketButton` генерирует `basket:open`.

**Класс Modal**

Класс модального окна. Отвечает за показ, скрытие и содержимое модалки. Не имеет наследников.

Конструктор:

`constructor(container: HTMLElement, events: IEvents)` — принимает элемент .modal и брокер событий.

Поля:

`protected events: IEvents` — брокер событий.

`protected modal: HTMLElement` — корневой элемент модалки.

`protected content: HTMLElement` — контейнер содержимого.

`protected closeButton: HTMLElement` — кнопка закрытия.

Методы:

`open(content: HTMLElement): void` — вставляет содержимое и добавляет класс modal_active.

`close(): void` — убирает класс modal_active и очищает содержимое.

События:

Клик по `closeButton` или по фону генерирует `modal:close`.

**Класс Gallery**

Класс каталога товаров. Отвечает за вывод карточек в `<main class="gallery">`.

Конструктор:

`constructor(container: HTMLElement)` — принимает элемент `.gallery`.

Поля:

`protected container: HTMLElement` — контейнер каталога.

Методы:

`set catalog(items: HTMLElement[]): void` — заменяет содержимое каталога переданными карточками товаров.

**Базовый класс карточки Card**

Базовый класс карточки товара. Содержит общую разметку и логику отображения заголовка, цены, категории, изображения и кнопки.

Конструктор:

`constructor(container: HTMLElement, events: IEvents)` — принимает DOM‑элемент карточки и брокер событий.

Поля:

`protected events: IEvents` — брокер событий.

`protected titleElement: HTMLElement` — заголовок (`.card__title`).

`protected priceElement: HTMLElement` — цена (`.card__price`).

`protected categoryElement?: HTMLElement` — категория (`.card__category`, может отсутствовать).

`protected imageElement?: HTMLImageElement` — изображение (`.card__image`, может отсутствовать).

`protected buttonElement?: HTMLButtonElement` — кнопка действия (`.card__button`, может отсутствовать).

`protected _id: string | null` — идентификатор товара, используется дочерними классами.

Методы:

`set id(value: string | undefined): void` — сохраняет идентификатор товара.

`get id(): string | null` — возвращает текущий идентификатор.

`set title(value: string): void` — устанавливает название.

`set price(value: number | null): void` — отображает цену в формате «N синапсов» или текст «Бесценно» при `null`.

`set category(value: string): void` — устанавливает текст категории и CSS‑модификатор по `categoryMap`.

`set image(value: string): void` — устанавливает URL изображения и alt‑текст по заголовку.

`set buttonLabel(value: string): void` — устанавливает текст кнопки, если она есть.

`set buttonDisabled(value: boolean): void` — включает/отключает кнопку, если она есть.

**Класс CardCatalog**

Карточка товара в каталоге.

Конструктор:

`constructor(container: HTMLElement, events: IEvents)` — принимает DOM‑элемент карточки каталога и брокер событий.

Поля:

Наследует поля `Card`.

`protected product: CardData | null` — сохранённые данные товара для передачи в событие.

Методы:

`render(data?: Partial<CardData>): HTMLElement` — заполняет карточку переданными данными (id, title, price, category, image), сохраняет их во внутреннем поле `product` и возвращает элемент карточки.

События:

Клик по карточке генерирует `card:select` с объектом товара `CardData`.

**Класс CardBasket**

Карточка товара в корзине (строка списка корзины).

Конструктор:

`constructor(container: HTMLElement, events: IEvents, onRemove: () => void)` — принимает DOM‑элемент строки корзины, брокер событий и обработчик удаления позиции.

Поля:

Наследует поля `Card`.

`protected indexElement: HTMLElement` — номер позиции в корзине.

`protected onRemove: () => void` — колбэк, вызываемый при удалении товара из корзины.

Методы:

`render(data?: Partial<CardBasketData>): HTMLElement` — отрисовывает строку корзины и возвращает элемент.

`set index(value: number): void` — устанавливает порядковый номер.

События:

Клик по кнопке удаления вызывает `onRemove`, который презентер использует для удаления товара из корзины и генерации события `basket:item-remove` с `id` товара.

**Класс CardPreview**

Карточка детального просмотра товара в модальном окне.

Конструктор:

`constructor(container: HTMLElement, events: IEvents)` — принимает DOM‑элемент карточки превью и брокер событий.

Поля:

Наследует поля `Card`.

`protected textElement: HTMLElement` — текстовое описание товара.

`protected _inCart: boolean` — флаг, находится ли товар в корзине.

`protected _canPurchase: boolean` — флаг, доступен ли товар к покупке (price !== null).

Методы:

`render(data: CardData): HTMLElement` — заполняет карточку данными (id, title, price, category, image, description) и возвращает корневой элемент.

`set text(value: string): void` — устанавливает текст описания.

`set inCart(value: boolean): void` — переключает текст кнопки между «В корзину» и «Удалить из корзины» для доступных к покупке товаров.

`set canPurchase(value: boolean): void` — включает/отключает кнопку и устанавливает текст «Недоступно» для товаров без цены.

События:

Клик по кнопке генерирует `preview:button-click` с `id` товара, презентер по этому событию либо добавляет товар в корзину, либо удаляет его оттуда.

Если товар недоступен к покупке (`canPurchase = false`, цена `null`), кнопка показывает «Недоступно» и отключена.

**Класс Basket**

Корзина. Отвечает за список товаров, общую стоимость и кнопку «Оформить».

Конструктор:

`constructor(container: HTMLElement, events: IEvents)` — принимает DOM‑элемент корзины и брокер событий.

Поля:

`private events: IEvents` — брокер событий.​

`private listElement: HTMLUListElement` — список товаров (.basket\_\_list).

`private totalElement: HTMLElement` — элемент с общей суммой (.basket\_\_price).​

`private orderButton: HTMLButtonElement` — кнопка оформления заказа (.basket\_\_button).

Методы:

`render(data: { items: IProduct[]; total: number }): HTMLElement` — пересобирает содержимое корзины: по шаблону #card-basket создаёт CardBasket для каждого товара, устанавливает порядковый номер и цену, обновляет список и общую сумму, затем возвращает корневой элемент корзины.

События:

Клик по `orderButton` генерирует событие `basket:order`.​

Каждый `CardBasket` внутри корзины вызывает переданный обработчик, который эмитит `basket:item-remove` с `id` товара при удалении позиции.

**Базовый класс формы Form<T>**

Базовый класс для форм. Отвечает за корневой контейнер формы, кнопку отправки и вывод текста ошибок.

Конструктор:

`constructor(container: HTMLElement)` — принимает DOM‑элемент формы.

Поля:

`protected submitButton: HTMLButtonElement` — кнопка отправки (`button[type="submit"]`).​

`protected errorsElement: HTMLElement` — блок для вывода ошибок (.form\_\_errors).​

Методы:

`render(data?: Partial<T>): HTMLElement` — наследуется от Component, позволяет передавать состояние формы и возвращает корневой элемент.

`set valid(value: boolean | undefined)` — включает или отключает кнопку отправки в зависимости от валидности формы.

`set errors(message: string | undefined)` — устанавливает текст ошибки в блоке ошибок; при undefined/пустой строке очищает его.

**Класс Order**

Форма первого шага: способ оплаты и адрес доставки.

Конструктор:

`constructor(container: HTMLElement, events: IEvents)` — принимает DOM‑элемент формы заказа и брокер событий.

Поля:

Наследует поля `Form<T>`.​

`protected cardButton: HTMLButtonElement` — кнопка оплаты «Онлайн».​

`protected cashButton: HTMLButtonElement` — кнопка оплаты «При получении».​

`protected addressInput: HTMLInputElement` — поле адреса.

Методы:

`render(data?: Partial<T>): HTMLElement` — наследуется от Form, подготавливает форму и возвращает её DOM‑элемент.

`set payment(value: TPayment | null | undefined): void` — отмечает выбранный способ оплаты (модификатор button_alt-active). ​

`set address(value: string | undefined): void` — устанавливает адрес доставки.

События:

Изменение способа оплаты или адреса генерирует `order:change`.​

Отправка формы генерирует `order:submit`.

**Класс Contacts**

Форма второго шага: email и телефон.

Конструктор:

`constructor(container: HTMLElement, events: IEvents)` — принимает DOM‑элемент формы контактов и брокер событий.

Поля:

Наследует поля `Form<T>`.​

`protected emailInput: HTMLInputElement` — поле email.​

`protected phoneInput: HTMLInputElement` — поле телефона.

Методы:

`render(data?: Partial<T>): HTMLElement` — наследуется от Form, наполняет форму и возвращает её DOM‑элемент.​

`set email(value: string | undefined): void` — устанавливает email.
​
`set phone(value: string | undefined): void` — устанавливает телефон.

События:

Изменение полей формы генерирует `contacts:change`.​

Отправка формы генерирует `contacts:submit`.

**Класс Success**

Экран успешной оплаты заказа

Конструктор:

`constructor(container: HTMLElement, events: IEvents)` — принимает DOM‑элемент блока успешного заказа и брокер событий.

Поля:

`protected events: IEvents` — брокер событий.

`protected descriptionElement: HTMLElement` — элемент с текстом «Списано N синапсов» (.order-success\_\_description).​

`protected closeButton: HTMLButtonElement` — кнопка закрытия (.order-success\_\_close).​

Методы:

`render(data: { total: number }): HTMLElement` — устанавливает текст Списано {total} синапсов и возвращает корневой элемент окна.

События:

Клик по `closeButton` генерирует событие `success:close`

**События приложения**

События делятся на события моделей данных и сигналы от классов представления. Все события обрабатываются в презентере (src/main.ts).

События моделей данных:

- `catalog:changed` — изменился список товаров каталога (Catalog получил новые items).
- `cart:changed` — изменилось содержимое корзины (добавление/удаление/очистка).

События карточек и превью:

- `card:select` — выбрана карточка товара в каталоге (CardCatalog), в обработчик передаётся объект товара.
- `preview:button-click` — нажата кнопка в карточке детального просмотра (CardPreview), передаётся `{ id }` товара.

События корзины:

- `basket:open` — пользователь открыл корзину (клик по кнопке в Page).
- `basket:item-remove` — удаление товара из корзины (CardBasket внутри Basket вызывает обработчик с `{ id }` товара).
- `basket:order` — пользователь нажал «Оформить» в корзине.

События форм:

- `order:change` — изменены данные формы заказа (способ оплаты или адрес).
- `order:submit` — отправлена форма заказа (переход к шагу контактов).
- `contacts:change` — изменены данные формы контактов (email или телефон).
- `contacts:submit` — отправлена форма контактов (попытка оформить заказ).

События модалки и экрана успеха:

- `modal:close` — модальное окно закрыто пользователем (клик по фону или крестику).
- `success:close` — окно успешного заказа закрыто пользователем.

### Слой презентер (Presenter)

Презентер реализован в файле `src/main.ts` и связывает модели, представления и API через событийную шину `EventEmitter`.

**Инициализация**

- создаются `EventEmitter`, `Page`, `Modal`, `Gallery`;
- инициализируются модели: `Catalog`, `Cart`, `Buyer`;
- создаются `Api` и `ShopApi` c `API_URL`;
- вызывается `shopApi.getProducts()`, и полученные товары передаются в `Catalog` через `catalog.setItems`, что приводит к событию `catalog:changed`.

**Каталог и превью**

На `catalog:changed` презентер:

- берёт массив товаров `items: IProduct[]`;
- для каждого товара клонирует шаблон `#card-catalog`, создаёт `CardCatalog` и вызывает `render` c `{ id, title, price, category, image }`;
- передаёт массив DOM‑карточек в `Gallery` через `gallery.catalog`.

`CardCatalog` при клике эмитит `card:select` с объектом товара. На `card:select` презентер:

- клонирует шаблон `#card-preview`;
- создаёт `CardPreview`, передаёт в `render` данные товара (id, title, price, category, image, description);
- по состоянию корзины (`Cart`) вычисляет, находится ли товар в корзине, и можно ли его купить (`price !== null`), и устанавливает `preview.inCart` и `preview.canPurchase`;
- открывает модалку `modal.open(previewDom)`.

**Корзина**

На `basket:open` презентер:

- клонирует шаблон `#basket`;
- создаёт `Basket`;
- передаёт в `basket.render({ items: cart.getItems(), total: cart.getTotal() })`;
- открывает модальное окно корзины через `modal.open`.

`Basket` для каждой позиции создаёт `CardBasket` и передаёт в него обработчик удаления, который эмитит `basket:item-remove` с `id` товара. На `basket:item-remove` презентер вызывает `cart.removeItem(id)`.

`CardPreview` при клике по кнопке эмитит `preview:button-click` с `id` товара. На `preview:button-click` презентер:

- ищет товар по `id` в `Catalog`;
- если товар недоступен к покупке (`price === null`), игнорирует событие;
- если товар уже есть в корзине — вызывает `cart.removeItem`;
- иначе — `cart.addItem`.

Модель `Cart` при изменениях эмитит `cart:changed`. На `cart:changed` презентер обновляет счётчик в шапке: `page.render({ counter: cart.getCount() })`.

**Заказ (форма #order)**

Нажатие кнопки «Оформить» в корзине приводит к событию `basket:order`. На `basket:order` презентер:

- клонирует шаблон `#order`;
- создаёт `Order` и сохраняет ссылку в `orderView`;
- берёт данные покупателя из `Buyer` (`buyer.getData()`), выполняет валидацию (`buyer.validate()`), учитывая только `payment` и `address`;
- проставляет в `Order` поля `payment`, `address`, а также `valid` и `errors` в зависимости от наличия ошибок;
- открывает форму заказа в модалке через `modal.open`.

На `order:change` презентер:

- обновляет модель `Buyer` через `buyer.setData`;
- снова валидирует только `payment` и `address`;
- если открыт `orderView`, обновляет в нём `payment` (если она изменилась), а также `valid` и `errors`.

На `order:submit`:

- выполняется валидация `Buyer` только по полям `payment` и `address`;
- при наличии ошибок презентер обновляет `orderView.valid = false` и устанавливает `orderView.errors`, не переходя дальше;
- при отсутствии ошибок открывается форма контактов.

**Контакты и успешный заказ**

При успешном `order:submit` презентер:

- клонирует шаблон `#contacts`;
- создаёт `Contacts` и сохраняет ссылку в `contactsView`;
- берёт данные покупателя (`email`, `phone`) из `Buyer`, выполняет полную валидацию всех полей;
- заполняет `contactsView.email`, `contactsView.phone`, а также `valid` и `errors`;
- открывает форму контактов в модалке.

На `contacts:change`:

- обновляет модель `Buyer` через `buyer.setData`;
- выполняет полную валидацию всех полей (payment, address, email, phone);
- если открыт `contactsView`, обновляет `valid` и `errors`.

На `contacts:submit`:

- выполняется полная валидация в `Buyer`;
- если есть ошибки, презентер обновляет `contactsView.valid = false` и `contactsView.errors` и прерывает оформление;
- если ошибок нет, формируется `orderRequest` c данными покупателя, суммой `cart.getTotal()` и массивом `items.map(item => item.id)` и вызывается `shopApi.createOrder(orderRequest)`.

После успешного ответа от API:

- очищаются `Cart` и `Buyer` (`cart.clear()`, `buyer.clear()`);
- счётчик в шапке обновляется через `page.render({ counter: 0 })`;
- по шаблону `#success` создаётся `Success`, вызывается `success.render({ total: result.total })`, и модалка открывается с экраном успешного заказа.

**Управление модалками**

`Modal` при клике по фону или кнопке закрытия эмитит `modal:close`. Презентер на это событие вызывает `modal.close()`, закрывая текущее модальное окно.  
Класс `Success` при клике по кнопке «Закрыть» эмитит `success:close`, на которое презентер также закрывает модалку.

​
