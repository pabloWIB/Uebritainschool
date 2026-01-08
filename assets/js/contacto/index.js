// Configuración de EmailJS
const CONFIG = {
    EMAILJS: {
        SERVICE_ID: 'service_t8hswkc',
        TEMPLATE_ID: 'template_ni1lndt',
        PUBLIC_KEY: 'Hv_khiO1DJANJtHXj'
    }
};

// Inicializar EmailJS
(function () {
    emailjs.init(CONFIG.EMAILJS.PUBLIC_KEY);
})();

function openThankYouModal() {
    const modal = document.getElementById('thankYouModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeThankYouModal() {
    const modal = document.getElementById('thankYouModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');

    if (!contactForm) {
        console.error('No se encontró el formulario');
        return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    if (!submitButton) {
        console.error('No se encontró el botón de submit');
        return;
    }

    const btnText = submitButton.querySelector('.btn-text');
    const btnLoading = submitButton.querySelector('.btn-loading');
    const modal = document.getElementById('thankYouModal');

    contactForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Deshabilitar botón y mostrar loading
        submitButton.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline';

        console.log('Enviando formulario...', {
            serviceId: CONFIG.EMAILJS.SERVICE_ID,
            templateId: CONFIG.EMAILJS.TEMPLATE_ID
        });

        try {
            const response = await emailjs.sendForm(
                CONFIG.EMAILJS.SERVICE_ID,
                CONFIG.EMAILJS.TEMPLATE_ID,
                contactForm
            );

            console.log('✅ Mensaje enviado exitosamente:', response);

            submitButton.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';

            contactForm.reset();

            openThankYouModal();

        } catch (error) {
            console.error('❌ Error al enviar mensaje:', error);

            alert('Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.\n\nError: ' + (error.text || error.message || 'Desconocido'));

            submitButton.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    });

    if (modal) {
        const modalOverlay = modal.querySelector('.modal-overlay');
        const modalClose = modal.querySelector('.modal-close');

        if (modalOverlay) {
            modalOverlay.addEventListener('click', closeThankYouModal);
        }

        if (modalClose) {
            modalClose.addEventListener('click', closeThankYouModal);
        }

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && modal.classList.contains('active')) {
                closeThankYouModal();
            }
        });
    }
});