
import React, { useState } from "react";
import "./NotificationsPage.css";

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: "Order Delivered 🎉",
    message: "Your order #NS1023 has been delivered successfully.",
    type: "orders",
    time: "2h ago",
    unread: true,
  },
  {
    id: 2,
    title: "20% OFF Nearby!",
    message: "FreshMart is offering 20% discount near you.",
    type: "offers",
    time: "5h ago",
    unread: true,
  },
  {
    id: 3,
    title: "Payment Received",
    message: "₹560 paid successfully for order #NS1021.",
    type: "system",
    time: "Yesterday",
    unread: false,
  },
];

const TABS = ["all", "orders", "offers", "system"];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(
    INITIAL_NOTIFICATIONS
  );
  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter(
          (notification) => notification.type === activeTab
        );

  const markAsRead = (id) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((previous) =>
      previous.filter((notification) => notification.id !== id)
    );
  };

  return (
    <main className="notification-container">
      <section className="nearshop-notifications-page">
        {/* Header */}
        <header className="notifications-header">
          <div>
            <h2>Notifications</h2>
            <p>
              {unreadCount} unread notification
              {unreadCount !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            Mark all as read
          </button>
        </header>

        {/* Category tabs */}
        <div
          className="notification-tabs"
          role="group"
          aria-label="Filter notifications"
        >
          {TABS.map((tab) => (
            <button
              type="button"
              key={tab}
              className={activeTab === tab ? "active" : ""}
              aria-pressed={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <div className="notification-list">
          {filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <div aria-hidden="true">🔔</div>
              <p>No notifications here</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <article
                key={notification.id}
                className={`notification-card ${
                  notification.unread ? "unread" : ""
                }`}
              >
                <div className="notification-left">
                  <span className={`badge ${notification.type}`}>
                    {notification.type}
                  </span>

                  <div>
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <small>{notification.time}</small>
                  </div>
                </div>

                <div className="notification-actions">
                  {notification.unread && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark Read
                    </button>
                  )}

                  <button
                    type="button"
                    className="danger"
                    onClick={() =>
                      deleteNotification(notification.id)
                    }
                    aria-label={`Delete ${notification.title}`}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
