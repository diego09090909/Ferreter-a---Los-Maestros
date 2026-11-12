package com.ferreteria.ms_ventas.client;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoCatalogo {

    private Long id;
    private String nombre;
    private Integer precio;
    private Integer stock;
    private Boolean disponible;
}
