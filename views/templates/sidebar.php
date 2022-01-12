<div class="sidebar">
    <div class="contenedor-sidebar">
        <h2>UpTask</h2>
        <div class="cerrar-menu">
            <img id="cerrar-menu" src="build/img/cerrar.svg" alt="imagen cerrar menu">
        </div>
    </div>


    <nav class="sidebar-nav">
        <a href="/dashboard" class="<?php echo ($titulo === 'Proyectos') ? 'activo' : ''; ?>">Proyectos</a>
        <a href="/crear-proyecto" class="<?php echo ($titulo === 'Crear Proyecto') ? 'activo' : ''; ?>">Crear Proyecto</a>
        <a href="/perfil" class="<?php echo ($titulo === 'Perfil') ? 'activo' : ''; ?>">Perfil</a>
    </nav>

    <div class="cerrar-sesion-mobile">
        <a href="/logout" class="cerrar-sesion">Cerrar Sesión</a>
    </div>
</div>