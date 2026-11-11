package com.ferreteria.ms_ventas.exception;

/** Se traduce a HTTP 404 en el @RestControllerAdvice. */
public class RecursoNoEncontradoException extends RuntimeException {

    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
