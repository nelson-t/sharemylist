$(document).ready(function(){
   var hash = window.location.hash.split("&")[0].split("=")[1];
   var currentImage="*";  

   $.fn.displayTrackInfo = function(){ 
     $.ajax({
        url: 'https://api.spotify.com/v1/me/player/currently-playing',
        method: 'GET',
        headers: {
          'Content-Type' : 'application/json', 
          'Accept' : 'application/json', 
          'Authorization' : 'Bearer '+hash
        },
        success: function(data){
           var textedJson = JSON.stringify(data, undefined, 4);
          
           if(data.is_playing==false) {
           	 $('#b1').text("PAUSED");
                   	} else {$('#b1').text("PLAYING");}  
             $('#myTextarea').text(textedJson);
             $('#myTextarea2').text(data.item.name+ " from "+data.item.artists[0].name);
           if (currentImage!=data.item.album.images[0].url) {
              $('#img1').attr("src", data.item.album.images[0].url);
             currentImage=data.item.album.images[0].url;
           }
        }
     });
   }

   $("#b1").click(function(){
      $.fn.displayTrackInfo();
   });

  $("#b-next").click(function(){
    $.ajax({
        url: 'https://api.spotify.com/v1/me/player/next',
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json', 
          'Accept' : 'application/json', 
          'Authorization' : 'Bearer '+hash
        }
    });
  });

  $("#b-prev").click(function(){
    $.ajax({
        url: 'https://api.spotify.com/v1/me/player/previous',
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json', 
          'Accept' : 'application/json', 
          'Authorization' : 'Bearer '+hash
        }
    });
  });
  
  $("#b-pause").click(function(){
    $.ajax({
        url: 'https://api.spotify.com/v1/me/player/pause',
        method: 'PUT',
        headers: {
          'Content-Type' : 'application/json', 
          'Accept' : 'application/json', 
          'Authorization' : 'Bearer '+hash
        }
    });
  });

  $("#b-play").click(function(){
    $.ajax({
        url: 'https://api.spotify.com/v1/me/player/play',
        method: 'PUT',
        headers: {
          'Content-Type' : 'application/json', 
          'Accept' : 'application/json', 
          'Authorization' : 'Bearer '+hash
        }
       });
    });
  $("#b1").click();
});

setInterval(function() {
    // $("#b1").click();
    $.fn.displayTrackInfo();
}, 2000);
