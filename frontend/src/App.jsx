import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: "#1e293b",
                        color: "#fff",
                        border: "1px solid #334155"
                    }
                }}
            />

            <AppRoutes />
        </>
    );
}

export default App;