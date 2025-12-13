/* ============================================================
    Smooth Scroll To Target Section
============================================================ */

function smoothScrollTo(targetElement, duration = 500) {
    if (!targetElement) return;

    let startPosition = window.pageYOffset;
    let targetPosition = targetElement.getBoundingClientRect().top + startPosition;
    let distance = targetPosition - startPosition;

    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;

        let progress = Math.min((currentTime - startTime) / duration, 1);

        // Ease In-Out Function
        let easedValue =
            progress < 0.5
                ? 2 * progress * progress
                : -1 + (4 - 2 * progress) * progress;

        window.scrollTo(0, startPosition + distance * easedValue);

        if (progress < 1) requestAnimationFrame(animation);
    }

    requestAnimationFrame(animation);
}



/* ============================================================
    Review Slider (Testimonials)
============================================================ */

function initReviewSlider() {
    const slider = document.querySelector("#slider");
    const dots = Array.from(document.querySelectorAll(".dot"));

    if (!slider || dots.length === 0) return;

    // Clone slides for infinite loop effect
    if (!slider.dataset.cloned) {
        const originalSlides = Array.from(slider.children);
        originalSlides.forEach(slide => slider.appendChild(slide.cloneNode(true)));
        slider.dataset.cloned = "true";
    }

    const slides = Array.from(slider.children);
    let index = 0;
    let interval = null;

    function getCardWidth() {
        return slides[0].offsetWidth + 20; // include margin
    }

    let cardWidth = getCardWidth();


    function changeDots(i) {
        dots.forEach(dot => dot.classList.remove("active"));
        dots[i % dots.length].classList.add("active");
    }


    function moveSlider() {
        index++;
        slider.style.transition = "transform 0.5s ease";
        slider.style.transform = "translateX(-" + index * cardWidth + "px)";

        const totalRealSlides = slides.length / 2;

        // Loop back instantly when reaching end
        if (index >= totalRealSlides) {
            setTimeout(() => {
                slider.style.transition = "none";
                index = 0;
                slider.style.transform = "translateX(0px)";

                setTimeout(() => {
                    slider.style.transition = "transform 0.5s ease";
                }, 30);
            }, 520);
        }

        changeDots(index);
    }


    // Pause on hover
    slider.parentElement.addEventListener("mouseenter", () => {
        clearInterval(interval);
    });

    // Resume on leave
    slider.parentElement.addEventListener("mouseleave", () => {
        interval = setInterval(moveSlider, 1400);
    });


    // Dot click navigation
    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            index = i;
            slider.style.transform = "translateX(-" + (index * cardWidth) + "px)";
            changeDots(index);
        });
    });


    window.addEventListener("resize", () => {
        cardWidth = getCardWidth();
    });

    // Start auto slide
    interval = setInterval(moveSlider, 1400);
    changeDots(0);
}



/* ============================================================
    Counter Animation
============================================================ */

function initCounters() {
    const counters = Array.from(document.querySelectorAll(".count"));

    counters.forEach(counter => {
        const targetValue = parseFloat(counter.getAttribute("data-target"));
        if (!targetValue) return;

        const suffix = counter.getAttribute("data-suffix") || "";
        let currentValue = 0;

        const steps = 80;
        const increment = targetValue / steps;

        function updateCounter() {
            currentValue += increment;

            if (currentValue < targetValue) {
                counter.textContent = currentValue.toFixed(1) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = targetValue + suffix;
            }
        }

        updateCounter();
    });
}



/* ============================================================
    FAQ Accordions
============================================================ */

function initAccordions() {
    const buttons = Array.from(document.querySelectorAll(".lm-acc-btn"));

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const content = button.nextElementSibling;
            const icon = button.querySelector(".lm-acc-icon");

            if (!content) return;

            const allContents = Array.from(document.querySelectorAll(".lm-acc-content"));
            const allIcons = Array.from(document.querySelectorAll(".lm-acc-icon"));

            // Close all other accordions
            allContents.forEach(c => {
                if (c !== content) {
                    c.style.maxHeight = "0px";
                    c.classList.remove("open");
                }
            });

            allIcons.forEach(ic => {
                if (ic !== icon) ic.textContent = "+";
            });

            // Toggle clicked accordion
            const isOpen = content.classList.contains("open");

            if (isOpen) {
                content.style.maxHeight = "0px";
                content.classList.remove("open");
                icon.textContent = "+";
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
                content.classList.add("open");
                icon.textContent = "-";
            }
        });
    });
}

/* ============================================================
   INNER FAQ Accordions
============================================================ */

function initInnerFaqs() {
    const faqButtons = document.querySelectorAll(".lm-faq-btn");

    faqButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const answer = btn.nextElementSibling;
            const icon = btn.querySelector(".lm-inner-icon");

            const isOpen = answer.classList.contains("open");

            // Close all other inner FAQ answers inside the SAME outer accordion
            const parent = btn.closest(".lm-acc-content");
            const allAnswers = parent.querySelectorAll(".lm-faq-answer");
            const allIcons = parent.querySelectorAll(".lm-inner-icon");

            allAnswers.forEach(a => {
                if (a !== answer) {
                    a.style.maxHeight = "0px";
                    a.classList.remove("open");
                }
            });

            allIcons.forEach(i => {
                if (i !== icon) i.textContent = "+";
            });

            // Toggle selected FAQ
            if (isOpen) {
                answer.style.maxHeight = "0px";
                answer.classList.remove("open");
                icon.textContent = "+";
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
                answer.classList.add("open");
                icon.textContent = "-";
            }
        });
    });
}

/* ===========================================================
               move right left
============================================================*/
 
document.addEventListener("DOMContentLoaded", () => {
   // initAccordions();     
    initInnerFaqs();       
});

const wrapper = document.querySelector(".scroll-wrapper");

// Drag variables
let isDown = false;
let startX;
let scrollLeft;

// Mouse Down
wrapper.addEventListener("mousedown", (e) => {
    isDown = true;
    wrapper.classList.add("active");
    startX = e.pageX - wrapper.offsetLeft;
    scrollLeft = wrapper.scrollLeft;
});

// Mouse Leave
wrapper.addEventListener("mouseleave", () => {
    isDown = false;
});

// Mouse Up
wrapper.addEventListener("mouseup", () => {
    isDown = false;
});

// Mouse Move
wrapper.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - wrapper.offsetLeft;
    const walk = (x - startX) * 2; // drag speed
    wrapper.scrollLeft = scrollLeft - walk;
});


/* ===========================================================
               slide up logic 
============================================================*/

 
document.addEventListener("DOMContentLoaded", function () {
    const photo = document.querySelector(".slide-up");
    photo.classList.add("active");
});
 


/* ===========================================================
               samooth scroll
============================================================*/



function scrollToSection(id) {
    const section = document.getElementById(id);
    if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

 
window.addEventListener("load", function () {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const section = params.get("scroll");

    if (section) {
        const target = document.getElementById(section);

        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 400); // small delay for smooth experience
        }
    }
});
 

/* ============================================================
    Smooth Navigation Links
============================================================ */
function initSmoothLinks() {
    const aboutLink = document.querySelector('a[href="#about"]');
    const serviceLink = document.querySelector('a[href="#service"]');

    if (aboutLink) {
        aboutLink.addEventListener("click", function (e) {
            e.preventDefault();
            const aboutSection = document.querySelector("#about");
            smoothScrollTo(aboutSection);
        });
    }

    if (serviceLink) {
        serviceLink.addEventListener("click", function (e) {
            e.preventDefault();
            const serviceSection = document.querySelector("#service");
            smoothScrollTo(serviceSection);
        });
    }
}



/* ============================================================
    Initialize All Functions When Page Loads
============================================================ */
document.addEventListener("DOMContentLoaded", function () {
    initCounters();
    initReviewSlider();
    initAccordions();
    initSmoothLinks();
});
