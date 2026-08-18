<script lang="ts">
  import { ethers } from "ethers";
  let provider: ethers.BrowserProvider | null = null;
  let address: string = "";
  let balance: string = "";
  let loading: boolean = false;

  async function connectWallet() {
    try {
      loading = true;
      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        address = await signer.getAddress();
      } else {
        alert("Instala Pali Wallet para continuar");
      }
    } finally {
      loading = false;
    }
  }

  async function getBalance() {
    try {
      loading = true;
      if (provider && address) {
        const balanceWei = await provider.getBalance(address);
        balance = ethers.formatEther(balanceWei);
      }
    } finally {
      loading = false;
    }
  }

  function shortenAddress(addr: string) {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
  }
</script>

<section class="card">
  <h1 class="title">
    <span class="material-icons">account_balance_wallet</span>
    Demo Pali Wallet
  </h1>

  {#if loading}
    <div class="loading-bar"></div>
  {/if}

  <button class="btn primary" on:click={connectWallet} disabled={loading}>
    <span class="material-icons">login</span>
    Iniciar sesión
  </button>

  {#if address}
    <p class="info">
      <span class="material-icons">fingerprint</span>
      Dirección: <strong>{shortenAddress(address)}</strong>
    </p>
  {/if}

  <button class="btn secondary" on:click={getBalance} disabled={!address || loading}>
    <span class="material-icons">paid</span>
    Leer saldo
  </button>

  {#if balance}
    <p class="info">
      <span class="material-icons">savings</span>
      Saldo: <strong>{balance} ETH</strong>
    </p>
  {/if}
</section>