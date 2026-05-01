export type OperationHandler<S, O> = (state: S, operation: O) => void;
