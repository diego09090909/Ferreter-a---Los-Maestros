package main.java.com.ferreteria.ms_usuarios.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DireccionRequest {

    @NotBlank(message = "La calle es obligatoria")
    @Size(max = 150)
    private String calle;

    @NotBlank(message = "El numero es obligatorio")
    @Size(max = 20)
    private String numero;

    @NotBlank(message = "Debe elegir una comuna")
    private String comuna;

    @NotBlank(message = "La ciudad es obligatoria")
    private String ciudad;

    private String region;
}