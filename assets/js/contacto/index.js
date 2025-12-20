const CONFIG = {
    EMAILJS: {
        SERVICE_ID: '',
        TEMPLATE_ID: '',
        PUBLIC_KEY: ''
    },
    APPS_SCRIPT_URL: ''
};

(function () {
    if (CONFIG.EMAILJS.PUBLIC_KEY) {
        emailjs.init(CONFIG.EMAILJS.PUBLIC_KEY);
    }
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

async function sendToGoogleSheets(formData) {
    if (!CONFIG.APPS_SCRIPT_URL) {
        return;
    }

    try {
        const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

    } catch (error) {
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');

    if (!contactForm) return;

    const submitButton = contactForm.querySelector('button[type="submit"]');
    if (!submitButton) return;

    const btnText = submitButton.querySelector('.btn-text');
    const btnLoading = submitButton.querySelector('.btn-loading');
    const modal = document.getElementById('thankYouModal');

    contactForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        submitButton.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline';

        try {
            const formData = {
                user_name: contactForm.querySelector('[name="user_name"]').value,
                user_email: contactForm.querySelector('[name="user_email"]').value,
                user_phone: contactForm.querySelector('[name="user_phone"]').value,
                subject: contactForm.querySelector('[name="subject"]').value,
                message: contactForm.querySelector('[name="message"]').value,
                timestamp: new Date().toISOString()
            };

            if (CONFIG.EMAILJS.SERVICE_ID && CONFIG.EMAILJS.TEMPLATE_ID) {
                await emailjs.sendForm(
                    CONFIG.EMAILJS.SERVICE_ID,
                    CONFIG.EMAILJS.TEMPLATE_ID,
                    contactForm
                );
            }

            await sendToGoogleSheets(formData);

            submitButton.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
            contactForm.reset();

            openThankYouModal();

        } catch (error) {
            alert('Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.');

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