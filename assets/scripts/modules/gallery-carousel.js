export function initGalleryCarousel() {
    const carousel = document.querySelector("[data-carousel]");
    const track = carousel?.querySelector("[data-carousel-track]");
    const slides = track ? Array.from(track.querySelectorAll("[data-carousel-slide]")) : [];
    const prevButton = carousel?.querySelector("[data-carousel-prev]");
    const nextButton = carousel?.querySelector("[data-carousel-next]");
    const dots = carousel ? Array.from(carousel.querySelectorAll("[data-carousel-dot]")) : [];

    if (!carousel || !track || slides.length <= 1 || !prevButton || !nextButton || !dots.length) {
        return;
    }

    let currentIndex = 0;
    let autoplayId = 0;

    const render = () => {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        slides.forEach((slide, index) => {
            slide.classList.toggle("is-active", index === currentIndex);
            slide.setAttribute("aria-hidden", String(index !== currentIndex));
        });

        dots.forEach((dot, index) => {
            const isActive = index === currentIndex;
            dot.classList.toggle("is-active", isActive);
            dot.setAttribute("aria-pressed", String(isActive));
        });
    };

    const goTo = (index) => {
        currentIndex = (index + slides.length) % slides.length;
        render();
    };

    const restartAutoplay = () => {
        window.clearInterval(autoplayId);
        autoplayId = window.setInterval(() => {
            goTo(currentIndex + 1);
        }, 4800);
    };

    prevButton.addEventListener("click", () => {
        goTo(currentIndex - 1);
        restartAutoplay();
    });

    nextButton.addEventListener("click", () => {
        goTo(currentIndex + 1);
        restartAutoplay();
    });

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            goTo(Number(dot.dataset.carouselDot));
            restartAutoplay();
        });
    });

    carousel.addEventListener("mouseenter", () => window.clearInterval(autoplayId));
    carousel.addEventListener("mouseleave", restartAutoplay);
    carousel.addEventListener("focusin", () => window.clearInterval(autoplayId));
    carousel.addEventListener("focusout", (event) => {
        if (!carousel.contains(event.relatedTarget)) {
            restartAutoplay();
        }
    });

    render();
    restartAutoplay();
}
