document.addEventListener('DOMContentLoaded', () => {
    const rsvpForm = document.getElementById('rsvpForm');
    const formMessage = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitBtn');

    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const attendance_count = document.getElementById('attendance_count').value;

            // Change button text while loading
            submitBtn.disabled = true;
            submitBtn.textContent = 'Mengirim...';
            formMessage.textContent = '';
            formMessage.className = 'form-message';

            try {
                // Post to API
                const response = await fetch('/api/rsvp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, attendance_count: parseInt(attendance_count) }),
                });

                const data = await response.json();

                if (response.ok) {
                    formMessage.textContent = 'Terima kasih, konfirmasi kehadiran Anda berhasil dikirim!';
                    formMessage.classList.add('success');
                    rsvpForm.reset();
                } else {
                    formMessage.textContent = data.error || 'Terjadi kesalahan saat mengirim RSVP.';
                    formMessage.classList.add('error');
                }
            } catch (error) {
                console.error('Error:', error);
                formMessage.textContent = 'Gagal terhubung ke server. Pastikan server API berjalan.';
                formMessage.classList.add('error');
            } finally {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.textContent = 'Konfirmasi Kehadiran';
            }
        });
    }

    // Add gentle fade in animations for elements on scroll
    const sections = document.querySelectorAll('.section');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.style.opacity = 0;
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.8s ease-out';
        observer.observe(section);
    });
});
