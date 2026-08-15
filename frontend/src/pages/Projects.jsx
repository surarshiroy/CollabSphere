import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getMyTeams } from "../services/teamService";
import {
    getProjectsByTeam,
    createProject
} from "../services/projectService";
import "../styles/projects.css";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Projects() {

    const navigate = useNavigate();

    const [teams, setTeams] = useState([]);
    const [projects, setProjects] = useState([]);

    const [loading, setLoading] = useState(true);
    const [projectsLoading, setProjectsLoading] = useState(false);

    const [showCreateModal, setShowCreateModal] = useState(false);

    const [selectedTeam, setSelectedTeam] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: ""
    });

    const [error, setError] = useState("");


    // --------------------------------
    // Check if user can create projects
    // --------------------------------

   const authorizedTeams = teams.filter(
    (team) =>
        team.role === "OWNER" ||
        team.role === "ADMIN"
);

const canCreateProject = authorizedTeams.length > 0;


    // --------------------------------
    // Load teams
    // --------------------------------

    const loadTeams = async () => {

        try {

            const data = await getMyTeams();
            console.log("MY TEAMS:", data);

            setTeams(data);

        } catch (error) {

            console.error("Failed to load teams:", error);

            setError("Failed to load teams.");

        } finally {

            setLoading(false);

        }

    };


    // --------------------------------
    // Load projects from all teams
    // --------------------------------

    const loadProjects = async (teamList) => {

        try {

            setProjectsLoading(true);

            const allProjects = [];

            for (const team of teamList) {

                try {

                    const teamProjects =
                        await getProjectsByTeam(team.id);

                    const projectsWithTeam =
                        teamProjects.map((project) => ({
                            ...project,
                            teamId: team.id,
                            teamName: team.name
                        }));

                    allProjects.push(...projectsWithTeam);

                } catch (error) {

                    console.error(
                        `Failed to load projects for team ${team.id}:`,
                        error
                    );

                }

            }

            setProjects(allProjects);

        } finally {

            setProjectsLoading(false);

        }

    };


    // --------------------------------
    // Initial load
    // --------------------------------

    useEffect(() => {

        const loadData = async () => {

            try {

                const data = await getMyTeams();

                setTeams(data);

                await loadProjects(data);

            } catch (error) {

                console.error(
                    "Failed to load project data:",
                    error
                );

                setError("Failed to load projects.");

            } finally {

                setLoading(false);

            }

        };

        loadData();

    }, []);


    // --------------------------------
    // Form change
    // --------------------------------

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    // --------------------------------
    // Create project
    // --------------------------------

    const handleCreateProject = async (e) => {

        e.preventDefault();

        if (!selectedTeam) {

            toast.error("Please select a team.");

            return;

        }

        // Find selected team
        const selectedTeamData = teams.find(
            (team) => String(team.id) === String(selectedTeam)
        );

        // Extra frontend permission check
        if (
            !selectedTeamData ||
            (
                selectedTeamData.role !== "OWNER" &&
                selectedTeamData.role !== "ADMIN"
            )
        ) {

            toast.error(
                "You do not have permission to create a project for this team."
            );

            return;

        }

        try {

            setProjectsLoading(true);

            await createProject(
                selectedTeam,
                formData
            );

            // Reload projects
            await loadProjects(teams);

            // Reset form
            setFormData({
                name: "",
                description: ""
            });

            setSelectedTeam("");

            setShowCreateModal(false);

            toast.success("Project created successfully!");

        } catch (error) {

            console.error(
                "Failed to create project:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                error.response?.data ||
                "Failed to create project."
            );

        } finally {

            setProjectsLoading(false);

        }

    };


    // --------------------------------
    // Loading
    // --------------------------------

    if (loading) {

        return (

            <div className="dashboard-layout">

                <Sidebar />

                <main className="projects-page">

                    <div className="projects-loading">

                        <i className="bi bi-arrow-repeat"></i>

                        <h2>
                            Loading projects...
                        </h2>

                        <p>
                            Getting your projects.
                        </p>

                    </div>

                </main>

            </div>

        );

    }


    return (

        <div className="dashboard-layout">

            <Sidebar />

            <main className="projects-page">


                {/* ================= HEADER ================= */}

                <div className="projects-header">

                    <div>

                        <h1>Projects</h1>

                        <p>
                            Create and manage your team's projects.
                        </p>

                    </div>


                    {/* Only OWNER / ADMIN can see this */}

                    {canCreateProject && (

                        <button
                            className="create-project-btn"
                            onClick={() =>
                                setShowCreateModal(true)
                            }
                        >

                            <i className="bi bi-folder-plus"></i>

                            Create Project

                        </button>

                    )}

                </div>


                {/* ================= ERROR ================= */}

                {error && (

                    <div className="projects-error">

                        {error}

                    </div>

                )}


                {/* ================= PROJECTS ================= */}

                {projectsLoading && projects.length === 0 ? (

                    <div className="projects-empty">

                        <div className="projects-empty-icon">

                            <i className="bi bi-arrow-repeat"></i>

                        </div>

                        <h2>Loading projects...</h2>

                    </div>

                ) : projects.length === 0 ? (

                    <div className="projects-empty">

                        <div className="projects-empty-icon">

                            <i className="bi bi-folder2-open"></i>

                        </div>

                        <h2>No projects yet</h2>

                        <p>
                            Create your first project to get started.
                        </p>


                        {/* Only OWNER / ADMIN can see this */}

                        {canCreateProject && (

                            <button
                                className="create-project-btn"
                                onClick={() =>
                                    setShowCreateModal(true)
                                }
                            >

                                <i className="bi bi-plus-lg"></i>

                                Create Project

                            </button>

                        )}

                    </div>

                ) : (

                    <div className="projects-grid">

                        {projects.map((project) => (

                            <div
                                key={project.id}
                                className="project-card"
                                onClick={() =>
                                    navigate(`/projects/${project.id}`)
                                }
                            >

                                <div className="project-card-top">

                                    <div className="project-icon">

                                        <i className="bi bi-folder-fill"></i>

                                    </div>


                                    <span
                                        className={`project-status ${project.status?.toLowerCase()}`}
                                    >

                                        {project.status}

                                    </span>

                                </div>


                                <div className="project-card-content">

                                    <h2>
                                        {project.name}
                                    </h2>

                                    <p>
                                        {project.description ||
                                            "No description provided."}
                                    </p>

                                </div>


                                <div className="project-card-footer">

                                    <div className="project-team">

                                        <i className="bi bi-people-fill"></i>

                                        <span>
                                            {project.teamName}
                                        </span>

                                    </div>


                                    <div className="project-creator">

                                        Created by{" "}

                                        <strong>
                                            {project.createdBy}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}


                {/* ================= CREATE MODAL ================= */}

                {showCreateModal && (

                    <div
                        className="project-modal-overlay"
                        onClick={() =>
                            setShowCreateModal(false)
                        }
                    >

                        <div
                            className="project-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >


                            <div className="project-modal-header">

                                <div>

                                    <h2>
                                        Create Project
                                    </h2>

                                    <p>
                                        Start a new project for your team.
                                    </p>

                                </div>


                                <button
                                    className="project-modal-close"
                                    onClick={() =>
                                        setShowCreateModal(false)
                                    }
                                >

                                    <i className="bi bi-x-lg"></i>

                                </button>

                            </div>


                            <form
                                onSubmit={handleCreateProject}
                            >


                                {/* PROJECT NAME */}

                                <div className="project-form-group">

                                    <label>
                                        Project Name
                                    </label>

                                    <div className="project-input-group">

                                        <span>

                                            <i className="bi bi-folder-fill"></i>

                                        </span>

                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter project name"
                                            required
                                        />

                                    </div>

                                </div>


                                {/* DESCRIPTION */}

                                <div className="project-form-group">

                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Describe your project..."
                                        rows="4"
                                    />

                                </div>


                                {/* TEAM */}

                                <div className="project-form-group">

                                    <label>
                                        Team
                                    </label>

                                    <div className="project-input-group">

                                        <span>

                                            <i className="bi bi-people-fill"></i>

                                        </span>

                                        <select
                                            value={selectedTeam}
                                            onChange={(e) =>
                                                setSelectedTeam(
                                                    e.target.value
                                                )
                                            }
                                            required
                                        >

                                            <option value="">
                                                Select a team
                                            </option>


                                            {/* 
                                                Only show teams where
                                                current user is OWNER
                                                or ADMIN
                                            */}

                                            {authorizedTeams
                                                .filter(
                                                    (team) =>
                                                        team.role === "OWNER" ||
                                                        team.role === "ADMIN"
                                                )
                                                .map((team) => (

                                                    <option
                                                        key={team.id}
                                                        value={team.id}
                                                    >

                                                        {team.name}

                                                    </option>

                                                ))}

                                        </select>

                                    </div>

                                </div>


                                {/* ACTIONS */}

                                <div className="project-modal-actions">

                                    <button
                                        type="button"
                                        className="project-cancel-btn"
                                        onClick={() =>
                                            setShowCreateModal(false)
                                        }
                                    >

                                        Cancel

                                    </button>


                                    <button
                                        type="submit"
                                        className="create-project-btn"
                                        disabled={projectsLoading}
                                    >

                                        <i className="bi bi-folder-plus"></i>

                                        {projectsLoading
                                            ? "Creating..."
                                            : "Create Project"}

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

            </main>

        </div>

    );

}

export default Projects;