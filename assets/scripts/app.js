import { initGalleryCarousel } from "./modules/gallery-carousel.js";
import { initChatWidget } from "./modules/chat-widget.js";
import { initContactForm } from "./modules/contact-form.js";
import { initAnimations } from "./modules/animations.js";

// Mantem um ponto unico de bootstrap para a pagina.
function startApp() {
    initContactForm();
    initChatWidget();
    initGalleryCarousel();
    initAnimations();
}

startApp();
