<script>
  import '../app.css';
  import DeveloperModal from './components/DeveloperModal.svelte';
  let showDevModal = false;
</script>

<main class="main-content">
  <div class="container">

    <!-- HERO SECTION -->
    <section class="hero-section">
      <h1 class="hero-title">
        <span class="highlight">GESTIONA</span> TUS CRIPTOMONEDAS<br />SIN COMPLICACIONES
      </h1>
      <p class="hero-description">
        Tenemos muchas herramientas útiles que facilitarán la gestión a las personas que disfrutan de las monedas digitales.
      </p>
      <div class="hero-cta">
        <a href="#funciones" class="btn btn-purple">
          Saber más
          <span class="material-symbols-outlined btn-icon-symbol">chevron_right</span>
        </a>
      </div>
    </section>

    <!-- NUESTRAS FUNCIONES SECTION -->
    <section id="funciones" class="section-funciones">
      <h2 class="section-title">NUESTRAS FUNCIONES</h2>

      <div class="grid-cards">
        <div class="card">
          <div class="card-header">
            <div class="card-icon-wrapper">
              <span class="material-symbols-outlined">search</span>
            </div>
            <span class="material-symbols-outlined card-arrow">north_east</span>
          </div>
          <h3 class="card-title">Búsqueda de cuenta</h3>
          <p class="card-text">Se puede buscar el saldo de otras personas, ya tu sabrás el motivo</p>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-icon-wrapper">
              <span class="material-symbols-outlined">credit_card</span>
            </div>
            <span class="material-symbols-outlined card-arrow">north_east</span>
          </div>
          <h3 class="card-title">Verificación de saldo</h3>
          <p class="card-text">Para no perder de vista el saldo disponible</p>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-icon-wrapper">
              <span class="material-symbols-outlined">swap_horiz</span>
            </div>
            <span class="material-symbols-outlined card-arrow">north_east</span>
          </div>
          <h3 class="card-title">Tranferencia</h3>
          <p class="card-text">También puedes transferir de una cuenta a otra</p>
        </div>
      </div>

      <div class="funciones-subbar">
        <p class="subbar-text">A futuro habrán muchas nuevas funciones muy interesantes</p>
        <a href="#boletin" class="btn btn-outline-pill">Ver el boletín</a>
      </div>
    </section>

    <!-- BENEFICIOS & OBJETIVO -->
    <section class="section-alternating">
      <div class="feature-row">
        <div class="feature-text-col">
          <h2 class="feature-heading">Nuestros beneficios</h2>
          <p class="feature-desc">
            Con Kitsune Mint obtienes acceso directo a información transparente de tus cuentas sin pagar suscripciones ni comisiones ocultas. Disfruta de herramientas fluidas diseñadas para agilizar la lectura de tus saldos y simplificar tu experiencia en el ecosistema Web3.
          </p>
        </div>
        <div class="feature-img-col">
          <img src="/images/coins.png" alt="Criptomonedas Ethereum y Bitcoin" class="feature-img" />
        </div>
      </div>

      <div class="feature-row reverse">
        <div class="feature-img-col">
          <img src="/images/objetivos.png" alt="Objetivo blanco y dardos" class="feature-img" />
        </div>
        <div class="feature-text-col">
          <h2 class="feature-heading">Nuestro objetivo</h2>
          <p class="feature-desc">
            Nuestra meta es facilitar el acceso y la gestión de criptomonedas para cualquier persona, eliminando las barreras de complejidad técnica. Queremos consolidar una suite de utilidades abiertas, rápidas y seguras que potencien tu control en la red.
          </p>
        </div>
      </div>
    </section>

    <!-- CARACTERÍSTICAS -->
    <section class="section-features-list">
      <div class="center-header">
        <h2 class="features-title">Caracteristicas que nos enorgullecen</h2>
        <p class="section-subtitle">Mas características a futuro</p>
      </div>

      <div class="grid-features-3col">
        <div class="feature-item">
          <span class="material-symbols-outlined feature-item-icon">compare_arrows</span>
          <h3 class="feature-item-title">Transferencias seguras</h3>
          <p class="feature-item-text">
            Todas las transferencias son seguras y auténticas, nunca manipularemos los montos y las direcciones.
          </p>
          <div class="feature-item-link">ver mas <span class="dashes">-----------</span></div>
        </div>

        <div class="feature-item">
          <span class="material-symbols-outlined feature-item-icon">fact_check</span>
          <h3 class="feature-item-title">Datos transparentes</h3>
          <p class="feature-item-text">
            Todos nuestros datos son oficiales y no manipulados, así que puedes relajarte y disfrutar de las operaciones.
          </p>
          <div class="feature-item-link">ver mas <span class="dashes">-----------</span></div>
        </div>

        <div class="feature-item">
          <span class="material-symbols-outlined feature-item-icon">bar_chart</span>
          <h3 class="feature-item-title">Múltiples redes</h3>
          <p class="feature-item-text">
            Actualmente contamos con muchas redes disponibles que te permitirán realizar muchas funciones.
          </p>
          <div class="feature-item-link">ver mas <span class="dashes">-----------</span></div>
        </div>
      </div>
    </section>

    <!-- BANNER PROMOCIONAL -->
        <section class="section-banner-purple">
          <h2 class="banner-title">ESTAMOS COMPROMETIDOS CON UN SERVICIO EXCELENTE PARA TODOS</h2>
          <p class="banner-text">
            Kitsune Mint es una plataforma abierta sin suscripción que busca hacer la travesía por la web3 lo más satisfactoria posible, si deseas apoyarnos puedes recomendar la página o comprarle café a krisp.
          </p>

          <div class="banner-mascot">
            <img src="/logoskitsune/yum.png" alt="Mascota Kitsune Krisp" class="mascot-img" />
          </div>

          <div class="banner-buttons">
            <a href="#cafe" class="btn btn-white">dar cafe a krisp</a>

            <!-- Reemplazamos la etiqueta <a> por este botón -->
            <button
              type="button"
              class="btn btn-purple-outline"
              on:click={() => showDevModal = true}
            >
              sobre el desarrollador
            </button>
          </div>
        </section>

  </div>
</main>

<DeveloperModal bind:isOpen={showDevModal} />

<style>
  /* ESTILOS EXCLUSIVOS DE LA VISTA INICIO (+page.svelte) */
  .hero-section {
    text-align: center;
    padding: 80px 0 90px 0;
  }

  .hero-title {
    font-size: 2.5rem;
    font-weight: 700;
    letter-spacing: 2px;
    line-height: 1.45;
    margin-bottom: 24px;
  }

  .hero-title .highlight {
    color: var(--accent-pink);
  }

  .hero-description {
    color: var(--text-muted);
    max-width: 680px;
    margin: 0 auto 36px auto;
    font-size: 0.88rem;
    line-height: 1.7;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px 28px;
    border-radius: 24px;
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 600;
    font-family: var(--font-mono);
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .btn-purple {
    background-color: var(--accent-purple);
    color: var(--text-main);
    border: none;
    padding: 12px 32px;
  }

  .btn-purple:hover {
    background-color: var(--accent-purple-hover);
  }

  .btn-icon-symbol {
    font-size: 18px !important;
  }



  .section-funciones {
    margin-bottom: 110px;
  }

  .section-title {
    font-size: 1.2rem;
    letter-spacing: 2px;
    margin-bottom: 30px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .grid-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-bottom: 12px;
  }

  .card {
    background-color: var(--card-bg);
    border: 1px solid var(--border-card);
    border-radius: 12px;
    padding: 28px 24px;
    display: flex;
    flex-direction: column;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }

  .card-icon-wrapper {
    background-color: rgba(255, 255, 255, 0.08);
    width: 42px;
    height: 42px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-main);
  }

  .card-arrow {
    font-size: 18px !important;
    color: var(--text-muted);
    opacity: 0.7;
  }

  .card-title {
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 14px;
  }

  .card-text {
    color: var(--text-muted);
    font-size: 0.78rem;
    line-height: 1.65;
  }

  .funciones-subbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 10px;
  }

  .subbar-text {
    color: var(--text-muted);
    font-size: 0.82rem;
  }

  .btn-outline-pill {
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: var(--text-main);
    background: transparent;
    padding: 10px 24px;
    border-radius: 20px;
  }

  .btn-outline-pill:hover {
    border-color: var(--text-main);
    background-color: rgba(255, 255, 255, 0.05);
  }

  .section-alternating {
    margin-bottom: 110px;
    display: flex;
    flex-direction: column;
    gap: 60px;
  }

  .feature-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 40px;
    background: linear-gradient(135deg, rgba(20, 17, 36, 0.8) 0%, rgba(14, 11, 25, 0.9) 100%);
    border: 1px solid var(--border-card);
    border-radius: 20px;
    padding: 36px 40px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease, border-color 0.3s ease;
  }

  .feature-row:hover {
    border-color: rgba(226, 94, 187, 0.3);
    transform: translateY(-2px);
  }

  .feature-text-col {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .feature-heading {
    font-size: 1.45rem;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 16px;
    letter-spacing: 0.5px;
  }

  .feature-desc {
    color: #a19db8;
    font-size: 0.83rem;
    line-height: 1.8;
    font-family: var(--font-mono);
  }

  .feature-img-col {
    width: 100%;
    height: 280px;
    border-radius: 14px;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .feature-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.5s ease;
  }

  .feature-row:hover .feature-img {
    transform: scale(1.03);
  }

  .section-features-list {
    margin-bottom: 110px;
  }

  .center-header {
    text-align: center;
    margin-bottom: 50px;
  }

  .features-title {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: none;
    margin-bottom: 8px;
  }

  .section-subtitle {
    color: var(--text-muted);
    font-size: 0.87rem;
    margin-bottom: 56px;
  }

  .grid-features-3col {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 52px;
  }

  .feature-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .feature-item-icon {
    font-size: 48px !important;
    color: var(--accent-pink);
    margin-bottom: 20px;
  }

  .feature-item-title {
    font-size: 0.98rem;
    font-weight: 700;
    margin-bottom: 14px;
  }

  .feature-item-text {
    color: var(--text-muted);
    font-size: 0.78rem;
    line-height: 1.75;
    margin-bottom: 22px;
  }

  .feature-item-link {
    color: var(--accent-pink);
    font-size: 0.78rem;
    display: flex;
    align-items: center;
    gap: 39px;
  }

  .feature-item-link .dashes {
    opacity: 0.6;
  }

  .section-banner-purple {
    background-color: var(--banner-bg);
    border-radius: 16px;
    padding: 55px 48px;
    text-align: center;
    margin-bottom: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .banner-title {
    font-size: 1.25rem;
    letter-spacing: 2px;
    line-height: 1.5;
    margin-bottom: 20px;
    font-weight: 700;
    max-width: 680px;
  }

  .banner-text {
    max-width: 650px;
    margin: 0 auto 24px auto;
    font-size: 0.8rem;
    line-height: 1.75;
    opacity: 0.95;
  }

  .banner-mascot {
    position: relative;
    z-index: 2;
    margin-bottom: -15px;
  }

  .mascot-img {
    width: 105px;
    height: auto;
    object-fit: contain;
    display: block;
  }

  .banner-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  .btn-white {
    background-color: #ffffff;
    color: var(--banner-bg);
    border: none;
    width: 280px;
    padding: 12px 20px;
    border-radius: 10px;
    font-weight: 700;
    position: relative;
    z-index: 1;
  }

  .btn-white:hover {
    background-color: #f5f5f5;
  }

  .btn-purple-outline {
    background-color: transparent;
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.8);
    width: 280px;
    padding: 12px 20px;
    border-radius: 10px;
    font-weight: 500;
  }

  .btn-purple-outline:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: #ffffff;
  }

  button.btn-purple-outline {
      cursor: pointer;
      font-family: inherit;
   }

  @media (max-width: 900px) {
    .grid-cards,
    .grid-features-3col {
      grid-template-columns: 1fr;
    }

    .section-alternating {
      gap: 30px;
    }

    .feature-row {
      grid-template-columns: 1fr;
      gap: 24px;
      padding: 24px;
    }

    .feature-row.reverse .feature-img-col {
      order: -1;
    }

    .feature-img-col {
      height: 220px;
    }

    .funciones-subbar {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }
  }
</style>