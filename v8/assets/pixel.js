/* Meta Pixel. El ID vive solo acá: pegarlo en META_PIXEL_ID y listo (no requiere build).
   Con el ID vacío este archivo no hace nada. */
(function(){
  var META_PIXEL_ID='';   /* COPIA DE PRUEBA: pixel apagado para no ensuciar Meta */
  if(!META_PIXEL_ID)return;
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init',META_PIXEL_ID);
  fbq('track','PageView');
})();
