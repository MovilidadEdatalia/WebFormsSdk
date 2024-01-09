import { Wizard } from "./wizard.js";
export default class JsonForms {
    constructor() {
        this.#globalJson = {};
    }
    #loadJsonButton;
    #globalJson;
    #formContainer;
    #toJson;
    #callback;
    #json;
    init(json = null, callback) {
        this.#callback = callback;
        this.#json = json;
        const loadJsonSection = document.getElementById("webforms_load_json_section");
        const sendJsonSection = document.getElementById("webforms_send_section");
        this.#loadJsonButton = document.getElementById("webforms_load_json_button");
        this.#toJson = document.getElementById("webforms_send");
        this.#formContainer = document.getElementById("webforms_main_form");
        if (json) {
            loadJsonSection.style.display = "none";
            sendJsonSection.style.display = "none";
            try {
                this.#loadJsonData(json);
            }
            catch (error) {
                this.#callback(JSON.stringify({ type: "error", value: error.message }));
            }
        }
        this.#loadJsonButton.addEventListener("click", this.#handleJsonSection.bind(this));
        this.#toJson.addEventListener("click", this.#converToPDF.bind(this));
    }
    // Función para renderizar el formulario a partir de los datos JSON
    //Se ha decidido usar un sistema de elementos personalizados, y no un subtype directamente en el json.
    //Se le añade a nivel de codigo ese subtype para hacer la lógica.
    #renderForm(page, form) {
        page.items.forEach((item) => {
            switch (item.type) {
                //image
                case "image":
                    if (item.src) {
                        this.#renderImageElement(item, form);
                    }
                    break;
                //text
                case "headerText":
                    item.subType = "h1";
                    this.#renderTextElement(item, form);
                    break;
                case "paragraphText":
                    item.subType = "p";
                    this.#renderTextElement(item, form);
                    break;
                case "continuousText":
                    item.subType = "span";
                    this.#renderTextElement(item, form);
                    break;
                //inputs
                case "textField":
                    item.subType = "text";
                    this.#renderTextInput(item, form);
                    break;
                case "numberField":
                    item.subType = "number";
                    this.#renderTextInput(item, form);
                    break;
                case "radioButton":
                    item.subType = "radio";
                    if (item.options) {
                        this.#renderRadioInput(item, form);
                    }
                    break;
                case "dateField":
                    item.subType = "date";
                    this.#renderTextInput(item, form);
                    break;
                case "emailField":
                    item.subType = "email";
                    this.#renderTextInput(item, form);
                    break;
                //table
                case "table":
                    item.subType = "table";
                    this.#renderTable(item, form);
                    break;
                //dividers
                case "pageBreak":
                    item.subType = "div";
                    this.#renderDivider(item, form);
                    break;
                case "barBreak":
                    item.subType = "hr";
                    this.#renderDivider(item, form);
                    break;
                case "lineBreak":
                    item.subType = "br";
                    this.#renderDivider(item, form);
                    break;
                default:
                    break;
            }
        });
    }
    #setGeneralStyles(styles) {
        for (const key in styles) {
            document.getElementById("webforms_wizard").style[key] = styles[key];
        }
    }
    // Función para renderizar elementos de entrada tipo radio
    #renderRadioInput(item, form) {
        const legend = document.createElement("legend");
        legend.setAttribute("id", item.id + "_legend");
        form.appendChild(legend);
        legend.textContent = item.label;
        if (item.visible === false) {
            legend.style.display = "none";
        }
        if (item.options) {
            item.options.forEach((option) => {
                option.customId = Math.floor(Math.random() * 90000) + 10000;
                const input = this.#createInputElement(item, option);
                const label = this.#createLabelElement(item, option);
                form.appendChild(input);
                form.appendChild(label);
            });
        }
    }
    // Función para renderizar elementos de entrada de texto
    #renderTextInput(item, form) {
        const input = this.#createInputElement(item);
        const label = this.#createLabelElement(item);
        form.appendChild(label);
        form.appendChild(input);
    }
    // Función para crear elementos de entrada de texto o radio
    #createInputElement(item, value) {
        const input = document.createElement("input");
        this.#setInputAttributes(item, value, input);
        this.#inputValueChanged(item, input);
        this.#addCss(item, input);
        return input;
    }
    #renderDivider(item, form) {
        const divider = this.#createDividerElement(item.subType);
        if (divider) {
            form.appendChild(divider);
        }
    }
    #createDividerElement(subType) {
        let divider;
        divider = document.createElement(subType);
        if (subType === "div") {
            divider.style.pageBreakBefore = "always";
        }
        return divider;
    }
    // Función para crear etiquetas de elementos de entrada
    #createLabelElement(item, value) {
        const label = document.createElement("label");
        if (item.subType === "radio" && item.options) {
            label.setAttribute("for", `${item.id}_${value.customId}`);
        }
        else {
            label.setAttribute("for", item.id);
        }
        if (value) {
            label.textContent = value.value;
        }
        else {
            label.textContent = item.label;
        }
        if (item.visible === false) {
            label.style.display = "none";
        }
        this.#addCss(item, label);
        return label;
    }
    // Función para renderizar elementos de texto
    #renderTextElement(item, form) {
        const text = document.createElement(item.subType);
        text.textContent = item.label;
        if (item.css) {
            for (const key in item.css) {
                text.style[key] = item.css[key];
            }
        }
        if (item.visible === false) {
            text.style.display = "none";
        }
        this.#addCss(item, text);
        form.appendChild(text);
    }
    // Función para renderizar elementos de imagen
    #renderImageElement(item, form) {
        const image = document.createElement("img");
        image.src = item.src;
        form.appendChild(image);
        if (item.visible === false) {
            image.style.display = "none";
        }
        this.#addCss(item, image);
    }
    //función para renderizar tablas
    #renderTable(item, form) {
        const table = this.#createTableElement(item);
        form.appendChild(table);
    }
    #createTableElement(item) {
        const table = document.createElement("table");
        this.#createTableHead(item, table);
        this.#createTableData(item, table);
        this.#addCss(item, table);
        return table;
    }
    #createTableHead(item, table) {
        const thRows = item.cells.th;
        const thRow = table.insertRow();
        //crea filas de cabecera
        thRows.forEach((element) => {
            const th = document.createElement("th"); // create th element
            th.innerHTML = element;
            thRow.appendChild(th);
            //addCss(item, cell);
        });
    }
    #createTableData(item, table) {
        const trRows = item.cells.tr;
        //crea filas de datos
        trRows.forEach((element) => {
            const row = table.insertRow();
            for (const key in element) {
                element[key].forEach((element) => {
                    const cell = row.insertCell();
                    cell.innerHTML = element;
                    //addCss(item, cell);
                });
            }
        });
    }
    //Función para añadir CSS
    #addCss(item, type) {
        if (item.css) {
            for (var key in item.css) {
                type.style[key] = item.css[key];
            }
        }
    }
    //Función para setear todas las propiedades de los inputs
    #setInputAttributes(item, value, input) {
        input.name = item.id;
        input.type = item.subType;
        if (item.subType === "radio" && item.options) {
            input.id = `${item.id}_${value.customId}`;
        }
        else {
            input.id = item.id;
        }
        if (item.value) {
            input.setAttribute("value", item.value);
            input.setAttribute("size", input.value.length + "px");
        }
        else {
            input.setAttribute("size", 10 + "px");
        }
        if (value) {
            input.value = value.value;
        }
        if (input.subType === "radio" && value.checked) {
            input.setAttribute("checked", "checked");
        }
        if (item.editable === false) {
            input.disabled = true;
        }
        if (item.visible === false) {
            input.style.display = "none";
        }
        if (item.required) {
            input.required = true;
        }
        if (item.pattern) {
            input.setAttribute("pattern", item.pattern);
        }
        if (item.today) {
            let d = new Date();
            let curr_date = d.getDate();
            let curr_month = d.getMonth() + 1; //Months are zero based
            let curr_year = d.getFullYear();
            let today = curr_year + "-" + curr_month + "-" + curr_date;
            input.valueAsDate = new Date();
            input.setAttribute("value", today);
        }
    }
    #inputValueChanged(item, input) {
        input.addEventListener("input", function (event) {
            if (input.type === "radio") {
                const radioButtons = document.querySelectorAll(`input[type="radio"][name=${input.name}]`);
                radioButtons.forEach((radioButton) => {
                    radioButton.removeAttribute("checked");
                });
                input.setAttribute("checked", "checked");
                if (item.actions) {
                    item.actions.forEach((actions) => {
                        const elements = document.getElementsByName(actions.relatedId);
                        const labels = document.querySelectorAll(`label[for*=${actions.relatedId}]`);
                        const legend = document.getElementById(`${actions.relatedId}_legend`);
                        if (actions.value === input.value) {
                            if (actions.visible) {
                                labels.forEach((label) => {
                                    label.style.display = "initial";
                                });
                                for (let index = 0; index < elements.length; index++) {
                                    const element = elements[index];
                                    element.style.display = "initial";
                                    if (actions.required) {
                                        element.setAttribute("required", actions.required);
                                    }
                                }
                                legend.style.display = "block";
                            }
                            else {
                                labels.forEach((label) => {
                                    label.style.display = "initial";
                                });
                                for (let index = 0; index < elements.length; index++) {
                                    const element = elements[index];
                                    element.style.display = "none";
                                    labels.forEach((label) => {
                                        label.style.display = "none";
                                    });
                                    if (legend) {
                                        legend.style.display = "none";
                                    }
                                    element.required = false;
                                }
                            }
                        }
                    });
                }
            }
            else {
                const newVal = event.target.value;
                input.setAttribute("value", newVal);
                if (input.value.length > input.size && input.value.length > 10) {
                    input.setAttribute("size", input.value.length + "px");
                }
                else {
                    if (input.value.length === 0) {
                        input.setAttribute("size", 10 + "px");
                    }
                    else {
                        if (input.value.length >= 10) {
                            input.setAttribute("size", input.value.length + "px");
                        }
                    }
                }
            }
        });
    }
    #changeStylesBeforePDF() {
        const dateInputs = document.querySelectorAll('input[type="date"]');
        const stepElements = document.querySelectorAll("div.step");
        // Quitar el borde de los inputs
        document.querySelectorAll("input").forEach((input) => {
            input.style.border = "none";
            input.style.backgroundColor = "white";
        });
        // Itera a través de los elementos y establece el atributo "readonly" en cada uno para quitar el icono del picker
        dateInputs.forEach(function (input) {
            input.setAttribute("readonly", "true");
        });
        stepElements.forEach(function (step) {
            step.style.display = "block";
        });
    }
    #startWizard() {
        let self = this;
        const sendJsonSection = document.getElementById("webforms_send_section");
        const nextButton = document.createElement("button");
        const prevButton = document.createElement("button");
        nextButton.setAttribute("class", "next");
        prevButton.setAttribute("class", "prev");
        nextButton.innerHTML = "Siguiente";
        prevButton.innerHTML = "Atrás";
        prevButton.style.display = "none";
        nextButton.style.display = "none";
        self.#toJson.style.display = "none";
        sendJsonSection.insertBefore(nextButton, sendJsonSection.firstChild);
        sendJsonSection.insertBefore(prevButton, sendJsonSection.firstChild);
        //TODO: CREAR CLASE INSTANCIA WIZARD
        const wizard = new Wizard(this.#formContainer);
        if (wizard.getFormSteps() > 1) {
            nextButton.style.display = "block";
        }
        if (wizard.isLastPage()) {
            self.#toJson.style.display = "block";
        }
        document.querySelector(".next").addEventListener("click", function () {
            prevButton.style.display = wizard.isFirstPage() ? "none" : "block";
            nextButton.style.display = wizard.isLastPage() ? "none" : "block";
            if (wizard.isLastPage()) {
                self.#toJson.style.display = "block";
            }
        });
        document.querySelector(".prev").addEventListener("click", function () {
            if (wizard.stepIsValid()) {
                prevButton.style.display = wizard.isFirstPage() ? "none" : "block";
                nextButton.style.display = "block";
            }
            if (!wizard.isLastPage()) {
                self.#toJson.style.display = "none";
            }
        });
    }
    // Función para generar un nuevo JSON a partir de los valores de los inputs
    #generateJSONFromInputs() {
        const inputs = document.querySelectorAll("#webforms_main_form input");
        const clonedObject = this.#globalJson;
        const outputJSON = {};
        clonedObject.pages.forEach((page) => {
            page.items.forEach((item) => {
                if (item.id) {
                    inputs.forEach((input) => {
                        if (item.id === input.name && input.type === "radio") {
                            outputJSON[item.id] = input.checked
                                ? input.value
                                : !this.isRadioGroupChecked(input.name)
                                    ? ""
                                    : outputJSON[item.id];
                        }
                        if (item.id === input.id) {
                            if (["date", "email", "text", "tel", "password", "number"].includes(input.type)) {
                                outputJSON[item.id] = this.parseInputValue(input);
                            }
                        }
                    });
                }
            });
        });
        this.#callback(JSON.stringify({
            type: "output",
            json: outputJSON,
            html: this.#outerHTMLstructure(),
        }));
    }
    isRadioGroupChecked(groupName) {
        const radios = document.querySelectorAll(`input[type="radio"][name="${groupName}"]`);
        return Array.from(radios).some((radio) => radio.checked);
    }
    parseInputValue(input) {
        switch (input.type) {
            case "date":
                return new Date(input.value);
            case "number":
                return parseFloat(input.value);
            default:
                return input.value;
        }
    }
    #outerHTMLstructure() {
        const formHTML = document.getElementById("webforms_main_form").outerHTML;
        const wrapperHTML = `
          <!DOCTYPE html>
          <html lang="es">
            <head>
              <meta charset="UTF-8">
            </head>
            <body>
              ${formHTML}
            </body>
          </html>
    `;
        return wrapperHTML;
    }
    #converToPDF() {
        let self = this;
        const form = document.getElementById("webforms_main_form");
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            if (form.checkValidity()) {
                self.#changeStylesBeforePDF();
                self.#generateJSONFromInputs();
                if (self.#json)
                    return;
                const pageHTML = document.getElementById("webforms_wizard").outerHTML;
                const blob = new Blob([pageHTML], { type: "text/html" });
                const formData = new FormData();
                formData.append("file", blob);
                document.body.classList.add("loading");
                fetch("https://formshtml2pdf.ecosignature.biz/HTML2PDF", {
                    method: "POST",
                    body: formData,
                })
                    .then((response) => response.blob())
                    .then((blob) => {
                    self.#callback({ type: "success", value: blob });
                })
                    .catch((error) => {
                    self.#callback(JSON.stringify({
                        type: "error",
                        message: error,
                    }));
                })
                    .finally(() => {
                    document.body.classList.remove("loading");
                });
            }
        });
    }
    #loadJsonData(jsonData) {
        const loadJsonSection = document.getElementById("webforms_load_json_section");
        const sendJsonSection = document.getElementById("webforms_send_section");
        this.#globalJson = jsonData;
        loadJsonSection.style.display = "none";
        sendJsonSection.style.display = "flex";
        jsonData.pages.forEach((element, i) => {
            const stepContainer = document.createElement("div");
            stepContainer.setAttribute("class", "step");
            this.#formContainer.appendChild(stepContainer);
            this.#renderForm(element, stepContainer);
        });
        this.#startWizard();
    }
    #handleJsonSection() {
        const fileInput = document.getElementById("webforms_json_input");
        const file = fileInput.files[0];
        const toast = document.getElementById("webforms_toast");
        let self = this;
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const jsonContent = event.target.result;
                const jsonData = JSON.parse(jsonContent);
                self.#loadJsonData(jsonData);
                self.#setGeneralStyles(jsonData.generalStyles);
            };
            reader.readAsText(file);
            fileInput.value = "";
        }
        else {
            // Realiza una solicitud para cargar el archivo JSON
            fetch("data.json")
                .then((response) => response.json())
                .then((data) => {
                this.#loadJsonData(data);
                this.#setGeneralStyles(data.generalStyles);
                toast.classList.remove("show");
            })
                .catch((error) => {
                console.error("Error al cargar el archivo JSON: ", error);
                toast.classList.add("show");
                toast.innerHTML =
                    "Es posible que falten elementos en el archivo JSON";
            });
        }
    }
}