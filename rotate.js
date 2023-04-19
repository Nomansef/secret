
const img2 =document.querySelector('.extra-js');
let rtdeg2 =0;
setInterval(() => {
    rtdeg2++;
  if(rtdeg2 == 360){
      rtdeg2 =0;
  }
console.log(rtdeg2);
  img2.style.transform = `rotate(${rtdeg2}deg)`;
}, 10)



const img1 =document.querySelector('.rotate-img');

let rtdeg1 =360;
setInterval(() => {
    rtdeg1--;

  if(rtdeg1 == 0){
      rtdeg1 =360;
  }
console.log(rtdeg1);
  img1.style.transform = `rotate(${rtdeg1}deg)`;
}, 10)