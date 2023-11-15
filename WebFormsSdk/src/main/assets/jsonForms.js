// Define las interfaces
import { Wizard } from "file:///android_asset/wizard.js";
export default class JsonForms {
    constructor() {
        // Variable para almacenar el JSON global
        this.globalJson = {};
   //
       // this.init(json);
    }
    // Elemento contenedor del formulario
    /* const inputContainer = document.getElementById("main_form");
     */
    init(json, callback) {
        this.callback = callback;
        const loadJsonSection = document.getElementById("seccion_cargar_json");
        const sendJsonSection = document.getElementById("send_section");
        this.loadJsonButton = document.getElementById("cargar_json");
        this.toJson = document.getElementById("send");
        this.formContainer = document.getElementById("main_form");
        if (json) {
            loadJsonSection.style.display = "none";
            sendJsonSection.style.display = "none";
            this.loadJsonData(json);
        }
        this.loadJsonButton.addEventListener("click", this.handleJsonSection.bind(this));
        this.toJson.addEventListener("click", this.converToPDF.bind(this));
      //  this.callback("Loaded");
    }
    // Función para renderizar el formulario a partir de los datos JSON
    renderForm(page, form) {
        page.items.forEach((item) => {
            for (const key in item.type) {
                const elementType = item.type[key];
                if (key === "input") {
                    if (elementType === "radio" && item.options) {
                        this.renderRadioInput(item, form);
                    }
                    else {
                        this.renderTextInput(item, form);
                    }
                }
                else if (key === "text") {
                    this.renderTextElement(item, form);
                }
                else if (key === "image" && item.src) {
                    this.renderImageElement(item, form);
                }
                else if (key === "divider") {
                    this.renderDivider(elementType, form);
                }
                else if (key === "table") {
                    this.renderTable(item, form);
                }
            }
        });
    }
    setGeneralStyles(styles) {
        for (const key in styles) {
            document.getElementById("wizard").style[key] = styles[key];
        }
    }
    // Función para renderizar elementos de entrada tipo radio
    renderRadioInput(item, form) {
        const legend = document.createElement("legend");
        legend.setAttribute("id", item.id + "_legend");
        form.appendChild(legend);
        legend.textContent = item.label;
        if (item.visible === false) {
            legend.style.display = "none";
        }
        if (item.options) {
            item.options.forEach((option) => {
                const input = this.createInputElement(item, option);
                const label = this.createLabelElement(item, option.value);
                form.appendChild(input);
                form.appendChild(label);
            });
        }
    }
    // Función para renderizar elementos de entrada de texto
    renderTextInput(item, form) {
        const input = this.createInputElement(item);
        const label = this.createLabelElement(item);
        form.appendChild(label);
        form.appendChild(input);
    }
    // Función para crear elementos de entrada de texto o radio
    createInputElement(item, value) {
        const input = document.createElement("input");
        this.setInputAttributes(item, value, input);
        this.inputValueChanged(item, input);
        this.addCss(item, input);
        return input;
    }
    renderDivider(item, form) {
        const divider = this.createDividerElement(item);
        if (divider) {
            form.appendChild(divider);
        }
    }
    createDividerElement(item) {
        let divider;
        if (item === "br") {
            divider = document.createElement("br");
        }
        else if (item === "hr") {
            divider = document.createElement("hr");
        }
        else if (item === "page-break") {
            divider = document.createElement("div");
            divider.style.pageBreakAfter = "always";
        }
        return divider;
    }
    // Función para crear etiquetas de elementos de entrada
    createLabelElement(item, value) {
        const label = document.createElement("label");
        label.setAttribute("for", item.id);
        if (value) {
            label.textContent = value;
        }
        else {
            label.textContent = item.label;
        }
        if (item.visible === false) {
            label.style.display = "none";
        }
        this.addCss(item, label);
        return label;
    }
    // Función para renderizar elementos de texto
    renderTextElement(item, form) {
        const text = document.createElement(item.type.text);
        text.textContent = item.label;
        if (item.css) {
            for (const key in item.css) {
                text.style[key] = item.css[key];
            }
        }
        if (item.visible === false) {
            text.style.display = "none";
        }
        this.addCss(item, text);
        form.appendChild(text);
    }
    // Función para renderizar elementos de imagen
    renderImageElement(item, form) {
        const image = document.createElement("img");
        image.src = item.src;
        form.appendChild(image);
        if (item.visible === false) {
            image.style.display = "none";
        }
        this.addCss(item, image);
    }
    //función para renderizar tablas
    renderTable(item, form) {
        const table = this.createTableElement(item);
        form.appendChild(table);
    }
    createTableElement(item) {
        const table = document.createElement("table");
        this.createTableHead(item, table);
        this.createTableData(item, table);
        this.addCss(item, table);
        return table;
    }
    createTableHead(item, table) {
        const thRows = item.cells.th;
        const thRow = table.insertRow();
        //crea filas de cabecera
        thRows.forEach((element) => {
            const cell = thRow.insertCell();
            cell.innerHTML = element;
            //addCss(item, cell);
        });
    }
    createTableData(item, table) {
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
    addCss(item, type) {
        if (item.css) {
            for (var key in item.css) {
                type.style[key] = item.css[key];
            }
        }
    }
    //Función para setear todas las propiedades de los inputs
    setInputAttributes(item, value, input) {
        input.name = item.id;
        input.id = item.id;
        input.type = item.type.input;
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
        if (input.type === "radio" && value.checked) {
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
    inputValueChanged(item, input) {
        input.addEventListener("input", function (event) {
            if (input.type === "radio") {
                const radioButtons = document.querySelectorAll(`input[type="radio"][name=${input.name}]`);
                radioButtons.forEach((radioButton) => {
                    radioButton.removeAttribute("checked");
                });
                input.setAttribute("checked", "checked");
                if (item.combo) {
                    item.combo.forEach((combo) => {
                        const elements = document.getElementsByName(combo.id);
                        const labels = document.querySelectorAll(`label[for=${combo.id}]`);
                        const legend = document.getElementById(`${combo.id}_legend`);
                        if (combo.value === input.value) {
                            if (combo.visible) {
                                labels.forEach((label) => {
                                    label.style.display = "initial";
                                });
                                for (let index = 0; index < elements.length; index++) {
                                    const element = elements[index];
                                    element.style.display = "initial";
                                    if (combo.required) {
                                        element.setAttribute("required", combo.required);
                                    }
                                }
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
                            legend.style.display = "block";
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
    changeStylesBeforePDF() {
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
    startWizard() {
        let self = this;
        const sendJsonSection = document.getElementById("send_section");
        const nextButton = document.createElement("button");
        const prevButton = document.createElement("button");
        nextButton.setAttribute("class", "next");
        prevButton.setAttribute("class", "prev");
        nextButton.innerHTML = "Siguiente";
        prevButton.innerHTML = "Atrás";
        prevButton.style.display = "none";
        nextButton.style.display = "none";
        self.toJson.style.display = "none";
        sendJsonSection.insertBefore(nextButton, sendJsonSection.firstChild);
        sendJsonSection.insertBefore(prevButton, sendJsonSection.firstChild);
        //TODO: CREAR CLASE INSTANCIA WIZARD
        const wizard = new Wizard(this.formContainer);
        if (wizard.getFormSteps() > 1) {
            nextButton.style.display = "block";
        }
        if (wizard.isLastPage()) {
            self.toJson.style.display = "block";
        }
        document.querySelector(".next").addEventListener("click", function () {
            prevButton.style.display = wizard.isFirstPage() ? "none" : "block";
            nextButton.style.display = wizard.isLastPage() ? "none" : "block";
            if (wizard.isLastPage()) {
                self.toJson.style.display = "block";
            }
        });
        document.querySelector(".prev").addEventListener("click", function () {
            if (wizard.stepIsValid()) {
                prevButton.style.display = wizard.isFirstPage() ? "none" : "block";
                nextButton.style.display = "block";
            }
            if (!wizard.isLastPage()) {
                self.toJson.style.display = "none";
            }
        });
    }
    // Función para generar un nuevo JSON a partir de los valores de los inputs
    generateJSONFromInputs() {
        const inputs = document.querySelectorAll("#main_form input");
        const clonedObject = this.globalJson;
        const outputJSON = {};
        clonedObject.form.pages.forEach((page) => {
            page.items.forEach((item) => {
                for (const key in item.type) {
                    if (key === "input" && item.id) {
                        inputs.forEach((input) => {
                            if (item.id === input.id) {
                                if (input.type === "radio" && input.checked) {
                                    outputJSON[item.id] = input.value;
                                }
                                else if ([
                                    "date",
                                    "email",
                                    "text",
                                    "tel",
                                    "password",
                                    "number",
                                ].indexOf(input.type)) {
                                    outputJSON[item.id] = input.value;
                                }
                            }
                        });
                    }
                }
            });
        });
        this.callback({
            type: "outputJSON",
            value: JSON.stringify(outputJSON, null, 2),
        });
    }
    converToPDF() {

        this.callback(document.getElementById("main_form").outerHTML);

        let self = this;
        const form = document.getElementById("main_form");
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            if (form.checkValidity()) {
                self.generateJSONFromInputs();
                self.changeStylesBeforePDF();
                const pageHTML = document.getElementById("main_form").outerHTML;
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
                    // Create a URL for the Blob
                    const pdfBlob = new Blob([blob], { type: "application/pdf" });
                    // Crear un FileReader para leer el blob como un ArrayBuffer
                    const reader = new FileReader();
                    reader.onload = function () {
                        // Obtener el ArrayBuffer
                        const arrayBuffer = reader.result;
                        // Convertir el ArrayBuffer en una matriz de bytes (Uint8Array)
                        const uint8Array = new Uint8Array(arrayBuffer);
                        // Guardar la matriz de bytes en el localStorage como una cadena codificada en base64
                        localStorage.setItem("pdfData", btoa(String.fromCharCode.apply(null, uint8Array)));
                        // Redirigir a la página HTML donde deseas recuperar el PDF
                        window.location.href = "websign.html";
                    };
                    reader.readAsArrayBuffer(pdfBlob);
                    //URL.revokeObjectURL(pdfUrl);
                })
                    .catch((error) => {
                    console.error("Error al cargar el archivo JSON: ", error);
                })
                    .finally(() => {
                    document.body.classList.remove("loading");
                });
            }
        });
    }
    loadJsonData(jsonData) {
        const loadJsonSection = document.getElementById("seccion_cargar_json");
        const sendJsonSection = document.getElementById("send_section");
        let widget = {};
        this.globalJson = jsonData;
        loadJsonSection.style.display = "none";
        sendJsonSection.style.display = "flex";
        widget = this.globalJson.widget;
        localStorage.setItem("widget", JSON.stringify(widget));
        jsonData.form.pages.forEach((element, i) => {
            const stepContainer = document.createElement("div");
            stepContainer.setAttribute("class", "step");
            this.formContainer.appendChild(stepContainer);
            this.renderForm(element, stepContainer);
        });
        this.startWizard();
    }
    handleJsonSection() {
        const fileInput = document.getElementById("json_input");
        const file = fileInput.files[0];
        const toast = document.getElementById("toast");
        let self = this;
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const jsonContent = event.target.result;
                const jsonData = JSON.parse(jsonContent);
                self.loadJsonData(jsonData);
                self.setGeneralStyles(jsonData.form.generalStyles);
            };
            reader.readAsText(file);
            fileInput.value = "";
        }
        else {
            // Realiza una solicitud para cargar el archivo JSON
            fetch("data.json")
                .then((response) => response.json())
                .then((data) => {
                this.loadJsonData(data);
                this.setGeneralStyles(data.form.generalStyles);
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