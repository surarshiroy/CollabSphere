function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    danger = true
}) {

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="confirm-modal-overlay"
            onClick={onCancel}
        >

            <div
                className="confirm-modal"
                onClick={(e) => e.stopPropagation()}
            >

                {/* ICON */}

                <div
                    className={`confirm-modal-icon ${
                        danger ? "danger" : ""
                    }`}
                >
                    <i
                        className={
                            danger
                                ? "bi bi-exclamation-triangle-fill"
                                : "bi bi-question-circle-fill"
                        }
                    ></i>
                </div>


                {/* CONTENT */}

                <div className="confirm-modal-content">

                    <h2>
                        {title}
                    </h2>

                    <p>
                        {message}
                    </p>

                </div>


                {/* ACTIONS */}

                <div className="confirm-modal-actions">

                    <button
                        type="button"
                        className="confirm-modal-cancel"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        className={`confirm-modal-confirm ${
                            danger ? "danger" : ""
                        }`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>

                </div>

            </div>

        </div>
    );
}

export default ConfirmModal;