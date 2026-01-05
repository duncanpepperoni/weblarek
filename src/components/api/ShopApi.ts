import { Api } from "../base/Api";
import { IProductsResponse, IOrderRequest, IOrderResponse } from "../../types";

export class ShopApi {
  private api: Api;

  constructor(baseUrl: string) {
    this.api = new Api(baseUrl);
  }

  getProducts(): Promise<IProductsResponse> {
    return this.api.get<IProductsResponse>("/product/");
  }

  createOrder(order: IOrderRequest): Promise<IOrderResponse> {
    return this.api.post<IOrderResponse>("/order", order);
  }
}
