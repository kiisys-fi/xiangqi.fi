(() => {
  'use strict';

  class OpeningBrowser {
    constructor(element, definition) {
      this.element = element;
      this.boardElement = this.requireElement('[data-role="board"]');
      this.previousButton = this.requireElement('[data-action="previous"]');
      this.nextButton = this.requireElement('[data-action="next"]');
      this.positionStatus = this.requireElement('[data-role="status"]');
      this.moveList = this.requireElement('[data-role="moves"]');
      this.lineSummary = this.requireElement('[data-role="line-summary"]');
      this.selectedContinuation = new WeakMap();
      this.currentNode = null;
      this.isAnimating = false;
      this.nextNodeId = 1;
      this.resizeObserver = null;

      const startFen = definition.start_fen || DEFAULT_START_FEN;
      this.root = {
        id: 'root',
        parent: null,
        ply: 0,
        fen: startFen,
        next: [],
      };
      this.prepareChildren(this.root, definition.next || []);
      this.renderNotation();
      this.bindControls();

      this.boardGui = new BoardGui({ elementId: this.boardElement.id });
      this.boardGui.disablePlayerMove();
      this.boardGui.addAfterDrawPositionsListener(() => {
        this.isAnimating = false;
        this.syncMovePanelHeight();
        this.updateControls();
      });
      this.showNode(this.root, false);
      this.bindPanelSizing();

      this.element.classList.add('is-initialized');
      this.element.setAttribute('aria-busy', 'false');
    }

    requireElement(selector) {
      const element = this.element.querySelector(selector);
      if (!element) {
        throw new Error(`Missing opening browser element: ${selector}`);
      }
      return element;
    }

    prepareChildren(parent, definitions) {
      parent.next = definitions.map((definition) => {
        if (!definition.uci) {
          throw new Error(`Missing UCI move after ply ${parent.ply}`);
        }

        const move = HalfMove.parseUci(definition.uci);
        const board = new Board();
        board.loadFen(parent.fen);
        if (!board.isLegalMove(move)) {
          throw new Error(`Illegal UCI move ${definition.uci} at ply ${parent.ply + 1}`);
        }

        const node = {
          id: `move-${this.nextNodeId++}`,
          parent,
          ply: parent.ply + 1,
          uci: definition.uci,
          wxf: translateMovesToWxf([move], '=', parent.fen)[0],
          name: definition.name || null,
          comment: definition.comment || null,
          next: [],
        };

        board.registerMove(move);
        node.fen = board.outputFen();
        this.prepareChildren(node, definition.next || []);
        return node;
      });
    }

    renderNotation() {
      this.moveList.replaceChildren();
      const line = this.getSelectedLine();
      const rows = new Map();

      line.forEach((node) => {
        const moveNumber = Math.ceil(node.ply / 2);
        let row = rows.get(moveNumber);
        if (!row) {
          row = document.createElement('div');
          row.className = 'opening-browser__move-row';

          const number = document.createElement('span');
          number.className = 'opening-browser__move-number';
          number.textContent = `${moveNumber}.`;
          row.appendChild(number);

          const redSlot = document.createElement('span');
          redSlot.className = 'opening-browser__move-slot';
          redSlot.dataset.color = 'red';
          row.appendChild(redSlot);

          const blackSlot = document.createElement('span');
          blackSlot.className = 'opening-browser__move-slot';
          blackSlot.dataset.color = 'black';
          row.appendChild(blackSlot);

          rows.set(moveNumber, row);
          this.moveList.appendChild(row);
        }

        const color = node.ply % 2 === 1 ? 'red' : 'black';
        row.querySelector(`[data-color="${color}"]`).appendChild(
          this.createMoveControl(node)
        );
      });

      this.moveItems = Array.from(
        this.element.querySelectorAll('.opening-browser__move')
      );
      const namedVariation = line.slice().reverse().find((node) => node.name);
      this.lineSummary.textContent = namedVariation ? namedVariation.name : '';
    }

    getSelectedLine() {
      const line = [];
      let parent = this.root;
      while (parent.next.length > 0) {
        const selected = this.selectedContinuation.get(parent)
          || parent.next[0];
        this.selectedContinuation.set(parent, selected);
        line.push(selected);
        parent = selected;
      }
      return line;
    }

    createMoveControl(node) {
      if (node.parent.next.length > 1) {
        return this.createBranchSelector(node);
      }

      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'opening-browser__move';
      item.dataset.nodeId = node.id;
      item.textContent = node.wxf;
      item.setAttribute('aria-label', `Siirto ${node.wxf}`);
      item.addEventListener('click', () => {
        if (!this.isAnimating) {
          this.selectedContinuation.set(node.parent, node);
          this.showNode(node);
        }
      });
      return item;
    }

    createBranchSelector(node) {
      const wrapper = document.createElement('span');
      wrapper.className = 'opening-browser__branch-control';

      const icon = document.createElement('i');
      icon.className = 'fas fa-code-branch';
      icon.setAttribute('aria-hidden', 'true');
      wrapper.appendChild(icon);

      const select = document.createElement('select');
      select.className = 'opening-browser__move opening-browser__branch-select';
      select.dataset.nodeId = node.id;
      select.setAttribute('aria-label', `Valitse jatko siirrolle ${Math.ceil(node.ply / 2)}`);

      node.parent.next.forEach((alternative, index) => {
        const option = document.createElement('option');
        option.value = alternative.id;
        option.textContent = alternative.name
          ? `${alternative.wxf} – ${alternative.name}`
          : `${alternative.wxf} · ${index + 1}/${node.parent.next.length}`;
        option.selected = alternative === node;
        select.appendChild(option);
      });

      select.addEventListener('change', () => {
        if (this.isAnimating) {
          select.value = this.selectedContinuation.get(node.parent).id;
          return;
        }
        const selected = node.parent.next.find(
          (alternative) => alternative.id === select.value
        );
        if (selected) {
          this.selectedContinuation.set(node.parent, selected);
          this.renderNotation();
          this.showNode(selected);
        }
      });
      wrapper.appendChild(select);
      return wrapper;
    }

    bindControls() {
      this.previousButton.addEventListener('click', () => {
        if (!this.isAnimating && this.currentNode.parent) {
          this.showNode(this.currentNode.parent);
        }
      });

      this.nextButton.addEventListener('click', () => {
        if (!this.isAnimating && this.currentNode.next.length > 0) {
          const next = this.selectedContinuation.get(this.currentNode)
            || this.currentNode.next[0];
          this.selectedContinuation.set(this.currentNode, next);
          this.showNode(next);
        }
      });
    }

    showNode(node, animate = true) {
      this.currentNode = node;
      this.isAnimating = animate;
      this.updateControls();
      this.boardGui.loadFen(node.fen, animate);
      if (!animate) {
        this.isAnimating = false;
        this.updateControls();
      }
    }

    bindPanelSizing() {
      this.syncMovePanelHeight();
      if ('ResizeObserver' in window) {
        this.resizeObserver = new ResizeObserver(() => this.syncMovePanelHeight());
        this.resizeObserver.observe(this.boardElement);
      } else {
        window.addEventListener('resize', () => this.syncMovePanelHeight());
      }
    }

    syncMovePanelHeight() {
      const boardHeight = this.boardElement.getBoundingClientRect().height;
      if (boardHeight > 0) {
        this.element.style.setProperty('--opening-board-height', `${boardHeight}px`);
      }
    }

    updateControls() {
      this.previousButton.disabled = this.isAnimating || this.currentNode === this.root;
      this.nextButton.disabled = this.isAnimating || this.currentNode.next.length === 0;
      this.positionStatus.textContent = this.currentNode === this.root
        ? 'Alkuasema'
        : `Siirto ${this.currentNode.ply} / ${this.getSelectedLine().length} · ${this.currentNode.wxf}`;

      this.moveItems.forEach((item) => {
        const isCurrent = item.dataset.nodeId === this.currentNode.id;
        item.classList.toggle('is-current', isCurrent);
        if (isCurrent) {
          item.setAttribute('aria-current', 'step');
        } else {
          item.removeAttribute('aria-current');
        }
      });

      const currentItem = this.element.querySelector(
        `.opening-browser__move[data-node-id="${this.currentNode.id}"]`
      );
      if (currentItem) {
        currentItem.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
    }
  }

  const instances = new WeakMap();
  const initialize = (element) => {
    if (instances.has(element)) {
      return instances.get(element);
    }

    try {
      const dataElement = element.querySelector('[data-role="definition"]');
      const definition = JSON.parse(dataElement.textContent);
      const instance = new OpeningBrowser(element, definition);
      instances.set(element, instance);
      return instance;
    } catch (error) {
      element.classList.add('has-error');
      element.setAttribute('aria-busy', 'false');
      const errorElement = element.querySelector('[data-role="error"]');
      if (errorElement) {
        errorElement.textContent = 'Avausta ei voitu ladata.';
      }
      console.error('Opening browser initialization failed:', error);
      return null;
    }
  };

  const boot = () => {
    const elements = Array.from(document.querySelectorAll('[data-opening-browser]'));
    let observer = null;

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            initialize(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '600px 0px' });
      elements.forEach((element) => observer.observe(element));
    } else {
      elements.forEach(initialize);
    }

    elements.forEach((element) => {
      const initializeElement = () => {
        initialize(element);
        if (observer) {
          observer.unobserve(element);
        }
      };
      element.addEventListener('focusin', initializeElement, { once: true });
      element.addEventListener('pointerenter', initializeElement, { once: true });
      element.addEventListener('pointerdown', initializeElement, { once: true });
    });

    window.addEventListener('beforeprint', () => {
      elements.forEach(initialize);
    });
  };

  window.OpeningBrowser = OpeningBrowser;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
