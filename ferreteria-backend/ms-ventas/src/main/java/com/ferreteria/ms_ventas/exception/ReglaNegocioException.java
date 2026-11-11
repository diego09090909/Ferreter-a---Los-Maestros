package com.ferreteria.ms_ventas.exception;

/**
 * Se lanza cuando la petición es válida en formato, pero rompe una regla del negocio
 * (sin stock, cambio de estado no permitido, etc.). Se traduce a HTTP 409 o 422.
 */
public class ReglaNegocioException extends RuntimeException {

    public ReglaNegocioException(String mensaje) {
        super(mensaje);
    }
}
