(() => {
  const imageInput = document.getElementById("imageInput");
  const sizeSelect = document.getElementById("sizeSelect");
  const hintMode = document.getElementById("hintMode");
  const createBtn = document.getElementById("createBtn");
  const imagePreviewWrap = document.getElementById("imagePreviewWrap");
  const imagePreview = document.getElementById("imagePreview");
  const fileName = document.getElementById("fileName");

  const gameSection = document.getElementById("gameSection");
  const originalPreview = document.getElementById("originalPreview");
  const board = document.getElementById("board");
  const tray = document.getElementById("tray");
  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");
  const message = document.getElementById("message");
  const hintOverlay = document.getElementById("hintOverlay");

  const restartBtn = document.getElementById("restartBtn");
  const hintBtn = document.getElementById("hintBtn");
  const newImageBtn = document.getElementById("newImageBtn");

  const winModal = document.getElementById("winModal");
  const winImage = document.getElementById("winImage");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const anotherImageBtn = document.getElementById("anotherImageBtn");

  let imageData = "";
  let imageAspect = 1;
  let gridSize = 3;
  let selectedPiece = null;
  let placed = 0;
  let dragging = null;

  imageInput.addEventListener("change", handleImage);

  function handleImage() {
    const file = imageInput.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      message.textContent = "צריך לבחור קובץ תמונה.";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      imageData = reader.result;

      const img = new Image();
      img.onload = () => {
        imageAspect = img.naturalWidth / img.naturalHeight || 1;
        imagePreview.src = imageData;
        originalPreview.src = imageData;
        winImage.src = imageData;
        fileName.textContent = file.name;
        imagePreviewWrap.classList.remove("hidden");
        createBtn.disabled = false;
        message.textContent = "התמונה מוכנה. בחרי רמה ולחצי 'צרי פאזל'.";
      };
      img.src = imageData;
    };
    reader.readAsDataURL(file);
  }

  createBtn.addEventListener("click", () => {
    if (!imageData) return;
    gridSize = Number(sizeSelect.value);
    gameSection.classList.remove("hidden");
    buildGame();
    gameSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function buildGame() {
    placed = 0;
    selectedPiece = null;
    dragging = null;
    tray.innerHTML = "";
    board.innerHTML = "";
    winModal.classList.add("hidden");

    const total = gridSize * gridSize;

    // Fit the uploaded picture without cropping it.
    board.style.aspectRatio = `${imageAspect}`;
    board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
    board.style.backgroundImage = hintMode.value === "faint"
      ? `linear-gradient(rgba(255,255,255,.78), rgba(255,255,255,.78)), url("${imageData}")`
      : "none";
    board.style.backgroundSize = "100% 100%";

    // Hint overlay matches board exactly.
    hintOverlay.style.backgroundImage = `url("${imageData}")`;
    syncHintOverlay();

    for (let i = 0; i < total; i++) {
      const slot = document.createElement("div");
      slot.className = "slot";
      slot.dataset.index = i;
      slot.addEventListener("click", () => {
        if (selectedPiece) tryPlace(selectedPiece, slot);
      });

      // Native desktop mouse drag/drop.
      slot.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        slot.classList.add("drop-ready");
      });

      slot.addEventListener("dragleave", () => {
        slot.classList.remove("drop-ready");
      });

      slot.addEventListener("drop", (e) => {
        e.preventDefault();
        slot.classList.remove("drop-ready");

        const index = Number(e.dataTransfer.getData("text/plain"));
        const piece = [...tray.querySelectorAll(".piece")]
          .find(p => Number(p.dataset.index) === index);

        if (piece) {
          tryPlace(piece, slot);
        }
      });

      board.appendChild(slot);
    }

    shuffle([...Array(total).keys()]).forEach(i => tray.appendChild(makePiece(i)));

    updateProgress();
    message.textContent = "גררי כל חלק למקום המתאים 😊";
  }

  function syncHintOverlay() {
    requestAnimationFrame(() => {
      const r = board.getBoundingClientRect();
      const parent = board.parentElement.getBoundingClientRect();
      hintOverlay.style.left = `${r.left - parent.left}px`;
      hintOverlay.style.top = `${r.top - parent.top}px`;
      hintOverlay.style.width = `${r.width}px`;
      hintOverlay.style.height = `${r.height}px`;
      hintOverlay.style.borderRadius = "18px";
    });
  }

  window.addEventListener("resize", syncHintOverlay);

  function makePiece(index) {
    const piece = document.createElement("div");
    piece.className = "piece";
    piece.dataset.index = index;
    piece.setAttribute("role", "button");
    piece.setAttribute("tabindex", "0");
    piece.setAttribute("aria-label", `חלק ${index + 1}`);
    piece.draggable = true;

    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    piece.style.backgroundImage = `url("${imageData}")`;
    piece.style.backgroundSize = `${gridSize * 100}% ${gridSize * 100}%`;
    piece.style.backgroundPosition = getBgPosition(col, row);

    piece.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!piece.parentElement?.classList.contains("slot")) {
        selectPiece(piece);
      }
    });

    piece.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectPiece(piece);
      }
    });

    // Desktop mouse: use the browser's native drag/drop.
    piece.addEventListener("dragstart", (e) => {
      if (piece.parentElement?.classList.contains("slot")) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
      piece.classList.add("dragging");
      selectedPiece = piece;
    });

    piece.addEventListener("dragend", () => {
      piece.classList.remove("dragging");
    });

    // Touch / pen: use pointer dragging.
    piece.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") {
        startDrag(e);
      }
    });

    return piece;
  }

  function getBgPosition(col, row) {
    const x = gridSize === 1 ? 0 : (col / (gridSize - 1)) * 100;
    const y = gridSize === 1 ? 0 : (row / (gridSize - 1)) * 100;
    return `${x}% ${y}%`;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function selectPiece(piece) {
    if (!piece || piece.parentElement?.classList.contains("slot")) return;
    if (selectedPiece) selectedPiece.classList.remove("selected");
    selectedPiece = piece;
    selectedPiece.classList.add("selected");
    message.textContent = "עכשיו בחרי את המקום המתאים בלוח.";
  }

  function tryPlace(piece, slot) {
    if (!piece || !slot || slot.children.length) return false;

    const pieceIndex = Number(piece.dataset.index);
    const slotIndex = Number(slot.dataset.index);

    if (pieceIndex === slotIndex) {
      piece.classList.remove("selected");
      slot.appendChild(piece);
      placed += 1;
      selectedPiece = null;
      playTone(660, .08);
      updateProgress();
      message.textContent = "נכון! ⭐";

      if (placed === gridSize * gridSize) {
        setTimeout(() => {
          playSuccess();
          winModal.classList.remove("hidden");
        }, 300);
      }
      return true;
    }

    slot.classList.add("target-flash");
    setTimeout(() => slot.classList.remove("target-flash"), 760);
    playTone(220, .06);
    message.textContent = "כמעט! נסי מקום אחר 💗";
    return false;
  }

  function updateProgress() {
    const total = gridSize * gridSize;
    progressText.textContent = `${placed}/${total}`;
    progressBar.style.width = `${placed / total * 100}%`;
  }

  function showHint() {
    hintOverlay.classList.add("show");
    message.textContent = "רמז קטן 👀";
    setTimeout(() => hintOverlay.classList.remove("show"), 1500);
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
    window.addEventListener("pointermove", onDragMove, { passive: false });
    window.addEventListener("pointerup", endDrag, { once: true });
    window.addEventListener("pointercancel", endDrag, { once: true });
  }

  function moveGhost(x, y) {
    if (!dragging) return;
    dragging.ghost.style.left = `${x - dragging.offsetX}px`;
    dragging.ghost.style.top = `${y - dragging.offsetY}px`;
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

  function resetToUpload() {
    winModal.classList.add("hidden");
    gameSection.classList.add("hidden");
    imageInput.value = "";
    imageData = "";
    createBtn.disabled = true;
    imagePreviewWrap.classList.add("hidden");
    message.textContent = "בחרי ציור חדש כדי להתחיל.";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function playTone(freq = 440, duration = .08) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
      osc.onended = () => ctx.close();
    } catch (_) {}
  }

  function playSuccess() {
    playTone(523, .09);
    setTimeout(() => playTone(659, .09), 100);
    setTimeout(() => playTone(784, .15), 200);
  }

  restartBtn.addEventListener("click", buildGame);
  hintBtn.addEventListener("click", showHint);
  newImageBtn.addEventListener("click", resetToUpload);
  playAgainBtn.addEventListener("click", buildGame);
  anotherImageBtn.addEventListener("click", resetToUpload);
})();
