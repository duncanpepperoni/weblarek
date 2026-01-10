import {
  IApi,
  IProductsResponse,
  IOrderRequest,
  IOrderResponse,
  IProduct,
} from "../../types";
import { CDN_URL } from "../../utils/constants";

export class ShopApi {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  getProducts(): Promise<IProductsResponse> {
    return this.api.get<IProductsResponse>("/product/").then((data) => ({
      total: data.total,
      items: data.items.map((item: IProduct) => ({
        ...item,
        // если путь относительный вроде "/5_Dots.svg" — дополняем через CDN_URL
        image: /^https?:\/\//.test(item.image)
          ? item.image
          : `${CDN_URL}${item.image}`,
      })),
    }));
  }

  createOrder(order: IOrderRequest): Promise<IOrderResponse> {
    return this.api.post<IOrderResponse>("/order", order);
  }
}
