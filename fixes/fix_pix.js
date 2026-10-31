// INTEGRACAO DA LOJINHA COM PIX MERCADO PAGO
(function () {
  const sb = window.sbClient;
  const modal = document.getElementById('pixModal');
  if (!sb || !modal) {
    console.error('PIX: cliente Supabase ou modal não encontrado.');
    return;
  }

  const box = modal.querySelector('.box');
  if (!box || box.dataset.pixReady === '1') return;
  box.dataset.pixReady = '1';

  box.innerHTML = `
    <h2>💲 DOLINHA VIA PIX</h2>
    <p style="font-size:12px">Escolha seu pacote. As dolinhas entram automaticamente após a confirmação do pagamento.</p>
    <div id="pixPackages">
      <div class="card"><b>10 💲 - R$ 5,00</b><button class="btn roxo" data-dolars="10">GERAR PIX</button></div>
      <div class="card"><b>50 💲 - R$ 20,00</b><button class="btn roxo" data-dolars="50">GERAR PIX</button></div>
      <div class="card"><b>100 💲 - R$ 35,00</b><button class="btn roxo" data-dolars="100">GERAR PIX</button></div>
      <div class="card"><b>500 💲 - R$ 150,00</b><button class="btn roxo" data-dolars="500">GERAR PIX</button></div>
    </div>
    <div id="pixPayment" style="display:none">
      <p id="pixStatus" style="font-weight:900"></p>
      <img id="pixQr" alt="QR Code Pix" style="display:none;width:220px;max-width:100%;margin:10px auto;background:#fff;padding:8px;border-radius:8px">
      <textarea id="pixCode" readonly rows="4" style="width:100%;box-sizing:border-box;padding:10px;border-radius:8px"></textarea>
      <button id="pixCopy" class="btn amarelo">COPIAR PIX</button>
      <button id="pixBack" class="btn branco">VOLTAR AOS PACOTES</button>
    </div>
    <button class="btn branco" id="pixClose">FECHAR</button>
  `;

  const packages = box.querySelector('#pixPackages');
  const payment = box.querySelector('#pixPayment');
  const statusEl = box.querySelector('#pixStatus');
  const qr = box.querySelector('#pixQr');
  const code = box.querySelector('#pixCode');
  let orderChannel = null;
  let pollTimer = null;
  let currentOrder = null;

  function stopTracking() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
    if (orderChannel) sb.removeChannel(orderChannel);
    orderChannel = null;
  }

  function showPackages() {
    stopTracking();
    currentOrder = null;
    payment.style.display = 'none';
    packages.style.display = 'block';
    statusEl.textContent = '';
    qr.style.display = 'none';
    code.value = '';
  }

  async function checkOrder() {
    if (!currentOrder) return;
    const { data, error } = await sb.from('pix_orders')
      .select('status')
      .eq('id', currentOrder)
      .maybeSingle();
    if (error) {
      console.error('PIX: erro ao consultar pedido:', error);
      return;
    }
    if (data?.status === 'approved') {
      stopTracking();
      statusEl.textContent = '✅ PAGAMENTO CONFIRMADO! Suas dolinhas foram creditadas.';
      statusEl.style.color = '#16803c';
      setTimeout(() => {
        if (typeof window.check === 'function') window.check();
      }, 500);
    } else if (data?.status === 'rejected' || data?.status === 'cancelled') {
      stopTracking();
      statusEl.textContent = 'Pagamento não aprovado. Gere um novo Pix.';
      statusEl.style.color = '#b42318';
    }
  }

  async function createPix(dolars, button) {
    const original = button.textContent;
    button.disabled = true;
    button.textContent = 'GERANDO...';
    try {
      const { data: sessionData, error: sessionError } = await sb.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (sessionError || !token) throw new Error('Entre na sua conta para comprar dolinhas.');

      const { data, error } = await sb.functions.invoke('create-pix', {
        body: { dolars }
      });
      if (error) {
        let detail = data?.error;
        if (!detail) {
          try { detail = await error.context?.json?.().then(x => x.error); } catch (_) {}
        }
        throw new Error(detail || 'Não foi possível gerar a cobrança Pix.');
      }
      if (!data?.order_id || !data?.pix_copy_paste) {
        throw new Error(data?.error || 'O Mercado Pago não retornou o código Pix.');
      }

      currentOrder = data.order_id;
      packages.style.display = 'none';
      payment.style.display = 'block';
      statusEl.textContent = 'Aguardando pagamento de R$ ' + Number(data.amount_brl).toFixed(2).replace('.', ',');
      statusEl.style.color = '#111';
      code.value = data.pix_copy_paste;
      if (data.pix_qr_base64) {
        qr.src = 'data:image/png;base64,' + data.pix_qr_base64;
        qr.style.display = 'block';
      }

      orderChannel = sb.channel('pix-order-' + currentOrder)
        .on('postgres_changes', {
          event: 'UPDATE', schema: 'public', table: 'pix_orders',
          filter: 'id=eq.' + currentOrder
        }, payload => {
          if (payload.new?.status === 'approved') checkOrder();
        }).subscribe();

      pollTimer = setInterval(checkOrder, 4000);
      checkOrder();
    } catch (error) {
      alert(error.message || 'Erro ao gerar Pix.');
      console.error('PIX:', error);
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  }

  packages.querySelectorAll('[data-dolars]').forEach(button => {
    button.addEventListener('click', () => createPix(Number(button.dataset.dolars), button));
  });

  box.querySelector('#pixCopy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code.value);
      statusEl.textContent = '✅ Código Pix copiado. Abra o aplicativo do seu banco para pagar.';
      statusEl.style.color = '#16803c';
    } catch (_) {
      code.focus();
      code.select();
      document.execCommand('copy');
      statusEl.textContent = 'Código selecionado. Copie e pague no aplicativo do banco.';
    }
  });

  box.querySelector('#pixBack').addEventListener('click', showPackages);
  box.querySelector('#pixClose').addEventListener('click', () => {
    stopTracking();
    if (typeof window.closeAll === 'function') window.closeAll();
    else modal.style.display = 'none';
  });

  console.log('PIX: lojinha conectada à função create-pix.');
})();