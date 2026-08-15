import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
    getMyTeams,
    addMember,
    getTeamMembers,
    deleteTeam,
    removeMember,
    updateTeam
} from "../services/teamService";

import "../styles/teamDetails.css";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/confirmModal.css";


function TeamDetails() {

    const { teamId } = useParams();
    const navigate = useNavigate();

    const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    onConfirm: null
});


    // ========================================
    // TEAM STATE
    // ========================================

    const [team, setTeam] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ========================================
    // MEMBERS STATE
    // ========================================

    const [members, setMembers] = useState([]);

    const [membersLoading, setMembersLoading] = useState(true);


    // ========================================
    // ADD MEMBER STATE
    // ========================================

    const [showAddMember, setShowAddMember] =
        useState(false);

    const [memberForm, setMemberForm] = useState({
        email: "",
        role: "MEMBER"
    });


    // ========================================
    // EDIT TEAM STATE
    // ========================================

    const [showEditTeam, setShowEditTeam] =
        useState(false);

    const [editTeamForm, setEditTeamForm] = useState({
        name: "",
        description: ""
    });

    const [updatingTeam, setUpdatingTeam] =
        useState(false);


    // ========================================
    // LOAD TEAM
    // ========================================

    const loadTeam = async () => {

        try {

            const teams = await getMyTeams();

            const foundTeam = teams.find(
                (team) =>
                    String(team.id) === String(teamId)
            );

            if (!foundTeam) {

                setError("Team not found.");

                return;

            }

            setTeam(foundTeam);

        } catch (error) {

            console.error(
                "Failed to load team:",
                error
            );

            setError("Failed to load team.");

        } finally {

            setLoading(false);

        }

    };


    // ========================================
    // LOAD MEMBERS
    // ========================================

    const loadMembers = async () => {

        try {

            setMembersLoading(true);

            const data =
                await getTeamMembers(teamId);

            setMembers(data);

        } catch (error) {

            console.error(
                "Failed to load team members:",
                error
            );

        } finally {

            setMembersLoading(false);

        }

    };


    // ========================================
    // LOAD DATA
    // ========================================

    useEffect(() => {

        loadTeam();

        loadMembers();

    }, [teamId]);


    // ========================================
    // MEMBER FORM CHANGE
    // ========================================

    const handleMemberChange = (e) => {

        setMemberForm({
            ...memberForm,
            [e.target.name]: e.target.value
        });

    };


    // ========================================
    // ADD MEMBER
    // ========================================

    const handleAddMember = async (e) => {

        e.preventDefault();

        try {

            await addMember(
                teamId,
                memberForm
            );

            await loadMembers();

            setShowAddMember(false);

            setMemberForm({
                email: "",
                role: "MEMBER"
            });

            toast.success(
                "Member added successfully!"
            );

        } catch (error) {

            console.error(
                "Failed to add member:",
                error
            );

            toast.error(
                error.response?.data ||
                "Failed to add member"
            );

        }

    };


    // ========================================
    // CHECK REMOVE PERMISSION
    // ========================================

    const canRemoveMember = (member) => {

        // OWNER can remove ADMIN or MEMBER
        if (team.role === "OWNER") {

            return member.role !== "OWNER";

        }


        // ADMIN can remove MEMBER only
        if (team.role === "ADMIN") {

            return member.role === "MEMBER";

        }


        // MEMBER cannot remove anyone
        return false;

    };


    // ========================================
    // REMOVE MEMBER
    // ========================================

    const handleRemoveMember = (member) => {

        if (!canRemoveMember(member)) {
            toast.error(
                "You do not have permission to remove members."
            );
            return;
        }

        setConfirmModal({
            isOpen: true,

            title: "Remove team member?",

            message:
                `Are you sure you want to remove ${member.name} from this team?`,

            confirmText: "Remove",

            onConfirm: async () => {

                setConfirmModal({
                    isOpen: false,
                    title: "",
                    message: "",
                    confirmText: "Confirm",
                    onConfirm: null
                });

                try {

                    await removeMember(
                        teamId,
                        member.id
                    );

                    setMembers((prev) =>
                        prev.filter(
                            (m) =>
                               m.id !== member.id
                        )
                    );

                    toast.success(
                        "Member removed successfully!"
                    );

                } catch (error) {

                    console.error(
                        "Failed to remove member:",
                        error
                    );

                    toast.error(
                        error.response?.data ||
                        "Failed to remove member."
                    );

                }

            }

        });

    };


    // ========================================
    // EDIT TEAM
    // ========================================

    const handleEditTeam = () => {

        setEditTeamForm({
            name: team.name || "",
            description:
                team.description || ""
        });

        setShowEditTeam(true);

    };


    // ========================================
    // EDIT TEAM FORM CHANGE
    // ========================================

    const handleEditTeamChange = (e) => {

        setEditTeamForm({
            ...editTeamForm,
            [e.target.name]: e.target.value
        });

    };


    // ========================================
    // UPDATE TEAM
    // ========================================

    const handleUpdateTeam = async (e) => {

        e.preventDefault();

        try {

            setUpdatingTeam(true);

            const updatedTeam =
                await updateTeam(
                    teamId,
                    editTeamForm
                );

            /*
             * Your backend returns the updated
             * team response.
             */
            setTeam(updatedTeam);

            setShowEditTeam(false);

            toast.success(
                "Team updated successfully!"
            );

        } catch (error) {

            console.error(
                "Failed to update team:",
                error
            );

            toast.error(
                error.response?.data ||
                "Failed to update team."
            );

        } finally {

            setUpdatingTeam(false);

        }

    };


    // ========================================
    // DELETE TEAM
    // ========================================

    const handleDeleteTeam = () => {

        setConfirmModal({
            isOpen: true,

            title: "Delete this team?",

            message:
                `Are you sure you want to delete "${team.name}"? This will permanently delete the team, its projects, tasks, and members.`,

            confirmText: "Delete",

            onConfirm: async () => {

                setConfirmModal({
                    isOpen: false,
                    title: "",
                    message: "",
                    confirmText: "Confirm",
                    onConfirm: null
                });

                try {

                    await deleteTeam(teamId);

                    toast.success(
                        "Team deleted successfully!"
                    );

                    navigate("/teams", { replace: true });

                } catch (error) {

                    console.error(
                        "Failed to delete team:",
                        error
                    );

                    toast.error(
                        error.response?.data ||
                        "Failed to delete team."
                    );

                }

            }

        });

    };


    // ========================================
    // LOADING
    // ========================================

    if (loading) {

        return (

            <div className="team-details-page">

                <div className="team-details-loading">

                    Loading team...

                </div>

            </div>

        );

    }


    // ========================================
    // ERROR
    // ========================================

    if (error) {

        return (

            <div className="team-details-page">

                <button
                    className="back-btn"
                    onClick={() => navigate("/teams", { replace: true })}
                >

                    <i className="bi bi-arrow-left"></i>

                    Back to Teams

                </button>


                <div className="team-details-error">

                    {error}

                </div>

            </div>

        );

    }


    // ========================================
    // PAGE
    // ========================================

    return (

        <>
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                onConfirm={confirmModal.onConfirm}
                onCancel={() =>
                    setConfirmModal({
                        isOpen: false,
                        title: "",
                        message: "",
                        confirmText: "Confirm",
                        onConfirm: null
                    })
                }
            />

            <div className="team-details-page">


            {/* ========================================
                BACK BUTTON
            ======================================== */}

            <button
                className="back-btn"
                onClick={() => navigate("/teams", { replace: true })}
            >

                <i className="bi bi-arrow-left"></i>

                Back to Teams

            </button>


            {/* ========================================
                TEAM HEADER
            ======================================== */}

            <div className="team-details-header">


                <div className="team-header-main">


                    <div className="team-details-icon">

                        <i className="bi bi-people-fill"></i>

                    </div>


                    <div>

                        <h1>
                            {team.name}
                        </h1>


                        <p>
                            {team.description ||
                                "No description provided."
                            }
                        </p>

                    </div>

                </div>


                {/* ========================================
                    TEAM ACTIONS
                ======================================== */}

                {(team.role === "OWNER" ||
                    team.role === "ADMIN") && (

                    <div className="team-header-actions">


                        {/* EDIT TEAM */}

                        <button
                            className="edit-team-btn"
                            onClick={handleEditTeam}
                        >

                            <i className="bi bi-pencil-fill"></i>

                            Edit Team

                        </button>


                        {/* DELETE TEAM
                            OWNER ONLY
                        */}

                        {team.role === "OWNER" && (

                            <button
                                className="delete-team-btn"
                                onClick={handleDeleteTeam}
                            >

                                <i className="bi bi-trash-fill"></i>

                                Delete Team

                            </button>

                        )}

                    </div>

                )}

            </div>


            {/* ========================================
                MAIN GRID
            ======================================== */}

            <div className="team-details-grid">


                {/* ========================================
                    TEAM MEMBERS
                ======================================== */}

                <div className="team-section">


                    <div className="section-header">


                        <div>

                            <h2>
                                Team Members
                            </h2>

                            <p>
                                Manage the people collaborating on this team.
                            </p>

                        </div>


                        {/* ADD MEMBER
                            OWNER + ADMIN
                        */}

                        {(team.role === "OWNER" ||
                            team.role === "ADMIN") && (

                            <button
                                className="create-team-btn"
                                onClick={() =>
                                    setShowAddMember(true)
                                }
                            >

                                <i className="bi bi-person-plus-fill"></i>

                                Add Member

                            </button>

                        )}

                    </div>


                    {/* ========================================
                        MEMBERS
                    ======================================== */}

                    {membersLoading ? (

                        <div className="members-empty">

                            <div className="members-empty-icon">

                                <i className="bi bi-arrow-repeat"></i>

                            </div>


                            <h3>
                                Loading members...
                            </h3>

                        </div>

                    ) : members.length === 0 ? (

                        <div className="members-empty">

                            <div className="members-empty-icon">

                                <i className="bi bi-people-fill"></i>

                            </div>


                            <h3>
                                No members to display
                            </h3>


                            <p>
                                Add members to start collaborating.
                            </p>

                        </div>

                    ) : (

                        <div className="members-list">


                            {members.map((member) => (

                                <div
                                    className="member-card"
                                    key={member.id}
                                >


                                    {/* AVATAR */}

                                    <div className="member-avatar">

                                        <i className="bi bi-person-fill"></i>

                                    </div>


                                    {/* MEMBER INFO */}

                                    <div className="member-info">

                                        <h3>
                                            {member.name}
                                        </h3>


                                        <p>
                                            {member.email}
                                        </p>

                                    </div>


                                    {/* ACTIONS */}

                                    <div className="member-actions">


                                        {/* ROLE */}

                                        <div
                                            className={
                                                `member-role ${member.role.toLowerCase()}`
                                            }
                                        >

                                            {member.role}

                                        </div>


                                        {/* REMOVE */}

                                        {canRemoveMember(member) && (

                                            <button
                                                className="remove-member-btn"
                                                onClick={() =>
                                                    handleRemoveMember(member)
                                                }
                                                title="Remove member"
                                            >

                                                <i className="bi bi-person-dash-fill"></i>

                                                <span>
                                                    Remove
                                                </span>

                                            </button>

                                        )}

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>


                {/* ========================================
                    TEAM INFORMATION
                ======================================== */}

                <div className="team-section team-info-section">


                    <h2>
                        Team Information
                    </h2>


                    <div className="team-info-row">

                        <span>
                            Team ID
                        </span>


                        <strong>
                            #{team.id}
                        </strong>

                    </div>


                    <div className="team-info-row">

                        <span>
                            Team Name
                        </span>


                        <strong>
                            {team.name}
                        </strong>

                    </div>

                </div>

            </div>


            {/* ========================================
                ADD MEMBER MODAL
            ======================================== */}

            {showAddMember && (

                <div
                    className="modal-overlay"
                    onClick={() => {

                        setShowAddMember(false);

                    }}
                >

                    <div
                        className="team-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >


                        {/* MODAL HEADER */}

                        <div className="modal-header">


                            <div>

                                <h2>
                                    Add Member
                                </h2>


                                <p>
                                    Add someone to this team.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="modal-close"
                                onClick={() =>
                                    setShowAddMember(false)
                                }
                            >

                                <i className="bi bi-x-lg"></i>

                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={handleAddMember}
                        >


                            {/* EMAIL */}

                            <div className="form-group">


                                <label>
                                    Member Email
                                </label>


                                <div className="input-group">


                                    <span className="input-group-text">

                                        <i className="bi bi-envelope-fill"></i>

                                    </span>


                                    <input
                                        type="email"
                                        name="email"
                                        value={memberForm.email}
                                        onChange={handleMemberChange}
                                        placeholder="Enter member email"
                                        required
                                    />

                                </div>

                            </div>


                            {/* ROLE */}

                            <div className="form-group">


                                <label>
                                    Role
                                </label>


                                <select
                                    name="role"
                                    value={memberForm.role}
                                    onChange={handleMemberChange}
                                >

                                    <option value="MEMBER">
                                        Member
                                    </option>


                                    <option value="ADMIN">
                                        Admin
                                    </option>

                                </select>

                            </div>


                            {/* ACTIONS */}

                            <div className="modal-actions">


                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() =>
                                        setShowAddMember(false)
                                    }
                                >

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    className="create-team-btn"
                                >

                                    <i className="bi bi-person-plus-fill"></i>

                                    Add Member

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* ========================================
                EDIT TEAM MODAL
            ======================================== */}

            {showEditTeam && (

                <div
                    className="modal-overlay"
                    onClick={() => {

                        if (!updatingTeam) {

                            setShowEditTeam(false);

                        }

                    }}
                >

                    <div
                        className="team-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >


                        {/* MODAL HEADER */}

                        <div className="modal-header">


                            <div>

                                <h2>
                                    Edit Team
                                </h2>


                                <p>
                                    Update your team's information.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => {

                                    if (!updatingTeam) {

                                        setShowEditTeam(false);

                                    }

                                }}
                            >

                                <i className="bi bi-x-lg"></i>

                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={handleUpdateTeam}
                        >


                            {/* TEAM NAME */}

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
                                        value={editTeamForm.name}
                                        onChange={handleEditTeamChange}
                                        placeholder="Enter team name"
                                        required
                                        disabled={updatingTeam}
                                    />

                                </div>

                            </div>


                            {/* DESCRIPTION */}

                            <div className="form-group">


                                <label>
                                    Description
                                </label>


                                <textarea
                                    name="description"
                                    value={editTeamForm.description}
                                    onChange={handleEditTeamChange}
                                    placeholder="What is this team about?"
                                    rows="4"
                                    disabled={updatingTeam}
                                />

                            </div>


                            {/* ACTIONS */}

                            <div className="modal-actions">


                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => {

                                        if (!updatingTeam) {

                                            setShowEditTeam(false);

                                        }

                                    }}
                                    disabled={updatingTeam}
                                >

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    className="create-team-btn"
                                    disabled={updatingTeam}
                                >

                                    <i className="bi bi-check-lg"></i>

                                    {updatingTeam
                                        ? "Saving..."
                                        : "Save Changes"
                                    }

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

        </>

    );

}


export default TeamDetails;