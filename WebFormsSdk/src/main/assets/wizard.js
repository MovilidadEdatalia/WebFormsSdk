export class Wizard {
    constructor(form) {
        this.steps = document.querySelectorAll(".step");
        this.currentStep = 0;
        this.form = form;
        this.showStep(this.currentStep);
        this.printPaginator();
        document
            .querySelector(".next")
            .addEventListener("click", this.onNextClick.bind(this));
        document
            .querySelector(".prev")
            .addEventListener("click", this.onPrevClick.bind(this));
    }
    onNextClick() {
        const currentPage = document.getElementById("current_page");
        if (this.currentStep < this.steps.length - 1 &&
            this.form.reportValidity()) {
            this.currentStep++;
            if (currentPage) {
                currentPage.innerHTML = (this.currentStep + 1).toString();
            }
            this.showStep(this.currentStep);
        }
    }
    onPrevClick() {
        const currentPage = document.getElementById("current_page");
        if (this.currentStep > 0 && this.form.reportValidity()) {
            this.currentStep--;
            if (currentPage) {
                currentPage.innerHTML = (this.currentStep + 1).toString();
            }
            this.showStep(this.currentStep);
        }
    }
    showStep(step) {
        this.steps.forEach((s, index) => {
            const isCurrentStep = index === step;
            s.style.display = isCurrentStep ? "block" : "none";
            this.setInputDisabled(s, !isCurrentStep);
        });
    }
    setInputDisabled(step, disabled) {
        const inputs = step.querySelectorAll("input[required]");
        inputs.forEach((input) => {
            input.disabled = disabled;
        });
    }
    printPaginator() {
        const container = document.getElementById("page_number");
        const currentPage = document.createElement("span");
        const separator = document.createElement("span");
        const totalPages = document.createElement("span");
        currentPage.setAttribute("class", "current-page");
        currentPage.setAttribute("id", "current_page");
        separator.setAttribute("class", "separator");
        totalPages.setAttribute("class", "total-pages");
        currentPage.innerHTML = (this.currentStep + 1).toString();
        separator.innerHTML = "/";
        totalPages.innerHTML = this.steps.length.toString();
        if (container) {
            container.appendChild(currentPage);
            container.appendChild(separator);
            container.appendChild(totalPages);
        }
    }
    isLastPage() {
        return this.currentStep === this.steps.length - 1;
    }
    isFirstPage() {
        return this.currentStep === 0;
    }
    stepIsValid() {
        return this.form.reportValidity();
    }
    getFormSteps() {
        return this.steps.length;
    }
}