/*=========================================================
    MONEDA
=========================================================*/

const MoneyHelper = {

    formatearUSD(valor){

        return new Intl.NumberFormat("en-US",{

            style:"currency",

            currency:"USD"

        }).format(valor);

    },

    formatearCRC(valor){

        return new Intl.NumberFormat("es-CR",{

            style:"currency",

            currency:"CRC"

        }).format(valor);

    },

    convertir(valor,tipoCambio){

        return valor * tipoCambio;

    }

};

Object.freeze(MoneyHelper);