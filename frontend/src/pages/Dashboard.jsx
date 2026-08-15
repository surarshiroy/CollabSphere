import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/dashboard.css";
import Sidebar from "../components/Sidebar";

import { getMyTeams } from "../services/teamService";
import { getProjectsByTeam } from "../services/projectService";
import { getTasksByProject } from "../services/taskService";

function Dashboard() {

    const navigate = useNavigate();

    const name = localStorage.getItem("userName");

    const [teamCount, setTeamCount] = useState(0);
    const [projectCount, setProjectCount] = useState(0);

    const [loadingStats, setLoadingStats] = useState(true);
    const [taskCount, setTaskCount] = useState(0);
const [completedCount, setCompletedCount] = useState(0);

    // Controls whether Create Project is visible
    const [canCreateProject, setCanCreateProject] = useState(false);


    // ========================================
    // LOAD DASHBOARD STATS
    // ========================================

    useEffect(() => {

        const loadStats = async () => {

            try {

                // Get user's teams
                const teams = await getMyTeams();

                setTeamCount(teams.length);


                // ========================================
                // CHECK PROJECT CREATION PERMISSION
                // ========================================

                const hasProjectPermission = teams.some(
                    (team) =>
                        team.role === "OWNER" ||
                        team.role === "ADMIN"
                );

                setCanCreateProject(hasProjectPermission);


                // ========================================
                // GET PROJECTS FROM EVERY TEAM
                // ========================================

                let totalProjects = 0;
                let totalTasks = 0;
let totalCompleted = 0;

                for (const team of teams) {

                    try {

                        const projects =
                            await getProjectsByTeam(team.id);

                        totalProjects += projects.length;
                        for (const project of projects) {

    try {

        const tasks =
            await getTasksByProject(project.id);

        totalTasks += tasks.length;

        totalCompleted += tasks.filter(
            (task) => task.status === "DONE"
        ).length;

    } catch (error) {

        console.error(
            `Failed to load tasks for project ${project.id}:`,
            error
        );

    }

}

                    } catch (error) {

                        console.error(
                            `Failed to load projects for team ${team.id}:`,
                            error
                        );

                    }

                }

                setProjectCount(totalProjects);
                setTaskCount(totalTasks);

setCompletedCount(totalCompleted);

            } catch (error) {

                console.error(
                    "Failed to load dashboard stats:",
                    error
                );

            } finally {

                setLoadingStats(false);

            }

        };


        loadStats();

    }, []);


    return (

        <div className="dashboard-layout">

            <Sidebar />


            <div className="dashboard">

                {/* ================= HEADER ================= */}

                <div className="dashboard-header">

                    <h1>
                        Welcome back, {name} 👋
                    </h1>

                    <p>
                        Ready to collaborate today?
                    </p>

                </div>


                {/* ================= STATS ================= */}

                <div className="stats-grid">


                    <div className="stat-card">

                        <h2>
                            Projects
                        </h2>

                        <span>
                            {loadingStats
                                ? "..."
                                : projectCount}
                        </span>

                    </div>


                    <div className="stat-card">

                        <h2>
                            Teams
                        </h2>

                        <span>
                            {loadingStats
                                ? "..."
                                : teamCount}
                        </span>

                    </div>


                    <div className="stat-card">

                        <h2>
                            Tasks
                        </h2>

                        <span>
                           {loadingStats
        ? "..."
        : taskCount}
                        </span>

                    </div>


                    <div className="stat-card">

                        <h2>
                            Completed
                        </h2>

                        <span>
                            {loadingStats
        ? "..."
        : completedCount}
                        </span>

                    </div>


                </div>


                {/* ================= QUICK ACTIONS ================= */}

                <div className="quick-actions">

                    <h2>
                        Quick Actions
                    </h2>


                    {canCreateProject && (

                        <button
                            className="create-btn"
                            onClick={() =>
                                navigate("/projects")
                            }
                        >

                            + Create Project

                        </button>

                    )}

                </div>


            


            </div>

        </div>

    );

}

export default Dashboard;