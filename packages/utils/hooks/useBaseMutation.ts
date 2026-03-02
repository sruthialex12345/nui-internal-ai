/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "@repo/ui";

export type UseBaseMutationConfig = {
  successMessage?: string | true;
  failureMessage?: string | true;
  invalidateQueries?: string[];
  onSuccessCallback?: (response: any, request: any, statusCode: number) => void;
  onErrorCallback?: (error: unknown, statusCode: number) => void;
};

type MutationFn<TData, TVariables> = (variables: TVariables) => Promise<TData>;

interface ApiResponse<T> {
  data?: T;
  errors?: any[];
  status?: number;
}

const useBaseMutation = <
  TData = unknown,
  TVariables = void,
  TError = Error,
  TContext = unknown,
>(
  mutationFn: MutationFn<TData, TVariables>,
  config?: UseBaseMutationConfig,
  options?: Omit<
    UseMutationOptions<TData, TError, TVariables, TContext>,
    "mutationFn" | "onSuccess" | "onError"
  >
): UseMutationResult<TData, TError, TVariables, TContext> => {
  const cache = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  const {
    successMessage,
    failureMessage,
    invalidateQueries,
    onSuccessCallback,
    onErrorCallback,
  } = config || {};

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    onSuccess: (response, request) => {
      const apiResponse = response as ApiResponse<TData>;
      if (apiResponse?.errors?.length) {
        const errMessage =
          typeof failureMessage === "string"
            ? failureMessage
            : "An unknown error has occurred";
        showErrorToast(errMessage);
        onErrorCallback?.(apiResponse, apiResponse.status || 500);
        return;
      }

      if (invalidateQueries?.length) {
        invalidateQueries.forEach((queryKey) => {
          cache.invalidateQueries({ queryKey: [queryKey] });
        });
      }

      if (successMessage) {
        const message =
          typeof successMessage === "string"
            ? successMessage
            : "Operation completed successfully";
        showSuccessToast(message);
      }

      onSuccessCallback?.(response, request, apiResponse.status || 200);
    },
    onError: (error) => {
      const statusCode = (error as any)?.response?.status || 500;
      if (failureMessage) {
        const message =
          typeof failureMessage === "string"
            ? failureMessage
            : (error as any)?.response?.data?.title ||
              "An unknown error has occurred";
        showErrorToast(message);
      }
      onErrorCallback?.(error, statusCode);
    },
    ...options,
  });
};

export default useBaseMutation;
