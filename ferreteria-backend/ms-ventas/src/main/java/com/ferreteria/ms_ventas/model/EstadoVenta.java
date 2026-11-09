package com.ferreteria.ms_ventas.model;

public enum EstadoVenta {
    PENDIENTE,
    PAGADA,
    DESPACHADA,
    ENTREGADA,
    ANULADA;

    public boolean puedeCambiarA(EstadoVenta nuevo) {
        return switch (this) {
            case PENDIENTE -> nuevo == PAGADA || nuevo == ANULADA;
            case PAGADA -> nuevo == DESPACHADA || nuevo == ANULADA;
            case DESPACHADA -> nuevo == ENTREGADA;
            case ENTREGADA, ANULADA -> false; // estados finales
        };
    }
}
