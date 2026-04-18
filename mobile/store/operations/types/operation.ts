export enum OperationType {
  CREATE_LIST = "CREATE_LIST",
  SET_LIST_MODE = "SET_LIST_MODE",
}

export type Operation<T = Record<string, any>> = {
  id: string;
  type: OperationType;
  actorId: string;
  payload: T;
  sequence: number;
};
