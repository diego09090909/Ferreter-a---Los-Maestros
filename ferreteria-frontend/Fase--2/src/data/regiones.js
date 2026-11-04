// Regiones y comunas disponibles para registrar una dirección.
// Para agregar otra región basta con sumar un objeto a esta lista.
export const REGIONES = [
    {
        nombre: 'Región de Coquimbo',
        comunas: [
            'La Serena', 'Coquimbo', 'Andacollo', 'La Higuera', 'Paihuano', 'Vicuña',
            'Illapel', 'Canela', 'Los Vilos', 'Salamanca',
            'Ovalle', 'Combarbalá', 'Monte Patria', 'Punitaqui', 'Río Hurtado',
        ],
    },
    {
        nombre: 'Región de Valparaíso',
        comunas: [
            'Valparaíso', 'Casablanca', 'Concón', 'Juan Fernández', 'Puchuncaví', 'Quintero',
            'Viña del Mar', 'Isla de Pascua', 'Los Andes', 'Calle Larga', 'Rinconada', 'San Esteban',
            'La Ligua', 'Cabildo', 'Papudo', 'Petorca', 'Zapallar', 'Quillota', 'Calera',
            'Hijuelas', 'La Cruz', 'Nogales', 'San Antonio', 'Algarrobo', 'Cartagena',
            'El Quisco', 'El Tabo', 'Santo Domingo', 'San Felipe', 'Catemu', 'Llaillay',
            'Panquehue', 'Putaendo', 'Santa María', 'Quilpué', 'Limache', 'Olmué', 'Villa Alemana',
        ],
    },
    {
        nombre: 'Región Metropolitana de Santiago',
        comunas: [
            'Santiago', 'Cerrillos', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central',
            'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana',
            'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú',
            'Ñuñoa', 'Pedro Aguirre Cerda', 'Peñalolén', 'Providencia', 'Pudahuel', 'Quilicura',
            'Quinta Normal', 'Recoleta', 'Renca', 'San Joaquín', 'San Miguel', 'San Ramón', 'Vitacura',
            'Puente Alto', 'Pirque', 'San José de Maipo', 'Colina', 'Lampa', 'Til Til',
            'San Bernardo', 'Buin', 'Calera de Tango', 'Paine', 'Melipilla', 'Alhué', 'Curacaví',
            'María Pinto', 'San Pedro', 'Talagante', 'El Monte', 'Isla de Maipo', 'Padre Hurtado', 'Peñaflor',
        ],
    },
]