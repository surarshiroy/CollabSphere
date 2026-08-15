import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";

import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";

import {
    getMyNotifications,
    markNotificationAsRead,
    deleteNotification
} from "../services/notificationService";

import { getToken } from "../utils/token";

import "../styles/notifications.css";


function Notifications() {

    // =========================================
    // NOTIFICATIONS
    // =========================================

    const [notifications, setNotifications] =
        useState([]);

    const [loadingNotifications, setLoadingNotifications] =
        useState(true);


    // =========================================
    // WEBSOCKET
    // =========================================

    const stompClientRef = useRef(null);


    // =========================================
    // LOAD NOTIFICATIONS
    // =========================================

    useEffect(() => {

        const loadNotifications = async () => {

            try {

                setLoadingNotifications(true);

                const data =
                    await getMyNotifications();

                setNotifications(data);

            } catch (error) {

                console.error(
                    "Failed to load notifications:",
                    error
                );

                toast.error(
                    error.response?.data ||
                    "Failed to load notifications."
                );

            } finally {

                setLoadingNotifications(false);

            }

        };

        loadNotifications();

    }, []);


    // =========================================
    // WEBSOCKET CONNECTION
    // =========================================

    useEffect(() => {

        const token = getToken();

        if (!token) {
            return;
        }


        const client = new Client({

            brokerURL:
                `wss://collabsphere-08te.onrender.com/ws?token=${encodeURIComponent(token)}`,

            reconnectDelay: 5000,

            onConnect: () => {

                console.log(
                    "Connected to notification WebSocket"
                );


                client.subscribe(
                    "/user/queue/notifications",
                    (message) => {

                        try {

                            const notification =
                                JSON.parse(message.body);


                            setNotifications(
                                previous => [
                                    notification,
                                    ...previous
                                ]
                            );


                            toast(
                                notification.message,
                                {
                                    icon: "🔔"
                                }
                            );

                        } catch (error) {

                            console.error(
                                "Failed to process notification:",
                                error
                            );

                        }

                    }
                );

            },

            onStompError: (frame) => {

                console.error(
                    "Notification WebSocket error:",
                    frame
                );

            },

            onWebSocketError: (error) => {

                console.error(
                    "Notification WebSocket connection error:",
                    error
                );

            }

        });


        stompClientRef.current = client;

        client.activate();


        return () => {

            client.deactivate();

            stompClientRef.current = null;

        };

    }, []);


    // =========================================
    // MARK AS READ
    // =========================================

    const handleMarkAsRead = async (
        notificationId
    ) => {

        try {

            const updatedNotification =
                await markNotificationAsRead(
                    notificationId
                );


            setNotifications(
                previous =>
                    previous.map(notification =>
                        notification.id === notificationId
                            ? updatedNotification
                            : notification
                    )
            );
            toast.success("Notification marked as read!");
            window.dispatchEvent(
    new Event("notificationsUpdated")
);

        } catch (error) {

            console.error(
                "Failed to mark notification as read:",
                error
            );

            if (error.response?.status === 403) {

                toast.error(
                    "You do not have permission to update this notification."
                );

            } else {

                toast.error(
                    error.response?.data ||
                    "Failed to mark notification as read."
                );

            }

        }

    };


    // =========================================
    // DELETE NOTIFICATION
    // =========================================

    const handleDeleteNotification = async (
        notificationId
    ) => {

        try {

            await deleteNotification(
                notificationId
            );


            setNotifications(
                previous =>
                    previous.filter(
                        notification =>
                            notification.id !== notificationId
                    )
            );


            toast.success(
                "Notification deleted."
            );
            window.dispatchEvent(
    new Event("notificationsUpdated")
);

        } catch (error) {

            console.error(
                "Failed to delete notification:",
                error
            );

            if (error.response?.status === 403) {

                toast.error(
                    "You do not have permission to delete this notification."
                );

            } else {

                toast.error(
                    error.response?.data ||
                    "Failed to delete notification."
                );

            }

        }

    };


    // =========================================
    // FORMAT DATE
    // =========================================

    const formatNotificationDate = (
        createdAt
    ) => {

        if (!createdAt) {
            return "";
        }


        const date =
    new Date(`${createdAt}Z`);


        const now =
            new Date();


        const difference =
            Math.floor(
                (now - date) / 1000
            );


        if (difference < 60) {
            return "Just now";
        }


        if (difference < 3600) {

            const minutes =
                Math.floor(
                    difference / 60
                );

            return `${minutes} ${
                minutes === 1
                    ? "minute"
                    : "minutes"
            } ago`;

        }


        if (difference < 86400) {

            const hours =
                Math.floor(
                    difference / 3600
                );

            return `${hours} ${
                hours === 1
                    ? "hour"
                    : "hours"
            } ago`;

        }


        if (difference < 604800) {

            const days =
                Math.floor(
                    difference / 86400
                );

            return `${days} ${
                days === 1
                    ? "day"
                    : "days"
            } ago`;

        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    };


    // =========================================
    // UNREAD COUNT
    // =========================================

    const unreadCount =
        notifications.filter(
            notification =>
                !notification.read
        ).length;


    // =========================================
    // LOADING
    // =========================================

    if (loadingNotifications) {

        return (

            <div className="notifications-layout">

                <Sidebar />

                <main className="notifications-page">

                    <div className="notifications-loading">

                        <i className="bi bi-arrow-repeat"></i>

                        <h2>
                            Loading notifications...
                        </h2>

                        <p>
                            Getting your latest notifications.
                        </p>

                    </div>

                </main>

            </div>

        );

    }


    // =========================================
    // PAGE
    // =========================================

    return (

        <div className="notifications-layout">

            <Sidebar />


            <main className="notifications-page">

                {/* =================================
                    HEADER
                ================================= */}

                <div className="notifications-header">

                    <div>

                        <h1>
                            Notifications
                        </h1>

                        <p>
                            Stay updated with what's happening in your workspace.
                        </p>

                    </div>


                    {unreadCount > 0 && (

                        <div className="notifications-count">

                            <i className="bi bi-bell-fill"></i>

                            {unreadCount} unread

                        </div>

                    )}

                </div>


                {/* =================================
                    NOTIFICATIONS
                ================================= */}

                {notifications.length === 0 ? (

                    <div className="notifications-empty">

                        <div className="notifications-empty-icon">

                            <i className="bi bi-bell-slash"></i>

                        </div>

                        <h2>
                            No notifications
                        </h2>

                        <p>
                            You're all caught up!
                        </p>

                    </div>

                ) : (

                    <div className="notifications-list">

                        {notifications.map(
                            (notification) => (

                                <div
                                    key={notification.id}
                                    className={
                                        `notification-item ${
                                            notification.read
                                                ? ""
                                                : "notification-unread"
                                        }`
                                    }
                                >

                                    <div className="notification-icon">

                                        <i className="bi bi-bell-fill"></i>

                                    </div>


                                    <div className="notification-content">

                                        <p>
                                            {notification.message}
                                        </p>

                                        <span>
                                            {formatNotificationDate(
                                                notification.createdAt
                                            )}
                                        </span>

                                    </div>


                                    <div className="notification-actions">

                                        {!notification.read && (

                                            <button
                                                type="button"
                                                className="notification-read-button"
                                                onClick={() =>
                                                    handleMarkAsRead(
                                                        notification.id
                                                    )
                                                }
                                                title="Mark as read"
                                            >

                                                <i className="bi bi-check2"></i>

                                            </button>

                                        )}


                                        <button
                                            type="button"
                                            className="notification-delete-button"
                                            onClick={() =>
                                                handleDeleteNotification(
                                                    notification.id
                                                )
                                            }
                                            title="Delete notification"
                                        >

                                            <i className="bi bi-trash3"></i>

                                        </button>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </main>

        </div>

    );

}

export default Notifications;