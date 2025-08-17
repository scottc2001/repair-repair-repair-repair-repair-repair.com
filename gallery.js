function initGallery(galleryId, lightboxId, jsonFile) {
  const galleryElement = document.getElementById(galleryId);
  const lightbox = document.getElementById(lightboxId);
  const lightboxContent = document.createElement('div');
  lightboxContent.className = 'lightbox-content';
  lightbox.innerHTML = ''; // Clear any existing content
  lightbox.appendChild(lightboxContent);

  const closeBtn = document.createElement('span');
  closeBtn.className = 'close-btn';
  closeBtn.innerHTML = '&times;';
  lightboxContent.appendChild(closeBtn);

  const lightboxMedia = document.createElement('img');
  lightboxMedia.className = 'lightbox-img';
  lightboxContent.appendChild(lightboxMedia);

  const lightboxVideo = document.createElement('video');
  lightboxVideo.className = 'lightbox-video';
  lightboxVideo.controls = true;
  lightboxVideo.style.display = 'none';
  lightboxContent.appendChild(lightboxVideo);

  const lightboxCaption = document.createElement('span');
  lightboxCaption.className = 'lightbox-caption';
  lightboxContent.appendChild(lightboxCaption);

  const prevBtn = document.createElement('span');
  prevBtn.className = 'nav-prev';
  prevBtn.innerHTML = '&#10094;';
  lightboxContent.appendChild(prevBtn);

  const nextBtn = document.createElement('span');
  nextBtn.className = 'nav-next';
  nextBtn.innerHTML = '&#10095;';
  lightboxContent.appendChild(nextBtn);

  let mediaItems = [];
  let currentIndex = 0;

  function pad(num) { return num.toString().padStart(2, '0'); }
  function formatDate(dateObj) {
    if (!dateObj) return '[No Date]';
    return `${dateObj.year}:${pad(dateObj.month)}:${pad(dateObj.day)} ${pad(dateObj.hour)}:${pad(dateObj.minute)}:${pad(dateObj.second)}`;
  }

  function openLightbox(index) {
    currentIndex = index;
    const item = mediaItems[currentIndex];
    lightbox.style.display = 'flex';

    if (item.type === 'image') {
      lightboxMedia.src = item.src;
      lightboxMedia.style.display = 'block';
      lightboxVideo.style.display = 'none';
    } else {
      lightboxVideo.src = item.src;
      lightboxVideo.style.display = 'block';
      lightboxMedia.style.display = 'none';
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
      } else {
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
        thumb.poster = item.src.replace(/\.[^.]+$/, '.jpg');
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

  fetch(jsonFile)
    .then(res => res.json())
    .then(data => {
      mediaItems = data.map(item => {
        const ext = item.file.split('.').pop().toLowerCase();
        return {
          ...item,
          type: ['jpg','jpeg','png','gif'].includes(ext) ? 'image' : 'video',
          src: `${jsonFile.replace('.json','')}/${item.file}`
        };
      });

      mediaItems.sort((a,b) => {
        const timeA = a.dateTaken ? new Date(a.dateTaken.year,a.dateTaken.month-1,a.dateTaken.day,a.dateTaken.hour,a.dateTaken.minute,a.dateTaken.second).getTime() : 0;
        const timeB = b.dateTaken ? new Date(b.dateTaken.year,b.dateTaken.month-1,b.dateTaken.day,b.dateTaken.hour,b.dateTaken.minute,b.dateTaken.second).getTime() : 0;
        return timeB - timeA;
      });

      buildGallery();
    })
    .catch(err => console.error('Error loading JSON:', err));

  // Close lightbox when clicking outside content
  lightbox.addEventListener('click', e => {
    if(e.target === lightbox) lightbox.style.display = 'none';
  });

  closeBtn.addEventListener('click', () => { lightbox.style.display='none'; });
  prevBtn.addEventListener('click', () => { openLightbox((currentIndex-1+mediaItems.length)%mediaItems.length); });
  nextBtn.addEventListener('click', () => { openLightbox((currentIndex+1)%mediaItems.length); });

  document.addEventListener('keydown', e => {
    if(lightbox.style.display==='flex'){
      if(e.key==='ArrowLeft') openLightbox((currentIndex-1+mediaItems.length)%mediaItems.length);
      else if(e.key==='ArrowRight') openLightbox((currentIndex+1)%mediaItems.length);
      else if(e.key==='Escape') lightbox.style.display='none';
    }
  });
}

// Example usage
initGallery('repairs-gallery','repairs-lightbox','repairs.json');
initGallery('cardboard-gallery','cardboard-lightbox','2020-03-16_Cardboard-Packaging.json');
initGallery('campus-gallery','campus-lightbox','2022-06-11_CampusPack.json');
