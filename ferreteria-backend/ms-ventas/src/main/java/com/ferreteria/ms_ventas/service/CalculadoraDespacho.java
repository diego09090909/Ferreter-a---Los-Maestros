package com.ferreteria.ms_ventas.service;

import com.ferreteria.ms_ventas.exception.ReglaNegocioException;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class CalculadoraDespacho {
    public static final long MONTO_DESPACHO_GRATIS = 50_000;

    private static final Map<String, Integer> COSTOS = Map.of(
            "La Serena", 3_990,
            "Coquimbo", 4_490,
            "Andacollo", 7_990,
            "Vicuña", 8_990,
            "Ovalle", 11_990);

    private static final Set<String> COMUNAS_DESPACHO_GRATIS = Set.of("La Serena", "Coquimbo");

    public String validarComuna(String comuna) {
        String buscada = comuna == null ? "" : comuna.trim();
        return COSTOS.keySet().stream()
                .filter(nombre -> nombre.equalsIgnoreCase(buscada))
                .findFirst()
                .orElseThrow(() -> new ReglaNegocioException(
                        "No tenemos despacho a la comuna '" + buscada + "'"));
    }

    public long calcularCosto(String comuna, long subtotal) {
        if (COMUNAS_DESPACHO_GRATIS.contains(comuna) && subtotal >= MONTO_DESPACHO_GRATIS) {
            return 0;
        }
        return COSTOS.get(comuna);
    }
}
