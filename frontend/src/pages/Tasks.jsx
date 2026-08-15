import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import "../styles/confirmModal.css";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";
import { getMyTeams } from "../services/teamService";
import { getProjectsByTeam } from "../services/projectService";
import {
    getTasksByProject,
    createTask,
    updateTask,
    deleteTask
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

import "../styles/tasks.css";


function Tasks() {

    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    // =========================================
// SEARCH
// =========================================

const [searchQuery, setSearchQuery] = useState("");
const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
// =========================================
// SORTING
// =========================================

const [sortOption, setSortOption] = useState("DEFAULT");
const [showSortOptions, setShowSortOptions] = useState(false);

// =========================================
// FILTERING
// =========================================

const [filterStatus, setFilterStatus] = useState("ALL");
const [filterPriority, setFilterPriority] = useState("ALL");
const [showFilterOptions, setShowFilterOptions] = useState(false);

const tasksControlsRef = useRef(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    // Track which task is currently being updated
    const [updatingTaskId, setUpdatingTaskId] = useState(null);
    // =========================================
// EDIT TASK MODAL
// =========================================

const [showEditTask, setShowEditTask] = useState(false);

const [editingTask, setEditingTask] = useState(null);

const [editTaskForm, setEditTaskForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    status: "TODO",
    deadline: ""
});

const [savingEditTask, setSavingEditTask] = useState(false);

    // =========================================
    // COMMENTS
    // =========================================

    const [expandedComments, setExpandedComments] = useState(null);

    const [comments, setComments] = useState({});

    const [loadingComments, setLoadingComments] = useState(false);

    const [commentText, setCommentText] = useState("");

    const [submittingComment, setSubmittingComment] = useState(false);

    const [editingCommentId, setEditingCommentId] = useState(null);

    const [editingCommentText, setEditingCommentText] = useState("");

    // =========================================
// ATTACHMENTS
// =========================================

const [expandedAttachments, setExpandedAttachments] = useState(null);

const [attachments, setAttachments] = useState({});

const [loadingAttachments, setLoadingAttachments] = useState(false);

const [uploadingAttachment, setUploadingAttachment] = useState(false);

const [deletingAttachmentId, setDeletingAttachmentId] = useState(null);

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
    // LOAD COMMENTS
    // =========================================

    const handleLoadComments = async (taskId) => {

        try {

            setLoadingComments(true);

            const data = await getComments(taskId);

            setComments((previous) => ({
                ...previous,
                [taskId]: data
            }));

        } catch (err) {

            console.error(
                "Failed to load comments:",
                err
            );

            toast.error(
                err.response?.data ||
                "Failed to load comments."
            );

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
            setEditingCommentId(null);
            setEditingCommentText("");
            return;
     }

        setExpandedComments(taskId);

        await handleLoadComments(taskId);
    };


    // =========================================
    // ADD COMMENT
    // =========================================

    const handleAddComment = async (taskId) => {

        if (!commentText.trim()) {
            return;
        }

        try {

            setSubmittingComment(true);

            const newComment = await addComment(
                taskId,
                commentText.trim()
            );

            setComments((previous) => ({
                ...previous,
                [taskId]: [
                    ...(previous[taskId] || []),
                    newComment
                ]
            }));

            setCommentText("");

        } catch (err) {

            console.error(
                "Failed to add comment:",
                err
            );

            toast.error(
                err.response?.data ||
                "Failed to add comment."
            );

        } finally {

            setSubmittingComment(false);

        }
    };


    // =========================================
    // START EDIT COMMENT
    // =========================================

    const handleStartEditComment = (comment) => {

        setEditingCommentId(comment.id);

        setEditingCommentText(comment.content);
    };


    // =========================================
    // UPDATE COMMENT
    // =========================================

    const handleUpdateComment = async (
        taskId,
        commentId
    ) => {

        if (!editingCommentText.trim()) {
            return;
        }

        try {

            const updatedComment =
                await updateComment(
                    taskId,
                    commentId,
                    editingCommentText.trim()
                );

            setComments((previous) => ({
                ...previous,
                [taskId]: (previous[taskId] || []).map(
                    (comment) =>
                        comment.id === commentId
                            ? updatedComment
                            : comment
                )
            }));

            setEditingCommentId(null);
            setEditingCommentText("");

        } catch (err) {

            console.error(
                "Failed to update comment:",
                err
            );

            toast.error(
                err.response?.data ||
                "Failed to update comment."
            );

        }
    };

    // =========================================
// OPEN CONFIRMATION MODAL
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


// =========================================
// CLOSE CONFIRMATION MODAL
// =========================================

const closeConfirmModal = () => {

    setShowConfirmModal(false);

    setConfirmAction(null);

};


    // =========================================
    // DELETE COMMENT
    // =========================================

  

const handleDeleteComment = async (
    taskId,
    commentId
) => {

    try {

        await deleteComment(
            taskId,
            commentId
        );

        setComments((previous) => ({
            ...previous,
            [taskId]: (previous[taskId] || []).filter(
                (comment) => comment.id !== commentId
            )
        }));

        toast.success("Comment deleted successfully!");

    } catch (err) {

        console.error(
            "Failed to delete comment:",
            err
        );

        toast.error(
            err.response?.data ||
            "Failed to delete comment."
        );

    }
};


    // =========================================
    // COMMENT PERMISSIONS
    // =========================================

    const canEditComment = (comment) => {

        const currentUserId =
            localStorage.getItem("userId");

        return String(comment.authorId) ===
            String(currentUserId);
    };


    const canDeleteComment = (task, comment) => {

        const currentUserId =
            localStorage.getItem("userId");

        return (
            String(comment.authorId) ===
                String(currentUserId)
            ||
            task.teamRole === "OWNER"
            ||
            task.teamRole === "ADMIN"
        );
    };
    // =========================================
// LOAD ATTACHMENTS
// =========================================

const handleLoadAttachments = async (taskId) => {

    try {

        setLoadingAttachments(true);

        const data = await getAttachments(taskId);

        setAttachments((previous) => ({
            ...previous,
            [taskId]: data
        }));

    } catch (err) {

        console.error(
            "Failed to load attachments:",
            err
        );

        toast.error(
            err.response?.data ||
            "Failed to load attachments."
        );

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

        setAttachments((previous) => ({
            ...previous,

            [taskId]: [
                ...(previous[taskId] || []),
                newAttachment
            ]
        }));

    } catch (err) {

        console.error(
            "Failed to upload attachment:",
            err
        );

        toast.error(
            err.response?.data ||
            "Failed to upload attachment."
        );

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

        const blob =
            new Blob(
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

    } catch (err) {

        console.error(
            "Failed to download attachment:",
            err
        );

        toast.error(
            err.response?.data ||
            "Failed to download attachment."
        );
    }
};


// =========================================
// DELETE ATTACHMENT
// =========================================

const handleDeleteAttachment = async (
    taskId,
    attachmentId
) => {

    try {

        setDeletingAttachmentId(
            attachmentId
        );

        await deleteAttachment(
            taskId,
            attachmentId
        );

        setAttachments((previous) => ({
            ...previous,

            [taskId]:
                (previous[taskId] || [])
                    .filter(
                        (attachment) =>
                            attachment.id !==
                            attachmentId
                    )
        }));

        toast.success(
            "Attachment deleted successfully!"
        );

    } catch (err) {

        console.error(
            "Failed to delete attachment:",
            err
        );

        toast.error(
            err.response?.data ||
            "Failed to delete attachment."
        );

    } finally {

        setDeletingAttachmentId(null);

    }
};

// =========================================
// ATTACHMENT PERMISSIONS
// =========================================

const canDeleteAttachment = (
    task,
    attachment
) => {

    const currentUserId =
        localStorage.getItem("userId");

    return (
        String(attachment.uploadedById) ===
            String(currentUserId)
        ||
        task.teamRole === "OWNER"
        ||
        task.teamRole === "ADMIN"
    );
};


    // =========================================
    // LOAD ALL TASKS
    // =========================================

    useEffect(() => {

        const loadTasks = async () => {

            try {

                setLoading(true);

                setError("");

                // Get user's teams
                const teams = await getMyTeams();

                let allTasks = [];


                // =========================================
                // LOOP THROUGH TEAMS
                // =========================================

                for (const team of teams) {

                    try {

                        // Get projects for this team
                        const projects =
                            await getProjectsByTeam(team.id);


                        // =========================================
                        // LOOP THROUGH PROJECTS
                        // =========================================

                        for (const project of projects) {

                            try {

                                // Get tasks for this project
                                const projectTasks =
                                    await getTasksByProject(project.id);


                                // Add project + team information
                                // to every task
                                const formattedTasks =
                                    projectTasks.map(task => ({

                                        ...task,

                                        projectId:
                                            project.id,

                                        projectName:
                                            project.name,

                                        teamId:
                                            team.id,

                                        teamName:
                                            team.name,

                                        // Save the user's role
                                        // for this specific team.
                                        teamRole:
                                            team.role

                                    }));


                                allTasks.push(
                                    ...formattedTasks
                                );


                            } catch (taskError) {

                                console.error(
                                    "Failed to load tasks for project:",
                                    project.id,
                                    taskError
                                );

                            }

                        }


                    } catch (projectError) {

                        console.error(
                            "Failed to load projects for team:",
                            team.id,
                            projectError
                        );

                    }

                }


                setTasks(allTasks);


            } catch (err) {

                console.error(
                    "Failed to load tasks:",
                    err
                );

                setError(
                    "Failed to load tasks."
                );


            } finally {

                setLoading(false);

            }

        };


        loadTasks();

    }, []);


    // =========================================
    // CLOSE SEARCH / FILTER / SORT MENUS
    // =========================================

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                tasksControlsRef.current &&
                !tasksControlsRef.current.contains(event.target)
            ) {
                setShowSearchSuggestions(false);
                setShowFilterOptions(false);
                setShowSortOptions(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setShowSearchSuggestions(false);
                setShowFilterOptions(false);
                setShowSortOptions(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    // =========================================
    // COUNTS
    // =========================================

    const totalTasks =
        tasks.length;


    const todoTasks =
        tasks.filter(
            task => task.status === "TODO"
        ).length;


    const inProgressTasks =
        tasks.filter(
            task => task.status === "IN_PROGRESS"
        ).length;


    const completedTasks =
        tasks.filter(
            task => task.status === "DONE"
        ).length;

    // =========================================
// SEARCHED TASKS
// =========================================

const filteredTasks = tasks.filter((task) => {
    const query = searchQuery.trim().toLowerCase();

    const matchesSearch = !query || (
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.projectName?.toLowerCase().includes(query) ||
        task.teamName?.toLowerCase().includes(query)
    );

    const matchesStatus =
        filterStatus === "ALL" ||
        task.status === filterStatus;

    const matchesPriority =
        filterPriority === "ALL" ||
        task.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
});

const hasActiveFilters =
    filterStatus !== "ALL" ||
    filterPriority !== "ALL";

// =========================================
// SEARCH SUGGESTIONS
// =========================================

const searchSuggestions = searchQuery.trim()
    ? tasks
        .filter((task) => {
            const query = searchQuery.trim().toLowerCase();

            return (
                task.title?.toLowerCase().includes(query) ||
                task.projectName?.toLowerCase().includes(query)
            );
        })
        .slice(0, 5)
    : [];

    // =========================================
// SORTED TASKS
// =========================================

const sortedTasks = [...filteredTasks].sort((a, b) => {

    // Default order
    if (sortOption === "DEFAULT") {
        return 0;
    }

    // Task name A-Z
    if (sortOption === "NAME_ASC") {
        return (a.title || "").localeCompare(
            b.title || ""
        );
    }

    // Task name Z-A
    if (sortOption === "NAME_DESC") {
        return (b.title || "").localeCompare(
            a.title || ""
        );
    }

    // Priority High -> Low
    if (sortOption === "PRIORITY_HIGH") {

        const priorityOrder = {
            HIGH: 3,
            MEDIUM: 2,
            LOW: 1
        };

        return (
            (priorityOrder[b.priority] || 0) -
            (priorityOrder[a.priority] || 0)
        );
    }

    // Priority Low -> High
    if (sortOption === "PRIORITY_LOW") {

        const priorityOrder = {
            HIGH: 3,
            MEDIUM: 2,
            LOW: 1
        };

        return (
            (priorityOrder[a.priority] || 0) -
            (priorityOrder[b.priority] || 0)
        );
    }

    // Deadline nearest first
    if (sortOption === "DEADLINE_NEAREST") {

        if (!a.deadline && !b.deadline) {
            return 0;
        }

        if (!a.deadline) {
            return 1;
        }

        if (!b.deadline) {
            return -1;
        }

        return (
            new Date(a.deadline) -
            new Date(b.deadline)
        );
    }

    // Deadline farthest first
    if (sortOption === "DEADLINE_FARTHEST") {

        if (!a.deadline && !b.deadline) {
            return 0;
        }

        if (!a.deadline) {
            return 1;
        }

        if (!b.deadline) {
            return -1;
        }

        return (
            new Date(b.deadline) -
            new Date(a.deadline)
        );
    }

    return 0;
});


    // =========================================
    // STATUS LABEL
    // =========================================

    const getStatusLabel = (status) => {

        if (status === "TODO") {
            return "To Do";
        }

        if (status === "IN_PROGRESS") {
            return "In Progress";
        }

        if (status === "IN_REVIEW") {
            return "In Review";
        }

        if (status === "DONE") {
            return "Done";
        }

        return status;

    };


    // =========================================
    // PRIORITY LABEL
    // =========================================

    const getPriorityLabel = (priority) => {

        if (priority === "LOW") {
            return "Low";
        }

        if (priority === "MEDIUM") {
            return "Medium";
        }

        if (priority === "HIGH") {
            return "High";
        }

        return priority;

    };
    // =========================================
// DELETE TASK
// =========================================

const [showDeleteTask, setShowDeleteTask] = useState(false);

const [deletingTask, setDeletingTask] = useState(null);

const [deletingTaskLoading, setDeletingTaskLoading] =
    useState(false);

    // =========================================
// OPEN DELETE CONFIRMATION
// =========================================

const openDeleteTask = (task) => {

    setDeletingTask(task);

    setShowDeleteTask(true);
};


// =========================================
// CLOSE DELETE CONFIRMATION
// =========================================

const closeDeleteTask = () => {

    if (deletingTaskLoading) {
        return;
    }

    setShowDeleteTask(false);

    setDeletingTask(null);
};


// =========================================
// DELETE TASK
// =========================================

const handleDeleteTask = async () => {

    if (!deletingTask) {
        return;
    }

    try {

        setDeletingTaskLoading(true);

        await deleteTask(
            deletingTask.projectId,
            deletingTask.id
        );

        // Remove task immediately from the UI
        setTasks(previousTasks =>
            previousTasks.filter(
                task =>
                    !(
                        task.id === deletingTask.id &&
                        task.projectId === deletingTask.projectId
                    )
            )
        );

        closeDeleteTask();

        toast.success("Task deleted successfully!");

    } catch (err) {

        console.error(
            "Failed to delete task:",
            err
        );

        if (err.response?.status === 403) {

            toast.error(
                "You do not have permission to delete this task."
            );

        } else {

            toast.error(
                err.response?.data ||
                "Failed to delete task."
            );

        }

    } finally {

        setDeletingTaskLoading(false);
    }
};
// =========================================
// DELETE PERMISSION
// =========================================

const canDeleteTask = (task) => {
    return (
        task.teamRole === "OWNER" ||
        task.teamRole === "ADMIN"
    );
};




    // =========================================
    // CHECK IF USER CAN UPDATE TASK
    // =========================================

    const canUpdateTask = (task) => {

        return (
            task.teamRole === "OWNER" ||
            task.teamRole === "ADMIN"
        );

    };


    // =========================================
    // UPDATE TASK STATUS
    // =========================================

    const handleStatusChange = async (
        task,
        newStatus
    ) => {

        // Don't do anything if status
        // hasn't actually changed
        if (newStatus === task.status) {
            return;
        }


        try {

            setUpdatingTaskId(task.id);


            /*
             * Backend UpdateTaskRequest accepts:
             *
             * title
             * description
             * priority
             * status
             *
             * So we send all existing values
             * instead of sending only status.
             */

            const updatedTask =
                await updateTask(
                    task.projectId,
                    task.id,
                    {
                        title:
                            task.title,

                        description:
                            task.description || "",

                        priority:
                            task.priority,

                        status:
                            newStatus
                    }
                );


            // Update the task in the existing list
            setTasks(previousTasks =>
                previousTasks.map(currentTask => {

                    if (
                        currentTask.id === task.id &&
                        currentTask.projectId === task.projectId
                    ) {

                        return {

                            ...currentTask,

                            ...updatedTask,

                            // Preserve frontend-only
                            // information returned
                            // from our project/team loop
                            projectId:
                                currentTask.projectId,

                            projectName:
                                currentTask.projectName,

                            teamId:
                                currentTask.teamId,

                            teamName:
                                currentTask.teamName,

                            teamRole:
                                currentTask.teamRole

                        };

                    }

                    return currentTask;

                })
            );

        toast.success("Task status updated successfully!");


        } catch (err) {

            console.error(
                "Failed to update task status:",
                err
            );


            toast.error(
                "Failed to update task status. Please try again."
            );


        } finally {

            setUpdatingTaskId(null);

        }

    };


    // =========================================
    // UPDATE TASK PRIORITY
    // =========================================

    const handlePriorityChange = async (
        task,
        newPriority
    ) => {

        // Don't do anything if priority
        // hasn't actually changed
        if (newPriority === task.priority) {
            return;
        }


        try {

            setUpdatingTaskId(task.id);


            /*
             * Backend UpdateTaskRequest accepts:
             *
             * title
             * description
             * priority
             * status
             *
             * So we keep the existing title,
             * description and status.
             */

            const updatedTask =
                await updateTask(
                    task.projectId,
                    task.id,
                    {
                        title:
                            task.title,

                        description:
                            task.description || "",

                        priority:
                            newPriority,

                        status:
                            task.status
                    }
                );


            // Update only this task in the list
            setTasks(previousTasks =>
                previousTasks.map(currentTask => {

                    if (
                        currentTask.id === task.id &&
                        currentTask.projectId === task.projectId
                    ) {

                        return {

                            ...currentTask,

                            ...updatedTask,

                            // Preserve frontend-only
                            // information
                            projectId:
                                currentTask.projectId,

                            projectName:
                                currentTask.projectName,

                            teamId:
                                currentTask.teamId,

                            teamName:
                                currentTask.teamName,

                            teamRole:
                                currentTask.teamRole

                        };

                    }

                    return currentTask;

                })
            );

        toast.success("Task priority updated successfully!");


        } catch (err) {

            console.error(
                "Failed to update task priority:",
                err
            );


            toast.error(
                "Failed to update task priority. Please try again."
            );


        } finally {

            setUpdatingTaskId(null);

        }

    };
    // =========================================
// OPEN EDIT TASK MODAL
// =========================================

const openEditTask = (task) => {

    setEditingTask(task);

    setEditTaskForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "MEDIUM",
        status: task.status || "TODO",
        deadline: task.deadline
            ? task.deadline.slice(0, 16)
            : ""
    });

    setShowEditTask(true);
};


// =========================================
// CLOSE EDIT TASK MODAL
// =========================================

const closeEditTask = () => {

    setShowEditTask(false);

    setEditingTask(null);

    setEditTaskForm({
        title: "",
        description: "",
        priority: "MEDIUM",
        status: "TODO",
        deadline: ""
    });
};


// =========================================
// HANDLE EDIT FORM CHANGE
// =========================================

const handleEditTaskChange = (e) => {

    const { name, value } = e.target;

    setEditTaskForm(previous => ({
        ...previous,
        [name]: value
    }));
};


// =========================================
// SAVE EDITED TASK
// =========================================

const handleEditTaskSubmit = async (e) => {

    e.preventDefault();

    if (!editingTask) {
        return;
    }

    if (!editTaskForm.title.trim()) {
        toast.error("Task title cannot be empty.");
        return;
    }

    try {

        setSavingEditTask(true);

        const updatedTask = await updateTask(
            editingTask.projectId,
            editingTask.id,
            {
                title: editTaskForm.title.trim(),

                description:
                    editTaskForm.description.trim(),

                priority:
                    editTaskForm.priority,

                status:
                    editTaskForm.status,
                deadline:
        editTaskForm.deadline
            ? editTaskForm.deadline + ":00"
            : null
            }
        );


        // Update the task immediately on the page
        setTasks(previousTasks =>
            previousTasks.map(currentTask => {

                if (
                    currentTask.id === editingTask.id &&
                    currentTask.projectId === editingTask.projectId
                ) {

                    return {
                        ...currentTask,

                        ...updatedTask,

                        // Keep frontend-only information
                        projectId:
                            currentTask.projectId,

                        projectName:
                            currentTask.projectName,

                        teamId:
                            currentTask.teamId,

                        teamName:
                            currentTask.teamName,

                        teamRole:
                            currentTask.teamRole
                    };
                }

                return currentTask;
            })
        );


        closeEditTask();

        toast.success("Task updated successfully!");


    } catch (err) {

        console.error(
            "Failed to update task:",
            err
        );

        toast.error(
            "Failed to update task. Please try again."
        );

    } finally {

        setSavingEditTask(false);
    }
};


    // =========================================
    // LOADING
    // =========================================

    if (loading) {

    return (
    <div className="tasks-layout">

        <Sidebar />

        <main className="tasks-page">

            <div className="tasks-loading">

                <i className="bi bi-arrow-repeat"></i>

                <h2>
                    Loading tasks...
                </h2>

                <p>
                    Getting your project tasks.
                </p>

            </div>

        </main>


    </div>
);

    }


    // =========================================
    // ERROR
    // =========================================

    if (error) {

        return (

            <div className="tasks-layout">

                <Sidebar />

                <main className="tasks-page">

                    <div className="tasks-error">

                        <i className="bi bi-exclamation-circle"></i>

                        <h2>
                            Something went wrong
                        </h2>

                        <p>
                            {error}
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

        <div className="tasks-layout">

            <Sidebar />


            <main className="tasks-page">


                {/* =================================
                    HEADER
                ================================= */}

                <div className="tasks-header">

                    <div>

                        <h1>
                            Tasks
                        </h1>

                        <p>
                            Manage and track all your project tasks.
                        </p>

                    </div>

                </div>


                {/* =================================
                    STATISTICS
                ================================= */}

                <div className="tasks-stats">


                    {/* Total */}

                    <div className="tasks-stat-card">

                        <div className="tasks-stat-icon">

                            <i className="bi bi-list-check"></i>

                        </div>

                        <div>

                            <span>
                                Total Tasks
                            </span>

                            <strong>
                                {totalTasks}
                            </strong>

                        </div>

                    </div>


                    {/* To Do */}

                    <div className="tasks-stat-card">

                        <div className="tasks-stat-icon todo-icon">

                            <i className="bi bi-circle"></i>

                        </div>

                        <div>

                            <span>
                                To Do
                            </span>

                            <strong>
                                {todoTasks}
                            </strong>

                        </div>

                    </div>


                    {/* In Progress */}

                    <div className="tasks-stat-card">

                        <div className="tasks-stat-icon progress-icon">

                            <i className="bi bi-arrow-repeat"></i>

                        </div>

                        <div>

                            <span>
                                In Progress
                            </span>

                            <strong>
                                {inProgressTasks}
                            </strong>

                        </div>

                    </div>


                    {/* Completed */}

                    <div className="tasks-stat-card">

                        <div className="tasks-stat-icon done-icon">

                            <i className="bi bi-check-circle-fill"></i>

                        </div>

                        <div>

                            <span>
                                Completed
                            </span>

                            <strong>
                                {completedTasks}
                            </strong>

                        </div>

                    </div>


                </div>


                <div className="tasks-section">


                    <div className="tasks-section-header">

                        <div>

                            <h2>
                                All Tasks
                            </h2>

                            <p>
                                Tasks from all your projects.
                            </p>

                        </div>

                        <div className="tasks-controls-wrapper" ref={tasksControlsRef}>

                            <div className="tasks-search-wrapper">

                                <i className="bi bi-search"></i>

                                <input
                                    type="text"
                                    className="tasks-search-input"
                                    placeholder="Search tasks..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowSearchSuggestions(true);
                                    }}
                                    onFocus={() => {
                                        if (searchQuery.trim()) {
                                            setShowSearchSuggestions(true);
                                        }
                                    }}
                                />

                                {showSearchSuggestions &&
                                    searchQuery.trim() &&
                                    searchSuggestions.length > 0 && (

                                    <div className="tasks-search-suggestions">

                                        {searchSuggestions.map((task) => (

                                            <button
                                                key={`${task.projectId}-${task.id}`}
                                                type="button"
                                                className="tasks-search-suggestion"
                                                onClick={() => {
                                                    setSearchQuery(task.title);
                                                    setShowSearchSuggestions(false);
                                                }}
                                            >

                                                <div className="tasks-search-suggestion-icon">
                                                    <i className="bi bi-check2-square"></i>
                                                </div>

                                                <div className="tasks-search-suggestion-content">

                                                    <strong>
                                                        {task.title}
                                                    </strong>

                                                    <span>
                                                        {task.projectName}
                                                    </span>

                                                </div>

                                            </button>

                                        ))}

                                    </div>
                                )}

                                {searchQuery && (
                                    <button
                                        type="button"
                                        className="tasks-search-clear"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setShowSearchSuggestions(false);
                                        }}
                                        title="Clear search"
                                    >
                                        <i className="bi bi-x"></i>
                                    </button>
                                )}

                            </div>

                            <div className="tasks-sort-wrapper">

                                <button
                                    type="button"
                                    className="tasks-sort-button"
                                    onClick={() => {
                                        setShowFilterOptions(previous => !previous);
                                        setShowSortOptions(false);
                                    }}
                                >
                                    <i className="bi bi-funnel-fill"></i>
                                    <span>Filter</span>
                                    {hasActiveFilters && (
                                        <span>
                                            ({[
                                                filterStatus !== "ALL",
                                                filterPriority !== "ALL"
                                            ].filter(Boolean).length})
                                        </span>
                                    )}
                                    <i className="bi bi-chevron-down"></i>
                                </button>

                                {showFilterOptions && (
                                    <div className="tasks-sort-menu">

                                        <div className="tasks-filter-group">
                                            <div
                                                className="tasks-sort-option"
                                                style={{ cursor: "default", fontWeight: 600, opacity: 0.7 }}
                                            >
                                                Status
                                            </div>

                                            {[
                                                ["ALL", "All statuses"],
                                                ["TODO", "To Do"],
                                                ["IN_PROGRESS", "In Progress"],
                                                ["IN_REVIEW", "In Review"],
                                                ["DONE", "Completed"]
                                            ].map(([value, label]) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    className={`tasks-sort-option ${
                                                        filterStatus === value ? "active" : ""
                                                    }`}
                                                    onClick={() => setFilterStatus(filterStatus === value && value !== "ALL" ? "ALL" : value)}
                                                >
                                                    <span>{label}</span>
                                                    {filterStatus === value && (
                                                        <i className="bi bi-check2"></i>
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="tasks-filter-group">
                                            <div
                                                className="tasks-sort-option"
                                                style={{ cursor: "default", fontWeight: 600, opacity: 0.7 }}
                                            >
                                                Priority
                                            </div>

                                            {[
                                                ["ALL", "All priorities"],
                                                ["LOW", "Low"],
                                                ["MEDIUM", "Medium"],
                                                ["HIGH", "High"]
                                            ].map(([value, label]) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    className={`tasks-sort-option ${
                                                        filterPriority === value ? "active" : ""
                                                    }`}
                                                    onClick={() => setFilterPriority(filterPriority === value && value !== "ALL" ? "ALL" : value)}
                                                >
                                                    <span>{label}</span>
                                                    {filterPriority === value && (
                                                        <i className="bi bi-check2"></i>
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {hasActiveFilters && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="tasks-sort-option"
                                                    onClick={() => {
                                                        setFilterStatus("ALL");
                                                        setFilterPriority("ALL");
                                                    }}
                                                >
                                                    <i className="bi bi-x-circle"></i>
                                                    Clear filters
                                                </button>
                                            </>
                                        )}

                                    </div>
                                )}

                            </div>

                            <div className="tasks-sort-wrapper">

                                <button
                                    type="button"
                                    className="tasks-sort-button"
                                    onClick={() => {
                                        setShowSortOptions(previous => !previous);
                                        setShowFilterOptions(false);
                                    }}
                                >
                                    <i className="bi bi-arrow-down-up"></i>
                                    <span>Sort</span>
                                    <i className="bi bi-chevron-down"></i>
                                </button>

                                {showSortOptions && (
                                    <div className="tasks-sort-menu">

                                        {[
                                            ["DEFAULT", "Default order"],
                                            ["NAME_ASC", "Task name: A → Z"],
                                            ["NAME_DESC", "Task name: Z → A"],
                                            ["PRIORITY_HIGH", "Priority: High → Low"],
                                            ["PRIORITY_LOW", "Priority: Low → High"],
                                            ["DEADLINE_NEAREST", "Deadline: Nearest first"],
                                            ["DEADLINE_FARTHEST", "Deadline: Farthest first"]
                                        ].map(([value, label]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                className={`tasks-sort-option ${
                                                    sortOption === value ? "active" : ""
                                                }`}
                                                onClick={() => {
                                                    setSortOption(value);
                                                    setShowSortOptions(false);
                                                }}
                                            >
                                                <span>{label}</span>

                                                {sortOption === value && (
                                                    <i className="bi bi-check2"></i>
                                                )}
                                            </button>
                                        ))}

                                    </div>
                                )}

                            </div>

                        </div>

                    </div>


                    {/* =================================
                        NO TASKS
                    ================================= */}

                    {tasks.length === 0 ? (

                        <div className="tasks-empty">

                            <div className="tasks-empty-icon">

                                <i className="bi bi-check2-square"></i>

                            </div>

                            <h3>
                                No tasks yet
                            </h3>

                            <p>
                                Tasks created in your projects
                                will appear here.
                            </p>

                        </div>

                    ) : (


                        /* =================================
                           TASK LIST
                        ================================= */

                        <div className="all-tasks-list">

                            {sortedTasks.map(task => (

                                <div
                                    className="all-task-card"
                                    key={`${task.projectId}-${task.id}`}
                                >


                                    {/* =================================
                                        TASK HEADING
                                    ================================= */}

                                    <div className="all-task-top">


                                       <div className="all-task-title">

    <h3>
        {task.title}
    </h3>


    {/* =================================
        EDIT TASK
    ================================= */}

    <div className="all-task-actions">

        {canUpdateTask(task) && (

            <button
                type="button"
                className="edit-task-button"
                onClick={() => openEditTask(task)}
            >
                <i className="bi bi-pencil-fill"></i>
                Edit
            </button>

        )}

        {canDeleteTask(task) && (

            <button
                type="button"
                className="delete-task-button"
                onClick={() => openDeleteTask(task)}
                title="Delete Task"
            >
                <i className="bi bi-trash-fill"></i>
                Delete
            </button>

        )}

    </div>


    {/* =================================
        STATUS
    ================================= */}

    {canUpdateTask(task) ? (

                                                <div className="task-select-wrapper">

                                                    <select
                                                        className={
                                                            `all-task-status-select ${
                                                                task.status
                                                                    ?.toLowerCase()
                                                            }`
                                                        }
                                                        value={
                                                            task.status
                                                        }
                                                        disabled={
                                                            updatingTaskId === task.id
                                                        }
                                                        onChange={(e) =>
                                                            handleStatusChange(
                                                                task,
                                                                e.target.value
                                                            )
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

                                            ) : (

                                                <span
                                                    className={
                                                        `all-task-status ${
                                                            task.status
                                                                ?.toLowerCase()
                                                        }`
                                                    }
                                                >

                                                    {getStatusLabel(
                                                        task.status
                                                    )}

                                                </span>

                                            )}

                                        </div>


                                        {/* =================================
                                            PRIORITY
                                        ================================= */}

                                        {canUpdateTask(task) ? (

                                            <div className="task-select-wrapper priority-select-wrapper">

                                                <select
                                                    className={
                                                        `all-task-priority-select ${
                                                            task.priority
                                                                ?.toLowerCase()
                                                        }`
                                                    }
                                                    value={
                                                        task.priority
                                                    }
                                                    disabled={
                                                        updatingTaskId === task.id
                                                    }
                                                    onChange={(e) =>
                                                        handlePriorityChange(
                                                            task,
                                                            e.target.value
                                                        )
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

                                        ) : (

                                            <span
                                                className={
                                                    `all-task-priority ${
                                                        task.priority
                                                            ?.toLowerCase()
                                                    }`
                                                }
                                            >

                                                {getPriorityLabel(
                                                    task.priority
                                                )}

                                            </span>

                                        )}


                                    </div>


                                    {/* =================================
                                        DESCRIPTION
                                    ================================= */}

                                    <p className="all-task-description">

                                        {task.description ||
                                            "No description provided."}

                                    </p>


                                    {/* =================================
                                        PROJECT
                                    ================================= */}

                                    <button
                                        className="task-project-link"
                                        onClick={() =>
                                            navigate(
                                                `/projects/${task.projectId}`
                                            )
                                        }
                                    >

                                        <i className="bi bi-folder-fill"></i>

                                        {task.projectName}

                                    </button>


                                    {/* =================================
                                        TASK INFORMATION
                                    ================================= */}

                                    <div className="all-task-meta">


                                        {/* Assignee */}

                                        <div>

                                            <i className="bi bi-person-fill"></i>

                                            <span>

                                                {task.assignee ||
                                                    "Unassigned"}

                                            </span>

                                        </div>


                                        {/* Created By */}

                                        <div>

                                            <i className="bi bi-person-plus-fill"></i>

                                            <span>

                                                Created by{" "}

                                                {task.createdBy ||
                                                    "Unknown"}

                                            </span>

                                        </div>
                                        {/* Deadline */}

<div>
    <i className="bi bi-calendar-event"></i>

    <span>
        {task.deadline
            ? new Date(task.deadline).toLocaleString()
            : "No deadline"}
    </span>
</div>


                                    </div>


                                    {/* =================================
                                        COMMENTS
                                    ================================= */}

                                   {/* =================================
    COMMENTS
================================= */}

<div className="tasks-comments-section">

    <button
        type="button"
        className="tasks-comments-toggle"
        onClick={() =>
            handleToggleComments(task.id)
        }
    >

        <span>

            <i className="bi bi-chat-left-text-fill"></i>

            Comments

            {comments[task.id]
                ? ` (${comments[task.id].length})`
                : ""}

        </span>

        <i
            className={`bi ${
                expandedComments === task.id
                    ? "bi-chevron-up"
                    : "bi-chevron-down"
            }`}
        ></i>

    </button>


    {/* =================================
        COMMENTS PANEL
    ================================= */}

    {expandedComments === task.id && (

        <div className="tasks-comments-panel">

            {loadingComments ? (

                <div className="tasks-comments-loading">

                    <i className="bi bi-arrow-repeat"></i>

                    Loading comments...

                </div>

            ) : (

                <>

                    {(!comments[task.id] ||
                        comments[task.id].length === 0) ? (

                        <div className="tasks-no-comments">

                            <i className="bi bi-chat"></i>

                            <p>
                                No comments yet.
                            </p>

                        </div>

                    ) : (

                        <div className="tasks-comments-list">

                            {comments[task.id].map(
                                comment => (

                                    <div
                                        className="tasks-comment-card"
                                        key={comment.id}
                                    >

                                        <div className="tasks-comment-header">

                                            <div className="tasks-comment-author">

                                                <i className="bi bi-person-circle"></i>

                                                <strong>
                                                    {comment.author}
                                                </strong>

                                            </div>

                                            <span className="tasks-comment-date">

                                                {comment.createdAt
                                                    ? new Date(
                                                        comment.createdAt
                                                    ).toLocaleString()
                                                    : ""}

                                            </span>

                                        </div>


                                        {editingCommentId === comment.id ? (

                                            <div className="tasks-comment-edit-box">

                                                <textarea
                                                    value={
                                                        editingCommentText
                                                    }
                                                    onChange={(e) =>
                                                        setEditingCommentText(
                                                            e.target.value
                                                        )
                                                    }
                                                    rows="3"
                                                />

                                                <div className="tasks-comment-actions">

                                                    <button
                                                        type="button"
                                                        className="tasks-comment-cancel"
                                                        onClick={() => {

                                                            setEditingCommentId(
                                                                null
                                                            );

                                                            setEditingCommentText(
                                                                ""
                                                            );

                                                        }}
                                                    >
                                                        Cancel
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="tasks-comment-save"
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

                                            <p className="tasks-comment-content">

                                                {comment.content}

                                            </p>

                                        )}


                                        {editingCommentId !== comment.id &&
                                            (
                                                canEditComment(comment) ||
                                                canDeleteComment(
                                                    task,
                                                    comment
                                                )
                                            ) && (

                                                <div className="tasks-comment-actions">

                                                    {canEditComment(comment) && (

                                                        <button
                                                            type="button"
                                                            className="tasks-comment-edit"
                                                            onClick={() =>
                                                                handleStartEditComment(
                                                                    comment
                                                                )
                                                            }
                                                        >

                                                            <i className="bi bi-pencil"></i>

                                                            Edit

                                                        </button>

                                                    )}


                                                    {canDeleteComment(
                                                        task,
                                                        comment
                                                    ) && (

                                                        <button
                                                            type="button"
                                                            className="tasks-comment-delete"
                                                          onClick={() =>
    openConfirmModal({
        title: "Delete Comment",
        message: "Are you sure you want to delete this comment?",
        confirmText: "Delete",
        action: () =>
            handleDeleteComment(
                task.id,
                comment.id
            )
    })
}
                                                        >

                                                            <i className="bi bi-trash"></i>

                                                            Delete

                                                        </button>

                                                    )}

                                                </div>

                                            )}

                                    </div>

                                )
                            )}

                        </div>

                    )}


                    <div className="tasks-add-comment-box">

                        <textarea
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={(e) =>
                                setCommentText(
                                    e.target.value
                                )
                            }
                            rows="3"
                        />

                        <button
                            type="button"
                            className="tasks-add-comment-btn"
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


{/* =================================
    ATTACHMENTS
================================= */}

<div className="tasks-attachments-section">

    <button
        type="button"
        className="tasks-attachments-toggle"
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


    {/* =================================
        ATTACHMENTS PANEL
    ================================= */}

    {expandedAttachments === task.id && (

        <div className="tasks-attachments-panel">

            {loadingAttachments ? (

                <div className="tasks-attachments-loading">

                    <i className="bi bi-arrow-repeat"></i>

                    Loading attachments...

                </div>

            ) : (

                <>

                    {(!attachments[task.id] ||
                        attachments[task.id].length === 0) ? (

                        <div className="tasks-no-attachments">

                            <i className="bi bi-paperclip"></i>

                            <p>
                                No attachments yet.
                            </p>

                        </div>

                    ) : (

                        <div className="tasks-attachments-list">

                            {attachments[task.id].map(
                                attachment => (

                                    <div
                                        className="tasks-attachment-card"
                                        key={attachment.id}
                                    >

                                        <div className="tasks-attachment-info">

                                            <div className="tasks-attachment-icon">

                                                <i className="bi bi-file-earmark"></i>

                                            </div>

                                            <div className="tasks-attachment-details">

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


                                        <div className="tasks-attachment-actions">

                                            <button
                                                type="button"
                                                className="tasks-attachment-download"
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
                                                task,
                                                attachment
                                            ) && (

                                                <button
                                                    type="button"
                                                    className="tasks-attachment-delete"
                                                    onClick={() =>
    openConfirmModal({
        title: "Delete Attachment",
        message: "Are you sure you want to delete this attachment?",
        confirmText: "Delete",
        action: () =>
            handleDeleteAttachment(
                task.id,
                attachment.id
            )
    })
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


                    {/* =================================
                        UPLOAD
                    ================================= */}

                    <div className="tasks-upload-attachment">

                        <label
                            className="tasks-upload-attachment-button"
                        >

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




                        </main>


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
                DELETE TASK MODAL
            ========================================= */}

            {showDeleteTask && deletingTask && (

                <div
                    className="delete-task-modal-overlay"
                    onClick={closeDeleteTask}
                >

                    <div
                        className="delete-task-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="delete-task-icon">

                            <i className="bi bi-trash-fill"></i>

                        </div>


                        <h2>
                            Delete Task?
                        </h2>


                        <p>

                            Are you sure you want to delete{" "}

                            <strong>
                                "{deletingTask.title}"
                            </strong>
                            ?

                            <br />

                            This action cannot be undone.

                        </p>


                        <div className="delete-task-actions">

                            <button
                                type="button"
                                className="delete-task-cancel"
                                onClick={closeDeleteTask}
                                disabled={deletingTaskLoading}
                            >
                                Cancel
                            </button>


                            <button
                                type="button"
                                className="delete-task-confirm"
                                onClick={handleDeleteTask}
                                disabled={deletingTaskLoading}
                            >

                                {deletingTaskLoading ? (

                                    <>
                                        <i className="bi bi-arrow-repeat"></i>
                                        Deleting...
                                    </>

                                ) : (

                                    <>
                                        <i className="bi bi-trash-fill"></i>
                                        Delete Task
                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* =========================================
                EDIT TASK MODAL
            ========================================= */}

            {showEditTask && editingTask && (

                <div className="edit-task-modal-overlay">

                    <div
                        className="edit-task-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* MODAL HEADER */}

                        <div className="edit-task-modal-header">

                            <div>
                                <h2>Edit Task</h2>

                                <p>
                                    Update the task details.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="edit-task-modal-close"
                                onClick={closeEditTask}
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>

                        </div>


                        {/* MODAL FORM */}

                        <form
                            onSubmit={handleEditTaskSubmit}
                            className="edit-task-form"
                        >

                            {/* TITLE */}

                            <div className="edit-task-field">

                                <label>
                                    Task Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={editTaskForm.title}
                                    onChange={handleEditTaskChange}
                                    placeholder="Enter task title"
                                    required
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="edit-task-field">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={editTaskForm.description}
                                    onChange={handleEditTaskChange}
                                    placeholder="Enter task description"
                                    rows="4"
                                />

                            </div>


                            {/* PRIORITY + STATUS */}

                            <div className="edit-task-form-row">

                                {/* PRIORITY */}

                                <div className="edit-task-field">

                                    <label>
                                        Priority
                                    </label>

                                    <select
                                        name="priority"
                                        value={editTaskForm.priority}
                                        onChange={handleEditTaskChange}
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


                                {/* STATUS */}

                                <div className="edit-task-field">

                                    <label>
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={editTaskForm.status}
                                        onChange={handleEditTaskChange}
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

                            </div>

                            {/* DEADLINE */}

<div className="edit-task-field">

    <label>
        Deadline
    </label>

    <input
        type="datetime-local"
        name="deadline"
        value={editTaskForm.deadline}
        onChange={handleEditTaskChange}
    />

    <small>
        Leave empty if this task has no deadline.
    </small>

</div>


                            {/* BUTTONS */}

                            <div className="edit-task-modal-actions">

                                <button
                                    type="button"
                                    className="edit-task-cancel-button"
                                    onClick={closeEditTask}
                                    disabled={savingEditTask}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="edit-task-save-button"
                                    disabled={savingEditTask}
                                >

                                    {savingEditTask ? (

                                        <>
                                            <i className="bi bi-arrow-repeat"></i>
                                            Saving...
                                        </>

                                    ) : (

                                        <>
                                            <i className="bi bi-check-lg"></i>
                                            Save Changes
                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}
            

       

export default Tasks;