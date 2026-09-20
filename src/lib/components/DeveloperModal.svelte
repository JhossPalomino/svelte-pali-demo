<script>
  import { fade, scale } from 'svelte/transition';

  export let isOpen = false;

  // Estado para el filtro de censura de la imagen
  let imageRevealed = false;

  function closeModal() {
    isOpen = false;
  }

  function handleKeydown(event) {
    if (event.key === 'Escape' && isOpen) {
      closeModal();
    }
  }

  function toggleImageReveal() {
    imageRevealed = !imageRevealed;
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- Backdrop / Fondo oscuro -->
  <div class="modal-backdrop" on:click={closeModal} transition:fade={{ duration: 150 }} role="presentation">
    <!-- Contenedor del Modal -->
    <div
      class="modal-card"
      on:click|stopPropagation
      transition:scale={{ duration: 200, start: 0.95 }}
      role="dialog"
      aria-modal="true"
    >
      <!-- Botón para cerrar -->
      <button class="btn-close" on:click={closeModal} aria-label="Cerrar modal">
        <span class="material-symbols-outlined">close</span>
      </button>

      <div class="modal-body">
        <!-- Columna Izquierda: Imagen con Censura/Blur -->
        <div
          class="image-wrapper"
          class:is-censored={!imageRevealed}
          on:click={toggleImageReveal}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === 'Enter' && toggleImageReveal()}
          title={imageRevealed ? "Hacer clic para ocultar" : "Hacer clic para revelar"}
        >
          <img
            src="/images/developer.jpg"
            alt="Jhoss Palomino Benito"
            class="dev-avatar"
          />

          <!-- Capa de Censura  -->
          {#if !imageRevealed}
            <div class="spoiler-overlay">
              <span class="spoiler-badge">SPOILER</span>
              <span class="spoiler-hint">Haz clic para mostrar</span>
            </div>
          {/if}
        </div>

        <!-- Columna Derecha: Información del Desarrollador -->
        <div class="dev-info">
          <h2 class="dev-name">Jhoss Palomino Benito</h2>
          <p class="dev-role">CREADOR DE LA PLATAFORMA</p>

          <p class="dev-bio">
            Apasionado por el desarrollo Web3 y la creación de herramientas digitales intuitivas. Me enfoco en construir soluciones abiertas, eficientes y seguras para facilitar la gestión de criptomonedas.
          </p>

          <!-- Redes Sociales -->
          <div class="social-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" class="social-btn">
              <img src="/images/GitHub.png" alt="GitHub" class="social-icon" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="social-btn">
              <img src="/images/LinkedIn.webp" alt="LinkedIn" class="social-icon" />
            </a>
            <a href="https://gitlab.com" target="_blank" rel="noopener noreferrer" class="social-btn">
              <img src="/images/gitlab.webp" alt="GitLab" class="social-icon" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(5, 3, 12, 0.82);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-card {
    background-color: #0b0818;
    border: 1px solid rgba(226, 94, 187, 0.25);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(130, 71, 229, 0.15);
    border-radius: 18px;
    width: 100%;
    max-width: 800px;
    position: relative;
    padding: 32px;
    box-sizing: border-box;
  }

  .btn-close {
    position: absolute;
    top: 16px;
    right: 16px;
    background: transparent;
    border: none;
    color: var(--text-muted, #a19db8);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border-radius: 50%;
    transition: all 0.2s ease;
  }

  .btn-close:hover {
    color: #ffffff;
    background-color: rgba(255, 255, 255, 0.1);
  }

  .modal-body {
    display: flex;
    gap: 32px;
    align-items: flex-start;
  }

  /* --- CENSURA  --- */
  .image-wrapper {
    position: relative;
    width: 180px;
    height: 230px;
    flex-shrink: 0;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    background-color: #151128;
    user-select: none;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .dev-avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: filter 0.3s ease, transform 0.3s ease;
  }

  .image-wrapper.is-censored .dev-avatar {
    filter: blur(18px) brightness(0.45);
    transform: scale(1.05);
  }

  .spoiler-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: rgba(0, 0, 0, 0.25);
    transition: background-color 0.2s ease;
  }

  .image-wrapper:hover .spoiler-overlay {
    background-color: rgba(0, 0, 0, 0.15);
  }

  .spoiler-badge {
    background-color: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 1.5px;
    padding: 4px 10px;
    border-radius: 4px;
    font-family: var(--font-mono, monospace);
  }

  .spoiler-hint {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.72rem;
    font-family: var(--font-mono, monospace);
  }

  /* --- INFORMACIÓN DEL DESARROLLADOR --- */
  .dev-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-top: 4px;
  }

  .dev-name {
    font-size: 1.35rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 6px 0;
    font-family: var(--font-mono, monospace);
    letter-spacing: 0.5px;
  }

  .dev-role {
    font-size: 0.75rem;
    color: var(--accent-pink, #e25ebf);
    font-weight: 700;
    letter-spacing: 1.5px;
    margin: 0 0 18px 0;
    font-family: var(--font-mono, monospace);
  }

  .dev-bio {
    color: var(--text-muted, #a19db8);
    font-size: 0.8rem;
    line-height: 1.65;
    margin: 0 0 24px 0;
    font-family: var(--font-mono, monospace);
  }

  .social-links {
    display: flex;
    gap: 14px;
    align-items: center;
  }

  .social-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.05);
    transition: transform 0.2s ease, background-color 0.2s ease;
  }

  .social-btn:hover {
    transform: translateY(-2px);
    background-color: rgba(255, 255, 255, 0.12);
  }

  .social-icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }

  @media (max-width: 600px) {
    .modal-body {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .image-wrapper {
      width: 160px;
      height: 200px;
    }

    .dev-info {
      align-items: center;
    }
  }
</style>