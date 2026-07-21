/**
 * ==========================================
 * Estado del módulo Login
 * ==========================================
 */

import { APP } from "../../core/constants.js";

const loginState = {

    loading: false,

    remember: false,

    attempts: 0,

    maxAttempts: APP.MAX_LOGIN_ATTEMPTS,

    authenticated: false,

    user: null

};

export default loginState;