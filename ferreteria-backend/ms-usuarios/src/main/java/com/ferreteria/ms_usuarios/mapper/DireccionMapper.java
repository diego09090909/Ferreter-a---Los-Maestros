package com.ferreteria.ms_usuarios.mapper;

import org.springframework.stereotype.Component;
import com.ferreteria.ms_usuarios.dto.DireccionRequest;
import com.ferreteria.ms_usuarios.dto.DireccionResponse;
import com.ferreteria.ms_usuarios.model.Direccion;

@Component
public class DireccionMapper {

    public DireccionResponse aResponse(Direccion d) {
        return new DireccionResponse(d.getId(), d.getCalle(), d.getNumero(),
                d.getComuna(), d.getRegion(), d.getAlias(), d.getDepartamento(), d.getIndicaciones(),
                d.isPredeterminada());
    }

    public Direccion aEntidad(DireccionRequest r) {
        Direccion d = new Direccion();
        actualizar(d, r);
        return d;
    }

    public void actualizar(Direccion d, DireccionRequest r) {
        d.setAlias(r.getAlias() == null || r.getAlias().isBlank() ? "Principal" : r.getAlias().trim());
        d.setCalle(r.getCalle().trim());
        d.setNumero(r.getNumero().trim());
        d.setDepartamento(r.getDepartamento());
        d.setComuna(r.getComuna());
        d.setRegion("Región de Coquimbo");
        d.setIndicaciones(r.getIndicaciones());
    }
}