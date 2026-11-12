package com.ferreteria.ms_catalogo.mapper;

import com.ferreteria.ms_catalogo.dto.CategoriaRequest;
import com.ferreteria.ms_catalogo.dto.CategoriaResponse;
import com.ferreteria.ms_catalogo.model.Categoria;
import org.springframework.stereotype.Component;

@Component
public class CategoriaMapper {

    public CategoriaResponse aResponse(Categoria c) {
        return new CategoriaResponse(c.getId(), c.getNombre(), c.getEtiqueta(), c.getDescripcion());
    }

    public Categoria aEntidad(CategoriaRequest r) {
        Categoria c = new Categoria();
        actualizar(c, r);
        return c;
    }

    public void actualizar(Categoria c, CategoriaRequest r) {
        c.setNombre(r.getNombre().trim());
        c.setEtiqueta(r.getEtiqueta().trim());
        c.setDescripcion(r.getDescripcion());
    }
}