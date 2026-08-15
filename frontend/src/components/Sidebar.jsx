import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { getMyNotifications } from "../services/notificationService";
import { getToken } from "../utils/token";
import { NavLink, useNavigate } from "react-router-dom";
import { removeToken } from "../utils/token";
import "../styles/sidebar.css";

function Sidebar() {

    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [unreadNotificationCount, setUnreadNotificationCount] =
    useState(0);

const stompClientRef = useRef(null);
useEffect(() => {

    const loadUnreadNotifications = async () => {

        try {

            const notifications =
                await getMyNotifications();

            const unreadCount =
                notifications.filter(
                    (notification) =>
                        !notification.read
                ).length;

            setUnreadNotificationCount(
                unreadCount
            );

        } catch (error) {

            console.error(
                "Failed to load notification count:",
                error
            );

        }

    };
    


    loadUnreadNotifications();
    window.addEventListener(
    "notificationsUpdated",
    loadUnreadNotifications
);


    const token = getToken();

    if (!token) {
    return () => {
        window.removeEventListener(
            "notificationsUpdated",
            loadUnreadNotifications
        );
    };
}


    const client = new Client({

        brokerURL:
            `wss://collabsphere-08te.onrender.com/ws?token=${encodeURIComponent(token)}`,

        reconnectDelay: 5000,

        onConnect: () => {

            client.subscribe(
                "/user/queue/notifications",
                (message) => {

                    try {

                        const notification =
                            JSON.parse(message.body);

                        if (!notification.read) {

                            setUnreadNotificationCount(
                                previous =>
                                    previous + 1
                            );

                        }

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

        window.removeEventListener(
            "notificationsUpdated",
            loadUnreadNotifications
        );

        client.deactivate();

        stompClientRef.current = null;

    };

}, []);

    const logout = () => {

        removeToken();

        localStorage.clear();

        navigate("/");

    };

    const closeSidebar = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* Mobile Header */}

            <div className="mobile-header">

                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsOpen(true)}
                >
                    <i className="bi bi-list"></i>
                </button>

                <div className="mobile-logo">

                    <i className="bi bi-diagram-3-fill"></i>

                    <span>CollabSphere</span>

                </div>

            </div>


            {/* Overlay */}

            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeSidebar}
                ></div>
            )}


            {/* Sidebar */}

            <div className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>

                <div className="sidebar-logo">

                    <i className="bi bi-diagram-3-fill"></i>

                    <h3>CollabSphere</h3>

                    {/* Mobile Close Button */}

                    <button
                        className="sidebar-close-btn"
                        onClick={closeSidebar}
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>

                </div>


                <nav>

                    <NavLink
                        to="/dashboard"
                        onClick={closeSidebar}
                    >
                        <i className="bi bi-house-door-fill"></i>
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/projects"
                        onClick={closeSidebar}
                    >
                        <i className="bi bi-kanban-fill"></i>
                        Projects
                    </NavLink>

                    <NavLink
                        to="/teams"
                        onClick={closeSidebar}
                    >
                        <i className="bi bi-people-fill"></i>
                        Teams
                    </NavLink>

                    <NavLink
                        to="/tasks"
                        onClick={closeSidebar}
                    >
                        <i className="bi bi-check2-square"></i>
                        Tasks
                    </NavLink>

                  <NavLink
    to="/notifications"
    onClick={closeSidebar}
>
    <i className="bi bi-bell-fill"></i>

    <span className="sidebar-notification-label">
        Notifications

        {unreadNotificationCount > 0 && (
            <span className="notification-badge">
                {unreadNotificationCount > 99
                    ? "99+"
                    : unreadNotificationCount}
            </span>
        )}
    </span>

</NavLink>

                    <NavLink
                        to="/profile"
                        onClick={closeSidebar}
                    >
                        <i className="bi bi-person-circle"></i>
                        Profile
                    </NavLink>

                </nav>


                <button
                    className="logout-btn"
                    onClick={logout}
                >
                    <i className="bi bi-box-arrow-right"></i>

                    Logout
                </button>

            </div>
        </>
    );
}

export default Sidebar;