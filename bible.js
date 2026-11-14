const CHAPTERS = {"Genesis":50,"Exodus":40,"Leviticus":27,"Numbers":36,"Deuteronomy":34,"Joshua":24,"Judges":21,"Ruth":4,"1 Samuel":31,"2 Samuel":24,"1 Kings":22,"2 Kings":25,"1 Chronicles":29,"2 Chronicles":36,"Ezra":10,"Nehemiah":13,"Esther":10,"Job":42,"Psalm":150,"Proverbs":31,"Ecclesiastes":12,"Song of Solomon":8,"Isaiah":66,"Jeremiah":52,"Lamentations":5,"Ezekiel":48,"Daniel":12,"Hosea":14,"Joel":3,"Amos":9,"Obadiah":1,"Jonah":4,"Micah":7,"Nahum":3,"Habakkuk":3,"Zephaniah":3,"Haggai":2,"Zechariah":14,"Malachi":4,"Matthew":28,"Mark":16,"Luke":24,"John":21,"Acts":28,"Romans":16,"1 Corinthians":16,"2 Corinthians":13,"Galatians":6,"Ephesians":6,"Philippians":4,"Colossians":4,"1 Thessalonians":5,"2 Thessalonians":3,"1 Timothy":6,"2 Timothy":4,"Titus":3,"Philemon":1,"Hebrews":13,"James":5,"1 Peter":5,"2 Peter":3,"1 John":5,"2 John":1,"3 John":1,"Jude":1,"Revelation":22};

const bookSelect = document.getElementById('book-select');
const chapterSelect = document.getElementById('chapter-select');
const textBox = document.getElementById('bible-text');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

function fillChapters() {
  chapterSelect.innerHTML = '';
  for (let i = 1; i <= CHAPTERS[bookSelect.value]; i++) chapterSelect.add(new Option('Chapter ' + i, i));
}

function updateNavButtons() {
  const first = bookSelect.selectedIndex === 0 && chapterSelect.selectedIndex === 0;
  const last = bookSelect.selectedIndex === bookSelect.options.length - 1 &&
               chapterSelect.selectedIndex === chapterSelect.options.length - 1;
  prevBtn.disabled = first;
  nextBtn.disabled = last;
}

async function loadChapter() {
  const book = bookSelect.value, chapter = chapterSelect.value;
  const key = `bible:${book}:${chapter}`;
  textBox.textContent = 'Loading…';
  updateNavButtons();
  try {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(key)); } catch (e) {}
    if (!data) {
      const res = await fetch(`https://bible-api.com/${encodeURIComponent(book)}+${chapter}`);
      if (!res.ok) throw new Error(res.status);
      data = await res.json();
      try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
    }
    textBox.textContent = '';
    const h = document.createElement('h2');
    h.textContent = data.reference;
    textBox.append(h);
    data.verses.forEach(v => {
      const n = document.createElement('span');
      n.className = 'verse-number';
      n.textContent = v.verse;
      textBox.append(n, v.text.trim() + ' ');
    });
    try { localStorage.setItem('bible:last', JSON.stringify({ book, chapter })); } catch (e) {}
  } catch (err) {
    textBox.textContent = 'This chapter could not be loaded. Check your internet connection and try again.';
  }
}

bookSelect.addEventListener('change', () => { fillChapters(); loadChapter(); });
chapterSelect.addEventListener('change', loadChapter);
prevBtn.addEventListener('click', () => {
  if (chapterSelect.selectedIndex > 0) chapterSelect.selectedIndex--;
  else if (bookSelect.selectedIndex > 0) {
    bookSelect.selectedIndex--; fillChapters();
    chapterSelect.selectedIndex = chapterSelect.options.length - 1;
  }
  loadChapter();
});
nextBtn.addEventListener('click', () => {
  if (chapterSelect.selectedIndex < chapterSelect.options.length - 1) chapterSelect.selectedIndex++;
  else if (bookSelect.selectedIndex < bookSelect.options.length - 1) {
    bookSelect.selectedIndex++; fillChapters();
  }
  loadChapter();
});

// Restore last place read (default: John 1)
let last = null;
try { last = JSON.parse(localStorage.getItem('bible:last')); } catch (e) {}
if (last && CHAPTERS[last.book]) bookSelect.value = last.book;
fillChapters();
if (last && last.chapter <= CHAPTERS[bookSelect.value]) chapterSelect.value = last.chapter;
loadChapter();
