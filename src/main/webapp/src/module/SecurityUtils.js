import axios from "axios";

class SeucrityUtils {
    login(login, password, rememberme) {
        return axios
            .post("/api/login", {login, password, rememberme})
            .then(response => {
                if (response.data.accessToken) {
                    sessionStorage.setItem("user", JSON.stringify(response.data));
                    if (rememberme) {
                        localStorage.setItem("user", JSON.stringify(response.data));
                    }
                }
                return response.data;
            });
    }

    logout() {
        sessionStorage.removeItem("user");
        localStorage.removeItem("user");
    }

    register(name, email, password) {
        return axios.post("/api/register", {name, email, password});
    }

    getCurrentUser() {
        return JSON.parse(sessionStorage.getItem('user'));
    }

    getBearerToken() {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (user && user.accessToken) {
            return "Bearer " + user.accessToken;
        } else {
            return "";
        }
    }
}

export default new SeucrityUtils();