import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";

import {
    getMyProfile,
    updateMyProfile,
    changePassword
} from "../services/userService";

import "../styles/profile.css";


function Profile() {

    // =========================================
    // PROFILE
    // =========================================

    const [profile, setProfile] = useState(null);

    const [profileName, setProfileName] = useState("");

    const [loadingProfile, setLoadingProfile] = useState(true);

    const [savingProfile, setSavingProfile] = useState(false);


    // =========================================
    // PASSWORD
    // =========================================

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [changingPassword, setChangingPassword] =
        useState(false);

    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false);

    const [showNewPassword, setShowNewPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);


    // =========================================
    // LOAD PROFILE
    // =========================================

    useEffect(() => {

        const loadProfile = async () => {

            try {

                setLoadingProfile(true);

                const data = await getMyProfile();

                setProfile(data);

                setProfileName(data.name || "");

            } catch (error) {

                console.error(
                    "Failed to load profile:",
                    error
                );

                toast.error(
                    error.response?.data ||
                    "Failed to load profile."
                );

            } finally {

                setLoadingProfile(false);

            }

        };

        loadProfile();

    }, []);


    // =========================================
    // PROFILE NAME CHANGE
    // =========================================

    const handleProfileNameChange = (e) => {

        setProfileName(e.target.value);

    };


    // =========================================
    // UPDATE PROFILE
    // =========================================

    const handleUpdateProfile = async (e) => {

        e.preventDefault();

        if (!profileName.trim()) {

            toast.error(
                "Name cannot be empty."
            );

            return;

        }

        try {

            setSavingProfile(true);

            const updatedProfile =
                await updateMyProfile({
                    name: profileName.trim()
                });

            setProfile(updatedProfile);
            localStorage.setItem(
    "userName",
    updatedProfile.name
);

            setProfileName(
                updatedProfile.name || ""
            );

            toast.success(
                "Profile updated successfully!"
            );

        } catch (error) {

            console.error(
                "Failed to update profile:",
                error
            );

            if (error.response?.status === 403) {

                toast.error(
                    "You do not have permission to update your profile."
                );

            } else {

                toast.error(
                    error.response?.data ||
                    "Failed to update profile."
                );

            }

        } finally {

            setSavingProfile(false);

        }

    };


    // =========================================
    // PASSWORD FORM CHANGE
    // =========================================

    const handlePasswordChange = (e) => {

        const { name, value } = e.target;

        setPasswordForm(previous => ({
            ...previous,
            [name]: value
        }));

    };


    // =========================================
    // CHANGE PASSWORD
    // =========================================

    const handleChangePassword = async (e) => {

        e.preventDefault();

        if (
            !passwordForm.currentPassword ||
            !passwordForm.newPassword ||
            !passwordForm.confirmPassword
        ) {

            toast.error(
                "Please fill in all password fields."
            );

            return;

        }


        if (
            passwordForm.newPassword !==
            passwordForm.confirmPassword
        ) {

            toast.error(
                "New passwords do not match."
            );

            return;

        }


        if (passwordForm.newPassword.length < 6) {

            toast.error(
                "New password must be at least 6 characters."
            );

            return;

        }


        try {

            setChangingPassword(true);

            await changePassword({
                currentPassword:
                    passwordForm.currentPassword,

                newPassword:
                    passwordForm.newPassword
            });

            toast.success(
                "Password changed successfully!"
            );

            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);

        } catch (error) {

            console.error(
                "Failed to change password:",
                error
            );

            toast.error(
                error.response?.data ||
                "Failed to change password."
            );

        } finally {

            setChangingPassword(false);

        }

    };


    // =========================================
    // LOADING
    // =========================================

    if (loadingProfile) {

        return (

            <div className="profile-layout">

                <Sidebar />

                <main className="profile-page">

                    <div className="profile-loading">

                        <i className="bi bi-arrow-repeat"></i>

                        <h2>
                            Loading profile...
                        </h2>

                        <p>
                            Getting your account information.
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

        <div className="profile-layout">

            <Sidebar />

            <main className="profile-page">

                {/* =================================
                    HEADER
                ================================= */}

                <div className="profile-header">

                    <div>

                        <h1>
                            Profile
                        </h1>

                        <p>
                            Manage your account and security settings.
                        </p>

                    </div>

                </div>


                {/* =================================
                    PROFILE OVERVIEW
                ================================= */}

                <section className="profile-overview">

                    <div className="profile-avatar">

                        {profile?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}

                    </div>


                    <div className="profile-overview-info">

                        <h2>
                            {profile?.name}
                        </h2>

                        <p>
                            {profile?.email}
                        </p>

                        <span className="profile-role-badge">

                            {profile?.role}

                        </span>

                    </div>

                </section>


                {/* =================================
                    PERSONAL INFORMATION
                ================================= */}

                <section className="profile-card">

                    <div className="profile-card-header">

                        <div className="profile-card-icon">

                            <i className="bi bi-person"></i>

                        </div>

                        <div>

                            <h2>
                                Personal Information
                            </h2>

                            <p>
                                Update your personal information.
                            </p>

                        </div>

                    </div>


                    <form
                        className="profile-form"
                        onSubmit={handleUpdateProfile}
                    >

                        {/* NAME */}

                        <div className="profile-field">

                            <label htmlFor="profile-name">
                                Name
                            </label>

                            <div className="profile-input-wrapper">

                                <i className="bi bi-person"></i>

                                <input
                                    id="profile-name"
                                    type="text"
                                    value={profileName}
                                    onChange={
                                        handleProfileNameChange
                                    }
                                    placeholder="Enter your name"
                                />

                            </div>

                        </div>


                        {/* EMAIL */}

                        <div className="profile-field">

                            <label htmlFor="profile-email">
                                Email
                            </label>

                            <div className="profile-input-wrapper profile-readonly">

                                <i className="bi bi-envelope"></i>

                                <input
                                    id="profile-email"
                                    type="email"
                                    value={profile?.email || ""}
                                    readOnly
                                />

                                <i
                                    className="bi bi-lock-fill profile-lock-icon"
                                    title="Email cannot be changed"
                                ></i>

                            </div>

                        </div>


                        {/* ROLE */}

                        <div className="profile-field">

                            <label>
                                Role
                            </label>

                            <div className="profile-readonly-value">

                                <i className="bi bi-shield-check"></i>

                                <span>
                                    {profile?.role}
                                </span>

                            </div>

                        </div>


                        {/* CREATED DATE */}

                        <div className="profile-field">

                            <label>
                                Member Since
                            </label>

                            <div className="profile-readonly-value">

                                <i className="bi bi-calendar3"></i>

                                <span>

                                    {profile?.createdAt
                                        ? new Date(
                                            profile.createdAt
                                        ).toLocaleDateString(
                                            "en-IN",
                                            {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric"
                                            }
                                        )
                                        : "—"}

                                </span>

                            </div>

                        </div>


                        <div className="profile-form-actions">

                            <button
                                type="submit"
                                className="profile-save-button"
                                disabled={savingProfile}
                            >

                                {savingProfile ? (

                                    <>
                                        <i className="bi bi-arrow-repeat"></i>
                                        Saving...
                                    </>

                                ) : (

                                    <>
                                        <i className="bi bi-check2"></i>
                                        Save Changes
                                    </>

                                )}

                            </button>

                        </div>

                    </form>

                </section>


                {/* =================================
                    CHANGE PASSWORD
                ================================= */}

                <section className="profile-card">

                    <div className="profile-card-header">

                        <div className="profile-card-icon">

                            <i className="bi bi-shield-lock"></i>

                        </div>

                        <div>

                            <h2>
                                Change Password
                            </h2>

                            <p>
                                Keep your account secure with a strong password.
                            </p>

                        </div>

                    </div>


                    <form
                        className="profile-form"
                        onSubmit={handleChangePassword}
                    >

                        {/* CURRENT PASSWORD */}

                        <div className="profile-field">

                            <label htmlFor="current-password">
                                Current Password
                            </label>

                            <div className="profile-input-wrapper">

                                <i className="bi bi-lock"></i>

                                <input
                                    id="current-password"
                                    name="currentPassword"
                                    type={
                                        showCurrentPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={
                                        passwordForm.currentPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Enter current password"
                                />

                                <button
                                    type="button"
                                    className="profile-password-toggle"
                                    onClick={() =>
                                        setShowCurrentPassword(
                                            previous => !previous
                                        )
                                    }
                                    aria-label={
                                        showCurrentPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >

                                    <i
                                        className={
                                            showCurrentPassword
                                                ? "bi bi-eye-slash"
                                                : "bi bi-eye"
                                        }
                                    ></i>

                                </button>

                            </div>

                        </div>


                        {/* NEW PASSWORD */}

                        <div className="profile-field">

                            <label htmlFor="new-password">
                                New Password
                            </label>

                            <div className="profile-input-wrapper">

                                <i className="bi bi-key"></i>

                                <input
                                    id="new-password"
                                    name="newPassword"
                                    type={
                                        showNewPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={
                                        passwordForm.newPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Enter new password"
                                />

                                <button
                                    type="button"
                                    className="profile-password-toggle"
                                    onClick={() =>
                                        setShowNewPassword(
                                            previous => !previous
                                        )
                                    }
                                    aria-label={
                                        showNewPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >

                                    <i
                                        className={
                                            showNewPassword
                                                ? "bi bi-eye-slash"
                                                : "bi bi-eye"
                                        }
                                    ></i>

                                </button>

                            </div>

                        </div>


                        {/* CONFIRM PASSWORD */}

                        <div className="profile-field">

                            <label htmlFor="confirm-password">
                                Confirm New Password
                            </label>

                            <div className="profile-input-wrapper">

                                <i className="bi bi-key-fill"></i>

                                <input
                                    id="confirm-password"
                                    name="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={
                                        passwordForm.confirmPassword
                                    }
                                    onChange={
                                        handlePasswordChange
                                    }
                                    placeholder="Confirm new password"
                                />

                                <button
                                    type="button"
                                    className="profile-password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            previous => !previous
                                        )
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >

                                    <i
                                        className={
                                            showConfirmPassword
                                                ? "bi bi-eye-slash"
                                                : "bi bi-eye"
                                        }
                                    ></i>

                                </button>

                            </div>

                        </div>


                        <div className="profile-form-actions">

                            <button
                                type="submit"
                                className="profile-password-button"
                                disabled={changingPassword}
                            >

                                {changingPassword ? (

                                    <>
                                        <i className="bi bi-arrow-repeat"></i>
                                        Changing Password...
                                    </>

                                ) : (

                                    <>
                                        <i className="bi bi-shield-check"></i>
                                        Change Password
                                    </>

                                )}

                            </button>

                        </div>

                    </form>

                </section>

            </main>

        </div>

    );

}

export default Profile;