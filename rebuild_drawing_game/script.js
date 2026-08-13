(() => {
  const SIZE = 3;
  const TOTAL = SIZE * SIZE;

  const board = document.getElementById("board");
  const tray = document.getElementById("tray");
  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");
  const message = document.getElementById("message");
  const hintOverlay = document.getElementById("hintOverlay");
  const winModal = document.getElementById("winModal");

  const shuffleBtn = document.getElementById("shuffleBtn");
  const hintBtn = document.getElementById("hintBtn");
  const checkBtn = document.getElementById("checkBtn");
  const playAgainBtn = document.getElementById("playAgainBtn");

  let selectedPiece = null;
  let placed = 0;
  let dragging = null;

  function positionFor(index) {
    const row = Math.floor(index / SIZE);
    const col = index % SIZE;
    return `${col * 50}% ${row * 50}%`;
  }

  function makePiece(index) {
    const piece = document.createElement("div");
    piece.className = "piece";
    piece.dataset.index = index;
    piece.setAttribute("role", "button");
    piece.setAttribute("tabindex", "0");
    piece.setAttribute("aria-label", `חלק ${index + 1}`);
    piece.style.backgroundPosition = positionFor(index);

    piece.addEventListener("click", (e) => {
      e.stopPropagation();
      selectPiece(piece);
    });

    piece.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectPiece(piece);
      }
    });

    piece.addEventListener("pointerdown", startDrag);
    return piece;
  }

  function createBoard() {
    board.innerHTML = "";
    for (let i = 0; i < TOTAL; i++) {
      const slot = document.createElement("div");
      slot.className = "slot";
      slot.dataset.index = i;
      slot.style.backgroundPosition = positionFor(i);

      slot.addEventListener("click", () => {
        if (selectedPiece) tryPlace(selectedPiece, slot);
      });

      board.appendChild(slot);
    }
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function startGame() {
    placed = 0;
    selectedPiece = null;
    dragging = null;
    tray.innerHTML = "";
    createBoard();
    winModal.classList.add("hidden");
    message.textContent = "בחרי חלק והניחי אותו במקום הנכון 😊";

    const order = shuffleArray([...Array(TOTAL).keys()]);
    order.forEach(i => tray.appendChild(makePiece(i)));

    updateProgress();
  }

  function selectPiece(piece) {
    if (!piece || piece.parentElement?.classList.contains("slot")) return;

    if (selectedPiece) selectedPiece.classList.remove("selected");
    selectedPiece = piece;
    piece.classList.add("selected");
    message.textContent = "עכשיו בחרי את המקום המתאים בלוח.";
  }

  function tryPlace(piece, slot) {
    if (!piece || !slot || slot.classList.contains("correct")) return false;

    const pieceIndex = Number(piece.dataset.index);
    const slotIndex = Number(slot.dataset.index);

    if (pieceIndex === slotIndex) {
      piece.classList.remove("selected");
      slot.innerHTML = "";
      slot.appendChild(piece);
      slot.classList.add("correct");
      piece.style.backgroundPosition = positionFor(pieceIndex);
      placed += 1;
      selectedPiece = null;
      playTone(660, 0.08);
      message.textContent = "נכון! ⭐";
      updateProgress();

      if (placed === TOTAL) {
        setTimeout(() => {
          playSuccess();
          winModal.classList.remove("hidden");
        }, 300);
      }
      return true;
    } else {
      slot.classList.add("target-flash");
      setTimeout(() => slot.classList.remove("target-flash"), 780);
      playTone(220, 0.06);
      message.textContent = "כמעט! נסי מקום אחר 💗";
      return false;
    }
  }

  function updateProgress() {
    progressText.textContent = `${placed}/${TOTAL}`;
    progressBar.style.width = `${(placed / TOTAL) * 100}%`;
  }

  function showHint() {
    hintOverlay.classList.add("show");
    message.textContent = "הנה רמז קטן 👀";
    setTimeout(() => hintOverlay.classList.remove("show"), 1500);
  }

  function checkGame() {
    if (placed === TOTAL) {
      message.textContent = "מושלם! סיימת את הציור 🎉";
      winModal.classList.remove("hidden");
      return;
    }
    const remaining = TOTAL - placed;
    message.textContent = `מעולה! נשארו עוד ${remaining} חלקים.`;
  }

  function startDrag(e) {
    const piece = e.currentTarget;
    if (piece.parentElement?.classList.contains("slot")) return;

    e.preventDefault();
    selectPiece(piece);

    const rect = piece.getBoundingClientRect();
    const ghost = piece.cloneNode(true);
    ghost.classList.add("drag-ghost");
    ghost.classList.remove("selected");
    ghost.style.width = rect.width + "px";
    ghost.style.height = rect.height + "px";
    document.body.appendChild(ghost);

    dragging = {
      piece,
      ghost,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    };

    moveGhost(e.clientX, e.clientY);
    piece.setPointerCapture?.(e.pointerId);

    window.addEventListener("pointermove", onDragMove, { passive: false });
    window.addEventListener("pointerup", endDrag, { once: true });
    window.addEventListener("pointercancel", endDrag, { once: true });
  }

  function moveGhost(x, y) {
    if (!dragging) return;
    dragging.ghost.style.left = (x - dragging.offsetX) + "px";
    dragging.ghost.style.top = (y - dragging.offsetY) + "px";
  }

  function onDragMove(e) {
    if (!dragging) return;
    e.preventDefault();
    moveGhost(e.clientX, e.clientY);
  }

  function endDrag(e) {
    window.removeEventListener("pointermove", onDragMove);
    if (!dragging) return;

    const { piece, ghost } = dragging;
    ghost.remove();

    const target = document.elementFromPoint(e.clientX, e.clientY);
    const slot = target?.closest?.(".slot");
    if (slot) tryPlace(piece, slot);

    dragging = null;
  }

  function playTone(freq = 440, duration = 0.08) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
      osc.onended = () => ctx.close();
    } catch (_) {}
  }

  function playSuccess() {
    playTone(523, .09);
    setTimeout(() => playTone(659, .09), 100);
    setTimeout(() => playTone(784, .16), 200);
  }

  shuffleBtn.addEventListener("click", startGame);
  hintBtn.addEventListener("click", showHint);
  checkBtn.addEventListener("click", checkGame);
  playAgainBtn.addEventListener("click", startGame);

  startGame();
})();
