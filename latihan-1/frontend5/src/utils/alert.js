import Swal from "sweetalert2";
export const showSuccess = async (message) => {
  await Swal.fire({
    icon: "success",
    title: "Success!",
    text: message,
  });
};
export const showError = async (message) => {
  await Swal.fire({
    icon: "error",
    title: "Error!",
    text: message,
  });
};

export const showConfirm = async (title, message) => {
    return await Swal.fire({
        icon:'question',
        title:title,
        text:message,
        showCancelButton:true
    });
}

