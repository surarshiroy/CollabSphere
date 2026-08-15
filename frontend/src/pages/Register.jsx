import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import { useEffect } from "react";

import { getToken } from "../utils/token";

import "../styles/login.css";

function Register() {

    const navigate = useNavigate();
    useEffect(() => {
    if (getToken()) {
        navigate("/dashboard", { replace: true });
    }
}, [navigate]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setLoading(true);

        setError("");

        try {

            await register(formData);

            alert("Registration Successful!");

            navigate("/");

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Registration Failed"
            );

        } finally {

            setLoading(false);

        }

    };
   
    return (
        

        <div className="login-page">

        <div className="login-card">

            <div className="login-logo">
                <i className="bi bi-diagram-3-fill"></i>
            </div>

            <h1>CollabSphere</h1>

            <p>Create your account</p>

                <form onSubmit={handleSubmit}>
<div className="mb-3">

    <label className="form-label">
        Full Name
    </label>

    <div className="input-group">

        <span className="input-group-text">
            <i className="bi bi-person-fill"></i>
        </span>

        <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter your full name"
        />

    </div>

</div>

                   <div className="mb-3">

    <label className="form-label">
        Email Address
    </label>

    <div className="input-group">

        <span className="input-group-text">
            <i className="bi bi-envelope-fill"></i>
        </span>

        <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter your email"
        />

    </div>

</div>

                   <div className="mb-4">

    <label className="form-label">
        Password
    </label>

    <div className="input-group password-input-group">

    <span className="input-group-text">
        <i className="bi bi-lock-fill"></i>
    </span>

    <input
        type={showPassword ? "text" : "password"}
        name="password"
        value={formData.password}
        onChange={handleChange}
        className="form-control password-input"
        placeholder="Create a password"
    />

    <button
        type="button"
        className="password-toggle"
        onClick={() => setShowPassword(!showPassword)}
    >
        <i
            className={
                showPassword
                    ? "bi bi-eye-slash-fill"
                    : "bi bi-eye-fill"
            }
        ></i>
    </button>

</div>

</div>

                    {error && (

                        <div className="alert alert-danger">

                            {error}

                        </div>

                    )}

                   <button
    type="submit"
    className="btn btn-primary w-100"
    disabled={loading}
>
    {loading ? "Creating..." : "Register"}
</button>

                </form>

                <p className="mt-4 text-center">

                    Already have an account?

                    <br />

                    <Link to="/">
                        Login
                    </Link>

                </p>

            </div>

        </div>

    );

}

export default Register;