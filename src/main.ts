import "./scss/styles.scss";

import { Catalog } from "../src/components/models/Catalog";
import { Cart } from "../src/components/models/Cart";
import { Buyer } from "../src/components/models/Buyer";
import { apiProducts } from "../src/utils/data";
import { API_URL } from "../src/utils/constants";
import { ShopApi } from "../src/components/api/ShopApi";

// Создаём модели
const catalog = new Catalog();
const cart = new Cart();
const buyer = new Buyer();

console.log("=== ТЕСТ МОДЕЛИ CATALOG ===");

// setItems / getItems
catalog.setItems(apiProducts.items);
console.log("Catalog.getItems():", catalog.getItems());

// getItem
const firstId = apiProducts.items[0]?.id;
if (firstId) {
  console.log("Catalog.getItem(firstId):", catalog.getItem(firstId));
}

// setSelectedItem / getSelectedItem
if (firstId) {
  const product = catalog.getItem(firstId) ?? null;
  catalog.setSelectedItem(product);
  console.log("Catalog.getSelectedItem():", catalog.getSelectedItem());
}

console.log("=== ТЕСТ МОДЕЛИ CART ===");

// getItems (пустая корзина)
console.log("Cart.getItems() (пусто):", cart.getItems());
console.log("Cart.getTotal() (пусто):", cart.getTotal());
console.log("Cart.getCount() (пусто):", cart.getCount());

// addItem / hasItem
const firstProduct = apiProducts.items[0];
const secondProduct = apiProducts.items[1];

if (firstProduct) {
  cart.addItem(firstProduct);
  console.log("Cart.addItem(firstProduct)");
  console.log("Cart.hasItem(firstProduct.id):", cart.hasItem(firstProduct.id));
}

if (secondProduct) {
  cart.addItem(secondProduct);
  console.log("Cart.addItem(secondProduct)");
}

console.log("Cart.getItems():", cart.getItems());
console.log("Cart.getTotal():", cart.getTotal());
console.log("Cart.getCount():", cart.getCount());

// removeItem
if (firstProduct) {
  cart.removeItem(firstProduct.id);
  console.log("Cart.removeItem(firstProduct.id)");
  console.log("Cart.getItems() после удаления:", cart.getItems());
  console.log("Cart.getTotal() после удаления:", cart.getTotal());
  console.log("Cart.getCount() после удаления:", cart.getCount());
}

// clear
cart.clear();
console.log("Cart.clear()");
console.log("Cart.getItems() после очистки:", cart.getItems());

console.log("=== ТЕСТ МОДЕЛИ BUYER ===");

// getData / validate на пустых данных
console.log("Buyer.getData() (пусто):", buyer.getData());
console.log("Buyer.validate() (пусто):", buyer.validate());

// setData (частично)
buyer.setData({ email: "test@test.ru" });
console.log("Buyer.setData({ email })");
console.log("Buyer.getData() после частичного setData:", buyer.getData());
console.log("Buyer.validate() после частичного setData:", buyer.validate());

// setData (полностью)
buyer.setData({
  payment: "online",
  phone: "+71234567890",
  address: "Spb, Nevsky 1",
});
console.log("Buyer.setData(все поля)");
console.log("Buyer.getData() (все поля):", buyer.getData());
console.log("Buyer.validate() (все поля):", buyer.validate());

// clear
buyer.clear();
console.log("Buyer.clear()");
console.log("Buyer.getData() после clear:", buyer.getData());

console.log("=== ТЕСТ СЛОЯ КОММУНИКАЦИИ ===");

const shopApi = new ShopApi(API_URL);

shopApi
  .getProducts()
  .then((response) => {
    console.log("ShopApi.getProducts() ответ сервера:", response);
    catalog.setItems(response.items);
    console.log(
      "Catalog.getItems() после ShopApi.getProducts():",
      catalog.getItems()
    );
  })
  .catch((error) => {
    console.error(
      "Ошибка при запросе каталога через ShopApi.getProducts():",
      error
    );
  });
