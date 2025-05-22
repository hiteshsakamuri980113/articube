import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../hooks/reduxHooks";
import {
  removeNotification,
  NotificationType,
} from "../../store/slices/notificationSlice";
import ErrorMessage from "./ErrorMessage";

interface NotificationItemProps {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  autoClose?: boolean;
  duration?: number;
  onClose: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  type,
  title,
  message,
  autoClose = true,
  duration = 5000,
  onClose,
}) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, autoClose, duration, onClose]);

  const getBackgroundColor = () => {
    switch (type) {
      case NotificationType.SUCCESS:
        return "bg-green-100 border-green-500 text-green-800";
      case NotificationType.ERROR:
        return "bg-red-100 border-red-500 text-red-800";
      case NotificationType.WARNING:
        return "bg-yellow-100 border-yellow-500 text-yellow-800";
      case NotificationType.INFO:
      default:
        return "bg-blue-100 border-blue-500 text-blue-800";
    }
  };

  const getIcon = () => {
    switch (type) {
      case NotificationType.SUCCESS:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case NotificationType.ERROR:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case NotificationType.WARNING:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-yellow-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case NotificationType.INFO:
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={`flex items-start p-4 mb-4 rounded-lg border-l-4 shadow-lg backdrop-blur-lg bg-opacity-80 transition-all duration-300 ease-in-out ${getBackgroundColor()}`}
      role="alert"
    >
      <div className="flex-shrink-0 mr-3">{getIcon()}</div>

      <div className="flex-1">
        {title && <h3 className="font-semibold text-lg">{title}</h3>}
        {type === NotificationType.ERROR ? (
          <ErrorMessage error={message} className="text-sm" />
        ) : (
          <p className="text-sm">{message}</p>
        )}
      </div>

      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8 items-center justify-center"
        onClick={() => onClose(id)}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

const NotificationContainer: React.FC = () => {
  const notifications = useAppSelector(
    (state) => state.notification.notifications
  );
  const dispatch = useAppDispatch();

  const handleClose = (id: string) => {
    dispatch(removeNotification(id));
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-4">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          {...notification}
          onClose={handleClose}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
