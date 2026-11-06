# test-manager-library-3239188-app

> **Prueba técnica SDD · Ficha ADSO 3239188**  
> Frontend SPA oficial en **React (Vite)** para *Manager Library*.

Este repositorio contiene la aplicación web de gestión para operadores (Administradores y Bibliotecarios) de la biblioteca, cumpliendo con la tarea **T-22** de la especificación SDD.

---

## 1. Características Implementadas (Tarea T-22)

* **Autenticación (HU-01):**
  * Pantalla de login para administradores y bibliotecarios.
  * Almacenamiento seguro del token JWT (8 horas de vigencia) y control de sesiones.
* **Catálogo de Libros (HU-03 y HU-04):**
  * Buscador en tiempo real por título y autor.
  * Filtro desplegable por las 5 categorías oficiales.
  * Contador visual de ejemplares disponibles / totales.
  * Modal de registro de nuevos libros con validación de ISBN de 13 dígitos (solo admin).
  * Opción de baja lógica con validación de préstamos abiertos.
* **Gestión de Socios (HU-05):**
  * Directorio y búsqueda de socios por nombre o documento.
  * Conteo en vivo de libros prestados activos sin devolver (máximo 3).
  * Modal de afiliación de nuevos socios con documento único.
* **Módulo de Préstamos (HU-06):**
  * Formulario interactivo que valida:
    * Límite de hasta 3 libros prestados simultáneos por socio.
    * Bloqueo si el socio tiene algún libro vencido.
    * Prohibición de repetir el mismo libro en el mismo préstamo.
    * Descuento automático de ejemplares y cálculo de fecha de vencimiento a 14 días.
* **Control de Vencidos y Devoluciones (HU-07 y HU-09):**
  * Bandeja de préstamos vencidos con cálculo de días de retraso (`days_late`).
  * Botón de devolución por línea que repone el ejemplar disponible en el catálogo e impide dobles devoluciones.
* **Reporte de Libros Más Prestados (HU-10 & ADR-004):**
  * Selector de rango de fechas (`from` y `to`).
  * Visualización del ranking analítico agrupado por los valores congelados.
* **Alta de Bibliotecarios (HU-02):**
  * Formulario para crear nuevos usuarios con rol `librarian` (solo admin).

---

## 2. Puesta en Marcha Local

### Requisitos
* [Node.js](https://nodejs.org/) v18+ instalado.

### Instalación y Ejecución
1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Iniciar el servidor de desarrollo en Vite:
   ```bash
   npm run dev
   ```

3. Abrir en el navegador:
   ```
   http://localhost:5173
   ```

### Credenciales de Acceso Iniciales
* **Usuario:** `admin`
* **Contraseña:** `admin_secret_pass`
*(Provistas por el entorno del backend `api`)*
