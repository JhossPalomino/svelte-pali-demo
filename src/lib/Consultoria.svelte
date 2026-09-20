<script>
  import { onMount, onDestroy } from 'svelte';
  import { navigate } from '../router.js';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  // --- CONTROL DE SCROLL DE LA VENTANA ---
  onMount(() => {
    // Bloquea el scroll del navegador solo al entrar a Consultoría
    document.body.style.overflow = 'hidden';
  });

  onDestroy(() => {
    // Restaura el scroll del navegador al salir a Home u otra página
    document.body.style.overflow = '';
  });

  // --- ESTADO DE NAVEGACIÓN Y PASOS ---
  let currentStep = 1;

  // --- ESTADO WEB3 Y CONEXIÓN ---
  let connectionMethod = null; // 'metamask' | 'paliwallet' | 'address'
  let walletAddress = '';
  let isLoadingBalances = false;

  // --- PERSISTENCIA DE CONEXIONES PREVIAS ---
  let connectedMethods = new Set();

  // --- ESTADO DE ANIMACIÓN DE CONEXIÓN ---
  let isConnectingAnimation = false;
  let showFinalContent = false;

  // --- MODAL DE ALERTAS Y ERRORES KITSUNE ---
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

  // Configuración de temas visuales para la animación por cada wallet
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
    address: {
      bars: ['#58377a', '#814cb8', '#a473d4'],
      finalBg: '#58377a',
      logo: '/images/wallet.png',
      title: 'Address'
    }
  };

  // Modal de Address
  let showAddressModal = false;
  let inputAddress = '';
  let isVerifyingAddress = false;

  // --- ESTADO DE REDES CON RPCS REALES Y SÍMBOLOS ---
  let networks = [
    { id: 'sepolia', name: 'Ethereum Sepolia', type: 'Testnet', icon: 'ethereum', symbol: 'ETH', selected: true, rpc: 'https://ethereum-sepolia-rpc.publicnode.com/', balance: 0 },
    { id: 'hoodi', name: 'Ethereum Hoodi', type: 'Testnet', icon: 'ethereum', symbol: 'ETH', selected: true, rpc: 'https://0xrpc.io/hoodi', balance: 0 },
    { id: 'zksys', name: 'zkSYS Testnet', type: 'Testnet', icon: 'syscoin', symbol: 'TSYS', selected: true, rpc: 'https://rpc-zk.tanenbaum.io/', balance: 0 },
    { id: 'holesky', name: 'Ethereum Holesky', type: 'Testnet', icon: 'ethereum', symbol: 'ETH', selected: false, rpc: 'https://ethereum-holesky.publicnode.com', balance: 0 },
    { id: 'arb-sepolia', name: 'Arbitrum Sepolia', type: 'Testnet', icon: 'ethereum', symbol: 'ETH', selected: false, rpc: 'https://sepolia.arbitrum.io/rpc', balance: 0 },
    { id: 'op-sepolia', name: 'Optimism Sepolia', type: 'Testnet', icon: 'ethereum', symbol: 'ETH', selected: false, rpc: 'https://sepolia.optimism.io', balance: 0 },
    { id: 'base-sepolia', name: 'Base Sepolia', type: 'Testnet', icon: 'ethereum', symbol: 'ETH', selected: false, rpc: 'https://sepolia.base.org', balance: 0 }
  ];

  // Modal para añadir red
  let showAddNetworkModal = false;
  let newNetworkName = '';
  let newNetworkRpc = '';
  let newNetworkSymbol = 'ETH';

  // --- LÓGICA DE PASOS ---
  function goToStep(step) {
    if (step <= currentStep) {
      currentStep = step;
    }
  }

  // --- DETECCIÓN REAL Y VERIFICACIÓN DE WALLETS ---
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

  // Lógica central para procesar la conexión y controlar la animación
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

  // --- CONEXIÓN METAMASK ---
  async function connectMetaMask() {
    if (typeof window.ethereum === 'undefined') {
      showAlert('MetaMask no encontrado', 'MetaMask no está instalado en tu navegador. Por favor instálalo para continuar.', '/logoskitsune/joker.png');
      return;
    }

    const detected = getDetectedWallet();
    if (detected === 'paliwallet') {
      showAlert('Pali Wallet Detectada', 'Se detectó Pali Wallet interfiriendo con la inyección de MetaMask. Por favor usa el botón de Pali Wallet.', '/logoskitsune/joker.png');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        handleConnectionSuccess('metamask', accounts[0]);
      }
    } catch (err) {
      showAlert('Error de conexión', 'No se pudo conectar con MetaMask: ' + err.message, '/logoskitsune/joker.png');
    }
  }

  // --- CONEXIÓN PALIWALLET ---
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
        } else {
          throw new Error('No se encontró un método de conexión compatible.');
        }

        if (account) {
          handleConnectionSuccess('paliwallet', Array.isArray(account) ? account[0] : account);
        }
      } catch (err) {
        showAlert('Error de conexión', 'No se pudo conectar con PaliWallet: ' + err.message, '/logoskitsune/joker.png');
      }
    } else {
      showAlert('PaliWallet no encontrada', 'PaliWallet no está instalada en tu navegador.', '/logoskitsune/joker.png');
    }
  }

  // --- VALIDACIÓN DE ADDRESS MANUAL Y VERIFICACIÓN ON-CHAIN ---
  function openAddressModal() {
    inputAddress = '';
    showAddressModal = true;
  }

  async function checkAddressInfo(address) {
    const rpcUrl = networks[0]?.rpc || 'https://ethereum-sepolia-rpc.publicnode.com/';
    try {
      const [balRes, txRes, codeRes] = await Promise.all([
        fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getBalance', params: [address, 'latest'], id: 1 })
        }),
        fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getTransactionCount', params: [address, 'latest'], id: 2 })
        }),
        fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getCode', params: [address, 'latest'], id: 3 })
        })
      ]);

      const balData = await balRes.json();
      const txData = await txRes.json();
      const codeData = await codeRes.json();

      const balance = balData?.result ? BigInt(balData.result) : 0n;
      const txCount = txData?.result ? parseInt(txData.result, 16) : 0;
      const code = codeData?.result || '0x';

      const hasBalance = balance > 0n;
      const hasSentTx = txCount > 0;
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

  async function confirmAddress() {
    const cleanAddress = inputAddress.trim();
    const isValidEthAddress = /^0x[a-fA-F0-9]{40}$/.test(cleanAddress);

    if (!isValidEthAddress) {
      showAlert('Address no válido', 'Por favor ingresa una dirección de Wallet válida con formato 0x...', '/logoskitsune/joker.png');
      return;
    }

    isVerifyingAddress = true;
    const { hasActivity } = await checkAddressInfo(cleanAddress);
    isVerifyingAddress = false;

    if (!hasActivity) {
      showAlert('Sin actividad previa', 'La dirección es válida, pero no registra saldo ni transacciones en la red principal de consulta.', '/logoskitsune/joker.png');
    }

    showAddressModal = false;
    handleConnectionSuccess('address', cleanAddress);
  }

  // --- CONSULTAR FONDOS REALES EN LA BLOCKCHAIN ---
  async function fetchRealOnChainBalances() {
    if (!walletAddress) {
      showAlert('Wallet no encontrada', 'No se ha detectado ninguna dirección de wallet.', '/logoskitsune/joker.png');
      return;
    }

    isLoadingBalances = true;
    currentStep = 4;

    const fetchPromises = networks.map(async (net) => {
      if (!net.selected || !net.rpc) return net;

      try {
        const response = await fetch(net.rpc, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getBalance',
            params: [walletAddress, 'latest'],
            id: 1
          })
        });

        if (!response.ok) {
          return { ...net, balance: 0 };
        }

        const data = await response.json();
        if (data && data.result) {
          const weiValue = BigInt(data.result);
          const ethBalance = Number(weiValue) / 1e18;
          return { ...net, balance: ethBalance };
        }
      } catch (err) {
        console.error(`Error consultando saldo en ${net.name}:`, err);
      }
      return { ...net, balance: 0 };
    });

    networks = await Promise.all(fetchPromises);
    isLoadingBalances = false;

    setTimeout(updateScroll, 100);
  }

  // --- DETECTAR Y AÑADIR NUEVA RED ---
  async function handleAddNewNetwork() {
    if (connectionMethod === 'address') return;

    if (typeof window.ethereum !== 'undefined') {
      try {
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
        const chainIdDec = parseInt(chainIdHex, 16);

        const existing = networks.find(n => n.id === `chain-${chainIdDec}`);
        if (existing) {
          showAlert('Red duplicada', `La red actual de tu wallet (Chain ID: ${chainIdDec}) ya está en la lista.`, '/logoskitsune/moneyisallyouneed.png');
          return;
        }

        const customNet = {
          id: `chain-${chainIdDec}`,
          name: `Red Detectada (Chain ${chainIdDec})`,
          type: 'Personalizada',
          icon: 'ethereum',
          symbol: 'ETH',
          selected: true,
          rpc: 'https://ethereum-sepolia-rpc.publicnode.com/',
          balance: 0
        };

        networks = [...networks, customNet];
        showAlert('Red Agregada', `Red con Chain ID ${chainIdDec} agregada exitosamente para esta sesión.`, '/logoskitsune/yum.png');
      } catch (e) {
        showAddNetworkModal = true;
      }
    } else {
      showAddNetworkModal = true;
    }
  }

  function saveManualNetwork() {
    if (!newNetworkName || !newNetworkRpc) return;
    networks = [...networks, {
      id: `custom-${Date.now()}`,
      name: newNetworkName,
      type: 'Personalizada',
      icon: 'ethereum',
      symbol: newNetworkSymbol || 'ETH',
      selected: true,
      rpc: newNetworkRpc,
      balance: 0
    }];
    showAddNetworkModal = false;
    newNetworkName = '';
    newNetworkRpc = '';
    newNetworkSymbol = 'ETH';
  }

  // --- CÁLCULO DE RESULTADOS ---
  $: selectedNetworks = networks.filter(n => n.selected);
  $: totalBalance = selectedNetworks.reduce((sum, n) => sum + n.balance, 0);
  $: totalCardsCount = 1 + selectedNetworks.length;

  // --- INTERACCIÓN CON SCROLLBAR ---
  let scrollContainer;
  let trackElement;
  let scrollRatio = 0;
  let thumbWidthPercent = 30;

  let isDraggingThumb = false;
  let startX = 0;
  let startScrollLeft = 0;

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
    scrollContainer.scrollLeft = clickRatio * maxScroll;
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

  function resetConsultation() {
    currentStep = 2;
  }
</script>

<!-- ANIMACIÓN DE BARRIDO Y CONEXIÓN -->
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

<div class="consultoria-wrapper" class:no-select={isDraggingThumb}>

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
              <span class="highlight-purple">Bienvenido</span> a la consultoria
            </h1>
            <p class="step-description max-w-720">
              O puedes elegir una o varias, como prefieras, si no encuentras la que quieres puedes añadirla pero solo servirá para esta sesión
            </p>
            <button class="btn-primary-purple btn-large" on:click={() => currentStep = 2}>
              Empezar
            </button>
          </div>

        <!-- PASO 2: MÉTODO DE CONEXIÓN -->
        {:else if currentStep === 2}
          <div class="step-container grid-two-cols">
            <div class="left-col left-col-centered">
              <h1 class="main-heading text-center">
                ¿Como te gustaria<br />consultar?
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

              <button class="option-card card-address" on:click={openAddressModal}>
                <div class="card-icon-section">
                  <img src="/images/wallet.png" alt="Address" class="provider-icon" />
                </div>
                <div class="card-text-section">
                  <span class="option-title">usar numero de address</span>
                </div>
              </button>
            </div>
          </div>

        <!-- PASO 3: SELECCIÓN DE REDES -->
        {:else if currentStep === 3}
          <div class="step-container grid-two-cols align-start">
            <div class="left-col step3-left-col">
              <h1 class="main-heading text-left">Elige las redes</h1>

              <div class="desc-mascot-row">
                <p class="step-description text-left max-w-320">
                  Puedes elegir una o varias, como prefieras, si no encuentras la que quieres puedes añadirla pero solo servirá para esta sesión (aplican condiciones... pista: solo para wallets)
                </p>
                <div class="mascot-wrapper-step3">
                  <img src="/logoskitsune/joker.png" alt="Mascota Kitsune" class="mascot-img-step3" />
                </div>
              </div>

              <div class="btn-center-container">
                <button class="btn-primary-purple btn-large shadow-glow" on:click={fetchRealOnChainBalances}>
                  Ver resultados
                </button>
              </div>
            </div>

            <div class="right-col">
              <div class="table-card">
                <div class="table-header-row">
                  <div class="th-cell cell-check">
                    <input
                      type="checkbox"
                      class="custom-checkbox"
                      checked={networks.every(n => n.selected)}
                      on:change={(e) => networks = networks.map(n => ({...n, selected: e.target.checked}))}
                    />
                  </div>
                  <div class="th-cell cell-icon">Icono</div>
                  <div class="th-cell cell-name">Nombre</div>
                  <div class="th-cell cell-type">Tipo</div>
                </div>

                <div class="table-scroll-container">
                  {#each networks as net}
                    <div class="table-body-row" class:row-selected={net.selected}>
                      <div class="td-cell cell-check">
                        <input type="checkbox" class="custom-checkbox" bind:checked={net.selected} />
                      </div>
                      <div class="td-cell cell-icon">
                        {#if net.icon === 'syscoin'}
                          <span class="material-symbols-outlined net-symbol-sys">polyline</span>
                        {:else}
                          <svg class="net-icon-eth" viewBox="0 0 256 417" width="22" height="28">
                            <path fill="#8a92b2" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/>
                            <path fill="#62688f" d="M127.962 0L0 212.32l127.962 75.639V152.47z"/>
                            <path fill="#8a92b2" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.601 128.038-180.32z"/>
                            <path fill="#62688f" d="M127.962 416.905v-104.72L0 236.585z"/>
                          </svg>
                        {/if}
                      </div>
                      <div class="td-cell cell-name">{net.name}</div>
                      <div class="td-cell cell-type">{net.type}</div>
                    </div>
                  {/each}
                </div>

                <button
                  class="add-network-btn"
                  disabled={connectionMethod === 'address'}
                  class:disabled-btn={connectionMethod === 'address'}
                  on:click={handleAddNewNetwork}
                >
                  <span class="material-symbols-outlined add-icon">add</span>
                  <span>Añadir una nueva red</span>
                  {#if connectionMethod === 'address'}
                    <small class="disabled-hint">(No disponible para modo Address)</small>
                  {/if}
                </button>
              </div>
            </div>
          </div>

        <!-- PASO 4: RESULTADOS -->
        {:else if currentStep === 4}
          <div class="step-container center-step">
            <h1 class="main-heading">Estos son los resultados</h1>

            {#if isLoadingBalances}
              <div class="loading-box">
                <div class="spinner"></div>
                <p>Consultando fondos reales en la blockchain...</p>
              </div>
            {:else}
              <div class="results-wrapper">
                <div
                  class="results-grid"
                  class:justify-center={totalCardsCount <= 3}
                  bind:this={scrollContainer}
                  on:scroll={updateScroll}
                >
                  <!-- Tarjeta Saldo Total -->
                  <div class="result-card card-total">
                    <div class="card-top-bar">Saldo total</div>
                    <div class="card-value-body">
                      <span class="amount">{totalBalance.toFixed(4).replace('.', ',')}</span>
                      <span class="currency">ETH</span>
                    </div>
                  </div>

                  <!-- Tarjetas de Redes Seleccionadas -->
                  {#each selectedNetworks as net}
                    <div class="result-card">
                      <div class="card-top-bar">{net.name}</div>
                      <div class="card-value-body">
                        <span class="amount">{net.balance.toFixed(4).replace('.', ',')}</span>
                        <span class="currency">{net.symbol}</span>
                      </div>
                    </div>
                  {/each}
                </div>

                <!-- BARRA DESLIZANTE INTEGRADA -->
                {#if totalCardsCount > 3}
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
                {/if}
              </div>

              <div class="results-actions">
                <button class="btn-primary-purple action-btn" on:click={() => navigate('inicio')}>
                  Volver a inicio
                </button>
                <button class="btn-secondary-purple action-btn" on:click={resetConsultation}>
                  Consultar otra vez
                </button>
              </div>
            {/if}
          </div>
        {/if}

      </div>
    {/key}

  </div>

  <!-- BARRA DE CONTROL DE PASOS -->
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
        <span class="material-symbols-outlined">wifi</span>
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

<!-- MODAL DE AÑADIR ADDRESS -->
{#if showAddressModal}
  <div class="modal-backdrop" transition:fade={{ duration: 180, easing: cubicOut }}>
    <div class="modal-box" in:fly={{ y: -15, duration: 250, easing: cubicOut }}>
      <h3 class="modal-title">Ingresa la dirección de Wallet</h3>
      <p class="modal-desc">Verificaremos que el address sea válido antes de consultar sus redes.</p>

      <input
        type="text"
        class="modal-input"
        placeholder="0x..."
        bind:value={inputAddress}
      />

      <div class="modal-buttons">
        <button class="btn-cancel" disabled={isVerifyingAddress} on:click={() => showAddressModal = false}>Cancelar</button>
        <button class="btn-confirm" disabled={isVerifyingAddress} on:click={confirmAddress}>
          {isVerifyingAddress ? 'Verificando...' : 'Continuar'}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- MODAL PARA AÑADIR RED -->
{#if showAddNetworkModal}
  <div class="modal-backdrop" transition:fade={{ duration: 180, easing: cubicOut }}>
    <div class="modal-box" in:fly={{ y: -15, duration: 250, easing: cubicOut }}>
      <h3 class="modal-title">Añadir Nueva Red</h3>
      <input type="text" class="modal-input" placeholder="Nombre de la Red (ej. Polygon)" bind:value={newNetworkName} />
      <input type="text" class="modal-input mt-2" placeholder="RPC URL (ej. https://...)" bind:value={newNetworkRpc} />
      <input type="text" class="modal-input mt-2" placeholder="Token Nativo (ej. ETH, TSYS)" bind:value={newNetworkSymbol} />
      <div class="modal-buttons mt-3">
        <button class="btn-cancel" on:click={() => showAddNetworkModal = false}>Cancelar</button>
        <button class="btn-confirm" on:click={saveManualNetwork}>Guardar Red</button>
      </div>
    </div>
  </div>
{/if}

<!-- MODAL ESTÉTICO DE MENSAJES Y ERRORES KITSUNE -->
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
  /* Se removieron las reglas globales :global(body) y :global(html) para no afectar Home */

  .consultoria-wrapper {
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

  /* ANIMACIÓN */
  .connection-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    pointer-events: all;
  }

  .sweep-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: translateX(-100%);
    will-change: transform;
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
    justify-content: center;
    gap: 24px;
    z-index: 10;
  }

  .anim-wallet-logo {
    width: 120px;
    height: 120px;
    object-fit: contain;
    filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.4));
  }

  .connection-done-text {
    font-size: 2.2rem;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.5px;
  }

  .step-container {
    width: 100%;
    max-width: 1200px;
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

  .align-start { align-items: center; }

  .left-col-centered {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  /* TIPOGRAFÍA */
  .main-heading {
    font-size: 3.6rem;
    font-weight: 700;
    line-height: 1.15;
    margin-bottom: 24px;
    letter-spacing: -0.5px;
  }

  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .highlight-purple { color: #cb53be; }

  .step-description {
    color: #9295bd;
    font-size: 1.1rem;
    line-height: 1.65;
    margin-bottom: 28px;
  }

  .max-w-720 { max-width: 720px; }
  .max-w-320 {
    max-width: 320px;
    margin-bottom: 0;
    font-size: 1rem;
    line-height: 1.6;
    color: #a3a6cd;
  }

  /* PASO 3 */
  .step3-left-col {
    display: flex;
    flex-direction: column;
  }

  .desc-mascot-row {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 28px;
  }

  .mascot-wrapper-step3 {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mascot-img-step3 {
    width: 180px;
    height: auto;
    object-fit: contain;
  }

  .btn-center-container {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .btn-primary-purple {
    background-color: #b053a4;
    color: #ffffff;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .shadow-glow {
    box-shadow: 0 4px 22px rgba(186, 92, 179, 0.45);
  }

  .btn-primary-purple:hover {
    background-color: #c967c2;
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(186, 92, 179, 0.65);
  }

  .btn-secondary-purple {
    background-color: #685ebd;
    color: #ffffff;
    border: none;
    border-radius: 12px;
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
  }

  .mascot-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
  }

  .mascot-img-large {
    width: 240px;
    height: auto;
    object-fit: contain;
  }

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
  .card-address { background-color: #7a52b3; }

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
    width: 54px;
    height: 54px;
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

  /* TABLA DE REDES */
  .table-card {
    background-color: #17142e;
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid #282247;
    box-shadow: 0 14px 38px rgba(0, 0, 0, 0.45);
    width: 100%;
  }

  .table-header-row {
    display: flex;
    align-items: center;
    background-color: #221c3b;
    padding: 16px 20px;
    color: #a09cb8;
    font-size: 0.95rem;
    font-weight: 600;
    border-bottom: 1px solid #2d264f;
  }

  .table-scroll-container {
    max-height: 260px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #685ebd #120f24;
  }

  .table-body-row {
    display: flex;
    align-items: center;
    padding: 14px 20px;
    border-bottom: 1px dashed #2b254a;
    transition: background-color 0.2s ease;
  }

  .row-selected {
    background-color: rgba(186, 92, 179, 0.08);
  }

  .th-cell, .td-cell {
    display: flex;
    align-items: center;
  }

  .cell-check { width: 12%; justify-content: center; }
  .cell-icon { width: 18%; justify-content: center; }
  .cell-name { width: 45%; font-weight: 600; }
  .cell-type { width: 25%; color: #8e91b5; font-size: 0.9rem; }

  .custom-checkbox {
    width: 20px;
    height: 20px;
    accent-color: #cb53be;
    cursor: pointer;
  }

  .net-icon-eth { display: block; }
  .net-symbol-sys { color: #5db9f8; font-size: 24px; }

  .add-network-btn {
    width: 100%;
    padding: 16px;
    background-color: #1c1838;
    border: none;
    border-top: 1px solid #282247;
    color: #bcbeea;
    font-weight: 600;
    font-size: 0.95rem;
    font-family: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .add-network-btn:hover:not(.disabled-btn) {
    background-color: #26204a;
    color: #ffffff;
  }

  .disabled-btn {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .disabled-hint {
    font-size: 0.8rem;
    color: #797ca3;
    margin-left: 6px;
  }

  .add-icon { font-size: 20px; }

  .loading-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 40px 0;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(203, 83, 190, 0.2);
    border-top-color: #cb53be;
    border-radius: 50%;
    animation: spin 1s infinite linear;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

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

  .justify-center {
    justify-content: center;
  }

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

  .card-total {
    border: 1px solid #b053a4;
    box-shadow: 0 0 20px rgba(176, 83, 164, 0.3);
  }

  .card-top-bar {
    background-color: #231d3d;
    padding: 12px 16px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #c0c3e6;
    text-align: center;
    border-bottom: 1px solid #2b254a;
  }

  .card-total .card-top-bar {
    background-color: #b053a4;
    color: #ffffff;
    border-bottom: none;
  }

  .card-value-body {
    padding: 28px 16px;
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 8px;
    background-color: #141128;
    flex: 1;
  }

  .amount {
    font-size: 1.75rem;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.5px;
  }

  .currency {
    font-size: 0.95rem;
    color: #a7a9d6;
    font-weight: 600;
  }

  .custom-scrollbar-track {
    width: 100%;
    max-width: 790px;
    height: 8px;
    background-color: #1d1838;
    border-radius: 4px;
    margin-top: 10px;
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
  }

  .action-btn {
    padding: 14px 38px;
    font-size: 1rem;
    border-radius: 12px;
  }

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

  .step-circle .material-symbols-outlined {
    font-size: 34px;
  }

  .step-circle:hover {
    transform: scale(1.08);
  }

  .step-circle.step-active {
    background-color: #b053a4;
    color: #ffffff;
  }

  .step-circle.step-current {
    background-color: #b053a4;
    box-shadow: 0 0 28px rgba(176, 83, 164, 0.85);
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(4, 3, 10, 0.82);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  }

  .modal-box {
    background-color: #181533;
    border: 1px solid #2d2754;
    border-radius: 18px;
    padding: 28px;
    width: 90%;
    max-width: 440px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  }

  .modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .modal-desc {
    font-size: 0.9rem;
    color: #8e91b5;
    margin-bottom: 20px;
  }

  .modal-input {
    width: 100%;
    background-color: #0d0b1a;
    border: 1px solid #2e2857;
    border-radius: 10px;
    padding: 12px 16px;
    color: #ffffff;
    font-family: inherit;
    font-size: 0.95rem;
    box-sizing: border-box;
  }

  .modal-input:focus {
    outline: none;
    border-color: #cb53be;
  }

  .modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }

  .btn-cancel {
    background: transparent;
    border: none;
    color: #8e91b5;
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
    padding: 10px 18px;
  }

  .btn-confirm {
    background-color: #cb53be;
    border: none;
    border-radius: 10px;
    color: #ffffff;
    font-family: inherit;
    font-weight: 700;
    cursor: pointer;
    padding: 10px 20px;
  }

  /* ESTILOS DEL MODAL ALERT KITSUNE */
  .modal-card {
    background-color: #17142e;
    border: 1px solid #322a59;
    border-radius: 18px;
    width: 100%;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.7);
    overflow: hidden;
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

  .modal-btn {
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 0.95rem;
  }

  .btn-alert-ok {
    width: 100%;
    padding: 14px;
  }

  .mt-2 { margin-top: 10px; }
  .mt-3 { margin-top: 16px; }
</style>