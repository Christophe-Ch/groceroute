import { Operation } from "./operation";

export type SetListModeOperation = Operation<{
  id: string;
  mode: "edit" | "play";
}>;
