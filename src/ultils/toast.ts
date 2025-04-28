import { Bounce, toast } from "react-toastify";

export const toastSuccess = (message: string) => {
    const notify = () => toast.success(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: 0,
        theme: "light",
        transition: Bounce,
    });;
    return notify;
}

export const toastError = (message: string) => {
    console.log(message);
    const notify = () => toast.error(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: 0,
        theme: "light",
        transition: Bounce,
    });;
    return notify;
}

export const toastWarning = (message: string) => {
    const notify = () => toast.warning(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: 0,
        theme: "light",
        transition: Bounce,
    });;
    return notify;
}

export const toastInfo = (message: string) => {
    const notify = () => toast.info(message, {
        position: "top-center",
        autoClose: 500,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: 0,
        theme: "light",
        transition: Bounce,
    });;
    return notify;
}


