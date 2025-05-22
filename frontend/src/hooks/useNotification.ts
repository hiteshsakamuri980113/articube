import { useCallback } from "react";
import { useAppDispatch } from "./reduxHooks";
import {
  addNotification,
  NotificationType,
} from "../store/slices/notificationSlice";

export function useNotification() {
  const dispatch = useAppDispatch();

  const showNotification = useCallback(
    (
      message: string,
      type: NotificationType = NotificationType.INFO,
      title?: string,
      options?: { autoClose?: boolean; duration?: number }
    ) => {
      dispatch(
        addNotification({
          message,
          type,
          title,
          ...options,
        })
      );
    },
    [dispatch]
  );

  const showSuccess = useCallback(
    (
      message: string,
      title?: string,
      options?: { autoClose?: boolean; duration?: number }
    ) => {
      showNotification(message, NotificationType.SUCCESS, title, options);
    },
    [showNotification]
  );

  const showError = useCallback(
    (
      message: string,
      title?: string,
      options?: { autoClose?: boolean; duration?: number }
    ) => {
      showNotification(message, NotificationType.ERROR, title, options);
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (
      message: string,
      title?: string,
      options?: { autoClose?: boolean; duration?: number }
    ) => {
      showNotification(message, NotificationType.INFO, title, options);
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (
      message: string,
      title?: string,
      options?: { autoClose?: boolean; duration?: number }
    ) => {
      showNotification(message, NotificationType.WARNING, title, options);
    },
    [showNotification]
  );

  return { showNotification, showSuccess, showError, showInfo, showWarning };
}
