function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

var token = "" 

$(document).ready(function(){
   token = window.location.hash.split("&")[0].split("=")[1];
   var currentImage="*";  

   $.fn.displayTrackInfo = function(){ 
     $.ajax({
        url: 'https://api.spotify.com/v1/me/player/currently-playing',
        method: 'GET',
        headers: {
          'Content-Type' : 'application/json', 
          'Accept' : 'application/json', 
          'Authorization' : 'Bearer '+token
        },
        success: function(data, textStatus, xhr){
           var textedJson = JSON.stringify(data, undefined, 4);
           if(xhr.status==200){ //Player on
             if(data.is_playing==false) {
             	 $('#b1').text("PAUSED");
             } else 
                {$('#b1').text("PLAYING");
             }  
             $('#myTextarea').text(textedJson);
             $('#myTextarea2').text(data.item.name+ " from "+data.item.artists[0].name);
             if (currentImage!=data.item.album.images[0].url) {
                $('#img1').attr("src", data.item.album.images[0].url);
               currentImage=data.item.album.images[0].url;
             }
          } else {
             $('#b1').text("OFF");
             $('#myTextarea').text("*");
             $('#myTextarea2').text("PLAYER IS OFF");
             $('#img1').attr("src", "off.jpeg");
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
          'Authorization' : 'Bearer '+token
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
          'Authorization' : 'Bearer '+token
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
          'Authorization' : 'Bearer '+token
        }
    });
  });

  $("#b-play").click(function(){
    $.ajax({
        url: 'https://api.spotify.com/v1/me/player/play',
        method: 'PUT',
        headers: {
          'Content-Type'  : 'application/json', 
          'Accept'        : 'application/json', 
          'Authorization' : 'Bearer '+token
        }
       });
    });
  $("#b1").click();
  
});

function testFunction(){
  var url  = "https://api.spotify.com/v1/me/player";
  var xhr1  = new XMLHttpRequest();
  var responseJSON="";
  var x = document.getElementById("myDiv");
  
  xhr1.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
				responseJSON = JSON.parse(this.responseText);            
            $('#testTextarea').text(this.responseText);
            $('#b-player').text(responseJSON.device.name);
				if (x.style.display === "none") {
    				x.style.display = "block";
  				} else {
    				x.style.display = "none";
  				}

        }
  };  
  
  xhr1.open("GET", url, true);
  xhr1.setRequestHeader('Content-Type', 'application/json');
  xhr1.setRequestHeader('Accept', 'application/json'); 
  xhr1.setRequestHeader('Authorization', 'Bearer '+token);
  xhr1.send();
}

setInterval(function() {
    // $("#b1").click();
    $.fn.displayTrackInfo();
}, 3000);
