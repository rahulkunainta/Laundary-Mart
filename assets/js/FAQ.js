/* MAIN ACCORDION */
document.querySelectorAll(".lm-acc-btn").forEach(btn => {
    btn.addEventListener("click", function () {
        const item = this.parentElement;
        const content = item.querySelector(".lm-acc-content");
        const icon = this.querySelector(".lm-acc-icon");

        document.querySelectorAll(".lm-acc-item").forEach(i => {
            if (i !== item) {
                i.classList.remove("active");
                i.querySelector(".lm-acc-content").style.maxHeight = null;
                i.querySelector(".lm-acc-icon").textContent = "+";
            }
        });

        item.classList.toggle("active");

        if (item.classList.contains("active")) {
            content.style.maxHeight = content.scrollHeight + "px";
            icon.textContent = "-";
        } else {
            content.style.maxHeight = null;
            icon.textContent = "+";
        }
    });
});

/* INNER FAQ ACCORDION */
document.querySelectorAll(".lm-faq-btn").forEach(btn => {
    btn.addEventListener("click", function () {
        const faqItem = this.parentElement;
        const answer = faqItem.querySelector(".lm-faq-answer");
        const icon = this.querySelector(".lm-inner-icon");

        faqItem.classList.toggle("open");

        if (faqItem.classList.contains("open")) {
            answer.style.maxHeight = answer.scrollHeight + "px";
            icon.textContent = "-";
        } else {
            answer.style.maxHeight = null;
            icon.textContent = "+";
        }
    });
});
