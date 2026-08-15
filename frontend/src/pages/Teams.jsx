import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/teams.css";
import { createTeam, getMyTeams } from "../services/teamService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Teams() {
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [teams, setTeams] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
    loadTeams();
}, []);

const loadTeams = async () => {

    try {

        const data = await getMyTeams();

        setTeams(data);

    } catch (error) {

        console.error("Failed to load teams:", error);

    } finally {

        setLoading(false);

    }
};

    const [formData, setFormData] = useState({
        name: "",
        description: ""
    });

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

 const handleSubmit = async (e) => {

    e.preventDefault();

    try {

        await createTeam(formData);

        setShowModal(false);

        setFormData({
            name: "",
            description: ""
        });

        await loadTeams();
        toast.success("Team created successfully!");

    } catch (error) {

        console.error("Failed to create team:", error);

        toast.error("Failed to create team");

    }
};
    return (

        <div className="teams-page">

            {/* Header */}

            <div className="teams-header">

                <div>
                    <h1>Teams</h1>

                    <p>
                        Create and manage your collaboration teams.
                    </p>
                </div>

                <button
                    className="create-team-btn"
                    onClick={() => setShowModal(true)}
                >
                    <i className="bi bi-plus-lg"></i>
                    Create Team
                </button>

            </div>


            {/* Empty State */}

            {loading ? (

    <div className="teams-loading">
        <i className="bi bi-arrow-repeat"></i>

        <h2>
            Loading teams...
        </h2>

        <p>
            Getting your teams.
        </p>
    </div>

) : teams.length === 0 ? (

    <div className="teams-empty">

        <div className="teams-empty-icon">
            <i className="bi bi-people-fill"></i>
        </div>

        <h2>No teams yet</h2>

        <p>
            Create your first team and start collaborating.
        </p>

        <button
            className="create-team-btn"
            onClick={() => setShowModal(true)}
        >
            <i className="bi bi-plus-lg"></i>
            Create Your First Team
        </button>

    </div>

) : (

    <div className="teams-grid">

        {teams.map((team) => (

           <div
    className="team-card"
    key={team.id}
    onClick={() => navigate(`/teams/${team.id}`)}
>
    <div className="team-card-icon">
        <i className="bi bi-people-fill"></i>
    </div>

    <div className="team-card-content">

        <h2>{team.name}</h2>

        <p>
            {team.description || "No description provided."}
        </p>

    </div>


            </div>

        ))}

    </div>

)}


            {/* Create Team Modal */}

            {showModal && (

                <div
                    className="modal-overlay"
                    onClick={() => setShowModal(false)}
                >

                    <div
                        className="team-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="modal-header">

                            <div>

                                <h2>Create Team</h2>

                                <p>
                                    Create a team for your project.
                                </p>

                            </div>

                            <button
                                className="modal-close"
                                onClick={() => setShowModal(false)}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>

                        </div>


                        <form onSubmit={handleSubmit}>

                            <div className="form-group">

                                <label>
                                    Team Name
                                </label>

                                <div className="input-group">

                                    <span className="input-group-text">
                                        <i className="bi bi-people-fill"></i>
                                    </span>

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter team name"
                                        required
                                    />

                                </div>

                            </div>


                            <div className="form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="What is this team about?"
                                    rows="4"
                                />

                            </div>


                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="create-team-btn"
                                >
                                    <i className="bi bi-plus-lg"></i>
                                    Create Team
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}

export default Teams;