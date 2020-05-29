class Util {

   static getDevices(){
      $.ajax({
         url: 'https://api.spotify.com/v1/me/player/devices',
         method: 'GET',
         headers: Player.getHeaders() ,
         success: function(data, textStatus, xhr){
            if(xhr.status==200){ //Response = OK
               document.getElementById("devicesJsonTextarea").value=JSON.stringify(data, undefined, 2);
               theDevices=data.devices;
               document.getElementById("devicesTableDiv").innerHTML=Util.displayDevicesTable();
            } else { 
               theDevice=null;
               document.getElementById("devicesTableDiv").value="None found!";
            }
         }
      });
   }
   
   static activateOnDevice(id){
      $.ajax({
         url: 'https://api.spotify.com/v1/me/player', 
         method:'PUT', 
         headers: Player.getHeaders(), 
         data: '{"device_ids":["'+id+'"]}'  
      });
      setTimeout(function() {Util.getDevices();},3000);
   }   
   
   static displayDevicesTable(){
      var theTable = "<table class='spTable' id='devicesTable'><tr><th>Available Device(s)</th><th>Type</th>"+
          "<th>Volume</th><th>Active</th></tr>";
      var addBold;
      for (var i=0; i < theDevices.length; i++) {
         addBold="";
         if(theDevices[i].is_active) {   
              addBold="<b>"; 
         }
         var theID='"'+theDevices[i].id+'"';

         var theURL="<a href='javascript:Util.activateOnDevice("+theID+");'>"+theDevices[i].name+"</a>";
         
         theTable+="<tr><td>"+addBold+theURL+"</td><td>"+theDevices[i].type+"</td>";
         theTable+="<td>"+theDevices[i].volume_percent+"</td><td>"+theDevices[i].is_active+"</td></tr></b>";
      }
      theTable+="</table> ";
      return theTable;      
   }

   static getDevicesJson(){
      if (devicesDiv.style.display == "none") {
         devicesDiv.style.display = "block";
  	   } else 
         devicesDiv.style.display = "none";
   }

   static getPlaylistJson(){
      document.getElementById("playlistJsonTextarea").value=JSON.stringify(thePlaylist, undefined, 2);
      if (playlistJsonDiv.style.display == "none") 
         playlistJsonDiv.style.display = "block";
  	   else
         playlistJsonDiv.style.display = "none";
   }
   
   static getPlaylistsJson(){
      if (playlistsJsonDiv.style.display == "none") 
         playlistsJsonDiv.style.display = "block";
      else
         playlistsJsonDiv.style.display = "none";
   }
   
   static getArtistJson(){
      document.getElementById("artistJsonTextarea").value=JSON.stringify(theArtist, undefined, 2);
      if (artistJsonDiv.style.display == "none") 
         artistJsonDiv.style.display = "block";
      else
         artistJsonDiv.style.display = "none";
   }

   static getPlayerJson(){
      document.getElementById("playerJsonTextarea").value=JSON.stringify(thePlayer, undefined, 2);
      if (playerJsonDiv.style.display == "none") 
         playerJsonDiv.style.display = "block";
  	   else 
         playerJsonDiv.style.display = "none";
   }
   
   static getTrackJson(){
       if (thePlayer!=null) 
         var tk=thePlayer.item;
      else 
         var tk=null;
      document.getElementById("trackJsonTextarea").value=JSON.stringify(tk, undefined, 2);
      if (trackJsonDiv.style.display == "none") 
         trackJsonDiv.style.display = "block";
  	   else
         trackJsonDiv.style.display = "none";
   }  
   
}
