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
   
const checksCategorias = document.querySelectorAll('.filter-category');

const prodItems = document.querySelectorAll('.producto-item');
const checksMarcas = document.querySelectorAll('.filter-marca');


function FiltrarProductos(){

    const categoriasSeleccionadas = [];
    const marcasSeleccionadas = [];

    checksMarcas.forEach(function(check){
        if (check.checked) {
            marcasSeleccionadas.push(check.value);
        }
    });

    checksCategorias.forEach(function(check){
        if (check.checked) {
            categoriasSeleccionadas.push(check.value);
        }
    });

    prodItems.forEach(function(producto){

        const noHayMarca = marcasSeleccionadas.length === 0;
        const marcaCorrecta = marcasSeleccionadas.includes(producto.dataset.marca);
        const cumpleMarca = noHayMarca || marcaCorrecta;


        const noHayCat = categoriasSeleccionadas.length === 0;
        const catCorrecta = categoriasSeleccionadas.includes(producto.dataset.categoria);
        const cumpleCategoria = noHayCat || catCorrecta;

       if (cumpleCategoria && cumpleMarca) {
        producto.classList.remove('d-none'); 
        } else {
        producto.classList.add('d-none');    
        }
    });

}
checksCategorias.forEach(function(check) {
    
    check.addEventListener('change', function() {
        
        filtrarProductos();
    });
});