export function initAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Selecionar elementos para animar
    const elementsToAnimate = document.querySelectorAll(`
        .hero__content,
        .hero__visual,
        .gallery-showcase__intro,
        .carousel,
        .story__copy,
        .service-card,
        .schedule__header,
        .schedule-table,
        .contact__intro,
        .contact-panel
    `);

    elementsToAnimate.forEach((el, index) => {
        // Adicionar um delay em cascata para grids
        if (el.classList.contains('service-card') || el.classList.contains('contact-panel')) {
            el.style.transitionDelay = `${(index % 3) * 150}ms`;
        }
        el.classList.add('fade-up');
        observer.observe(el);
    });
}
