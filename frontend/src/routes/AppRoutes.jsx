import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";

import Dashboard from "../pages/Dashboard";

import Teams from "../pages/Teams";
import TeamDetails from "../pages/TeamDetails";

import Projects from "../pages/Projects";
import ProjectDetails from "../pages/ProjectDetails";

import Tasks from "../pages/Tasks";
import Profile from "../pages/Profile";
import Notifications from "../pages/Notifications";


function AppRoutes() {

    return (

        <BrowserRouter>

            <Routes>

                {/* =========================================
                    DEFAULT
                ========================================= */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />


                {/* =========================================
                    AUTHENTICATION
                ========================================= */}

                <Route
                    path="/login"
                    element={
                        <Login />
                    }
                />

                <Route
                    path="/register"
                    element={
                        <Register />
                    }
                />


                {/* =========================================
                    DASHBOARD
                ========================================= */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    TEAMS
                ========================================= */}

                <Route
                    path="/teams"
                    element={
                        <ProtectedRoute>
                            <Teams />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teams/:teamId"
                    element={
                        <ProtectedRoute>
                            <TeamDetails />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    PROJECTS
                ========================================= */}

                <Route
                    path="/projects"
                    element={
                        <ProtectedRoute>
                            <Projects />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/projects/:projectId"
                    element={
                        <ProtectedRoute>
                            <ProjectDetails />
                        </ProtectedRoute>
                    }
                />


                {/* =========================================
                    TASKS
                ========================================= */}

                <Route
                    path="/tasks"
                    element={
                        <ProtectedRoute>
                            <Tasks />
                        </ProtectedRoute>
                    }
                />
                {/* =========================================
    PROFILE
========================================= */}

<Route
    path="/profile"
    element={
        <ProtectedRoute>
            <Profile />
        </ProtectedRoute>
    }
/>
<Route
    path="/notifications"
    element={
        <ProtectedRoute>
            <Notifications />
        </ProtectedRoute>
    }
/>

            </Routes>

        </BrowserRouter>

    );

}


export default AppRoutes;