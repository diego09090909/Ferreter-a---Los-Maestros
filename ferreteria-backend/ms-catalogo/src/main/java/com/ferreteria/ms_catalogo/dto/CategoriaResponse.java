package com.ferreteria.ms_catalogo.dto;

import com.ferreteria.ms_catalogo.model.Categoria;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaResponse {

    private Long id;
    private String nombre;
    private String etiqueta;
    private String descripcion;

    public static CategoriaResponse desde(Categoria categoria) {
        return new CategoriaResponse(
                categoria.getId(),
                categoria.getNombre(),
                categoria.getEtiqueta(),
                categoria.getDescripcion());
    }
}