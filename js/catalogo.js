document.addEventListener('DOMContentLoaded', function () {
    const rangoPrecio = document.getElementById('rango');
    const precioMaximoTexto = document.getElementById('precioMaximoTexto');

  
    if (rangoPrecio && precioMaximoTexto) {
        
        rangoPrecio.addEventListener('input', function () {
            const valorActual = Number(this.value);
            const valorFormateado = valorActual.toLocaleString('es-CL');
            precioMaximoTexto.textContent = valorFormateado;
        });

    }
});