import { Item } from "@prisma/client";
import { ApiResponsePromise } from "../../types/api-response";

export interface CreateItemArgs {
  name: string;
  category: number;
  price: number;
}

export interface UpdateItemArgs {
  id: number;
  name: string;
  category: number;
  price: number;
}

export interface DeleteItemArgs {
  id: number;
}

export type ItemResponse = ApiResponsePromise<Item>;
export type ItemsResponse = ApiResponsePromise<Item[]>;

export interface ItemApi {
  items(): ItemsResponse;
  create(args: CreateItemArgs): ItemResponse;
  update(args: UpdateItemArgs): ItemResponse;
  delete(args: DeleteItemArgs): ItemResponse;
}
