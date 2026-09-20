<script>
  import './app.css';
  // 1. Importamos el store y la función desde tu router.js
  import { currentRoute, navigate } from './router.js';

  // 2. Importamos las páginas/vistas separadas
  import Inicio from './lib/Home.svelte';
  import Consultoria from './lib/Consultoria.svelte';
  import Transacciones from './lib/Transacciones.svelte';
  import Extra from './lib/Extra.svelte';
  import Desarrollador from './lib/Desarrollador.svelte';
</script>

<!-- HEADER / NAVBAR (Fijo para todas las páginas) -->
<header class="header">
  <div class="container header-container">
    <a href="#inicio" on:click|preventDefault={() => navigate('inicio')} class="brand">
      <img src="/logoskitsune/logo.png" alt="Kitsune Mint Logo" class="brand-logo" />
      <div class="brand-text">
        <span class="brand-title">KITSUNE MINT</span>
        <span class="brand-subtitle">Treasures on the web</span>
      </div>
    </a>

    <!-- Navegación usando el store $currentRoute -->
    <nav class="nav">
      <a
        href="#inicio"
        class="nav-link"
        class:active={$currentRoute === 'inicio'}
        on:click|preventDefault={() => navigate('inicio')}
      >INICIO</a>
      <a
        href="#consultoria"
        class="nav-link"
        class:active={$currentRoute === 'consultoria'}
        on:click|preventDefault={() => navigate('consultoria')}
      >CONSULTORIA</a>
      <a
        href="#transacciones"
        class="nav-link"
        class:active={$currentRoute === 'transacciones'}
        on:click|preventDefault={() => navigate('transacciones')}
      >TRANSACCIONES</a>
      <a
        href="#extra"
        class="nav-link"
        class:active={$currentRoute === 'extra'}
        on:click|preventDefault={() => navigate('extra')}
      >EXTRA</a>
    </nav>

    <div class="header-spacer"></div>
  </div>
</header>

<!-- CONTENIDO DINÁMICO SEGÚN LA RUTA -->
<main class="main-content">
  {#if $currentRoute === 'inicio'}
    <Inicio />
  {:else if $currentRoute === 'consultoria'}
    <Consultoria />
  {:else if $currentRoute === 'transacciones'}
    <Transacciones />
  {:else if $currentRoute === 'extra'}
    <Extra />
  {:else if $currentRoute === 'desarrollador'}
    <Desarrollador />
  {/if}
</main>

<!-- FOOTER (Fijo para todas las páginas) -->
<footer class="footer">
  <div class="container footer-container">
    <div class="footer-col brand-col">
      <div class="brand">
        <img src="/logoskitsune/logo.png" alt="Kitsune Mint Logo" class="brand-logo" />
        <div class="brand-text">
          <span class="brand-title">KITSUNE MINT</span>
          <span class="brand-subtitle">Treasures on the web</span>
        </div>
      </div>
    </div>

    <div class="footer-col">
      <h4 class="footer-heading">Enlaces útiles</h4>
      <ul class="footer-links">
        <li><a href="#inicio" on:click|preventDefault={() => navigate('inicio')}>Inicio</a></li>
        <li><a href="#consultoria" on:click|preventDefault={() => navigate('consultoria')}>Consultoria</a></li>
        <li><a href="#transacciones" on:click|preventDefault={() => navigate('transacciones')}>Transacciones</a></li>
        <li><a href="#extra" on:click|preventDefault={() => navigate('extra')}>Extras</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4 class="footer-heading">Sobre...</h4>
      <ul class="footer-links">
        <li><a href="#krisp">Krisp</a></li>
        <li><a href="#pagina">La página</a></li>
        <li><a href="#desarrollo">El desarrollo</a></li>
        <li><a href="#datos">Uso de datos</a></li>
      </ul>
    </div>

    <div class="footer-col">
      <h4 class="footer-heading">Contacto</h4>
      <ul class="footer-links">
        <li><a href="https://github.com" target="_blank" rel="noopener">Github personal</a></li>
        <li><a href="https://linkedin.com" target="_blank" rel="noopener">Página de LinkedIn</a></li>
      </ul>
    </div>
  </div>
</footer>