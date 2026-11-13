const usuarios = [
    {
        id: 1,
        usuario: "cliente1",
        clave: "1234",
        rol: "Cliente",
        nombre: "Luis Vera",
        correo: "luisvera@correo.com",
        telefono: "0991112233",
        activo: true
    },
    {
        id: 2,
        usuario: "cliente2",
        clave: "1234",
        rol: "Cliente",
        nombre: "María López",
        correo: "marialopez@correo.com",
        telefono: "0982223344",
        activo: true
    },
    {
        id: 3,
        usuario: "admin",
        clave: "admin123",
        rol: "Administrador",
        nombre: "Administrador Autos Quito",
        correo: "admin@autosquito.com",
        telefono: "0998887766",
        activo: true
    }
];

let solicitudes = [];
let usuarioActual = null;
let siguienteId = 1;
let detallesAbiertosId = null;

const enlaceLogin = document.getElementById("enlaceLogin");
const enlacePerfil = document.getElementById("enlacePerfil");
const enlaceAdmin = document.getElementById("enlaceAdmin");
const enlaceSalir = document.getElementById("enlaceSalir");

const contenedorLogin = document.getElementById("contenedorLogin");
const contenedorPerfil = document.getElementById("contenedorPerfil");
const contenedorAdmin = document.getElementById("contenedorAdmin");
const contenedorSalir = document.getElementById("contenedorSalir");

const botonCerrarSesionPanel = document.getElementById("btnCerrarSesionPanel");

const formulario = document.getElementById("formularioSolicitud");
const panel = document.getElementById("panel");
const datosPerfil = document.getElementById("datosPerfil");
const tituloPanel = document.getElementById("tituloPanel");
const tituloSolicitudes = document.getElementById("tituloSolicitudes");
const tabla = document.getElementById("tablaSolicitudes");
const columnaAcciones = document.getElementById("columnaAcciones");

const contenedorClienteAdmin = document.getElementById("contenedorClienteAdmin");
const clienteSeleccionado = document.getElementById("clienteSeleccionado");

const contenedorDetalles = document.getElementById("contenedorDetalles");
const tituloDetalles = document.getElementById("tituloDetalles");
const contenidoDetalles = document.getElementById("contenidoDetalles");

const CLAVE_SOLICITUDES = "ad01_solicitudes_autosquito";
const CLAVE_USUARIO = "ad01_usuario_autosquito";

const SERVICIOS = [
    "Cambio de aceite",
    "Revisión de frenos",
    "Diagnóstico electrónico",
    "Alineación y balanceo",
    "Mantenimiento general",
    "Cambio de llantas"
];

function cargarDatos() {
    const solicitudesGuardadas = localStorage.getItem(CLAVE_SOLICITUDES);

    if (solicitudesGuardadas) {
        solicitudes = JSON.parse(solicitudesGuardadas);
    }

    usuarioActual = null;

    localStorage.removeItem(CLAVE_USUARIO);

    siguienteId = solicitudes.length > 0
        ? Math.max(...solicitudes.map(solicitud => solicitud.id)) + 1
        : 1;

    actualizarMenu();
}

function guardarSolicitudes() {
    localStorage.setItem(CLAVE_SOLICITUDES, JSON.stringify(solicitudes));
}

function actualizarMenu() {
    if (usuarioActual) {
        contenedorLogin.classList.add("d-none");
        contenedorPerfil.classList.remove("d-none");
        contenedorSalir.classList.remove("d-none");

        if (usuarioActual.rol === "Administrador") {
            contenedorAdmin.classList.remove("d-none");
        } else {
            contenedorAdmin.classList.add("d-none");
        }
    } else {
        contenedorLogin.classList.remove("d-none");
        contenedorPerfil.classList.add("d-none");
        contenedorAdmin.classList.add("d-none");
        contenedorSalir.classList.add("d-none");
        panel.classList.add("d-none");
        ocultarDetalles();
    }
}

function iniciarSesion() {
    Swal.fire({
        title: "Iniciar sesión",
        html: `
            <input id="usuarioLogin" class="swal2-input" placeholder="Usuario">
            <input id="claveLogin" class="swal2-input" type="password" placeholder="Contraseña">
        `,
        confirmButtonText: "Ingresar",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        preConfirm: () => {
            const usuario = document.getElementById("usuarioLogin").value.trim();
            const clave = document.getElementById("claveLogin").value;

            if (!usuario || !clave) {
                Swal.showValidationMessage("Ingrese usuario y contraseña.");
                return false;
            }

            return { usuario, clave };
        }
    }).then(resultado => {
        if (!resultado.isConfirmed) return;

        const usuarioEncontrado = usuarios.find(item =>
            item.usuario.toLowerCase() === resultado.value.usuario.toLowerCase() &&
            item.clave === resultado.value.clave
        );

        if (!usuarioEncontrado) {
            Swal.fire({
                icon: "error",
                title: "Credenciales inválidas",
                text: "Usuario o contraseña incorrectos."
            });
            return;
        }

        if (!usuarioEncontrado.activo) {
            Swal.fire({
                icon: "warning",
                title: "Cuenta deshabilitada",
                text: "Contacte al administrador."
            });
            return;
        }

        usuarioActual = usuarioEncontrado;
        actualizarMenu();

        if (usuarioActual.rol === "Administrador") {
            mostrarAdministracion();
        } else {
            mostrarPerfil();
        }

        Swal.fire({
            icon: "success",
            title: "Bienvenido",
            text: `Hola, ${usuarioActual.nombre}.`
        });
    });
}

function cerrarSesion() {
    usuarioActual = null;
    actualizarMenu();

    Swal.fire({
        icon: "info",
        title: "Sesión cerrada",
        text: "Has salido de tu cuenta."
    });
}

function esAdministrador() {
    return usuarioActual && usuarioActual.rol === "Administrador";
}

function mostrarPerfil() {
    if (!usuarioActual) return;

    tituloPanel.textContent = "Mi perfil";
    tituloSolicitudes.textContent = "Mis mantenimientos";
    columnaAcciones.classList.add("d-none");
    contenedorClienteAdmin.classList.add("d-none");
    ocultarDetalles();

    datosPerfil.innerHTML = `
        <p><strong>Nombre:</strong> ${usuarioActual.nombre}</p>
        <p><strong>Usuario:</strong> ${usuarioActual.usuario}</p>
        <p><strong>Correo:</strong> ${usuarioActual.correo}</p>
        <p><strong>Teléfono:</strong> ${usuarioActual.telefono}</p>
        <p><strong>Rol:</strong> ${usuarioActual.rol}</p>
    `;

    panel.classList.remove("d-none");
    mostrarSolicitudes();
}

function mostrarAdministracion() {
    if (!esAdministrador()) {
        Swal.fire({
            icon: "error",
            title: "Acceso denegado",
            text: "Solo el administrador puede ingresar a esta sección."
        });
        return;
    }

    tituloPanel.textContent = "Administración";
    tituloSolicitudes.textContent = "Solicitudes de todos los clientes";
    columnaAcciones.classList.remove("d-none");
    contenedorClienteAdmin.classList.remove("d-none");
    ocultarDetalles();

    cargarClientesEnSelector();

    datosPerfil.innerHTML = `
        <p><strong>Administrador:</strong> ${usuarioActual.nombre}</p>
        <p><strong>Rol:</strong> ${usuarioActual.rol}</p>
        <p><strong>Total de solicitudes:</strong> ${solicitudes.length}</p>
    `;

    panel.classList.remove("d-none");
    mostrarSolicitudes();
}

function cargarClientesEnSelector() {
    clienteSeleccionado.innerHTML = `
        <option value="">Seleccione un cliente...</option>
    `;

    const clientes = usuarios.filter(usuario => usuario.rol === "Cliente");

    clientes.forEach(cliente => {
        clienteSeleccionado.innerHTML += `
            <option value="${cliente.id}">${cliente.nombre}</option>
        `;
    });
}

function mostrarSolicitudes() {
    tabla.innerHTML = "";
    ocultarDetalles();

    let lista = solicitudes;

    if (usuarioActual && usuarioActual.rol === "Cliente") {
        lista = solicitudes.filter(
            solicitud => solicitud.idCliente === usuarioActual.id
        );
    }

    if (lista.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="10" class="text-center">No hay solicitudes registradas.</td>
            </tr>
        `;
        return;
    }

    lista.forEach(solicitud => {
        const fila = document.createElement("tr");

        const celdaId = document.createElement("td");
        celdaId.textContent = solicitud.id;

        const celdaCliente = document.createElement("td");
        celdaCliente.textContent = solicitud.cliente;

        const celdaPlaca = document.createElement("td");
        celdaPlaca.textContent = solicitud.placa;

        const celdaVehiculo = document.createElement("td");
        celdaVehiculo.textContent = `${solicitud.marca} ${solicitud.modelo} (${solicitud.anio})`;

        const celdaServicio = document.createElement("td");
        celdaServicio.textContent = solicitud.servicio;

        const celdaFecha = document.createElement("td");
        celdaFecha.textContent = solicitud.fecha;

        const celdaHora = document.createElement("td");
        celdaHora.textContent = solicitud.hora;

        const celdaEstado = document.createElement("td");
        celdaEstado.textContent = solicitud.estado;

        const celdaDetalles = document.createElement("td");

        const botonDetalles = document.createElement("button");
        botonDetalles.className = "btn btn-outline-primary btn-sm";
        botonDetalles.textContent = "Ver detalles";
        botonDetalles.dataset.id = solicitud.id;
        botonDetalles.addEventListener("click", function () {
            mostrarDetalles(solicitud.id, botonDetalles);
        });

        celdaDetalles.appendChild(botonDetalles);

        fila.appendChild(celdaId);
        fila.appendChild(celdaCliente);
        fila.appendChild(celdaPlaca);
        fila.appendChild(celdaVehiculo);
        fila.appendChild(celdaServicio);
        fila.appendChild(celdaFecha);
        fila.appendChild(celdaHora);
        fila.appendChild(celdaEstado);
        fila.appendChild(celdaDetalles);

        if (esAdministrador()) {
            const celdaAcciones = document.createElement("td");
            celdaAcciones.className = "d-flex gap-2";

            const botonEditar = document.createElement("button");
            botonEditar.className = "btn btn-primary btn-sm";
            botonEditar.textContent = "Editar";
            botonEditar.addEventListener("click", function () {
                editarSolicitud(solicitud.id);
            });

            const botonEstado = document.createElement("button");
            botonEstado.className = "btn btn-warning btn-sm";
            botonEstado.textContent = "Estado";
            botonEstado.addEventListener("click", function () {
                cambiarEstado(solicitud.id);
            });

            const botonEliminar = document.createElement("button");
            botonEliminar.className = "btn btn-danger btn-sm";
            botonEliminar.textContent = "Eliminar";
            botonEliminar.addEventListener("click", function () {
                eliminarSolicitud(solicitud.id);
            });

            celdaAcciones.appendChild(botonEditar);
            celdaAcciones.appendChild(botonEstado);
            celdaAcciones.appendChild(botonEliminar);

            fila.appendChild(celdaAcciones);
        }

        tabla.appendChild(fila);
    });
}

function mostrarDetalles(idSolicitud, botonDetalles) {
    const solicitud = solicitudes.find(item => item.id === idSolicitud);

    if (!solicitud) return;

    if (
        !esAdministrador() &&
        (!usuarioActual || solicitud.idCliente !== usuarioActual.id)
    ) {
        Swal.fire({
            icon: "error",
            title: "Acceso denegado",
            text: "Solo puede consultar los detalles de sus propias solicitudes."
        });
        return;
    }

    if (detallesAbiertosId === idSolicitud) {
        ocultarDetalles();
        botonDetalles.textContent = "Ver detalles";
        return;
    }

    detallesAbiertosId = idSolicitud;
    botonDetalles.textContent = "Ocultar detalles";

    tituloDetalles.textContent = `Detalles de la solicitud #${solicitud.id}`;
    contenidoDetalles.innerHTML = "";

    const datos = [
        ["Cliente", solicitud.cliente],
        ["Correo", solicitud.correo],
        ["Teléfono", solicitud.telefono],
        ["Tipo de cliente", solicitud.tipoCliente],
        ["Placa", solicitud.placa],
        ["Vehículo", `${solicitud.marca} ${solicitud.modelo} (${solicitud.anio})`],
        ["Kilometraje", `${solicitud.kilometraje} km`],
        ["Servicio", solicitud.servicio],
        ["Fecha", solicitud.fecha],
        ["Hora", solicitud.hora],
        ["Servicios adicionales", solicitud.adicionales.length > 0 ? solicitud.adicionales.join(", ") : "Ninguno"],
        ["Estado", solicitud.estado],
        ["Observaciones", solicitud.observaciones ? solicitud.observaciones : "Sin observaciones"]
    ];

    datos.forEach(dato => {
        const parrafo = document.createElement("p");
        parrafo.className = "mb-1";

        const etiqueta = document.createElement("strong");
        etiqueta.textContent = `${dato[0]}: `;

        const valor = document.createElement("span");
        valor.textContent = dato[1];

        parrafo.appendChild(etiqueta);
        parrafo.appendChild(valor);
        contenidoDetalles.appendChild(parrafo);
    });

    contenedorDetalles.classList.remove("d-none");
    contenedorDetalles.scrollIntoView({ behavior: "smooth", block: "start" });
}

function ocultarDetalles() {
    contenedorDetalles.classList.add("d-none");
    tituloDetalles.textContent = "Detalles de la solicitud";
    contenidoDetalles.innerHTML = "";
    detallesAbiertosId = null;
}

function validarSolicitud(datos) {
    const regexPlaca = /^[A-Z]{3}-\d{3,4}$/;
    const regexTelefono = /^09\d{8}$/;

    if (!datos.nombre || !datos.correo || !datos.telefono) {
        return "Complete los datos del cliente.";
    }

    if (!regexTelefono.test(datos.telefono)) {
        return "El teléfono debe tener 10 dígitos y comenzar con 09.";
    }

    if (!regexPlaca.test(datos.placa)) {
        return "La placa debe tener el formato PBA-4821.";
    }

    if (!datos.marca || !datos.modelo) {
        return "Ingrese la marca y el modelo del vehículo.";
    }

    const anioActual = new Date().getFullYear();

    if (datos.anio < 1980 || datos.anio > anioActual + 1) {
        return `El año debe estar entre 1980 y ${anioActual + 1}.`;
    }

    if (datos.kilometraje < 0) {
        return "El kilometraje no puede ser negativo.";
    }

    if (!datos.servicio) {
        return "Seleccione un servicio.";
    }

    if (!datos.fecha || !datos.hora) {
        return "Seleccione fecha y hora.";
    }

    const fecha = new Date(datos.fecha + "T00:00:00");
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fecha < hoy) {
        return "La fecha no puede ser anterior a hoy.";
    }

    if (!datos.terminos) {
        return "Debe aceptar los términos y condiciones.";
    }

    return null;
}

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (!usuarioActual) {
        Swal.fire({
            icon: "warning",
            title: "Inicio de sesión requerido",
            text: "Debe iniciar sesión para registrar una solicitud."
        });
        return;
    }

    let idClienteSeleccionado = usuarioActual.id;
    let nombreClienteSeleccionado = usuarioActual.nombre;

    if (esAdministrador() && clienteSeleccionado.value) {
        const clienteElegido = usuarios.find(
            usuario => usuario.id === Number(clienteSeleccionado.value)
        );

        if (!clienteElegido) {
            Swal.fire({
                icon: "error",
                title: "Cliente inválido",
                text: "Seleccione un cliente válido."
            });
            return;
        }

        idClienteSeleccionado = clienteElegido.id;
        nombreClienteSeleccionado = clienteElegido.nombre;
    }

    const adicionales = [];

    if (document.getElementById("lavado").checked) adicionales.push("Lavado");
    if (document.getElementById("recogida").checked) adicionales.push("Recogida");
    if (document.getElementById("repuestos").checked) adicionales.push("Repuestos originales");

    const datos = {
        nombre: document.getElementById("nombre").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        tipoCliente: document.querySelector('input[name="tipoCliente"]:checked').value,
        placa: document.getElementById("placa").value.trim().toUpperCase(),
        marca: document.getElementById("marca").value.trim(),
        modelo: document.getElementById("modelo").value.trim(),
        anio: Number(document.getElementById("anio").value),
        kilometraje: Number(document.getElementById("kilometraje").value),
        servicio: document.getElementById("servicio").value,
        fecha: document.getElementById("fecha").value,
        hora: document.getElementById("hora").value,
        adicionales,
        observaciones: document.getElementById("observaciones").value.trim(),
        terminos: document.getElementById("terminos").checked
    };

    const error = validarSolicitud(datos);

    if (error) {
        Swal.fire({
            icon: "error",
            title: "Datos inválidos",
            text: error
        });
        return;
    }

    const nuevaSolicitud = {
        id: siguienteId,
        idCliente: idClienteSeleccionado,
        cliente: nombreClienteSeleccionado,
        correo: datos.correo,
        telefono: datos.telefono,
        tipoCliente: datos.tipoCliente,
        placa: datos.placa,
        marca: datos.marca,
        modelo: datos.modelo,
        anio: datos.anio,
        kilometraje: datos.kilometraje,
        servicio: datos.servicio,
        fecha: datos.fecha,
        hora: datos.hora,
        adicionales: datos.adicionales,
        observaciones: datos.observaciones,
        estado: "Pendiente"
    };

    solicitudes.push(nuevaSolicitud);
    siguienteId++;

    guardarSolicitudes();
    formulario.reset();
    mostrarSolicitudes();

    Swal.fire({
        icon: "success",
        title: "Solicitud registrada",
        text: `La solicitud ${nuevaSolicitud.id} fue registrada correctamente.`
    });
});

function editarSolicitud(idSolicitud) {
    if (!esAdministrador()) {
        Swal.fire({
            icon: "error",
            title: "Acceso denegado",
            text: "No tiene permisos para editar solicitudes."
        });
        return;
    }

    const solicitud = solicitudes.find(item => item.id === idSolicitud);

    if (!solicitud) return;

    Swal.fire({
        title: `Editar programación de la solicitud #${solicitud.id}`,
        html: `
            <p class="mb-2">Solo puede modificar la fecha, la hora y el servicio.</p>
            <input id="editarFecha" class="swal2-input" type="date" value="${solicitud.fecha}">
            <input id="editarHora" class="swal2-input" type="time" value="${solicitud.hora}">
            <select id="editarServicio" class="swal2-input">
                ${SERVICIOS.map(servicio => `
                    <option value="${servicio}" ${servicio === solicitud.servicio ? "selected" : ""}>
                        ${servicio}
                    </option>
                `).join("")}
            </select>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Guardar cambios",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
            const fecha = document.getElementById("editarFecha").value;
            const hora = document.getElementById("editarHora").value;
            const servicio = document.getElementById("editarServicio").value;

            if (!fecha || !hora) {
                Swal.showValidationMessage("Seleccione fecha y hora.");
                return false;
            }

            if (!SERVICIOS.includes(servicio)) {
                Swal.showValidationMessage("Seleccione un servicio válido.");
                return false;
            }

            const fechaSeleccionada = new Date(fecha + "T00:00:00");
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (fechaSeleccionada < hoy) {
                Swal.showValidationMessage("La fecha no puede ser anterior a hoy.");
                return false;
            }

            return { fecha, hora, servicio };
        }
    }).then(resultado => {
        if (!resultado.isConfirmed) return;

        solicitud.fecha = resultado.value.fecha;
        solicitud.hora = resultado.value.hora;
        solicitud.servicio = resultado.value.servicio;

        guardarSolicitudes();
        mostrarSolicitudes();

        Swal.fire({
            icon: "success",
            title: "Solicitud actualizada",
            text: `La programación de la solicitud ${solicitud.id} fue modificada correctamente.`
        });
    });
}

function cambiarEstado(idSolicitud) {
    if (!esAdministrador()) {
        Swal.fire({
            icon: "error",
            title: "Acceso denegado",
            text: "No tiene permisos para cambiar el estado."
        });
        return;
    }

    const solicitud = solicitudes.find(item => item.id === idSolicitud);

    if (!solicitud) return;

    Swal.fire({
        title: "Cambiar estado",
        input: "select",
        inputOptions: {
            Pendiente: "Pendiente",
            "En revisión": "En revisión",
            "En proceso": "En proceso",
            Finalizado: "Finalizado",
            Cancelado: "Cancelado"
        },
        inputValue: solicitud.estado,
        showCancelButton: true,
        confirmButtonText: "Guardar",
        cancelButtonText: "Cancelar"
    }).then(resultado => {
        if (!resultado.isConfirmed) return;

        solicitud.estado = resultado.value;
        guardarSolicitudes();
        mostrarSolicitudes();

        Swal.fire({
            icon: "success",
            title: "Estado actualizado",
            text: `La solicitud ${solicitud.id} ahora está ${solicitud.estado}.`
        });
    });
}

function eliminarSolicitud(idSolicitud) {
    if (!esAdministrador()) {
        Swal.fire({
            icon: "error",
            title: "Acceso denegado",
            text: "No tiene permisos para eliminar solicitudes."
        });
        return;
    }

    Swal.fire({
        icon: "warning",
        title: "¿Eliminar solicitud?",
        text: "Esta acción no se puede deshacer.",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33"
    }).then(resultado => {
        if (!resultado.isConfirmed) return;

        solicitudes = solicitudes.filter(
            solicitud => solicitud.id !== idSolicitud
        );

        guardarSolicitudes();
        mostrarSolicitudes();

        Swal.fire({
            icon: "success",
            title: "Solicitud eliminada",
            text: "El registro fue eliminado correctamente."
        });
    });
}

enlaceLogin.addEventListener("click", function (evento) {
    evento.preventDefault();
    iniciarSesion();
});

enlacePerfil.addEventListener("click", function (evento) {
    evento.preventDefault();
    mostrarPerfil();
});

enlaceAdmin.addEventListener("click", function (evento) {
    evento.preventDefault();
    mostrarAdministracion();
});

enlaceSalir.addEventListener("click", function (evento) {
    evento.preventDefault();
    cerrarSesion();
});

botonCerrarSesionPanel.addEventListener("click", function () {
    cerrarSesion();
});

document.getElementById("anio").max = new Date().getFullYear() + 1;

cargarDatos();