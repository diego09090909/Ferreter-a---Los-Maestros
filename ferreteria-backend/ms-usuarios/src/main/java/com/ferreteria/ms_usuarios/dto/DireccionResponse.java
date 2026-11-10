package com.ferreteria.ms_usuarios.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DireccionResponse {

    private Long id;
    private String calle;
    private String numero;
    private String comuna;
    private String ciudad;
    private String region;
}
