import { toast } from "react-toastify";

const toastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
};

export const showToast = (mensagem) => toast(mensagem, toastOptions);
export const showToastError = (mensagem) => toast.error(mensagem, toastOptions);
export const showToastWarn = (mensagem) => toast.warn(mensagem, toastOptions);
export const showToastSuccess = (mensagem) => toast.success(mensagem, toastOptions);
export const showToastInfo = (mensagem) => toast.info(mensagem, toastOptions);
