package com.ferreteria.ms_usuarios.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class RutValidator implements ConstraintValidator<RutValido, String> {

    @Override
    public boolean isValid(String rut, ConstraintValidatorContext context) {
        if (rut == null || rut.isBlank()) {
            return true; 
        }

        String limpio = rut.trim().replace(".", "").toUpperCase();

      
        if (!limpio.matches("^\\d{7,8}-[\\dK]$")) {
            return false;
        }

        String cuerpo = limpio.substring(0, limpio.length() - 2);
        char dv = limpio.charAt(limpio.length() - 1);

        int suma = 0;
        int multiplicador = 2;
        for (int i = cuerpo.length() - 1; i >= 0; i--) {
            suma += Character.getNumericValue(cuerpo.charAt(i)) * multiplicador;
            multiplicador = (multiplicador == 7) ? 2 : multiplicador + 1;
        }

        int resto = 11 - (suma % 11);
        char esperado = (resto == 11) ? '0' : (resto == 10) ? 'K' : (char) ('0' + resto);

        return dv == esperado;
    }
}