/**
 * ==========================================
 * Servicio HTTP
 * Centraliza toda la comunicación con la API.
 * ==========================================
 */

import AppConfig from "../core/config.js";

import { getToken } from "../core/auth.js";

import { forceLogout } from "../core/guard.js";

class HttpService {

    async request(url, options = {}) {

        const token = getToken();

        const response = await fetch(

            `${AppConfig.api.baseUrl}${url}`,

            {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
                    ...(options.headers || {})
                },
                ...options
            }

        );

        // Token vencido, revocado, o usuario inactivo: cerramos sesión
        // local y mandamos a login, sin que cada módulo tenga que
        // manejar este caso por separado.
        if (response.status === 401) {

            forceLogout();

            throw {

                status: 401,

                message: "Sesión expirada."

            };

        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {

            throw {

                status: response.status,

                message: data?.message || "Error en la solicitud.",

                data

            };

        }

        return data;

    }

    get(url) {

        return this.request(url, {

            method: "GET"

        });

    }

    post(url, body) {

        return this.request(url, {

            method: "POST",

            body: JSON.stringify(body)

        });

    }

    put(url, body) {

        return this.request(url, {

            method: "PUT",

            body: JSON.stringify(body)

        });

    }

    delete(url) {

        return this.request(url, {

            method: "DELETE"

        });

    }

}

const http = new HttpService();

export default http;
