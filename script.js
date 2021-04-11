const photobooth = (() => {
  const WIDTH = 960;
  const HEIGHT = 720;
  /**
   * Actions
   */
   const takePhoto = (id) => {
    const camera = getElementById(`${id}_camera`);
    const output = getElementById(`${id}_output`);

    if (WIDTH && HEIGHT) {
      const context = output.getContext('2d');
      output.width = WIDTH / 3;// 320
      output.height = HEIGHT / 3;// 240
      context.drawImage(camera, 0, 0, WIDTH / 3, HEIGHT / 3);

      const resultCanvas = document.createElement('canvas');
      resultCanvas.style.display = 'none';
      resultCanvas.width = WIDTH;
      resultCanvas.height = HEIGHT;
      resultCanvas.id = `${id}_result`;
      document.body.appendChild(resultCanvas)
      const rcContext = resultCanvas.getContext('2d');
      rcContext.drawImage(camera, 0, 0, WIDTH, HEIGHT);

      output.setAttribute(
        'class',
        'photobooth__output photobooth__output--display'
      );

      displayElementsAs(id, ['take'], 'none');
      displayElementsAs(id, ['retake', 'save'], 'inline-block');
    } else {
      clearCanvas();
    }
  }

  const savePhoto = (id) => {
    const output = getElementById(`${id}_result`);
    const select = getElementById(`${id}_select`);
    const photoURL = output.toDataURL('image/png');

    if (photoURL) {
      displayElementsAs(id, ['spinner'], 'inline-block');
      jQuery(document).ready(() => {
        jQuery.ajax({
          method: 'POST',
          url: AjaxObject.url,
          data: {
            photo: photoURL,
            type: select.value,
            action: 'save_photo',
          }
        }).success(() => {
          displayElementsAs(id, ['spinner'], 'none');
          onSuccess(id);
        }).fail((error) => {
          displayElementsAs(id, ['spinner'], 'none');
          setInfo(id, 'An error occurred please try again later.');
          console.error(`An error occurred: ${error}`);
        });
      });
    }
  }

  const onSuccess = (id) => {
    const output = getElementById(`${id}_output`);
    const result = getElementById(`${id}_result`);

    let context = output.getContext('2d');
    context.fillStyle = '#AAA';
    result.remove();

    displayElementsAs(id, ['save'], 'none');
    setInfo(id, 'Your photo has been sucessfully saved!');
  }

  const getOverlay = (id, overlays, type) => {
    displayElementsAs(id, ['spinner'], 'inline-block');
    jQuery(document).ready(() => {
      jQuery.ajax({
        method: 'GET',
        url: AjaxObject.url,
        data: {
          type: type,
          action: 'get_photo',
        }
      }).success((data) => {
        const select = getElementById(`${id}_select`);
        const overlay = getElementById(`${id}_overlay`);
        clearCanvas(id);
        overlay.src = !!data ? data : overlays[select.selectedIndex];
        displayElementsAs(id, ['retake', 'save', 'spinner'], 'none');
        displayElementsAs(id, ['take'], 'inline-block');
      }).fail((error) => {
        displayElementsAs(id, ['spinner'], 'none');
        console.error(`An error occurred: ${error}`);
      });
    });
  }

  /**
   * Utils
   */
  const getElementById = (elementId) => document.getElementById(elementId);

  const setInfo = (id, message) => {
    const infoElement = getElementById(`${id}_info`);
    const span = document.createElement('span');
    span.innerText = message;
    infoElement.innerText ='';
    infoElement.appendChild(span);
  }

  const displayElementsAs = (id, elements, value) => {
    elements.forEach((element) => {
      const item = getElementById(`${id}_${element}`);
      item.style.display = value;
    })
  }

  const clearCanvas = (id) => {
    const output = getElementById(`${id}_output`);
    const result = getElementById(`${id}_result`);

    if (result) {
      result.remove();
    }

    let context = output.getContext('2d');
    context.fillStyle = '#AAA';
    context.fillRect(0, 0, output.width, output.height);
    output.setAttribute(
      'class',
      'photobooth__output photobooth__output--hidden'
    );
  }

  const initCamera = (id) => {
    let streaming = false; // |streaming| indicates whether or not we're currently streaming
    const config = { video: { width: WIDTH, height: HEIGHT, facingMode: "user" }, audio: false }
    const camera = getElementById(`${id}_camera`);

    navigator.mediaDevices.getUserMedia(config).then((stream) => {
        camera.srcObject = stream;
        camera.pause();
        camera.play();
    }).catch((error) => {
      setInfo(id, 'An error occurred. You must allow your browser to access your camera and you need to refresh the page.');
      displayElementsAs(id, ['select', 'take', 'retake', 'save', 'output', 'spinner'], 'none');
      console.error(`An error occurred: ${error}`);
    });

    camera.addEventListener('canplay', (_event) => {
      if (!streaming) {
        camera.setAttribute('width', WIDTH);
        camera.setAttribute('height', HEIGHT);
        streaming = true;
      }
    }, false);
  }

  const initEventListeners = (id, overlays) => {
    const takeButton = getElementById(`${id}_take`);
    const retakeButton = getElementById(`${id}_retake`);
    const saveButton = getElementById(`${id}_save`);
    const select = getElementById(`${id}_select`);

    takeButton.addEventListener('click', (event) => {
      takePhoto(id);
      event.preventDefault();
    }, false);

    retakeButton.addEventListener('click', (event) => {
      setInfo(id, '');
      clearCanvas(id);
      displayElementsAs(id, ['retake', 'save', 'spinner'], 'none');
      displayElementsAs(id, ['take'], 'inline-block');
      event.preventDefault();
    }, false);

    saveButton.addEventListener('click', (event) => {
      savePhoto(id);
      event.preventDefault();
    }, false);

    select.addEventListener('change', (event) => {
      getOverlay(id, overlays, event.currentTarget.value);
      event.preventDefault();
    }, false);
  }

  return {
    initialize: (id, userId, overlays) => {
      if (userId === '0') {
        setInfo(id, 'You need to be logged in to use this feature.');
        return displayElementsAs(id, ['select', 'take', 'retake', 'save', 'camera', 'output', 'overlay', 'spinner'], 'none');
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        initCamera(id);
        initEventListeners(id, overlays);
        displayElementsAs(id, ['retake', 'save', 'spinner'], 'none');
        clearCanvas(id);
      } else {
        displayElementsAs(id, ['select', 'take', 'retake', 'save', 'camera', 'output', 'overlay', 'spinner'], 'none');
        setInfo(id, 'Oops! Your browser do not support the camera. Please try via your desktop or a browser supporting the camera.');
      }
    }
  };
})();
