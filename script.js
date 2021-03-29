const photobooth = (() => {
  // Fill the photo with an indication that none has been captured.
  const clearOutput = (id) => {
    const takeButton = document.getElementById(`${id}_take`);
    const retakeButton = document.getElementById(`${id}_retake`);
    const saveButton = document.getElementById(`${id}_save`);
    const output = document.getElementById(`${id}_output`);
    const result = document.getElementById(`${id}_result`);

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

    takeButton.style.display = 'inline-block';
    retakeButton.style.display = 'none';
    saveButton.style.display = 'none';
  }

  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.
  const takePhoto = (id, width, height) => {
    const saveButton = document.getElementById(`${id}_save`);
    const takeButton = document.getElementById(`${id}_take`);
    const retakeButton = document.getElementById(`${id}_retake`);
    const camera = document.getElementById(`${id}_camera`);
    const output = document.getElementById(`${id}_output`);
    if (width && height) {
      const context = output.getContext('2d');
      output.width = width / 4.5; // 320
      output.height = height / 4.5; // 240
      context.drawImage(camera, 0, 0, width / 4.5, height / 4.5);

      const finalWidth = width; // 1440
      const finalHeight = height; // 1080
      const resultCanvas = document.createElement('canvas');
      resultCanvas.style.display = 'none';
      resultCanvas.width = finalWidth;
      resultCanvas.height = finalHeight;
      resultCanvas.id = `${id}_result`;
      document.body.appendChild(resultCanvas)
      const rcContext = resultCanvas.getContext('2d');
      rcContext.drawImage(camera, 0, 0, width, height);

      output.setAttribute(
        'class',
        'photobooth__output photobooth__output--display'
      );
      takeButton.style.display = 'none';
      retakeButton.style.display = 'inline-block';
      saveButton.style.display = 'inline-block';
    } else {
      clearOutput();
    }
  }

  const onSuccess = (id) => {
    const takeButton = document.getElementById(`${id}_take`);
    const retakeButton = document.getElementById(`${id}_retake`);
    const saveButton = document.getElementById(`${id}_save`);
    const output = document.getElementById(`${id}_output`);
    const result = document.getElementById(`${id}_result`);

    let context = output.getContext('2d');
    context.fillStyle = '#AAA';

    result.remove();
    takeButton.style.display = 'none';
    retakeButton.style.display = 'none';
    saveButton.style.display = 'none';
    setInfo(id, 'Your photo has been sucessfully saved!');
  }

  const setInfo = (id, message) => {
    const infoDiv = document.getElementById(`${id}_info`);
    const span = document.createElement('span');
    span.innerText = message;
    infoDiv.innerText ='';
    infoDiv.appendChild(span);
  }

  const savePhoto = (id, overlayType) => {
    const output = document.getElementById(`${id}_result`);
    const photoURL = output.toDataURL('image/png');
    if (photoURL) {
      jQuery(document).ready(function(){
        jQuery.ajax({
          method: 'POST',
          url: AjaxObject.url,
          data: {
            photo: photoURL,
            type: overlayType,
            action: 'save_photobooth',
          }
        }).success(() => {
          onSuccess(id);
        }).fail((error) => {
          setInfo(id, 'An error occurred please try again later.');
          console.error(`An error occurred: ${error}`);
        });
      });
    }
  }

  const disableButtons = (id) => {
    const camera = document.getElementById(`${id}_camera`);
    const output = document.getElementById(`${id}_output`);
    const overlay = document.getElementById(`${id}_overlay`);
    const takeButton = document.getElementById(`${id}_take`);
    const retakeButton = document.getElementById(`${id}_retake`);
    const saveButton = document.getElementById(`${id}_save`);
    camera.style.display = 'none';
    output.style.display = 'none';
    overlay.style.display = 'none';
    takeButton.style.display = 'none';
    retakeButton.style.display = 'none';
    saveButton.style.display = 'none';
  }

  return {
    initialize: (id, overlayType, userId) => {
      if (userId === '0') {
        setInfo(id,
          'You need to be logged in to use this feature.'
        );
        return disableButtons(id);
      }
      let streaming = false; // |streaming| indicates whether or not we're currently streaming
      let width = 1440//320; // We will scale the photo width to this
      let height = 1080//240; // We will scale the photo height to this

      const config = { video: { width: width, height: height, facingMode: "user" }, audio: false }

      const camera = document.getElementById(`${id}_camera`);
      const output = document.getElementById(`${id}_output`);
      const takeButton = document.getElementById(`${id}_take`);
      const retakeButton = document.getElementById(`${id}_retake`);
      const saveButton = document.getElementById(`${id}_save`);

      // Verify and connect to the camera of the device
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia(config)
          .then((stream) => {
            camera.srcObject = stream;
            camera.play();
          })
          .catch((error) => {
            setInfo(id,
              'An error occurred. You must allow your browser to access your camera and you need to refresh the page.'
            );
            takeButton.style.display = 'none';
            console.error(`An error occurred: ${error}`);
          });

        camera.addEventListener(
          'canplay',
          (_event) => {
            if (!streaming) {
              camera.setAttribute('width', width);
              camera.setAttribute('height', height);
              streaming = true;
            }
          }, false);

        takeButton.addEventListener(
          'click',
          (event) => {
            takePhoto(id, width, height);
            event.preventDefault();
          }, false);

        retakeButton.addEventListener(
          'click',
          (event) => {
            clearOutput(id);
            event.preventDefault();
          }, false);

        saveButton.addEventListener(
          'click',
          (event) => {
            savePhoto(id, overlayType);
            event.preventDefault();
          }, false);
        // We make sure the output is clean at the initialization.
        clearOutput(id);
      } else {
        output.style.display = 'none';
        takeButton.style.display = 'none';
        retakeButton.style.display = 'none';
        saveButton.style.display = 'none';
        setInfo(id,
          'Oops! Your browser do not support the camera. Please try via your desktop or a browser supporting the camera.'
        );
      }
    }
  };
})();
