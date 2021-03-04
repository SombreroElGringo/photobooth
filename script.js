const photobooth = (() => {
  // Fill the photo with an indication that none has been captured.
  const clearOutput = (id) => {
    const takeButton = document.getElementById(`${id}_take`);
    const retakeButton = document.getElementById(`${id}_retake`);
    const saveButton = document.getElementById(`${id}_save`);
    const output = document.getElementById(`${id}_output`);
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
    let context = output.getContext('2d');
    if (width && height) {
      output.width = width;
      output.height = height;
      context.drawImage(camera, 0, 0, width, height);

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

    let context = output.getContext('2d');
    context.fillStyle = '#AAA';

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
    const output = document.getElementById(`${id}_output`);
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

  return {
    initialize: (id, overlayType) => {
      let streaming = false; // |streaming| indicates whether or not we're currently streaming
      let width = 320; // We will scale the photo width to this
      let height = 390; // We will scale the photo height to this

      const camera = document.getElementById(`${id}_camera`);
      const takeButton = document.getElementById(`${id}_take`);
      const retakeButton = document.getElementById(`${id}_retake`);
      const saveButton = document.getElementById(`${id}_save`);

      // Verify and connect to the camera of the device
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          camera.srcObject = stream;
          camera.play();
        })
        .catch((error) => {
          setInfo(id,
            'An error occured. Please you need to allow your browser to acces your camera and refresh the page.'
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
    }
  };
})();
