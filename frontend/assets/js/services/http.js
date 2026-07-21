/**
 * ==========================================
 * Servicio HTTP
 * Centraliza toda la comunicación con la API.
 * ==========================================
 */

import AppConfig from "../core/config.js";

class HttpService {

    async request(url, options = {}) {

        const response = await fetch(

            `${AppConfig.api.baseUrl}${url}`,

            {
                headers: {
                    "Content-Type": "application/json",
                    ...(options.headers || {})
                },
                ...options
            }

        );

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