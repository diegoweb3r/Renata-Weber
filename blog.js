    document.getElementById('year').textContent = new Date().getFullYear();

    // ── Utilitários ──────────────────────────────────────
    function formatDate(str) {
      if (!str) return '';
      const d = new Date(str);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    function parseFrontmatter(raw) {
      // Simple frontmatter parser (---\nkey: val\n---\nbody)
      const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!match) return { data: {}, content: raw };
      const data = {};
      match[1].split('\n').forEach(line => {
        const [k, ...v] = line.split(':');
        if (k) data[k.trim()] = v.join(':').trim().replace(/^["']|["']$/g, '');
      });
      return { data, content: match[2] };
    }

    // ── Renderiza um post no modal ────────────────────────
    function openPost(post) {
      const overlay = document.getElementById('post-overlay');
      const content = document.getElementById('post-content');
      content.innerHTML = `
        <div class="post-meta">${formatDate(post.date)}</div>
        <h1>${post.title}</h1>
        ${post.thumbnail ? `<img class="cover" src="${post.thumbnail}" alt="${post.title}" />` : ''}
        <div class="post-body">${marked.parse(post.body || '')}</div>
      `;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    document.getElementById('close-btn').addEventListener('click', () => {
      document.getElementById('post-overlay').classList.remove('open');
      document.body.style.overflow = '';
    });

    document.getElementById('post-overlay').addEventListener('click', e => {
      if (e.target === document.getElementById('post-overlay')) {
        document.getElementById('post-overlay').classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    // ── Carrega lista de posts via manifest.json ──────────
    async function loadPosts() {
      let posts = [];
      try {
        const res = await fetch('_posts/manifest.json');
        if (!res.ok) throw new Error('no manifest');
        const files = await res.json(); // array de filenames, ex: ["2024-01-15-meu-post.md"]

        posts = await Promise.all(files.map(async fname => {
          const r = await fetch(`_posts/${fname}`);
          const raw = await r.text();
          const { data, content } = parseFrontmatter(raw);
          return { ...data, body: content, slug: fname };
        }));

        // Ordena do mais recente para o mais antigo
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      } catch {
        // Sem manifest → mantém empty state
        return;
      }

      if (!posts.length) return;

      const grid = document.getElementById('blog-grid');
      grid.innerHTML = posts.map((post, i) => `
        <article class="post-card" data-index="${i}">
          ${post.thumbnail
            ? `<img class="cover" src="${post.thumbnail}" alt="${post.title}" loading="lazy" />`
            : `<div class="cover-placeholder">Renata Weber</div>`
          }
          <span class="meta">${formatDate(post.date)}</span>
          <h2>${post.title}</h2>
          ${post.excerpt ? `<p class="excerpt">${post.excerpt}</p>` : ''}
          <a class="read-more" href="#" data-index="${i}">Ler texto</a>
        </article>
      `).join('');

      // Eventos de clique
      grid.querySelectorAll('[data-index]').forEach(el => {
        el.addEventListener('click', e => {
          e.preventDefault();
          const idx = parseInt(el.closest('[data-index]')?.dataset.index ?? el.dataset.index);
          openPost(posts[idx]);
        });
      });
    }

    loadPosts();
