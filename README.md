# Autos Quito — Portal de Mantenimiento Automotriz

Aplicación web frontend desarrollada para la gestión integral de servicios y solicitudes de mantenimiento vehicular del taller **Autos Quito**. El sistema permite visualizar la información institucional del taller, consultar el catálogo de servicios, registrar solicitudes con validaciones estrictas y administrar registros mediante control de acceso basado en roles (Cliente y Administrador) sin necesidad de servidor backend ni base de datos externa.

---

## Arquitectura y Módulos Implementados

### 1. Página Institucional
* **Navegación dinámica:** Barra de navegación responsiva (`navbar`) que adapta sus opciones de menú según el estado de autenticación y el rol activo en sesión.
* **Identidad y Acerca de:** Presentación institucional del taller, propósito del sistema y características operativas principales.
* **Catálogo de Servicios:** Grilla responsiva con 6 servicios automotrices y tarifas base:
  * Cambio de aceite (desde \$35)
  * Revisión de frenos (desde \$45)
  * Diagnóstico electrónico (desde \$30)
  * Alineación y balanceo (desde \$40)
  * Mantenimiento general (desde \$60)
  * Cambio de llantas (desde \$25)

### 2. Solicitud de Mantenimiento y Validaciones
* **Formulario completo:** Captura de datos del cliente (nombre, correo, teléfono, tipo de cliente: *Particular* o *Empresa*) y especificaciones del vehículo (placa, marca, modelo, año, kilometraje, servicio principal, servicios adicionales como *Lavado*, *Recogida* o *Repuestos originales*, fecha, hora y observaciones).
* **Validación en tiempo real y envío:**
  * **Teléfono:** Formato celular ecuatoriano de 10 dígitos iniciando con `09` (`/^\d{8}$/`).
  * **Placa vehicular:** Formato alfanumérico estándar (`/^[A-Z]{3}-\d{3,4}$/`, ej. `PBA-4821`).
  * **Año y kilometraje:** Rango de fabricación válido (`1980` hasta el año siguiente al actual) y kilometraje no negativo (`>= 0`).
  * **Programación:** Verificación de fecha igual o posterior al día en curso, selección de horario y aceptación obligatoria de términos y condiciones.

### 3. Autenticación, Control de Roles y CRUD
* **Rol Cliente:**
  * Visualización de datos personales en su perfil.
  * Registro de solicitudes vinculadas automáticamente a su identificador de usuario (`idCliente`).
  * Consulta exclusiva de sus propias solicitudes y despliegue detallado de cada orden mediante filtrado de arreglos.
* **Rol Administrador:**
  * Registro de solicitudes propias o asignadas a cualquier cliente registrado mediante un selector dinámico.
  * Visualización global de todas las órdenes ingresadas en el sistema.
  * **Operaciones CRUD:** Edición de programación (fecha, hora y servicio), actualización del estado de atención y eliminación de registros con confirmación modal previa.
* **Persistencia local:** Sincronización automática de las solicitudes en un arreglo de objetos almacenado en `localStorage` (`ad01_solicitudes_autosquito`).

---

## Credenciales de Prueba

El sistema cuenta con usuarios precargados en `js/script.js` para validar los niveles de acceso y restricciones por rol:

| Rol | Usuario | Contraseña | Nombre en sistema | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `admin123` | Administrador Autos Quito | Activo |
| **Cliente 1** | `cliente1` | `1234` | Luis Vera | Activo |
| **Cliente 2** | `cliente2` | `1234` | María López | Activo |

---

## Stack Tecnológico

* **HTML5:** Maquetación semántica (`header`, `nav`, `main`, `section`, `footer`).
* **CSS3 y Bootstrap v5.3.3:** Diseño responsivo, sistema de rejillas, tarjetas, tablas adaptables y paleta visual personalizada.
* **JavaScript (ES6+):** Manipulación del DOM, gestión de eventos, validaciones con expresiones regulares, métodos de arreglos (`find()`, `filter()`, `forEach()`, `map()`) y almacenamiento en `localStorage`.
* **SweetAlert2 v11:** Diálogos modales interactivos para inicio de sesión, alertas de error, formularios de edición y confirmación de eliminación.

---

## Estructura del Repositorio

```text
Mantenimiento-Automotriz/
├── index.html          # Estructura principal, catálogo, formulario y panel de usuario
├── css/
│   └── styles.css      # Estilos personalizados y paleta institucional
├── js/
│   └── script.js       # Lógica de usuarios, validaciones, eventos y CRUD
└── README.md           # Documentación técnica del proyecto
```

---

## Ejecución Local

1. Clona este repositorio en tu máquina local:
   ```bash
   git clone https://github.com
   ```
2. Abre la carpeta del proyecto en **Visual Studio Code**.
3. Abre el archivo `index.html` en tu navegador web o ejecútalo mediante la extensión **Live Server**.