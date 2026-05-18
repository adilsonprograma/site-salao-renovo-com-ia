import { initGalleryCarousel } from "./modules/gallery-carousel.js";
import { initChatWidget } from "./modules/chat-widget.js";
import { initContactForm } from "./modules/contact-form.js";

// Mantem um ponto unico de bootstrap para a pagina.
function startApp() {
    initContactForm();
    initChatWidget();
    initGalleryCarousel();
}

startApp();
