class Player{
   
   static headers = {
      'Content-Type'  : 'application/json', 
      'Accept'        : 'application/json', 
      'Authorization' : '*'   
   }; 

   static getHeaders(){
       Player.headers.Authorization='Bearer '+token;
       return Player.headers;
   }

  static getATrackName(id, tbl, row, col) {
      $.ajax({ 
         url    :"https://api.spotify.com/v1/tracks/"+id, 
         method :"GET", 
         headers: Player.getHeaders() 
      }).done(function (data, textStatus, jqXHR) {
         let trackInfo=data;
         tbl.rows[row].cells[col].innerHTML=trackInfo.name+" ("+trackInfo.album.artists[0].name+")";
         console.log("getATrackName = "+row+" , "+col+ " = "+tbl.rows[row].cells[col].innerHTML);
      }).fail(function (jqXHR, textStatus, htttpErrorThrown) {
         console.log(textStatus+" detected : "+jqXHR.responseText); 
      });
   }   
   
   static displayTheTrack(){ 
      if(thePlayer!=null && theTrack!=null){ //Player on
         if(thePlayer.is_playing==false) {
            $('#s-status').text("[paused]");
         } else { 
            $('#s-status').text("[playing]");
         } 
         let ps=Math.round(thePlayer.progress_ms/theTrack.duration_ms*100);
         $('#playerVolume').val(theDevice.volume_percent);
         $('#s-track'  ).text('"'+theTrack.name+'" from '+theTrack.album.name);
         $('#track-progress').text(ps+"%");
         let a="";
         for(let i=0; i<theTrack.artists.length; i++){
            if(i!=0)
              a+=", ";
            a+=theTrack.artists[i].name;
         }  
         $('#s-author' ).text(a);
         $('#s-player' ).text(theDevice.name);
         $('#s-player').css('color', 'black');
         $('#s-repeat' ).text('Repeat = '+thePlayer.repeat_state);
         $('#s-shuffle').text('Shuffle = '+thePlayer.shuffle_state);
         if (currentTrack!=theTrack.id) {
            $('#img1').attr("src", theTrack.album.images[0].url);
            Util.getDevices();
            currentTrack=theTrack.id;
            updateList=true;
         }
      } else {
         $('#s-track').text("*");
         $('#s-author').text("*");
         $('#s-player').text("* None selected *");
         $('#img1').attr("src", "favicon.ico");
         if (thePlayer==null) {
              $('#s-player').text("*** None selected ***");
              $('#s-player').css('color', 'red');
         }    
      }
   }  
     
   static getPlayingTrackInfo(){ //Get also Conetxt Info
      $.ajax({ 
         url: 'https://api.spotify.com/v1/me/player',
         method: 'GET',
         headers: Player.getHeaders()
      }).done(function (data, textStatus, jqXHR) {
         if(jqXHR.status==200){ //Player on
            thePlayer= data;
            theTrack = thePlayer.item;
            theDevice= thePlayer.device;
         } else { 
            thePlayer = null;               
            theTrack  = null;
            theDevice = null;
         }
         Player.displayTheTrack();
         if (updateList) {
            Context.displayContext();
            updateList=false;
            if(thePlayer!==null && !thePlayer.is_playing) //if Play pauses after changing track (bug in some devices)
               Player.play();
         } 

         ////////////////////////
         Queue.updateQueueTable();
         ///////////////////////
         
      }).fail(function (jqXHR, textStatus, htttpErrorThrown) { //To login if timeout
         if(jqXHR.status==401){
            alert("Timeout. Please login again!");
            window.location.href = document.referrer; //+"?rand="+Math.random().toString(36).substring(7); 
         } 
     });
   }
   static setRepeat() {
      $.ajax({
         url: 'https://api.spotify.com/v1/me/player/repeat', method:'PUT', headers: Player.getHeaders()  
      });
   }
   static setShuffle() {
      $.ajax({
         url: 'https://api.spotify.com/v1/me/player/shuffle', method:'PUT', headers: Player.getHeaders()  
      });
   }
   static next(inc) {
     $.ajax({
        url: 'https://api.spotify.com/v1/me/player/next', method:'POST', headers: Player.getHeaders()  
    }).done(function () {
        stepTracks+=inc;
    });
   }
   
   static previous(){
     $.ajax({
        url: 'https://api.spotify.com/v1/me/player/previous', method:'POST', headers: Player.getHeaders()  
     });
   }
   static pause(){
     $.ajax({
        url: 'https://api.spotify.com/v1/me/player/pause', method:'PUT', headers: Player.getHeaders() 
     });
   }
   static play(){
     $.ajax({
        url: 'https://api.spotify.com/v1/me/player/play', method:'PUT', headers: Player.getHeaders()  
     });
     currentTrack="none"; 
   }
   static setVolume(volValue){
      $.ajax({
        url: 'https://api.spotify.com/v1/me/player/volume?volume_percent='+volValue,
        method: 'PUT',
        headers: Player.getHeaders() 
      });
   }
   
   static playFromList(qType, lURI, offsetId, ms, deleAll){
  
      if(theDevice==null) {
         alert("Select a device!");
         document.getElementById("b-tutil").click();
         return;         
      }

      var cType=lURI.split(":")[1];      
      var dat  ="{}";
      
      if(cType==="artist")
         dat='{"context_uri": "'+lURI+'"}';      
      else if(cType==="playlist" || cType==="album"){
         if (offsetId==="000")          
            dat  = '{"context_uri": "'+lURI+'", "offset": {"position": 0}, "position_ms":'+ms+'}';
         else 
            dat  = '{"context_uri": "'+lURI+'", "offset": {"uri": "spotify:track:'+offsetId+'"}, "position_ms":'+ms+'}';
      } else 
         return;
         
      clearInterval(theLoop);
      
      //*******************************
      if (deleAll)      
         Queue.deleteQueued();
      //********************************
      
      var xhr  = new XMLHttpRequest(); 
      var url  = "https://api.spotify.com/v1/me/player/play";
      xhr.open("PUT", url, true);
      xhr.setRequestHeader('Authorization', 'Bearer '+token);
      xhr.onreadystatechange = function() {
         if (xhr.readyState === 4) {
            updateList=true;
            //Update and activate Player/Track tab.
            $('#s-track').text("Wait...");
            $('#s-author').text("*");
            $('#track-progress').text("0%");
            $('#img1').attr("src", "favicon.ico");
            document.getElementById("b-tplayer").click();
            currentTrack="none";
            setLoops();
         }
      }
      xhr.send(dat);
   }
   
  static playTracks(lURIS, ms){
      var xhr  = new XMLHttpRequest(); 
      var url  = "https://api.spotify.com/v1/me/player/play";
      var dat  = '{"uris": '+lURIS+', "offset":{"position": 0}, "position_ms":'+ms+'}';
      clearInterval(theLoop);
      xhr.open("PUT", url, true);
      xhr.setRequestHeader('Authorization', 'Bearer '+token);
      xhr.onreadystatechange = function() {
         if (xhr.readyState === 4) {
            updateList=true;
            //Update and activate Player/Track tab.
            $('#s-track').text("Wait...");
            $('#s-author').text("*");
            $('#track-progress').text("0%");            
            $('#img1').attr("src", "favicon.ico");
            document.getElementById("b-tplayer").click();
            currentTrack="none";
            setLoops()
         }
      }
      xhr.send(dat);
   } 

}

