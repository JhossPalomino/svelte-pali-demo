<script>
  import { onMount } from 'svelte';
  import { navigate } from '../router.js';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  // --- BLOQUEO TEMPORAL DE SCROLL EN WINDOW/BODY ---
  onMount(() => {
    // Bloquea el desplazamiento al entrar a Transacciones
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      // Restaura el desplazamiento al salir a Inicio o cualquier otra vista
      document.body.style.overflow = originalOverflow;
    };
  });

  // --- ESTADO DE NAVEGACIÓN Y PASOS ---
  let currentStep = 1;

  // --- ESTADO WEB3 Y TRANSACCIÓN ---
  let connectionMethod = null;
  let walletAddress = '';
  let recipientAddress = '';
  let amountToTransfer = '1.00';
  let isSendingTx = false;
  let txHash = '';
  let txError = '';

  // --- MODAL DE DETALLE ---
  let isDetailModalOpen = false;
  let detailModalTitle = '';
  let detailModalValue = '';

  function openDetailModal(title, value) {
    detailModalTitle = title;
    detailModalValue = value || 'No disponible';
    isDetailModalOpen = true;
  }

  function closeDetailModal() {
    isDetailModalOpen = false;
  }

  // --- MODAL DE ALERTAS Y ERRORES ---
  let isAlertModalOpen = false;
  let alertTitle = '';
  let alertMessage = '';
  let alertMascot = '/logoskitsune/moneyisallyouneed.png';

  function showAlert(title, message, mascot = '/logoskitsune/yum.png') {
    alertTitle = title;
    alertMessage = message;
    alertMascot = mascot;
    isAlertModalOpen = true;
  }

  function closeAlertModal() {
    isAlertModalOpen = false;
  }

  function copyToClipboard(text) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showAlert('¡Copiado!', 'El texto ha sido copiado al portapapeles con éxito, agradecele a los poderes misticos de krisp', '/logoskitsune/joker.png');
  }

  // --- NAVEGACIÓN Y SCROLL ---
  let scrollContainer;
  let trackElement;
  let scrollRatio = 0;
  let thumbWidthPercent = 30;
  let isDraggingThumb = false;
  let startX = 0;
  let startScrollLeft = 0;

  const totalCardsCount = 5;

  function updateScroll() {
    if (!scrollContainer) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      scrollRatio = scrollLeft / maxScroll;
      thumbWidthPercent = Math.max(15, (clientWidth / scrollWidth) * 100);
    } else {
      scrollRatio = 0;
      thumbWidthPercent = 100;
    }
  }

  function handleTrackClick(e) {
    if (!trackElement || !scrollContainer || isDraggingThumb) return;
    const rect = trackElement.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = clickX / rect.width;
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    scrollContainer.scrollTo({
      left: clickRatio * maxScroll,
      behavior: 'smooth'
    });
  }

  function handleThumbPointerDown(e) {
    e.stopPropagation();
    isDraggingThumb = true;
    startX = e.clientX;
    startScrollLeft = scrollContainer.scrollLeft;

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }

  function handlePointerMove(e) {
    if (!isDraggingThumb || !scrollContainer || !trackElement) return;
    const deltaX = e.clientX - startX;
    const rect = trackElement.getBoundingClientRect();
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

    const scrollPerPixel = maxScroll / (rect.width * (1 - thumbWidthPercent / 100));
    scrollContainer.scrollLeft = startScrollLeft + deltaX * scrollPerPixel;
  }

  function handlePointerUp() {
    isDraggingThumb = false;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }

  // --- ANIMACIÓN DE CONEXIÓN ---
  let connectedMethods = new Set();
  let isConnectingAnimation = false;
  let showFinalContent = false;

  const walletThemes = {
    metamask: {
      bars: ['#8d3c3c', '#bd5555', '#cc7766'],
      finalBg: '#8d3c3c',
      logo: '/images/metamask.webp',
      title: 'MetaMask'
    },
    paliwallet: {
      bars: ['#35487a', '#4c6cb8', '#738ed4'],
      finalBg: '#35487a',
      logo: '/images/pali.png',
      title: 'Pali Wallet'
    },
    other: {
      bars: ['#58377a', '#814cb8', '#a473d4'],
      finalBg: '#58377a',
      logo: '/images/wallet.png',
      title: 'Wallet Externa'
    }
  };

  function goToStep(step) {
    if (step <= currentStep) {
      currentStep = step;
    }
  }

  // --- MÉTODOS Y PROVEEDORES WEB3 ---
  function getDetectedWallet() {
    if (typeof window === 'undefined') return null;
    const ethereum = window.ethereum;
    const pali = window.pali;

    if (pali || ethereum?.isPali) {
      return 'paliwallet';
    }
    if (ethereum?.isMetaMask && !ethereum?.isPali) {
      return 'metamask';
    }
    return null;
  }

  function getActiveProvider() {
    if (connectionMethod === 'paliwallet') {
      return window.pali || (window.ethereum?.isPali ? window.ethereum : null);
    }
    if (connectionMethod === 'metamask') {
      return window.ethereum;
    }
    return window.ethereum || window.pali;
  }

  function handleConnectionSuccess(method, address) {
    walletAddress = address;
    connectionMethod = method;

    const isFirstTime = !connectedMethods.has(method);

    if (isFirstTime) {
      connectedMethods.add(method);
      triggerConnectionAnimation();
    } else {
      currentStep = 3;
    }
  }

  function triggerConnectionAnimation() {
    isConnectingAnimation = true;
    showFinalContent = false;

    setTimeout(() => {
      showFinalContent = true;
    }, 700);

    setTimeout(() => {
      currentStep = 3;
    }, 2400);

    setTimeout(() => {
      isConnectingAnimation = false;
    }, 2800);
  }

  async function connectMetaMask() {
    if (typeof window.ethereum === 'undefined') {
      showAlert('MetaMask no encontrado', 'MetaMask no está instalado en tu navegador. Por favor instálalo para continuar');
      return;
    }

    const detected = getDetectedWallet();
    if (detected === 'paliwallet') {
      showAlert('Pali Wallet Detectada', 'Se detectó Pali Wallet interfiriendo con la inyección de MetaMask. Por favor usa el botón de Pali Wallet');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        handleConnectionSuccess('metamask', accounts[0]);
      }
    } catch (err) {
      showAlert('Error de conexión', 'No se pudo conectar con MetaMask: ' + err.message);
    }
  }

  async function connectPaliWallet() {
    const paliObj = window.pali || (window.ethereum?.isPali ? window.ethereum : null);

    if (paliObj) {
      try {
        let account;
        if (typeof paliObj.requestAccount === 'function') {
          account = await paliObj.requestAccount();
        } else if (typeof paliObj.request === 'function') {
          const accounts = await paliObj.request({ method: 'eth_requestAccounts' });
          account = accounts && accounts.length > 0 ? accounts[0] : null;
        } else if (typeof paliObj.enable === 'function') {
          const accounts = await paliObj.enable();
          account = accounts && accounts.length > 0 ? accounts[0] : null;
        }

        if (account) {
          handleConnectionSuccess('paliwallet', Array.isArray(account) ? account[0] : account);
        }
      } catch (err) {
        showAlert('Error de conexión', 'No se pudo conectar con PaliWallet: ' + err.message);
      }
    } else {
      showAlert('PaliWallet no encontrada', 'PaliWallet no está instalada en tu navegador');
    }
  }

  async function connectGenericWallet() {
    const provider = getActiveProvider();
    if (!provider) {
      showAlert('Proveedor Web3 no encontrado', 'No se detectó ningún proveedor de Wallet en tu navegador');
      return;
    }

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        handleConnectionSuccess('other', accounts[0]);
      }
    } catch (err) {
      showAlert('Error de conexión', 'Error al conectar con la Wallet: ' + err.message);
    }
  }

  // --- LÓGICA DE TRANSACCIONES Y BLOCKCHAIN ---
  async function checkAddressInfo(provider, address) {
    try {
      const balance = await provider.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      const txCount = await provider.request({
        method: 'eth_getTransactionCount',
        params: [address, 'latest']
      });
      const code = await provider.request({
        method: 'eth_getCode',
        params: [address, 'latest']
      });

      const hasBalance = BigInt(balance) > 0n;
      const hasSentTx = parseInt(txCount, 16) > 0;
      const isContract = code !== '0x' && code !== '0x0';

      return {
        hasActivity: hasBalance || hasSentTx || isContract,
        isContract
      };
    } catch (err) {
      console.error('Error al verificar la dirección:', err);
      return { hasActivity: false, isContract: false };
    }
  }

  async function executeTransaction() {
    txError = '';

    const cleanAddress = recipientAddress.trim();
    const isValidEthAddress = /^0x[a-fA-F0-9]{40}$/.test(cleanAddress);
    if (!isValidEthAddress) {
      showAlert('Address no válido', 'Por favor ingresa una dirección de destino válida con formato 0x...', '/logoskitsune/joker.png');
      return;
    }

    const numericAmount = parseFloat(amountToTransfer.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      showAlert('Monto incorrecto', 'Ingresa un monto numérico mayor a 0 para transferir.');
      return;
    }

    const provider = getActiveProvider();
    if (!provider) {
      showAlert('Error de Wallet', 'No se encontró un proveedor Web3 activo.');
      return;
    }

    try {
      isSendingTx = true;

      const { hasActivity } = await checkAddressInfo(provider, cleanAddress);
      if (!hasActivity) {
        showAlert('Dirección sin historial', 'La dirección es válida, pero nunca ha tenido actividad o saldo en la red. Verifica antes de enviar.', '/logoskitsune/joker.png');
      }

      const weiValue = BigInt(Math.floor(numericAmount * 1e18));
      const valueHex = '0x' + weiValue.toString(16);

      const txParams = {
        from: walletAddress,
        to: cleanAddress,
        value: valueHex
      };

      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams]
      });

      txHash = hash;
      isSendingTx = false;
      currentStep = 4;
      setTimeout(updateScroll, 100);
    } catch (err) {
      isSendingTx = false;
      console.error(err);
      showAlert('Error en la Transacción', err.message || 'La transacción fue cancelada o falló.');
    }
  }

  function resetTransaction() {
    recipientAddress = '';
    amountToTransfer = '1.00';
    txHash = '';
    walletAddress = '';
    connectionMethod = null;
    currentStep = 1;
  }

  // --- FORMATO DE TEXTO ---
  function formatShortHash(hash) {
    if (!hash) return '3324537...';
    return hash.length > 10 ? hash.substring(0, 7) + '...' : hash;
  }

  function formatShortAddress(addr) {
    if (!addr) return '0x00...0000';
    if (addr.length <= 12) return addr;
    return addr.substring(0, 6) + '...' + addr.substring(addr.length - 4);
  }
</script>

<!-- ANIMACIÓN DE CONEXIÓN -->
{#if isConnectingAnimation && connectionMethod}
  {@const theme = walletThemes[connectionMethod]}
  <div class="connection-overlay" transition:fade={{ duration: 400, easing: cubicOut }}>
    <div class="sweep-layer layer-1" style="background-color: {theme.bars[0]}"></div>
    <div class="sweep-layer layer-2" style="background-color: {theme.bars[1]}"></div>
    <div class="sweep-layer layer-3" style="background-color: {theme.finalBg}">
      {#if showFinalContent}
        <div class="center-content" in:fly={{ y: 20, duration: 400, easing: cubicOut }}>
          <img src={theme.logo} alt={theme.title} class="anim-wallet-logo" />
          <h2 class="connection-done-text">Conexión terminada</h2>
        </div>
      {/if}
    </div>
  </div>
{/if}

<div class="transacciones-wrapper" class:no-select={isDraggingThumb}>
  <div class="step-content container">

    {#key currentStep}
      <div
        class="step-animation-wrapper"
        in:fly={{ y: 10, duration: 400, delay: 100, easing: cubicOut }}
        out:fade={{ duration: 150, easing: cubicOut }}
      >

        <!-- PASO 1: BIENVENIDA -->
        {#if currentStep === 1}
          <div class="step-container center-step">
            <h1 class="main-heading">
              <span class="highlight-purple">Bienvenido</span> a las transacciones
            </h1>
            <p class="step-description max-w-720">
              Aquí puedes realizar transacciones de manera rápida y fácil. Recuerda enviar únicamente a address de confianza, ya que el Kitsune aún no puede ver los corazones de las personas.
            </p>
            <button class="btn-primary-purple btn-large" on:click={() => currentStep = 2}>
              Empezar
            </button>
          </div>

        <!-- PASO 2: SELECCIÓN DE WALLET -->
        {:else if currentStep === 2}
          <div class="step-container grid-two-cols">
            <div class="left-col left-col-centered">
              <h1 class="main-heading text-center font-compact">
                Inicie sesión en<br />su wallet favorita
              </h1>
              <div class="mascot-wrapper">
                <img src="/logoskitsune/momiaphantomthieve.png" alt="Mascota Kitsune" class="mascot-img-large" />
              </div>
            </div>

            <div class="right-col options-stack">
              <button class="option-card card-metamask" on:click={connectMetaMask}>
                <div class="card-icon-section">
                  <img src="/images/metamask.webp" alt="MetaMask" class="provider-icon" />
                </div>
                <div class="card-text-section">
                  <span class="option-title">Conectar con metamask</span>
                </div>
              </button>

              <button class="option-card card-paliwallet" on:click={connectPaliWallet}>
                <div class="card-icon-section">
                  <img src="/images/pali.png" alt="PaliWallet" class="provider-icon" />
                </div>
                <div class="card-text-section">
                  <span class="option-title">Conectar con palliwallet</span>
                </div>
              </button>

              <button class="option-card card-other" on:click={connectGenericWallet}>
                <div class="card-icon-section">
                  <img src="/images/wallet.png" alt="Otra Wallet" class="provider-icon" />
                </div>
                <div class="card-text-section">
                  <span class="option-title">otra wallet</span>
                </div>
              </button>
            </div>
          </div>

        <!-- PASO 3: CONFIGURACIÓN DE TRANSACCIÓN -->
        {:else if currentStep === 3}
          <div class="step-container center-step">
            <div class="tx-inputs-grid">
              <!-- BLOQUE ORIGEN -->
              <div class="tx-input-card">
                <h2 class="tx-card-title">Origen</h2>
                <p class="tx-card-subtitle">¿Cuánto deseas transferir?</p>
                <div class="input-pill pill-origen">
                  <div class="pill-icon-bg icon-origen">
                    <svg class="net-icon-eth" viewBox="0 0 256 417" width="40" height="46">
                      <path fill="#8a92b2" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/>
                      <path fill="#62688f" d="M127.962 0L0 212.32l127.962 75.639V152.47z"/>
                      <path fill="#8a92b2" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.601 128.038-180.32z"/>
                      <path fill="#62688f" d="M127.962 416.905v-104.72L0 236.585z"/>
                    </svg>
                  </div>
                  <div class="pill-field-group">
                    <input
                      type="text"
                      class="pill-input text-right"
                      bind:value={amountToTransfer}
                      placeholder="1,00"
                    />
                    <span class="currency-tag">ETH</span>
                  </div>
                </div>
              </div>

              <!-- BLOQUE DESTINO -->
              <div class="tx-input-card">
                <h2 class="tx-card-title">Destino</h2>
                <p class="tx-card-subtitle">Escribe la dirección de destino</p>
                <div class="input-pill pill-destino">
                  <div class="pill-icon-bg icon-destino">
                    <img src="/images/wallet.png" alt="Destino" class="pill-wallet-icon" />
                  </div>
                  <input
                    type="text"
                    class="pill-input"
                    bind:value={recipientAddress}
                    placeholder="Escriba una dirección..."
                  />
                </div>
              </div>
            </div>

            <div class="action-block">
              <img src="/logoskitsune/love.png" alt="Kitsune Transfer" class="mascot-img-center" />
              <button
                class="btn-primary-purple btn-large btn-wide"
                disabled={isSendingTx}
                on:click={executeTransaction}
              >
                {#if isSendingTx}
                  enviando transacción...
                {:else}
                  verificar y transferir
                {/if}
              </button>
            </div>
          </div>

        <!-- PASO 4: RESULTADO DE TRANSACCIÓN -->
        {:else if currentStep === 4}
          <div class="step-container center-step">
            <h1 class="main-heading">Transacción hecha con éxito</h1>

            <div class="results-wrapper">
              <div
                class="results-grid"
                bind:this={scrollContainer}
                on:scroll={updateScroll}
              >
                <div class="result-card">
                  <div class="card-top-bar">Estado</div>
                  <div class="card-value-body flex-col">
                    <div class="success-check-circle">
                      <span class="material-symbols-outlined check-icon">check</span>
                    </div>
                    <span class="summary-value-text">Éxito</span>
                  </div>
                </div>

                <div class="result-card">
                  <div class="card-top-bar">Cantidad transferida</div>
                  <div class="card-value-body flex-col">
                    <div class="amount-large-text">
                      {amountToTransfer.replace('.', ',')} <span class="currency-small">ETH</span>
                    </div>
                    <span class="network-subtext">Ethereum Hoddi</span>
                  </div>
                </div>

                <div class="result-card">
                  <div class="card-top-bar">Remitente</div>
                  <div class="card-value-body">
                    <button
                      class="clickable-value"
                      title="Ver address completo"
                      on:click={() => openDetailModal('Address del Remitente', walletAddress)}
                    >
                      <span class="hash-text">{formatShortAddress(walletAddress)}</span>
                    </button>
                  </div>
                </div>

                <div class="result-card">
                  <div class="card-top-bar">Receptor</div>
                  <div class="card-value-body">
                    <button
                      class="clickable-value"
                      title="Ver address completo"
                      on:click={() => openDetailModal('Address del Receptor', recipientAddress)}
                    >
                      <span class="hash-text">{formatShortAddress(recipientAddress)}</span>
                    </button>
                  </div>
                </div>

                <div class="result-card">
                  <div class="card-top-bar">Hash</div>
                  <div class="card-value-body">
                    <button
                      class="clickable-value"
                      title="Ver Hash completo"
                      on:click={() => openDetailModal('Hash de la Transacción', txHash)}
                    >
                      <span class="hash-text">{formatShortHash(txHash)}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div
                class="custom-scrollbar-track"
                bind:this={trackElement}
                on:click={handleTrackClick}
              >
                <div
                  class="custom-scrollbar-thumb"
                  class:dragging={isDraggingThumb}
                  style="width: {thumbWidthPercent}%; left: {scrollRatio * (100 - thumbWidthPercent)}%;"
                  on:pointerdown={handleThumbPointerDown}
                ></div>
              </div>
            </div>

            <div class="results-actions">
              <button class="btn-primary-purple action-btn" on:click={() => navigate('inicio')}>
                Volver a inicio
              </button>
              <button class="btn-secondary-purple action-btn" on:click={resetTransaction}>
                Realizar otra transacción
              </button>
            </div>
          </div>
        {/if}

      </div>
    {/key}

  </div>

  <!-- NAVEGADOR INFERIOR -->
  <div class="bottom-stepper-section">
    <div class="stepper-bar">
      <div class="stepper-line-bg">
        <div
          class="stepper-line-active"
          style="width: {((currentStep - 1) / 3) * 100}%"
        ></div>
      </div>

      <button
        class="step-circle"
        class:step-active={currentStep >= 1}
        class:step-current={currentStep === 1}
        on:click={() => goToStep(1)}
      >
        <span class="material-symbols-outlined">home</span>
      </button>

      <button
        class="step-circle"
        class:step-active={currentStep >= 2}
        class:step-current={currentStep === 2}
        on:click={() => goToStep(2)}
      >
        <span class="material-symbols-outlined">credit_card</span>
      </button>

      <button
        class="step-circle"
        class:step-active={currentStep >= 3}
        class:step-current={currentStep === 3}
        on:click={() => goToStep(3)}
      >
        <span class="material-symbols-outlined">output</span>
      </button>

      <button
        class="step-circle"
        class:step-active={currentStep >= 4}
        class:step-current={currentStep === 4}
        on:click={() => goToStep(4)}
      >
        <span class="material-symbols-outlined">task_alt</span>
      </button>
    </div>
  </div>
</div>

<!-- MODAL DE DETALLES -->
{#if isDetailModalOpen}
  <div class="modal-backdrop" transition:fade={{ duration: 180, easing: cubicOut }} on:click|self={closeDetailModal}>
    <div class="modal-card" in:fly={{ y: 20, duration: 250, easing: cubicOut }}>
      <div class="modal-header">
        <h3>{detailModalTitle}</h3>
        <button class="modal-close-btn" on:click={closeDetailModal}>&times;</button>
      </div>
      <div class="modal-body">
        <p class="modal-label">Valor completo:</p>
        <div class="full-value-display">{detailModalValue}</div>
        <div class="modal-actions">
          <button class="btn-primary-purple modal-btn" on:click={() => copyToClipboard(detailModalValue)}>
            Copiar al portapapeles
          </button>
          <button class="btn-secondary-purple modal-btn" on:click={closeDetailModal}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- MODAL DE ALERTAS -->
{#if isAlertModalOpen}
  <div class="modal-backdrop" transition:fade={{ duration: 180, easing: cubicOut }} on:click|self={closeAlertModal}>
    <div class="modal-card alert-modal-card" in:fly={{ y: 20, duration: 250, easing: cubicOut }}>
      <div class="alert-modal-content">
        <img src={alertMascot} alt="Kitsune Mascot" class="kitsune-alert-img" />
        <h3 class="alert-title">{alertTitle}</h3>
        <p class="alert-message">{alertMessage}</p>
        <button class="btn-primary-purple modal-btn btn-alert-ok" on:click={closeAlertModal}>
          Entendido
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* LAYOUT GENERAL */
  .transacciones-wrapper {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background-color: #0b0a16;
    color: #ffffff;
    font-family: 'JetBrains Mono', monospace, sans-serif;
    position: relative;
    justify-content: space-between;
  }

  .no-select {
    user-select: none;
  }

  .step-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px 20px 20px;
    min-height: 0;
  }

  .step-animation-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .step-container {
    width: 100%;
    max-width: 1100px;
  }

  .center-step {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .grid-two-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: center;
  }

  .left-col-centered {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  /* TIPOGRAFÍA */
  .main-heading {
    font-size: 3.4rem;
    font-weight: 700;
    line-height: 1.15;
    margin-bottom: 24px;
    letter-spacing: -0.5px;
  }

  .font-compact { font-size: 3rem; }
  .text-center { text-align: center; }
  .highlight-purple { color: #cb53be; }

  .step-description {
    color: #9295bd;
    font-size: 1.05rem;
    line-height: 1.65;
    margin-bottom: 32px;
  }

  .max-w-720 { max-width: 720px; }

  /* COMPONENTES PASO 2 */
  .options-stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
  }

  .option-card {
    display: flex;
    align-items: center;
    border: none;
    border-radius: 16px;
    padding: 0;
    cursor: pointer;
    overflow: hidden;
    height: 84px;
    width: 100%;
    transition: transform 0.25s ease, filter 0.25s ease;
    color: #ffffff;
  }

  .option-card:hover {
    transform: translateY(-3px);
    filter: brightness(1.08);
  }

  .card-metamask { background-color: #b25252; }
  .card-paliwallet { background-color: #516cb0; }
  .card-other { background-color: #7a52b3; }

  .card-icon-section {
    width: 84px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.22);
    flex-shrink: 0;
  }

  .provider-icon {
    width: 50px;
    height: 50px;
    object-fit: contain;
  }

  .card-text-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 20px;
  }

  .option-title {
    font-size: 1.15rem;
    font-weight: 700;
    font-family: inherit;
  }

  .mascot-wrapper {
    margin-top: 16px;
  }

  .mascot-img-large {
    width: 220px;
    height: auto;
    object-fit: contain;
  }

  /* COMPONENTES PASO 3 */
  .tx-inputs-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 176px;
    width: 100%;
    max-width: 1090px;
    margin-bottom: 24px;
  }

  .tx-input-card {
    text-align: center;
  }

  .tx-card-title {
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 8px;
    color: #ffffff;
  }

  .tx-card-subtitle {
    font-size: 0.95rem;
    color: #9396b8;
    margin-bottom: 20px;
  }

  .input-pill {
    display: flex;
    align-items: center;
    border-radius: 12px;
    height: 68px;
    overflow: hidden;
  }

  .pill-origen { background-color: #322b54; }
  .icon-origen { background-color: #564784; }
  .pill-destino { background-color: #1e2445; }
  .icon-destino { background-color: #313b6c; }

  .pill-icon-bg {
    width: 68px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .pill-wallet-icon {
    width: 58px;
    height: 58px;
    object-fit: contain;
  }

  .pill-field-group {
    flex: 1;
    display: flex;
    align-items: center;
    padding-right: 20px;
  }

  .pill-input {
    width: 100%;
    background: transparent;
    border: none;
    color: #ffffff;
    font-family: inherit;
    font-size: 1.1rem;
    font-weight: 700;
    padding: 0 16px;
  }

  .pill-input::placeholder { color: #a3a6cd; }
  .pill-input:focus { outline: none; }
  .text-right { text-align: right; }

  .currency-tag {
    font-weight: 700;
    font-size: 1rem;
    color: #ffffff;
    margin-left: 6px;
  }

  .action-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    width: 100%;
    margin-top: 10px;
  }

  .mascot-img-center {
    width: 110px;
    height: auto;
    margin-bottom: -18px;
    z-index: 10;
    position: relative;
    pointer-events: none;
  }

  .btn-wide {
    width: 100%;
    max-width: 460px;
    position: relative;
    z-index: 1;
    padding: 16px 24px;
    font-size: 1.1rem;
    border-radius: 12px;
    text-transform: lowercase;
  }

  /* COMPONENTES PASO 4 */
  .results-wrapper {
    width: 100%;
    max-width: 820px;
    margin: 0 auto 28px auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .results-grid {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    width: 100%;
    padding: 10px 4px 16px 4px;
    scrollbar-width: none;
    box-sizing: border-box;
  }

  .results-grid::-webkit-scrollbar { display: none; }

  .result-card {
    width: 250px;
    min-width: 250px;
    max-width: 250px;
    background-color: #17142e;
    border: 1px solid #2b254a;
    border-radius: 16px;
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
    display: flex;
    flex-direction: column;
  }

  .card-top-bar {
    background-color: #231d3d;
    padding: 14px 16px;
    font-size: 0.95rem;
    font-weight: 700;
    color: #ffffff;
    text-align: center;
    border-bottom: 1px solid #2b254a;
  }

  .card-value-body {
    padding: 24px 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #141128;
    flex: 1;
  }

  .flex-col {
    flex-direction: column;
  }

  .success-check-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: #23c460;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
  }

  .check-icon {
    font-size: 30px;
    color: #ffffff;
    font-weight: bold;
  }

  .summary-value-text {
    font-size: 1.05rem;
    font-weight: 600;
  }

  .amount-large-text {
    font-size: 1.7rem;
    font-weight: 700;
  }

  .currency-small {
    font-size: 0.95rem;
    color: #a09cb8;
  }

  .network-subtext {
    font-size: 0.85rem;
    color: #8e91b5;
    margin-top: 4px;
  }

  .hash-text {
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .clickable-value {
    background: rgba(255, 255, 255, 0.03);
    border: none;
    outline: none;
    color: #ffffff;
    cursor: pointer;
    padding: 10px 16px;
    border-radius: 10px;
    transition: all 0.2s ease;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .clickable-value:hover {
    background-color: rgba(203, 83, 190, 0.18);
    color: #cb53be;
    transform: scale(1.03);
  }

  .custom-scrollbar-track {
    width: 100%;
    max-width: 790px;
    height: 8px;
    background-color: #1d1838;
    border-radius: 4px;
    margin-top: 14px;
    position: relative;
    cursor: pointer;
  }

  .custom-scrollbar-thumb {
    position: absolute;
    top: 0;
    height: 100%;
    background-color: #b053a4;
    border-radius: 4px;
    cursor: grab;
    transition: background-color 0.2s ease;
  }

  .custom-scrollbar-thumb.dragging {
    cursor: grabbing;
    background-color: #cb53be;
  }

  .results-actions {
    display: flex;
    gap: 20px;
    justify-content: center;
    width: 100%;
    max-width: 820px;
  }

  .action-btn {
    flex: 1;
    padding: 16px 24px;
    font-size: 1.05rem;
    border-radius: 12px;
    text-align: center;
  }

  /* BOTONES GENERALES */
  .btn-primary-purple {
    background-color: #b053a4;
    color: #ffffff;
    border: none;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .btn-primary-purple:hover:not(:disabled) {
    background-color: #c967c2;
    transform: translateY(-2px);
  }

  .btn-secondary-purple {
    background-color: #685ebd;
    color: #ffffff;
    border: none;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .btn-secondary-purple:hover {
    background-color: #796fcd;
    transform: translateY(-2px);
  }

  .btn-large {
    padding: 18px 80px;
    font-size: 1.15rem;
    border-radius: 12px;
  }

  /* ESTILOS DE MODALES */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(4, 3, 10, 0.82);
    backdrop-filter: blur(8px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .modal-card {
    background-color: #17142e;
    border: 1px solid #322a59;
    border-radius: 18px;
    width: 100%;
    max-width: 540px;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.7);
    overflow: hidden;
  }

  .modal-header {
    background-color: #211c3a;
    padding: 18px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #282247;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.2rem;
    color: #ffffff;
    font-weight: 700;
  }

  .modal-close-btn {
    background: transparent;
    border: none;
    color: #a09cb8;
    font-size: 1.8rem;
    line-height: 1;
    cursor: pointer;
    transition: color 0.2s;
  }

  .modal-close-btn:hover { color: #ffffff; }

  .modal-body {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .modal-label {
    font-size: 0.9rem;
    color: #8e91b5;
    margin: 0;
  }

  .full-value-display {
    word-break: break-all;
    background-color: #0c0a17;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid #282247;
    color: #cb53be;
    font-family: inherit;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 8px;
  }

  .modal-btn {
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 0.95rem;
  }

  .alert-modal-card {
    max-width: 420px;
    text-align: center;
  }

  .alert-modal-content {
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .kitsune-alert-img {
    width: 140px;
    height: auto;
    margin-bottom: 16px;
    object-fit: contain;
  }

  .alert-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 10px 0;
  }

  .alert-message {
    font-size: 0.95rem;
    color: #a3a6cd;
    line-height: 1.5;
    margin: 0 0 24px 0;
  }

  .btn-alert-ok {
    width: 100%;
    padding: 14px;
  }

  /* NAVEGADOR INFERIOR */
  .bottom-stepper-section {
    width: 100%;
    height: 265px;
    background-color: #161836;
    clip-path: polygon(0 22px, 8% 0, 92% 0, 100% 22px, 100% 100%, 0 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 20;
    flex-shrink: 0;
    padding-bottom: 115px;
  }

  .stepper-bar {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 580px;
    padding: 0 30px;
  }

  .stepper-line-bg {
    position: absolute;
    top: 50%;
    left: 60px;
    right: 60px;
    height: 4px;
    background-color: #272a5a;
    transform: translateY(-50%);
    z-index: 1;
  }

  .stepper-line-active {
    height: 100%;
    background-color: #b053a4;
    transition: width 0.35s ease;
  }

  .step-circle {
    position: relative;
    z-index: 2;
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background-color: #272a5a;
    border: none;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .step-circle .material-symbols-outlined { font-size: 34px; }

  .step-circle:hover { transform: scale(1.08); }

  .step-circle.step-active { background-color: #b053a4; }

  .step-circle.step-current {
    background-color: #b053a4;
    box-shadow: 0 0 28px rgba(176, 83, 164, 0.85);
  }

  /* ANIMACIÓN OVERLAY */
  .connection-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    width: 100vw;
    height: 100vh;
  }

  .sweep-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: translateX(-100%);
  }

  .layer-1 { animation: sweepCover 0.65s cubic-bezier(0.77, 0, 0.175, 1) 0s forwards; }
  .layer-2 { animation: sweepCover 0.65s cubic-bezier(0.77, 0, 0.175, 1) 0.15s forwards; }
  .layer-3 {
    animation: sweepCover 0.65s cubic-bezier(0.77, 0, 0.175, 1) 0.3s forwards;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes sweepCover {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(0%); }
  }

  .center-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .anim-wallet-logo {
    width: 110px;
    height: 110px;
    object-fit: contain;
  }

  .connection-done-text {
    font-size: 2rem;
    font-weight: 700;
  }
</style>