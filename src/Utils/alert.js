import Swal from 'sweetalert2';

export const showAlert = (title, text, icon) => {
    return Swal.fire({
        title,
        text,
        icon,
        background: '#18181b',
        color: '#ffffff',
        confirmButtonColor: '#ccff00',
        customClass: {
            popup: 'rounded-[32px] border border-white/10 shadow-2xl',
            title: 'text-2xl font-black tracking-tight text-white pt-6',
            htmlContainer: 'text-zinc-400 font-medium text-sm px-6',
            confirmButton: 'bg-[#ccff00] text-black font-bold px-8 py-3 rounded-2xl hover:scale-105 transition-transform duration-300'
        },
        buttonsStyling: false
    });
};
