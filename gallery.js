function initGallery(galleryId, lightboxId, jsonFile) {
  const galleryElement = document.getElementById(galleryId);
  const lightbox = document.getElementById(lightboxId);
  let lightboxMedia = lightbox.querySelector('.lightbox-img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.close-btn');
  const prevBtn = lightbox.querySelector('.nav-prev');
  const nextBtn = lightbox.querySelector('.nav-next');

  let mediaItems = [];
  let currentIndex = 0;

  function pad(num) { return num.toString().padStart(2, '0'); }

  function formatDate(dateObj) {
    if (!dateObj) return '[No Date]';
    return `${dateObj.year}:${pad(dateObj.month)}:${pad(dateObj.day)} ${pad(dateObj.hour)}:${pad(dateObj.minute)}:${pad(dateObj.second)}`;
  }

  function getFolderFromJSON(filename) {
    switch (filename) {
      case 'repairs.json':
        return 'Repairs';
      case '2020-03-16_Cardboard-Packaging.json':
        return '2020-03-16_Cardboard-Packaging';
      case '2022-06-11_CampusPack.json':
        return 'Campus';
      default:
        return '';
    }
  }

  function openLightbox(index) {
    currentIndex = index;
    const item = mediaItems[currentIndex];
    lightbox.style.display = 'flex';

    if (lightboxMedia) lightboxMedia.remove();

    if (item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.src;
      img.className = 'lightbox-img';
      lightbox.insertBefore(img, lightboxCaption);
      lightboxMedia = img;
    } else if (item.type === 'video') {
      const video = document.createElement('video');
      video.src = item.src;
      video.controls = true;
      video.autoplay = false;
      video.style.maxWidth = '90%';
      video.style.maxHeight = '80%';
      video.className = 'lightbox-img';
      lightbox.insertBefore(video, lightboxCaption);
      lightboxMedia = video;
    }

    lightboxCaption.textContent = `${item.file} [${formatDate(item.dateTaken)}]`;
  }

  function buildGallery() {
    mediaItems.forEach((item, index) => {
      const container = document.createElement('div');
      container.classList.add('image-item');

      let thumb;
      if (item.type === 'image') {
        thumb = document.createElement('img');
        thumb.src = item.src;
      } else if (item.type === 'video') {
        thumb = document.createElement('video');
        thumb.src = item.src;
        thumb.controls = false;
        thumb.muted = true;
        thumb.autoplay = false;
        thumb.loop = true;
        thumb.style.width = '200px';
        thumb.style.height = 'auto';
        thumb.style.objectFit = 'cover';
        thumb.style.cursor = 'pointer';
        thumb.poster = `${item.src.replace(/\.[^.]+$/, '.jpg')}`;
      }

      thumb.alt = item.file;
      thumb.addEventListener('click', () => openLightbox(index));

      const caption = document.createElement('div');
      caption.classList.add('caption');
      caption.textContent = `${item.file} [${formatDate(item.dateTaken)}]`;

      container.appendChild(thumb);
      container.appendChild(caption);
      galleryElement.appendChild(container);
    });
  }

  fetch(`./${jsonFile}`)
    .then(res => res.json())
    .then(data => {
      const folder = getFolderFromJSON(jsonFile);

      mediaItems = data.map(item => {
        const ext = item.file.split('.').pop().toLowerCase();
        return {
          ...item,
          type: ['jpg','jpeg','png','gif'].includes(ext) ? 'image' : 'video',
          src: folder ? `./${folder}/${item.file}` : `./${item.file}`
        };
      });

      mediaItems.sort((a, b) => {
        const timeA = a.dateTaken ? new Date(a.dateTaken.year, a.dateTaken.month-1, a.dateTaken.day, a.dateTaken.hour, a.dateTaken.minute, a.dateTaken.second).getTime() : 0;
        const timeB = b.dateTaken ? new Date(b.dateTaken.year, b.dateTaken.month-1, b.dateTaken.day, b.dateTaken.hour, b.dateTaken.minute, b.dateTaken.second).getTime() : 0;
        return timeB - timeA;
      });

      buildGallery();
    })
    .catch(err => console.error('Error loading JSON:', err));

  // Lightbox controls
  closeBtn.addEventListener('click', () => { lightbox.style.display = 'none'; });
  prevBtn.addEventListener('click', () => { openLightbox((currentIndex - 1 + mediaItems.length) % mediaItems.length); });
  nextBtn.addEventListener('click', () => { openLightbox((currentIndex + 1) % mediaItems.length); });
  lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.style.display = 'none'; });
  document.addEventListener('keydown', e => {
    if (lightbox.style.display === 'flex') {
      if (e.key === 'ArrowLeft') openLightbox((currentIndex - 1 + mediaItems.length) % mediaItems.length);
      else if (e.key === 'ArrowRight') openLightbox((currentIndex + 1) % mediaItems.length);
      else if (e.key === 'Escape') lightbox.style.display = 'none';
    }
  });
}

// Initialize all galleries
initGallery('repairs-gallery', 'repairs-lightbox', 'repairs.json');
initGallery('cardboard-gallery', 'cardboard-lightbox', '2020-03-16_Cardboard-Packaging.json');
initGallery('campus-gallery', 'campus-lightbox', '2022-06-11_CampusPack.json');
