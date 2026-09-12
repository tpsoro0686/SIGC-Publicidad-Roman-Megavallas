import http from "../../services/http.js";

export function obtenerDashboard() {

    return http.get("/dashboard");

}