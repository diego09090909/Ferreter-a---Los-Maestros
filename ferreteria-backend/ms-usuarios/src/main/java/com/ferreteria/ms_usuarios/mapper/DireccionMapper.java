package com.ferreteria.ms_usuarios.mapper;
import org.springframework.stereotype.Component;
import com.ferreteria.ms_usuarios.dto.DireccionRequest;
import com.ferreteria.ms_usuarios.dto.DireccionResponse;
import com.ferreteria.ms_usuarios.model.Direccion;

@Component
public class DireccionMapper {

    public DireccionResponse aResponse(Direccion d) {
        return new DireccionResponse(d.getId(), d.getCalle(), d.getNumero(),
                d.getComuna(), d.getCiudad(), d.getRegion());
    }

    public Direccion aEntidad(DireccionRequest r) {
        Direccion d = new Direccion();
        d.setCalle(r.getCalle());
        d.setNumero(r.getNumero());
        d.setComuna(r.getComuna());
        d.setCiudad(r.getCiudad());
        d.setRegion(r.getRegion());
        return d;
    }
}