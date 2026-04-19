import Swal from 'sweetalert2';

export const showAlert = (icon, title, text = '') => {
  return Swal.fire({
    icon,
    title,
    text,
    confirmButtonText: 'OK'
  });
};

export const showConfirm = (title, text) => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No'
  });
};