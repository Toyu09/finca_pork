function filterTable() {
    const input = document.getElementById("searchInput");
    const filter = input.value.toLowerCase();
    const table = document.getElementById("planTable");
    const rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName("td");
        let match = false;

        for (let j = 0; j < cells.length; j++) {
            if (cells[j].innerText.toLowerCase().includes(filter)) {
                match = true;
                break;
            }
        }

        rows[i].style.display = match ? "" : "none";
    }
}

function saveToExcel() {
    const table = document.getElementById("planTable");
    const rows = table.getElementsByTagName("tr");
    const data = [];

    // Obtener datos de la tabla
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName(i === 0 ? "th" : "td");
        const row = Array.from(cells).map(cell => cell.innerText);
        data.push(row);
    }

    // Crear hoja de cálculo
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plan Sanitario");

    // Descargar archivo
    XLSX.writeFile(wb, "plan_sanitario.xlsx");
}

function loadTable(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0]; // Toma la primera hoja
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Convierte a JSON

        const tableBody = document.querySelector("#planTable tbody");
        tableBody.innerHTML = ""; // Limpia las filas actuales

        jsonData.forEach(row => {
            const tr = document.createElement("tr");
            row.forEach(cellText => {
                const td = document.createElement("td");
                td.contentEditable = "true";
                td.innerText = cellText || ""; // Maneja celdas vacías
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
    };
    reader.readAsArrayBuffer(file);
}


function updateVaccinationDates() {
    const birthDateInput = document.getElementById("birthDate").value;
    if (!birthDateInput) return;

    const birthDate = new Date(birthDateInput);
    const table = document.getElementById("planTable");
    const rows = table.getElementsByTagName("tr");

    // Comienza desde la fila 1 para evitar modificar el encabezado
    for (let i = 1; i < rows.length; i++) {
        const daysCell = rows[i].getElementsByTagName("td")[2];  // Celda con los días
        const editableDateCell = rows[i].getElementsByTagName("td")[3];  // Celda editable (vacunación editable)
        const fixedDateCell = rows[i].getElementsByTagName("td")[4];  // Celda fija (vacunación fija)
        const days = parseInt(daysCell.innerText);

        if (!isNaN(days)) {
            const vaccinationDate = new Date(birthDate);
            vaccinationDate.setDate(birthDate.getDate() + days);

            // Obtener día, mes y año en formato día-mes-año
            const day = vaccinationDate.getDate().toString().padStart(2, '0'); // Añade un cero si el día es menor a 10
            const month = (vaccinationDate.getMonth() + 1).toString().padStart(2, '0'); // Sumar 1 al mes
            const year = vaccinationDate.getFullYear();

            // Crear la fecha en formato día-mes-año
            const formattedDate = `${day}-${month}-${year}`;

            // Actualiza ambas celdas con la misma fecha
            fixedDateCell.innerText = formattedDate;  // Fecha fija
            editableDateCell.innerText = formattedDate;  // Fecha editable
        } else {
            fixedDateCell.innerText = "-";
            editableDateCell.innerText = "-";
        }
    }
}
