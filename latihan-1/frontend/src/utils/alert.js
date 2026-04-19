
import Swal from "sweetalert2";

export const showError = (message) => {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: message,
  });
};

export const showSuccess = (message) => {
  Swal.fire({
    icon: "success",
    title: "Success",
    text: message,
    timer: 1500,
    showConfirmButton: false,
  });
};


export const confirmDelete = async (id) => {
  const res = await Swal.fire({
    title: "Delete post?",
    icon: "warning",
    showCancelButton: true,
  });

  if (res.isConfirmed) {
    await deletePost(id);
    load();
    showSuccess("Post deleted");
  }
};


