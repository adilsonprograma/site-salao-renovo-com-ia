import { fetchAdminSession, loginAdmin } from "./services/api-client.js";

async function redirectIfLoggedIn() {
    try {
        await fetchAdminSession();
        window.location.href = "admin.html";
    } catch (error) {
        // Sem sessao ativa: mantem a pagina de login.
    }
}

async function initLoginPage() {
    await redirectIfLoggedIn();

    const loginForm = document.getElementById("loginForm");
    const submitBtn = document.getElementById("submitBtn");
    const submitText = document.getElementById("submitText");
    const loadingSpinner = document.getElementById("loadingSpinner");
    const loginError = document.getElementById("loginError");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const usernameError = document.getElementById("usernameError");
    const passwordError = document.getElementById("passwordError");

    if (!loginForm || !submitBtn || !submitText || !loadingSpinner || !loginError || !usernameInput || !passwordInput) {
        return;
    }

    usernameInput.addEventListener("input", clearError);
    passwordInput.addEventListener("input", clearError);
    loginForm.addEventListener("submit", handleLogin);

    async function handleLogin(event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const result = await loginAdmin({
                password: passwordInput.value,
                username: usernameInput.value.trim()
            });

            showSuccessMessage(result.message || "Login realizado! Redirecionando...");
            window.setTimeout(() => {
                window.location.href = "admin.html";
            }, 900);
        } catch (error) {
            console.error("Erro durante login:", error);
            setLoading(false);
            showError(error.message || "Erro ao conectar com o servidor.");
            passwordInput.value = "";
            passwordInput.focus();
        }
    }

    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;
        submitText.style.display = isLoading ? "none" : "inline";
        loadingSpinner.style.display = isLoading ? "inline-block" : "none";
    }

    function validateForm() {
        clearError();
        let isValid = true;

        if (!usernameInput.value.trim()) {
            usernameError.textContent = "Usuario e obrigatorio";
            isValid = false;
        }

        if (!passwordInput.value) {
            passwordError.textContent = "Senha e obrigatoria";
            isValid = false;
        }

        return isValid;
    }

    function showError(message) {
        loginError.textContent = message;
        loginError.classList.remove("form-status--success");
        loginError.classList.add("form-status--error", "is-visible");
    }

    function showSuccessMessage(message) {
        loginError.textContent = message;
        loginError.classList.remove("form-status--error");
        loginError.classList.add("form-status--success", "is-visible");
    }

    function clearError() {
        loginError.textContent = "";
        loginError.classList.remove("is-visible", "form-status--error", "form-status--success");
        usernameError.textContent = "";
        passwordError.textContent = "";
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLoginPage);
} else {
    initLoginPage();
}
