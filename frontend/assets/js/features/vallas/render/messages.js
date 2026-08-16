import Toast from "../../../components/toast/toast.js";

export function showSuccess(message){

    Toast.success(message);

}

export function showError(message){

    Toast.error(message);

}

export function showWarning(message){

    Toast.warning(message);

}

export function showInfo(message){

    Toast.info(message);

}