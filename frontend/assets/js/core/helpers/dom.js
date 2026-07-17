/*=========================================================
    DOM
=========================================================*/

const DomHelper = {

    id(id){

        return document.getElementById(id);

    },

    selector(selector){

        return document.querySelector(selector);

    },

    selectorTodos(selector){

        return document.querySelectorAll(selector);

    }

};

Object.freeze(DomHelper);