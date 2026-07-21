/**
 * ==========================================
 * Componente Toast
 * ==========================================
 */

class Toast {

    constructor(){

        this.container = document.querySelector(".toast-container");

        if(!this.container){

            this.container = document.createElement("div");

            this.container.className = "toast-container";

            document.body.appendChild(this.container);

        }

    }

    show(message,type="info"){

        const icons = {

            success:"✔",

            error:"✖",

            warning:"⚠",

            info:"ℹ"

        };

        const toast = document.createElement("div");

        toast.className = `toast toast-${type}`;

        toast.innerHTML = `

            <span class="toast-icon">

                ${icons[type]}

            </span>

            <div class="toast-message">

                ${message}

            </div>

        `;

        this.container.appendChild(toast);

        setTimeout(()=>{

            toast.classList.add("hide");

            setTimeout(()=>{

                toast.remove();

            },250);

        },3500);

    }

    success(message){

        this.show(message,"success");

    }

    error(message){

        this.show(message,"error");

    }

    warning(message){

        this.show(message,"warning");

    }

    info(message){

        this.show(message,"info");

    }

}

export default new Toast();