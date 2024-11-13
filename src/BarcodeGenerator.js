import React, { useState } from 'react';
import Papa from 'papaparse';
import JsBarcode from 'jsbarcode';
import './BarcodeGenerator.css'; // Asegúrate de que la ruta sea correcta

const BarcodeGenerator = () => {
    const [productos, setProductos] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [customCode, setCustomCode] = useState('');
    const [selectedOptions, setSelectedOptions] = useState([]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            Papa.parse(file, {
                complete: (results) => {
                    setProductos(results.data.slice(1)); // Omitir encabezado
                }
            });
        }
    };

    const handleSelectChange = (event) => {
        const options = Array.from(event.target.selectedOptions).map(opt => opt.value);
        setSelectedOptions(options);
        
        // Autocompletar el campo de búsqueda con la descripción del producto seleccionado.
        const selectedProduct = productos.find(product => product[0] === options[0]);
        if (selectedProduct) {
            setSearchValue(selectedProduct[1]); // Actualiza el valor del input de búsqueda con la descripción
        }
    };

    const filteredProducts = productos.filter(producto => 
        producto[1]?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const handleGenerateBarcodes = () => {
        const barcodeContainer = document.getElementById('barcodeContainer');
        barcodeContainer.innerHTML = ''; // Limpiar contenedor anterior

        selectedOptions.forEach(codigo => {
            const producto = productos.find(producto => producto[0] === codigo);
            const descripcion = producto ? producto[1] : 'Descripción no disponible';

            const imgContainer = document.createElement('div');
            imgContainer.style.textAlign = 'center'; // Centrar contenido

            const img = document.createElement('img');
            JsBarcode(img, codigo, { format: "CODE128" });
            imgContainer.appendChild(img);

            const description = document.createElement('p');
            description.textContent = `${descripcion} (${codigo})`;
            imgContainer.appendChild(description);

            barcodeContainer.appendChild(imgContainer); // Añadir el contenedor de imagen y descripción al contenedor principal
        });
    };

    const handleGenerateCustomBarcode = () => {
        const barcodeContainer = document.getElementById('barcodeContainer');

        if (customCode) {
            const imgContainer = document.createElement('div');
            imgContainer.style.textAlign = 'center'; // Centrar contenido

            const img = document.createElement('img');
            JsBarcode(img, customCode, { format: "CODE128" });
            imgContainer.appendChild(img);

            const description = document.createElement('p');
            description.textContent = `Código Lote: ${customCode}`;
            imgContainer.appendChild(description);

            barcodeContainer.appendChild(imgContainer); // Añadir el contenedor de imagen y descripción al contenedor principal

            setCustomCode(''); // Limpiar entrada
        } else {
            alert('Por favor, ingrese un código Lote.');
        }
    };

    const handlePrintBarcodes = () => {
        const barcodeContainer = document.getElementById('barcodeContainer');
        const printWindow = window.open('', '_blank', 'width=600,height=400');
        printWindow.document.write('<html><head><title>Imprimir Códigos de Barras</title>');
        printWindow.document.write('<style>body { font-family: Arial, sans-serif; text-align: center; }</style></head><body>');
        printWindow.document.write(barcodeContainer.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div style={{ fontFamily: 'Arial', backgroundColor: '#f9f9f9', padding: '20px' }}>
            <h1>Códigos de Barras</h1>
            <input type="file" onChange={handleFileChange} accept=".csv" />
            <input 
                type="text" 
                placeholder="Buscar producto..." 
                value={searchValue} 
                onChange={e => setSearchValue(e.target.value)} 
            />
            <select id="productList" onChange={handleSelectChange} multiple>
                {filteredProducts.map((producto, index) => (
                    <option key={index} value={producto[0]}>
                        {producto[1]} ({producto[0]})
                    </option>
                ))}
            </select>
            <button onClick={handleGenerateBarcodes}>Generar Códigos de Barras Seleccionados</button>
            <button onClick={handlePrintBarcodes}>Imprimir Códigos de Barras</button>
            <input 
                type="text" 
                placeholder="Ingrese un código Lote..."
                value={customCode}
                onChange={e => setCustomCode(e.target.value)} 
            />
            <button onClick={handleGenerateCustomBarcode}>Generar Código de Barras lote</button>

            <div id="barcodeContainer" style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}></div>
        </div>
    );
};

export default BarcodeGenerator;