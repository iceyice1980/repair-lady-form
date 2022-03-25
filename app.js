const canvas = document.querySelector('canvas');
const form = document.querySelector('.signature-pad-form');
const clearButton = document.querySelector('.clear-button');
const ctx = canvas.getContext('2d');
let writingMode = false;
const date = new Date();

window.addEventListener("load", () => {

    canvas.height = window.innerHeight * 0.3;
    canvas.width = window.innerWidth * 0.75;

});

window.addEventListener("resize", () => {

    canvas.height = window.innerHeight * 0.3;
    canvas.width = window.innerWidth * 0.75;

});

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const imageURL = canvas.toDataURL();
    const image = document.createElement('img');
    image.src = imageURL;
    image.height = canvas.height;
    image.width = canvas.width;
    image.style.display = 'block';
    form.append('Email Sent!')
    form.appendChild(image);
    clearPad();
    const { fullname, email, phone, altphone, desc, items, imei, liq, sigimg } = event.target;
    const endpoint = "https://h7tealj9lk.execute-api.us-west-1.amazonaws.com/default/trl-dropoff-python"
    /* POST body */
    const body = JSON.stringify({
        fullname: fullname.value,
        email: email.value,
        phone: phone.value,
        altphone: altphone.value,
        desc: desc.value,
        items: items.value,
        imei: imei.value,
        liq: liq.value,
        date: date,
        sigimage: imageURL
    })
    console.log("Stringed body", body)

    const requestOptions = {
        method: "POST",
        body
      };
      console.log("POSTed body")

      fetch(endpoint, requestOptions)
      .then((response) => {
        if (!response.ok) throw new Error("Error in fetch");
        return response.json();
      })

      .then((response) => {
        document.getElementById("result-text").innerText =
          "Email sent successfully!";
          return response.json();
      })

      .catch((error) => {
        document.getElementById("result-text").innerText =
          "An unkown error occured.";
          return error.JSON();
      });
      console.log("Unknown catch error")



    console.log('Name:', fullname.value)
    console.log('Email:', email.value )
    console.log('Phone:', phone.value)
    console.log('Alt Phone:', altphone.value)
    console.log('Description:', desc.value)
    console.log('Items:', items.value)
    console.log('Imei/SN:', imei.value)
    console.log('Liquid Damage:', liq.value)
    console.log('Date:', Date())
    console.log('Signature', image)

    console.log('Submit button pressed')
})


const clearPad = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

clearButton.addEventListener('click', (event) => {
    event.preventDefault();
    clearPad();
})

const getTargetPosition = (event) => {
    positionX = event.clientX - event.target.getBoundingClientRect().x;
    positionY = event.clientY - event.target.getBoundingClientRect().y;

    return [positionX, positionY];
    /*console.log("returned position")*/
}

const handlePointerMove = (event) => {
    if (!writingMode) return

    const [positionX, positionY] = getTargetPosition(event);
    ctx.lineTo(positionX, positionY);
    ctx.stroke();
    /*console.log("moved pointer")*/
}

const handlePointerUp = () => {
    writingMode = false;
    /*console.log("pointer up")*/
}

const handlePointerDown = (event) => {
    writingMode = true;
    ctx.beginPath();

    const [positionX, positionY] = getTargetPosition(event);
    ctx.moveTo(positionX, positionY);
    /*console.log("pointer down")*/
}

const handlePointerLeave = (event) => {
  /*console.log("pointer left")*/
}

 
ctx.lineWidth = 3;
ctx.lineJoin = ctx.lineCap = 'round';

canvas.addEventListener('pointerdown', handlePointerDown, {passive: true});
canvas.addEventListener('pointerup', handlePointerUp, {passive:true});
canvas.addEventListener('pointermove', handlePointerMove, {passive:true});
canvas.addEventListener('pointerleave', handlePointerLeave, {passive:true});