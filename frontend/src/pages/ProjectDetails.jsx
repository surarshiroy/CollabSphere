import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/confirmModal.css";
import toast from "react-hot-toast";
import {
    getMyTeams,
    getTeamMembers
} from "../services/teamService";

import {
    getProjectsByTeam,
    updateProject,
    deleteProject,
    
} from "../services/projectService";

import {
    getTasksByProject,
    createTask,
    updateTask,
    deleteTask,
    assignTask
} from "../services/taskService";

import {
    getComments,
    addComment,
    updateComment,
    deleteComment
} from "../services/commentService";

import {
    getAttachments,
    uploadAttachment,
    downloadAttachment,
    deleteAttachment
} from "../services/attachmentService";

import "../styles/projectDetails.css";


function ProjectDetails() {

    // Normalize the role received from the backend so frontend permission
    // checks work consistently for values such as "admin", "ADMIN",
    // or "ROLE_ADMIN".
    const normalizeRole = (role) => {
        return String(role || "")
            .trim()
            .toUpperCase()
            .replace(/^ROLE_/, "");
    };

    const { projectId } = useParams();

    const navigate = useNavigate();
    


    // =========================================
    // State
    // =========================================

    const [project, setProject] = useState(null);

    // OWNER and ADMIN are allowed to manage projects/tasks.
    const canManageTeam =
        normalizeRole(project?.teamRole) === "OWNER" ||
        normalizeRole(project?.teamRole) === "ADMIN";

    const [tasks, setTasks] = useState([]);

    const [loading, setLoading] = useState(true);

    const [loadingTasks, setLoadingTasks] = useState(true);

    const [error, setError] = useState("");
    const [teamMembers, setTeamMembers] = useState([]);
const [loadingMembers, setLoadingMembers] = useState(false);


    // =========================================
    // Comments State
    // =========================================

    const [expandedComments, setExpandedComments] = useState(null);

    const [comments, setComments] = useState({});

    const [loadingComments, setLoadingComments] = useState(false);

    const [commentText, setCommentText] = useState("");

    const [submittingComment, setSubmittingComment] = useState(false);

    const [editingCommentId, setEditingCommentId] = useState(null);

    const [editingCommentText, setEditingCommentText] = useState("");
    // =========================================
// Attachments State
// =========================================

const [expandedAttachments, setExpandedAttachments] =
    useState(null);

const [attachments, setAttachments] =
    useState({});

const [loadingAttachments, setLoadingAttachments] =
    useState(false);

const [uploadingAttachment, setUploadingAttachment] =
    useState(false);

const [deletingAttachmentId, setDeletingAttachmentId] =
    useState(null);

// =========================================
// CONFIRMATION MODAL
// =========================================

const [showConfirmModal, setShowConfirmModal] = useState(false);

const [confirmAction, setConfirmAction] = useState(null);

const [confirmModalData, setConfirmModalData] = useState({
    title: "",
    message: "",
    confirmText: "Confirm"
});



    // =========================================
    // Create Task State
    // =========================================

    const [showCreateTask, setShowCreateTask] =
        useState(false);

    const [creatingTask, setCreatingTask] =
        useState(false);

    const [taskForm, setTaskForm] = useState({
        title: "",
        description: "",
        priority: "MEDIUM",
        deadline: ""
    });
    // =========================================
// Edit Task State
// =========================================

const [showEditTask, setShowEditTask] = useState(false);

const [editingTask, setEditingTask] = useState(null);

const [updatingTask, setUpdatingTask] = useState(false);

const [editTaskForm, setEditTaskForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    status: "TODO",
    deadline: ""
});


    // =========================================
    // Update Project State
    // =========================================

    const [showEditProject, setShowEditProject] =
        useState(false);

    const [updatingProject, setUpdatingProject] =
        useState(false);

    const [projectForm, setProjectForm] = useState({
        name: "",
        description: "",
        status: "ACTIVE",
        deadline: ""
    });


    // =========================================
    // Load Project
    // =========================================

    const loadProject = async () => {

        try {

            setLoading(true);

            setError("");


            /*
             * Backend currently exposes:
             *
             * GET /teams/{teamId}/projects
             *
             * So we first get the user's teams,
             * then search each team's projects.
             */

            const teams = await getMyTeams();


            let foundProject = null;

            let foundTeam = null;


            for (const team of teams) {

                try {

                    const projects =
                        await getProjectsByTeam(team.id);


                    const match = projects.find(
                        (project) =>
                            String(project.id) ===
                            String(projectId)
                    );


                    if (match) {

                        foundProject = match;

                        foundTeam = team;

                        break;

                    }

                } catch (err) {

                    console.error(
                        `Failed to load projects for team ${team.id}`,
                        err
                    );

                }

            }


            // =========================================
            // Project not found
            // =========================================

            if (!foundProject || !foundTeam) {

                setError("Project not found.");

                return;

            }


            // =========================================
            // Save Project
            // =========================================

            setProject({

                ...foundProject,

                teamId: foundTeam.id,

                teamName: foundTeam.name,

                teamRole: normalizeRole(foundTeam.role)

            });
            await loadTeamMembers(foundTeam.id);


        } catch (err) {

            console.error(
                "Failed to load project:",
                err
            );

            setError("Failed to load project.");

        } finally {

            setLoading(false);

        }

    };


    // =========================================
    // Load Tasks
    // =========================================

    const loadTasks = async (id) => {

        try {

            setLoadingTasks(true);


            const data =
                await getTasksByProject(id);


            setTasks(data);


        } catch (error) {

            console.error(
                "Failed to load tasks:",
                error
            );

            setTasks([]);

        } finally {

            setLoadingTasks(false);

        }

    };

    // =========================================
// Load Team Members
// =========================================

const loadTeamMembers = async (teamId) => {

    try {

        setLoadingMembers(true);

        const members = await getTeamMembers(teamId);

        setTeamMembers(members);

    } catch (error) {

        console.error(
            "Failed to load team members:",
            error
        );

        setTeamMembers([]);

    } finally {

        setLoadingMembers(false);

    }

};


    // =========================================
    // Create Task
    // =========================================

    const handleCreateTask = async (e) => {



        e.preventDefault();

    if (!canManageTeam) {
        toast.error("You do not have permission to manage tasks.");
        return;
    }


        if (!taskForm.title.trim()) {

            toast.error("Please enter a task title.");

            return;

        }


        try {

            setCreatingTask(true);


            const newTask =
                await createTask(
                    projectId,
                    {
                        title: taskForm.title.trim(),

                        description:
                            taskForm.description.trim(),

                        priority:
                            taskForm.priority,
                        deadline: taskForm.deadline || null
                    }
                );


            // Add newly created task to the UI
            setTasks((prevTasks) => [
                newTask,
                ...prevTasks
            ]);

            toast.success("Task created successfully!");


            // Reset form
            setTaskForm({
                title: "",
                description: "",
                priority: "MEDIUM",
                deadline: ""
            });


            // Close modal
            setShowCreateTask(false);


        } catch (error) {

            console.error(
                "Failed to create task:",
                error
            );


            if (error.response?.status === 403) {

                toast.error(
                    "You do not have permission to create tasks."
                );

            } else {

                toast.error(
                    error.response?.data ||
                    "Failed to create task."
                );

            }

        } finally {

            setCreatingTask(false);

        }

    };
    // =========================================
// UPDATE TASK PRIORITY
// =========================================

const handleUpdateTaskPriority = async (task, newPriority) => {
    if (!canManageTeam) {
        toast.error("You do not have permission to update this task.");
        return;
    }



    try {

        const updatedTask = await updateTask(
            projectId,
            task.id,
            {
                title: task.title,
                description: task.description,
                priority: newPriority,
                status: task.status
            }
        );

        // Update task immediately in UI
        setTasks((prevTasks) =>
            prevTasks.map((currentTask) =>
                currentTask.id === task.id
                    ? {
                        ...currentTask,
                        ...updatedTask
                    }
                    : currentTask
            )
        );

    } catch (error) {

        console.error(
            "Failed to update task priority:",
            error
        );

        if (error.response?.status === 403) {

            toast.error(
                "You do not have permission to update this task."
            );

        } else {

            toast.error(
                error.response?.data ||
                "Failed to update task priority."
            );

        }

    }
};
// =========================================
// DELETE TASK
// =========================================

const handleDeleteTask = (task) => {

    if (!canManageTeam) {
        toast.error("You do not have permission to delete this task.");
        return;
    }

    openConfirmModal({
        title: "Delete Task",
        message: `Are you sure you want to delete "${task.title}"?`,
        confirmText: "Delete Task",
        action: async () => {

            try {

                await deleteTask(
                    projectId,
                    task.id
                );

                setTasks((prevTasks) =>
                    prevTasks.filter(
                        (currentTask) =>
                            currentTask.id !== task.id
                    )
                );

                toast.success("Task deleted successfully!");

            } catch (error) {

                console.error(
                    "Failed to delete task:",
                    error
                );

                if (error.response?.status === 403) {

                    toast.error(
                        "You do not have permission to delete this task."
                    );

                } else {

                    toast.error(
                        error.response?.data ||
                        "Failed to delete task."
                    );

                }

            }

        }
    });
};


// =========================================
// UPDATE TASK STATUS
// =========================================

const handleUpdateTaskStatus = async (task, newStatus) => {
    if (!canManageTeam) {
        toast.error("You do not have permission to update this task.");
        return;
    }



    if (newStatus === task.status) {
        return;
    }

    try {

        const updatedTask = await updateTask(
            projectId,
            task.id,
            {
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: newStatus
            }
        );

        // Update task immediately in UI
        setTasks((prevTasks) =>
            prevTasks.map((currentTask) =>
                currentTask.id === task.id
                    ? {
                        ...currentTask,
                        ...updatedTask
                    }
                    : currentTask
            )
        );

    } catch (error) {

        console.error(
            "Failed to update task status:",
            error
        );

        if (error.response?.status === 403) {

            toast.error(
                "You do not have permission to update this task."
            );

        } else {

            toast.error(
                error.response?.data ||
                "Failed to update task status."
            );

        }

    }
};
// =========================================
// ASSIGN TASK
// =========================================

const handleAssignTask = async (task, userId) => {
    if (!canManageTeam) {
        toast.error("You do not have permission to assign this task.");
        return;
    }



    try {

        const updatedTask = await assignTask(
            projectId,
            task.id,
            userId
        );

        setTasks((prevTasks) =>
            prevTasks.map((currentTask) =>
                currentTask.id === task.id
                    ? {
                        ...currentTask,
                        ...updatedTask
                    }
                    : currentTask
            )
        );
        toast.success("Task assigned successfully!");

    } catch (error) {

        console.error(
            "Failed to assign task:",
            error
        );

        if (error.response?.status === 403) {

            toast.error(
                "You do not have permission to assign this task."
            );

        } else {

            toast.error(
                error.response?.data ||
                "Failed to assign task."
            );

        }

    }
};
// =========================================
// OPEN EDIT TASK MODAL
// =========================================

const openEditTask = (task) => {

    if (!canManageTeam) {
        toast.error("You do not have permission to edit tasks.");
        return;
    }

    setEditingTask(task);

    setEditTaskForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "MEDIUM",
        status: task.status || "TODO",
        deadline: task.deadline || ""
    });

    setShowEditTask(true);
};


// =========================================
// UPDATE TASK
// =========================================

const handleUpdateTask = async (e) => {



    e.preventDefault();

    if (!canManageTeam) {
        toast.error("You do not have permission to update this task.");
        return;
    }

    if (!editTaskForm.title.trim()) {

        toast.error("Please enter a task title.");

        return;
    }

    try {

        setUpdatingTask(true);

       const updatedTask = await updateTask(
    projectId,
    editingTask.id,
    {
        title: editTaskForm.title.trim(),
        description: editTaskForm.description.trim(),
        priority: editTaskForm.priority,
        status: editTaskForm.status,
        deadline: editTaskForm.deadline || null
    }
);

        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === editingTask.id
                    ? {
                        ...task,
                        ...updatedTask
                    }
                    : task
            )
        );

        setShowEditTask(false);
        setEditingTask(null);

        toast.success("Task updated successfully!");

    } catch (error) {

        console.error(
            "Failed to update task:",
            error
        );

        if (error.response?.status === 403) {

            toast.error(
                "You do not have permission to update this task."
            );

        } else {

            toast.error(
                error.response?.data ||
                "Failed to update task."
            );

        }

    } finally {

        setUpdatingTask(false);

    }
};


    // =========================================
    // UPDATE PROJECT
    // =========================================

    const handleUpdateProject = async (e) => {



        e.preventDefault();

    if (!canManageTeam) {
        toast.error("You do not have permission to update this project.");
        return;
    }


        if (!projectForm.name.trim()) {

            toast.error("Please enter a project name.");

            return;

        }


        try {

            setUpdatingProject(true);


           const updatedProject = await updateProject(
    project.teamId,
    projectId,
    {
        name: projectForm.name.trim(),
        description: projectForm.description.trim(),
        deadline: projectForm.deadline
            ? projectForm.deadline + ":00"
            : null,
        status: projectForm.status
    }
);


            /*
             * Keep the team information and role
             * because the backend ProjectResponse
             * doesn't contain them.
             */

            setProject((prevProject) => ({

                ...prevProject,

                ...updatedProject

            }));


            setShowEditProject(false);


            toast.success("Project updated successfully!");


        } catch (error) {

            console.error(
                "Failed to update project:",
                error
            );


            if (error.response?.status === 403) {

                toast.error(
                    "You do not have permission to update this project."
                );

            } else {

                toast.error(
                    error.response?.data ||
                    "Failed to update project."
                );

            }

        } finally {

            setUpdatingProject(false);

        }

    };


    // =========================================
    // OPEN EDIT PROJECT MODAL
    // =========================================

    const openEditProject = () => {
    if (!canManageTeam) {
        toast.error("You do not have permission to edit this project.");
        return;
    }

    setProjectForm({
        name: project.name || "",
        description: project.description || "",
        deadline: project.deadline
            ? project.deadline.slice(0, 16)
            : "",
        status: project.status || "ACTIVE"
    });

    setShowEditProject(true);
};


    


    // =========================================
    // Delete Project
    // =========================================

    const handleDeleteProject = () => {

        if (!canManageTeam) {
            toast.error("You do not have permission to delete this project.");
            return;
        }

        openConfirmModal({
            title: "Delete Project",
            message: "Are you sure you want to delete this project?",
            confirmText: "Delete Project",
            action: async () => {

                try {

                    await deleteProject(
                        project.teamId,
                        projectId
                    );

                    toast.success(
                        "Project deleted successfully!"
                    );

                    navigate("/projects", { replace: true });

                } catch (error) {

                    console.error(
                        "Failed to delete project:",
                        error
                    );

                    if (error.response?.status === 409) {

                        toast.error(
                            "Cannot delete project. Please delete all tasks in this project first."
                        );

                        return;

                    }

                    if (error.response?.status === 403) {

                        toast.error(
                            "You do not have permission to delete this project."
                        );

                        return;

                    }

                    toast.error(
                        error.response?.data ||
                        "Failed to delete project."
                    );

                }

            }
        });
    };


    // =========================================
    // LOAD COMMENTS
    // =========================================

    const handleLoadComments = async (taskId) => {

        try {

            setLoadingComments(true);

            const data = await getComments(taskId);

            setComments((prev) => ({
                ...prev,
                [taskId]: data
            }));

        } catch (error) {

            console.error(
                "Failed to load comments:",
                error
            );

            if (error.response?.status === 403) {

                toast.error(
                    "You do not have permission to view comments."
                );

            } else {

                toast.error(
                    error.response?.data ||
                    "Failed to load comments."
                );

            }

        } finally {

            setLoadingComments(false);

        }
    };


    // =========================================
    // TOGGLE COMMENTS
    // =========================================

    const handleToggleComments = async (taskId) => {

        if (expandedComments === taskId) {

            setExpandedComments(null);

            return;
        }

        setExpandedComments(taskId);

        setCommentText("");
        setEditingCommentId(null);
        setEditingCommentText("");

        await handleLoadComments(taskId);
    };


    // =========================================
    // ADD COMMENT
    // =========================================

    const handleAddComment = async (taskId) => {

        if (!commentText.trim()) {

            toast.error("Please enter a comment.");

            return;
        }

        try {

            setSubmittingComment(true);

            const newComment = await addComment(
                taskId,
                commentText.trim()
            );

            setComments((prev) => ({
                ...prev,
                [taskId]: [
                    ...(prev[taskId] || []),
                    newComment
                ]
            }));

            setCommentText("");

        } catch (error) {

            console.error(
                "Failed to add comment:",
                error
            );

            if (error.response?.status === 403) {

                toast.error(
                    "You do not have permission to comment on this task."
                );

            } else {

                toast.error(
                    error.response?.data ||
                    "Failed to add comment."
                );

            }

        } finally {

            setSubmittingComment(false);

        }
    };


    // =========================================
    // START EDIT COMMENT
    // =========================================

    const handleStartEditComment = (comment) => {

        setEditingCommentId(comment.id);

        setEditingCommentText(comment.content || "");
    };


    // =========================================
    // SAVE EDITED COMMENT
    // =========================================

    const handleUpdateComment = async (
        taskId,
        commentId
    ) => {

        if (!editingCommentText.trim()) {

            toast.error("Comment cannot be empty.");

            return;
        }

        try {

            const updatedComment = await updateComment(
                taskId,
                commentId,
                editingCommentText.trim()
            );

            setComments((prev) => ({
                ...prev,
                [taskId]: (prev[taskId] || []).map(
                    (comment) =>
                        comment.id === commentId
                            ? updatedComment
                            : comment
                )
            }));

            setEditingCommentId(null);
            setEditingCommentText("");

        } catch (error) {

            console.error(
                "Failed to update comment:",
                error
            );

            if (error.response?.status === 403) {

                toast.error(
                    "You can only edit your own comments."
                );

            } else {

                toast.error(
                    error.response?.data ||
                    "Failed to update comment."
                );

            }

        }
    };


    // =========================================
    // CONFIRMATION MODAL HELPERS
    // =========================================

    const openConfirmModal = ({
        title,
        message,
        confirmText,
        action
    }) => {

        setConfirmModalData({
            title,
            message,
            confirmText
        });

        setConfirmAction(() => action);

        setShowConfirmModal(true);
    };


    const closeConfirmModal = () => {

        setShowConfirmModal(false);

        setConfirmAction(null);

    };


    // =========================================
    // DELETE COMMENT
    // =========================================

    const handleDeleteComment = (
        taskId,
        commentId
    ) => {

        openConfirmModal({
            title: "Delete Comment",
            message: "Are you sure you want to delete this comment?",
            confirmText: "Delete Comment",
            action: async () => {

                try {

                    await deleteComment(
                        taskId,
                        commentId
                    );

                    setComments((prev) => ({
                        ...prev,
                        [taskId]: (prev[taskId] || []).filter(
                            (comment) => comment.id !== commentId
                        )
                    }));

                    toast.success("Comment deleted successfully!");

                } catch (error) {

                    console.error(
                        "Failed to delete comment:",
                        error
                    );

                    if (error.response?.status === 403) {

                        toast.error(
                            "You are not authorized to delete this comment."
                        );

                    } else {

                        toast.error(
                            error.response?.data ||
                            "Failed to delete comment."
                        );

                    }

                }

            }
        });
    };


    // =========================================
// LOAD ATTACHMENTS
// =========================================

const handleLoadAttachments = async (taskId) => {

    try {

        setLoadingAttachments(true);

        const data = await getAttachments(taskId);

        setAttachments((prev) => ({
            ...prev,
            [taskId]: data
        }));

    } catch (error) {

        console.error(
            "Failed to load attachments:",
            error
        );

        if (error.response?.status === 403) {

            toast.error(
                "You do not have permission to view attachments."
            );

        } else {

            toast.error(
                error.response?.data ||
                "Failed to load attachments."
            );

        }

    } finally {

        setLoadingAttachments(false);

    }
};


// =========================================
// TOGGLE ATTACHMENTS
// =========================================

const handleToggleAttachments = async (taskId) => {

    if (expandedAttachments === taskId) {

        setExpandedAttachments(null);

        return;
    }

    setExpandedAttachments(taskId);

    await handleLoadAttachments(taskId);
};


// =========================================
// UPLOAD ATTACHMENT
// =========================================

const handleUploadAttachment = async (
    taskId,
    file
) => {

    if (!file) {
        return;
    }

    try {

        setUploadingAttachment(true);

        const newAttachment =
            await uploadAttachment(
                taskId,
                file
            );

        setAttachments((prev) => ({
            ...prev,
            [taskId]: [
                ...(prev[taskId] || []),
                newAttachment
            ]
        }));

    } catch (error) {

        console.error(
            "Failed to upload attachment:",
            error
        );

        if (error.response?.status === 403) {

            toast.error(
                "You do not have permission to upload attachments."
            );

        } else {

            toast.error(
                error.response?.data ||
                "Failed to upload attachment."
            );

        }

    } finally {

        setUploadingAttachment(false);

    }
};


// =========================================
// DOWNLOAD ATTACHMENT
// =========================================

const handleDownloadAttachment = async (
    taskId,
    attachment
) => {

    try {

        const response =
            await downloadAttachment(
                taskId,
                attachment.id
            );

        const blob = new Blob(
            [response.data],
            {
                type:
                    attachment.contentType ||
                    "application/octet-stream"
            }
        );

        const url =
            window.URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;

        link.download =
            attachment.fileName;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

    } catch (error) {

        console.error(
            "Failed to download attachment:",
            error
        );

        toast.error(
            error.response?.data ||
            "Failed to download attachment."
        );
    }
};


// =========================================
// DELETE ATTACHMENT
// =========================================

const handleDeleteAttachment = (
    taskId,
    attachmentId
) => {

    openConfirmModal({
        title: "Delete Attachment",
        message: "Are you sure you want to delete this attachment?",
        confirmText: "Delete Attachment",
        action: async () => {

            try {

                setDeletingAttachmentId(
                    attachmentId
                );

                await deleteAttachment(
                    taskId,
                    attachmentId
                );

                setAttachments((prev) => ({
                    ...prev,

                    [taskId]:
                        (prev[taskId] || []).filter(
                            (attachment) =>
                                attachment.id !==
                                attachmentId
                        )
                }));

                toast.success("Attachment deleted successfully!");

            } catch (error) {

                console.error(
                    "Failed to delete attachment:",
                    error
                );

                if (error.response?.status === 403) {

                    toast.error(
                        "You are not authorized to delete this attachment."
                    );

                } else {

                    toast.error(
                        error.response?.data ||
                        "Failed to delete attachment."
                    );

                }

            } finally {

                setDeletingAttachmentId(null);

            }

        }
    });
};


// =========================================
// ATTACHMENT PERMISSION
// =========================================

const canDeleteAttachment = (
    attachment
) => {

    const currentUserId =
        localStorage.getItem("userId");

    return (
        String(attachment.uploadedById) ===
            String(currentUserId)
        ||
        canManageTeam
    );
};


    // =========================================
    // Load project + tasks when page opens
    // =========================================

    useEffect(() => {

        loadProject();

        loadTasks(projectId);

    }, [projectId]);


    // =========================================
    // Loading Screen
    // =========================================

    if (loading) {

        return (

            <div className="project-details-page">

                <div className="project-details-loading">

                    <i className="bi bi-arrow-repeat"></i>

                    <h2>
                        Loading project...
                    </h2>

                    <p>
                        Getting your project information.
                    </p>

                </div>

            </div>

        );

    }


    // =========================================
    // Error Screen
    // =========================================

    if (error) {

        return (

            <div className="project-details-page">


                <button
                    className="back-btn"
                     onClick={() => navigate("/projects", { replace: true })}
                >

                    <i className="bi bi-arrow-left"></i>

                    Back to Projects

                </button>


                <div className="project-details-error">

                    <div className="project-error-icon">

                        <i className="bi bi-exclamation-circle-fill"></i>

                    </div>


                    <h2>
                        {error}
                    </h2>


                    <p>
                        The project could not be loaded.
                    </p>

                </div>

            </div>

        );

    }


    // =========================================
    // Main Page
    // =========================================

    return (

        <div className="project-details-page">


            {/* =========================================
                Back Button
            ========================================= */}

            <button
                className="back-btn"
                 onClick={() => navigate("/projects", { replace: true })}
            >

                <i className="bi bi-arrow-left"></i>

                Back to Projects

            </button>



            {/* =========================================
                Project Header
            ========================================= */}

            <div className="project-details-header">


                <div className="project-details-icon">

                    <i className="bi bi-folder-fill"></i>

                </div>


                <div className="project-header-content">


                    <div className="project-title-row">


                        <div className="project-title">

                            <h1>
                                {project.name}
                            </h1>


                            <span
                                className={`project-status ${project.status?.toLowerCase()}`}
                            >
                                {project.status}
                            </span>

                        </div>



                        {/* Project Actions */}

                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                alignItems: "center"
                            }}
                        >

                            {/* Edit Project */}

                            {(canManageTeam) && (

                                <button
                                    className="project-action-btn"
                                    onClick={openEditProject}
                                >

                                    <i className="bi bi-pencil-fill"></i>

                                    Edit Project

                                </button>

                            )}


                            {/* Delete Project */}

                            {(canManageTeam) && (

                                <button
                                    className="delete-project-btn"
                                    onClick={handleDeleteProject}
                                >

                                    <i className="bi bi-trash-fill"></i>

                                    Delete Project

                                </button>

                            )}

                        </div>


                    </div>


                    <p>

                        {project.description ||
                            "No description provided."}

                    </p>

                </div>

            </div>



            {/* =========================================
                Main Information Grid
            ========================================= */}

            <div className="project-details-grid">


                {/* =========================================
                    Project Overview
                ========================================= */}

                <div className="project-section">


                    <div className="section-header">

                        <div>

                            <h2>
                                Project Overview
                            </h2>

                            <p>
                                Information about this project.
                            </p>

                        </div>

                    </div>



                    <div className="project-info-list">


                        {/* Team */}

                        <div className="project-info-row">

                            <div className="info-icon">

                                <i className="bi bi-people-fill"></i>

                            </div>


                            <div>

                                <span>
                                    Team
                                </span>

                                <strong>
                                    {project.teamName}
                                </strong>

                            </div>

                        </div>



                        {/* Created By */}

                        <div className="project-info-row">

                            <div className="info-icon">

                                <i className="bi bi-person-fill"></i>

                            </div>


                            <div>

                                <span>
                                    Created By
                                </span>

                                <strong>
                                    {project.createdBy}
                                </strong>

                            </div>

                        </div>



                        {/* Created At */}

                        <div className="project-info-row">

                            <div className="info-icon">

                                <i className="bi bi-calendar-event-fill"></i>

                            </div>


                            <div>

                                <span>
                                    Created At
                                </span>

                                <strong>

                                    {project.createdAt
                                        ? new Date(
                                            project.createdAt
                                        ).toLocaleDateString()
                                        : "—"}

                                </strong>

                            </div>

                        </div>


                    </div>

                </div>



                {/* =========================================
                    Project Stats
                ========================================= */}

                <div className="project-section">


                    <h2>
                        Project Stats
                    </h2>


                    <div className="project-stats">


                        {/* Tasks */}

                        <div className="project-stat-card">

                            <div className="project-stat-icon">

                                <i className="bi bi-list-check"></i>

                            </div>


                            <div>

                                <span>
                                    Tasks
                                </span>

                                <strong>
                                    {loadingTasks
                                        ? "..."
                                        : tasks.length}
                                </strong>

                            </div>

                        </div>



                        {/* Completed */}

                        <div className="project-stat-card">

                            <div className="project-stat-icon">

                                <i className="bi bi-check-circle-fill"></i>

                            </div>


                            <div>

                                <span>
                                    Completed
                                </span>

                                <strong>

                                    {loadingTasks
                                        ? "..."
                                        : tasks.filter(
                                            (task) =>
                                                task.status === "DONE"
                                        ).length}

                                </strong>

                            </div>

                        </div>



                        {/* Deadline */}

                        <div className="project-stat-card">

                            <div className="project-stat-icon">

                                <i className="bi bi-calendar-check-fill"></i>

                            </div>


                            <div>

                                <span>
                                    Deadline
                                </span>

                                <strong>
                                    {project.deadline
                                        ? new Date(project.deadline).toLocaleString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true
                                        })
                                        : "No deadline"}
                                </strong>

                            </div>

                        </div>


                    </div>

                </div>


            </div>



            {/* =========================================
                Tasks Section
            ========================================= */}

            <div className="project-section project-tasks-section">


                <div className="section-header">


                    <div>

                        <h2>
                            Tasks
                        </h2>

                        <p>
                            Tasks for this project.
                        </p>

                    </div>



                    {/* Add Task */}

                    {(canManageTeam) && (

                        <button
                            className="project-action-btn"
                            onClick={() =>
                                setShowCreateTask(true)
                            }
                        >

                            <i className="bi bi-plus-lg"></i>

                            Add Task

                        </button>

                    )}

                </div>



                {/* ================= TASK LIST ================= */}

                {loadingTasks ? (

                    <div className="tasks-coming-soon">

                        <div className="tasks-coming-icon">

                            <i className="bi bi-arrow-repeat"></i>

                        </div>


                        <h3>
                            Loading tasks...
                        </h3>


                        <p>
                            Getting your project tasks.
                        </p>

                    </div>

                ) : tasks.length === 0 ? (

                    <div className="tasks-coming-soon">

                        <div className="tasks-coming-icon">

                            <i className="bi bi-kanban-fill"></i>

                        </div>


                        <h3>
                            No tasks yet
                        </h3>


                        <p>
                            Create a task to start working on this project.
                        </p>

                    </div>

                ) : (

                    <div className="task-list">

                        {tasks.map((task) => (

                            <div
                                className="task-card"
                                key={task.id}
                            >


                                <div className="task-card-header">

    <h3>
        {task.title}
    </h3>

    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "8px"
        }}
    >

        {/* EDIT TASK */}

        {(canManageTeam) && (

            <button
                type="button"
                className="task-edit-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    openEditTask(task);
                }}
                title="Edit Task"
            >

                <i className="bi bi-pencil-fill"></i>

                <span>
                    Edit
                </span>

            </button>

        )}


        {/* DELETE TASK */}

        {(normalizeRole(project?.teamRole) === "OWNER" ||
    normalizeRole(project?.teamRole) === "ADMIN") && (
    <button
        type="button"
        className="delete-project-btn"
        onClick={(e) => {
            e.stopPropagation();
            handleDeleteTask(task);
        }}
        title="Delete Task"
    >
        <i className="bi bi-trash-fill"></i>
        <span>Delete</span>
    </button>
)}


        {/* STATUS */}

        {(canManageTeam) ? (

            <select
                className={`task-status-select ${task.status?.toLowerCase()}`}
                value={task.status}
                onChange={(e) =>
                    handleUpdateTaskStatus(
                        task,
                        e.target.value
                    )
                }
                onClick={(e) => e.stopPropagation()}
            >

                <option value="TODO">
                    TO DO
                </option>

                <option value="IN_PROGRESS">
                    IN PROGRESS
                </option>

                <option value="IN_REVIEW">
                    IN REVIEW
                </option>

                <option value="DONE">
                    DONE
                </option>

            </select>

        ) : (

            <span
                className={`task-status ${task.status?.toLowerCase()}`}
            >
                {task.status}
            </span>

        )}

    </div>

</div>



                                <p className="task-description">

                                    {task.description ||
                                        "No description provided."}

                                </p>



                                <div className="task-meta">


                                   {(canManageTeam) ? (

    <select
        className={`task-priority-select ${task.priority?.toLowerCase()}`}
        value={task.priority}
        onChange={(e) =>
            handleUpdateTaskPriority(
                task,
                e.target.value
            )
        }
        onClick={(e) => e.stopPropagation()}
    >

        <option value="LOW">
            LOW
        </option>

        <option value="MEDIUM">
            MEDIUM
        </option>

        <option value="HIGH">
            HIGH
        </option>

    </select>

) : (

    <span className={`task-priority ${task.priority?.toLowerCase()}`}>

        <i className="bi bi-flag-fill"></i>

        {task.priority}

    </span>

)}



                                
                                   {(canManageTeam) ? (

    <select
        className="task-assignee-select"
        value={
            teamMembers.find(
                (member) =>
                    member.name === task.assignee
            )?.id || ""
        }
        onChange={(e) =>
            handleAssignTask(
                task,
                Number(e.target.value)
            )
        }
        onClick={(e) =>
            e.stopPropagation()
        }
        disabled={loadingMembers}
    >

        <option value="">
            Unassigned
        </option>

        {teamMembers.map((member) => (

            <option
                key={member.id}
                value={member.id}
            >
                {member.name}
            </option>

        ))}

    </select>

) : (

    <span>

        <i className="bi bi-person-fill"></i>

        {task.assignee || "Unassigned"}

    </span>

)}



                                   <span>
    <i className="bi bi-person-plus-fill"></i>
    {task.createdBy}
</span>

<span>
    <i className="bi bi-calendar-event-fill"></i>
    {task.deadline
        ? new Date(task.deadline).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
          })
        : "No deadline"}
</span>


                                </div>


                                {/* =========================================
                                    COMMENTS
                                ========================================= */}

                                <div className="task-comments-section">

                                    <button
                                        type="button"
                                        className="task-comments-toggle"
                                        onClick={() =>
                                            handleToggleComments(task.id)
                                        }
                                    >

                                        <span>
                                            <i className="bi bi-chat-left-text-fill"></i>

                                            Comments

                                            {comments[task.id] ?
                                                ` (${comments[task.id].length})` :
                                                ""}
                                        </span>

                                        <i
                                            className={`bi ${
                                                expandedComments === task.id
                                                    ? "bi-chevron-up"
                                                    : "bi-chevron-down"
                                            }`}
                                        ></i>

                                    </button>


                                    {expandedComments === task.id && (

                                        <div className="task-comments">

                                            {loadingComments ? (

                                                <div className="comments-loading">
                                                    <i className="bi bi-arrow-repeat"></i>
                                                    Loading comments...
                                                </div>

                                            ) : (

                                                <>

                                                    {(!comments[task.id] ||
                                                        comments[task.id].length === 0) ? (

                                                        <div className="no-comments">
                                                            <i className="bi bi-chat"></i>
                                                            <p>No comments yet.</p>
                                                        </div>

                                                    ) : (

                                                        <div className="comments-list">

                                                            {comments[task.id].map((comment) => (

                                                                <div
                                                                    className="comment-card"
                                                                    key={comment.id}
                                                                >

                                                                    <div className="comment-header">

                                                                        <div className="comment-author">
                                                                            <i className="bi bi-person-circle"></i>
                                                                            <strong>{comment.author}</strong>
                                                                        </div>

                                                                        <span className="comment-date">
                                                                            {comment.createdAt
                                                                                ? new Date(comment.createdAt).toLocaleString()
                                                                                : ""}
                                                                        </span>

                                                                    </div>


                                                                    {editingCommentId === comment.id ? (

                                                                        <div className="comment-edit-box">

                                                                            <textarea
                                                                                value={editingCommentText}
                                                                                onChange={(e) =>
                                                                                    setEditingCommentText(e.target.value)
                                                                                }
                                                                                rows="3"
                                                                            />

                                                                            <div className="comment-actions">

                                                                                <button
                                                                                    type="button"
                                                                                    className="comment-cancel-btn"
                                                                                    onClick={() => {
                                                                                        setEditingCommentId(null);
                                                                                        setEditingCommentText("");
                                                                                    }}
                                                                                >
                                                                                    Cancel
                                                                                </button>

                                                                                <button
                                                                                    type="button"
                                                                                    className="comment-save-btn"
                                                                                    onClick={() =>
                                                                                        handleUpdateComment(
                                                                                            task.id,
                                                                                            comment.id
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    Save
                                                                                </button>

                                                                            </div>

                                                                        </div>

                                                                    ) : (

                                                                        <p className="comment-content">
                                                                            {comment.content}
                                                                        </p>

                                                                    )}


                                                                   {editingCommentId !== comment.id && (

    <div className="comment-actions">

        {/* EDIT — ONLY COMMENT AUTHOR */}

        {String(comment.authorId) ===
            String(localStorage.getItem("userId")) && (

            <button
                type="button"
                className="comment-edit-small-btn"
                onClick={() =>
                    handleStartEditComment(comment)
                }
            >

                <i className="bi bi-pencil"></i>

                Edit

            </button>

        )}


        {/* DELETE — AUTHOR OR OWNER/ADMIN */}

        {(
            String(comment.authorId) ===
                String(localStorage.getItem("userId"))
            ||
            canManageTeam
        ) && (

            <button
                type="button"
                className="comment-delete-small-btn"
                onClick={() =>
                    handleDeleteComment(
                        task.id,
                        comment.id
                    )
                }
            >

                <i className="bi bi-trash"></i>

                Delete

            </button>

        )}

    </div>

)}

                                                                </div>

                                                            ))}

                                                        </div>

                                                    )}


                                                    <div className="add-comment-box">

                                                        <textarea
                                                            placeholder="Write a comment..."
                                                            value={commentText}
                                                            onChange={(e) =>
                                                                setCommentText(e.target.value)
                                                            }
                                                            rows="3"
                                                        />

                                                        <button
                                                            type="button"
                                                            className="add-comment-btn"
                                                            onClick={() =>
                                                                handleAddComment(task.id)
                                                            }
                                                            disabled={submittingComment}
                                                        >
                                                            <i className="bi bi-send-fill"></i>
                                                            {submittingComment
                                                                ? "Posting..."
                                                                : "Post Comment"}
                                                        </button>

                                                    </div>

                                                </>

                                            )}

                                        </div>

                                    )}

                                </div>

                                {/* =========================================
    ATTACHMENTS
========================================= */}

<div className="task-attachments-section">

    <button
        type="button"
        className="task-attachments-toggle"
        onClick={() =>
            handleToggleAttachments(task.id)
        }
    >

        <span>

            <i className="bi bi-paperclip"></i>

            Attachments

            {attachments[task.id]
                ? ` (${attachments[task.id].length})`
                : ""}

        </span>

        <i
            className={`bi ${
                expandedAttachments === task.id
                    ? "bi-chevron-up"
                    : "bi-chevron-down"
            }`}
        ></i>

    </button>


    {expandedAttachments === task.id && (

        <div className="task-attachments">

            {loadingAttachments ? (

                <div className="attachments-loading">

                    <i className="bi bi-arrow-repeat"></i>

                    Loading attachments...

                </div>

            ) : (

                <>

                    {(!attachments[task.id] ||
                        attachments[task.id].length === 0) ? (

                        <div className="no-attachments">

                            <i className="bi bi-paperclip"></i>

                            <p>
                                No attachments yet.
                            </p>

                        </div>

                    ) : (

                        <div className="attachments-list">

                            {attachments[task.id].map(
                                (attachment) => (

                                    <div
                                        className="attachment-card"
                                        key={attachment.id}
                                    >

                                        <div className="attachment-info">

                                            <div className="attachment-icon">

                                                <i className="bi bi-file-earmark"></i>

                                            </div>

                                            <div className="attachment-details">

                                                <strong
                                                    title={
                                                        attachment.fileName
                                                    }
                                                >
                                                    {attachment.fileName}
                                                </strong>

                                                <span>

                                                    {attachment.uploadedBy ||
                                                        "Unknown"}

                                                    {" • "}

                                                    {attachment.fileSize
                                                        ? `${(
                                                            attachment.fileSize /
                                                            1024 /
                                                            1024
                                                        ).toFixed(2)} MB`
                                                        : "Unknown size"}

                                                </span>

                                            </div>

                                        </div>


                                        <div className="attachment-actions">

                                            <button
                                                type="button"
                                                className="attachment-download-btn"
                                                onClick={() =>
                                                    handleDownloadAttachment(
                                                        task.id,
                                                        attachment
                                                    )
                                                }
                                            >

                                                <i className="bi bi-download"></i>

                                                Download

                                            </button>


                                            {canDeleteAttachment(
                                                attachment
                                            ) && (

                                                <button
                                                    type="button"
                                                    className="attachment-delete-btn"
                                                    onClick={() =>
                                                        handleDeleteAttachment(
                                                            task.id,
                                                            attachment.id
                                                        )
                                                    }
                                                    disabled={
                                                        deletingAttachmentId ===
                                                        attachment.id
                                                    }
                                                >

                                                    <i className="bi bi-trash"></i>

                                                    {deletingAttachmentId ===
                                                    attachment.id
                                                        ? "Deleting..."
                                                        : "Delete"}

                                                </button>

                                            )}

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}


                    {/* UPLOAD */}

                    <div className="upload-attachment">

                        <label className="upload-attachment-btn">

                            <i className="bi bi-paperclip"></i>

                            {uploadingAttachment
                                ? "Uploading..."
                                : "Add Attachment"}

                            <input
                                type="file"
                                hidden
                                disabled={
                                    uploadingAttachment
                                }
                                onChange={(e) => {

                                    const file =
                                        e.target.files?.[0];

                                    if (file) {

                                        handleUploadAttachment(
                                            task.id,
                                            file
                                        );

                                    }

                                    e.target.value = "";

                                }}
                            />

                        </label>

                    </div>

                </>

            )}

        </div>

    )}

</div>


                            </div>

                        ))}

                    </div>

                )}


            </div>



            {/* =========================================
                CONFIRMATION MODAL
            ========================================= */}

            <ConfirmModal
                isOpen={showConfirmModal}
                title={confirmModalData.title}
                message={confirmModalData.message}
                confirmText={confirmModalData.confirmText}
                cancelText="Cancel"
                onConfirm={() => {

                    const action = confirmAction;

                    closeConfirmModal();

                    if (action) {
                        action();
                    }

                }}
                onCancel={closeConfirmModal}
                danger={true}
            />


            {/* =========================================
                EDIT PROJECT MODAL
            ========================================= */}

            {showEditProject && (

                <div
                    className="task-modal-overlay"
                    onClick={() => {

                        if (!updatingProject) {

                            setShowEditProject(false);

                        }

                    }}
                >

                    <div
                        className="task-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* Modal Header */}

                        <div className="task-modal-header">

                            <div>

                                <h2>
                                    Edit Project
                                </h2>

                                <p>
                                    Update your project information.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="task-modal-close"
                                onClick={() => {

                                    if (!updatingProject) {

                                        setShowEditProject(false);

                                    }

                                }}
                            >

                                <i className="bi bi-x-lg"></i>

                            </button>

                        </div>



                        {/* Form */}

                        <form
                            onSubmit={handleUpdateProject}
                            className="task-form"
                        >

                            {/* Name */}

                            <div className="task-form-group">

                                <label>
                                    Project Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter project name"
                                    value={projectForm.name}
                                    onChange={(e) =>
                                        setProjectForm({
                                            ...projectForm,
                                            name: e.target.value
                                        })
                                    }
                                    required
                                />

                            </div>



                            {/* Description */}

                            <div className="task-form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    placeholder="Describe your project..."
                                    rows="4"
                                    value={projectForm.description}
                                    onChange={(e) =>
                                        setProjectForm({
                                            ...projectForm,
                                            description:
                                                e.target.value
                                        })
                                    }
                                />

                            </div>



                            {/* Deadline */}

                            <div className="task-form-group">

                                <label>
                                    Deadline
                                </label>

                                <input
                                    type="datetime-local"
                                    value={projectForm.deadline}
                                    onChange={(e) =>
                                        setProjectForm({
                                            ...projectForm,
                                            deadline: e.target.value
                                        })
                                    }
                                />

                            </div>



                            {/* Status */}

                            <div className="task-form-group">

                                <label>
                                    Status
                                </label>

                                <select
                                    value={projectForm.status}
                                    onChange={(e) =>
                                        setProjectForm({
                                            ...projectForm,
                                            status: e.target.value
                                        })
                                    }
                                >

                                    <option value="ACTIVE">
                                        Active
                                    </option>

                                    <option value="COMPLETED">
                                        Completed
                                    </option>

                                    <option value="ARCHIVED">
                                        Archived
                                    </option>

                                </select>

                            </div>



                            {/* Buttons */}

                            <div className="task-form-actions">

                                <button
                                    type="button"
                                    className="task-cancel-btn"
                                    onClick={() => {

                                        if (!updatingProject) {

                                            setShowEditProject(false);

                                        }

                                    }}
                                >

                                    Cancel

                                </button>


                                <button
                                    type="submit"
                                    className="task-create-btn"
                                    disabled={updatingProject}
                                >

                                    {updatingProject
                                        ? "Saving..."
                                        : "Save Changes"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

            {/* =========================================
    EDIT TASK MODAL
========================================= */}

{showEditTask && (

    <div
        className="task-modal-overlay"
        onClick={() => {

            if (!updatingTask) {
                setShowEditTask(false);
            }

        }}
    >

        <div
            className="task-modal"
            onClick={(e) =>
                e.stopPropagation()
            }
        >

            {/* HEADER */}

            <div className="task-modal-header">

                <div>

                    <h2>
                        Edit Task
                    </h2>

                    <p>
                        Update the task details.
                    </p>

                </div>


                <button
                    type="button"
                    className="task-modal-close"
                    onClick={() => {

                        if (!updatingTask) {
                            setShowEditTask(false);
                        }

                    }}
                >

                    <i className="bi bi-x-lg"></i>

                </button>

            </div>


            {/* FORM */}

            <form
                onSubmit={handleUpdateTask}
                className="task-form"
            >

                {/* TITLE */}

                <div className="task-form-group">

                    <label>
                        Task Title
                    </label>

                    <input
                        type="text"
                        placeholder="Enter task title"
                        value={editTaskForm.title || ""}
                        onChange={(e) =>
                            setEditTaskForm({
                                ...editTaskForm,
                                title: e.target.value
                            })
                        }
                        required
                    />

                </div>


                {/* DESCRIPTION */}

                <div className="task-form-group">

                    <label>
                        Description
                    </label>

                    <textarea
                        placeholder="Describe what needs to be done..."
                        rows="4"
                        value={editTaskForm.description}
                        onChange={(e) =>
                            setEditTaskForm({
                                ...editTaskForm,
                                description: e.target.value
                            })
                        }
                    />

                </div>


                {/* PRIORITY */}

                <div className="task-form-group">

                    <label>
                        Priority
                    </label>

                    <select
                        value={editTaskForm.priority}
                        onChange={(e) =>
                            setEditTaskForm({
                                ...editTaskForm,
                                priority: e.target.value
                            })
                        }
                    >

                        <option value="LOW">
                            Low
                        </option>

                        <option value="MEDIUM">
                            Medium
                        </option>

                        <option value="HIGH">
                            High
                        </option>

                    </select>

                </div>

                {/* DEADLINE */}

<div className="task-form-group">

    <label>
        Deadline
    </label>

    <input
        type="datetime-local"
        value={editTaskForm.deadline}
        onChange={(e) =>
            setEditTaskForm({
                ...editTaskForm,
                deadline: e.target.value
            })
        }
    />

</div>


                {/* STATUS */}

                <div className="task-form-group">

                    <label>
                        Status
                    </label>

                    <select
                        value={editTaskForm.status}
                        onChange={(e) =>
                            setEditTaskForm({
                                ...editTaskForm,
                                status: e.target.value
                            })
                        }
                    >

                        <option value="TODO">
                            To Do
                        </option>

                        <option value="IN_PROGRESS">
                            In Progress
                        </option>

                        <option value="IN_REVIEW">
                            In Review
                        </option>

                        <option value="DONE">
                            Done
                        </option>

                    </select>

                </div>


                {/* BUTTONS */}

                <div className="task-form-actions">

                    <button
                        type="button"
                        className="task-cancel-btn"
                        onClick={() => {

                            if (!updatingTask) {
                                setShowEditTask(false);
                            }

                        }}
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        className="task-create-btn"
                        disabled={updatingTask}
                    >

                        {updatingTask
                            ? "Saving..."
                            : "Save Changes"}

                    </button>

                </div>

            </form>

        </div>

    </div>

)}



            {/* =========================================
                CREATE TASK MODAL
            ========================================= */}

            {showCreateTask && (

                <div
                    className="task-modal-overlay"
                    onClick={() => {

                        if (!creatingTask) {

                            setShowCreateTask(false);

                        }

                    }}
                >


                    <div
                        className="task-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >


                        {/* Modal Header */}

                        <div className="task-modal-header">


                            <div>

                                <h2>
                                    Create Task
                                </h2>

                                <p>
                                    Add a new task to this project.
                                </p>

                            </div>



                            <button
                                type="button"
                                className="task-modal-close"
                                onClick={() => {

                                    if (!creatingTask) {

                                        setShowCreateTask(false);

                                    }

                                }}
                            >

                                <i className="bi bi-x-lg"></i>

                            </button>


                        </div>



                        {/* Form */}

                        <form
                            onSubmit={handleCreateTask}
                            className="task-form"
                        >


                            {/* Title */}

                            <div className="task-form-group">


                                <label>
                                    Task Title
                                </label>


                                <input
                                    type="text"
                                    placeholder="e.g. Fix authentication bug"
                                    value={taskForm.title}
                                    onChange={(e) =>
                                        setTaskForm({
                                            ...taskForm,
                                            title: e.target.value
                                        })
                                    }
                                    required
                                />

                            </div>



                            {/* Description */}

                            <div className="task-form-group">


                                <label>
                                    Description
                                </label>


                                <textarea
                                    placeholder="Describe what needs to be done..."
                                    rows="4"
                                    value={taskForm.description}
                                    onChange={(e) =>
                                        setTaskForm({
                                            ...taskForm,
                                            description:
                                                e.target.value
                                        })
                                    }
                                />

                            </div>



                            {/* Priority */}

                            <div className="task-form-group">


                                <label>
                                    Priority
                                </label>


                                <select
                                    value={taskForm.priority}
                                    onChange={(e) =>
                                        setTaskForm({
                                            ...taskForm,
                                            priority: e.target.value
                                        })
                                    }
                                >

                                    <option value="LOW">
                                        Low
                                    </option>

                                    <option value="MEDIUM">
                                        Medium
                                    </option>

                                    <option value="HIGH">
                                        High
                                    </option>

                                </select>

                            </div>

                            {/* Deadline */}

<div className="task-form-group">

    <label>
        Deadline
    </label>

    <input
        type="datetime-local"
        value={taskForm.deadline}
        onChange={(e) =>
            setTaskForm({
                ...taskForm,
                deadline: e.target.value
            })
        }
    />

</div>



                            {/* Buttons */}

                            <div className="task-form-actions">


                                <button
                                    type="button"
                                    className="task-cancel-btn"
                                    onClick={() => {

                                        if (!creatingTask) {

                                            setShowCreateTask(false);

                                        }

                                    }}
                                >

                                    Cancel

                                </button>



                                <button
                                    type="submit"
                                    className="task-create-btn"
                                    disabled={creatingTask}
                                >

                                    {creatingTask
                                        ? "Creating..."
                                        : "Create Task"}

                                </button>


                            </div>


                        </form>


                    </div>

                </div>

            )}


        </div>

    );

}


export default ProjectDetails;