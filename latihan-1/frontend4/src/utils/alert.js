import Swal from "sweetalert2"


export const showError = async(message) => {
    await Swal.fire({
        icon:'error',
        title:"Error!",
        text:message
    })
}
export const showSuccess = async(message) => {
    await Swal.fire({
        icon:'success',
        title:"Success!",
        text:message
    })
}
export const showConfirm = async(message, title) => {
    const hasil = await Swal.fire({
        icon:'question',
        title:title,
        text:message,
        showCancelButton:true,
        
        
    })
    return hasil;    
}

export const alertConfirm = async ({
  title = "Are you sure?",
  text = "This action cannot be undone",
  confirmText = "Yes, delete it",
  cancelText = "Cancel",
}) => {
  return await Swal.fire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
  });
};