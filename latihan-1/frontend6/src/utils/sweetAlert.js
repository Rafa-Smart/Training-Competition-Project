


import Swal from "sweetalert2";

const SuccessAlert = async (message) => {
    return await Swal.fire({
        icon:'success',
        title:"Success!",
        text:message
    })
}
const ErrorAlert = async (message) => {
    return await Swal.fire({
        icon:'error',
        title:"Error!",
        text:message
    })
}

const ConfirmAlert = async (title, message) => {
    return await Swal.fire({
        icon:'question',
        title:title,
        text:message,
        showCancelButton:true
    })
}

export {
    ConfirmAlert,
    SuccessAlert,
    ErrorAlert
}