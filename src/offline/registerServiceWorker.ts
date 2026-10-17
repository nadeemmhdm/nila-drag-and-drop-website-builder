export function registerOfflineWorker(){
  if(!import.meta.env.PROD||!('serviceWorker' in navigator))return;
  window.addEventListener('load',()=>{void navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(()=>undefined);});
}
