class Context{
   
   static displayContext() {
      document.getElementById("s-context-type").textContent="N/A";
      document.getElementById("s-context-name").textContent="N/A"; 
      document.getElementById("listTable").innerHTML="<p>";
      document.getElementById("img2").src="favicon.ico";
      
      if(thePlayer==null || theDevice==null || theTrack==null) return;
      
      if(thePlayer.context!=null) {
         var cType=thePlayer.context.uri.split(":")[1]; //one of these: artist, playlist, album
         var cCode=thePlayer.context.uri.split(":")[2]; //context code
         var url=thePlayer.context.href;
      } else {
         var cType="track"; 
         var cCode=theTrack.id;
         var url=theTrack.href;
      } 
      document.getElementById("s-context-type").textContent=cType;
      
      theArtist="Only when the context is Artist";
      if (cType=="artist")
         url+="/top-tracks?country=US"

      var responseJSON="";
      var xhr  = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json'); 
      xhr.setRequestHeader('Authorization', 'Bearer '+token);
      
      xhr.onreadystatechange = function() {
         if (xhr.readyState == 4 && xhr.status == 200) {
            switch(cType) {
               case "playlist":
              	   thePlaylist = JSON.parse(xhr.responseText);
 	               document.getElementById("s-context-name").textContent=thePlaylist.name;
 	               thePlaylistImage=thePlaylist.images[0].url;
                  document.getElementById("img2").src=thePlaylistImage;
                  document.getElementById("listTable").innerHTML=Context.displayPlaylistTable();
                  break;
               case "album":
                  theAlbum = JSON.parse(xhr.responseText);
  	               document.getElementById("s-context-name").textContent=theAlbum.name;
                  thePlaylistImage=theAlbum.images[0].url;
                  document.getElementById("img2").src=thePlaylistImage;
                  document.getElementById("listTable").innerHTML=Context.displayAlbumTable();
                  break;
               case "artist":
                  //Display only artist's info - continous playing of artist tracks
                  theArtist= JSON.parse(xhr.responseText);
	               document.getElementById("s-context-name").textContent="Top 10 - "+theTrack.artists[0].name;
                  thePlaylistImage=theTrack.album.images[0].url; 	               
	               document.getElementById("img2").src=thePlaylistImage;
                  document.getElementById("listTable").innerHTML=Context.displayArtistTable();
                  break;
               case "track":
              	   thePlaylist = JSON.parse(xhr.responseText);
 	               document.getElementById("s-context-name").textContent='"'+theTrack.name+'" from '+theTrack.album.name;
 	               thePlaylistImage=theTrack.album.images[0].url; 
                  document.getElementById("img2").src=thePlaylistImage;
                  break;                 
               default:
	               document.getElementById("s-context-name").textContent="N/A";
                  thePlaylistImage="favicon.ico";	               
	               document.getElementById("img2").src=thePlaylistImage;
                  return;
            }
         }      
      }    
      xhr.send();
   }
   
  static displayPlaylistTable(){
      var theTable = "<table style='width:100%' class='spTable' id='playlistTable'>"+
                     "<tr>"+
                       //"<th>#</th>"+
                       "<th>Track Name</th>"+
                       "<th>Main Artist</th>"+
                       "<th>Album Name</th>"+
                       "<th>Queue</th>"+
                     "</tr>";
      var addBold;
      for (let i=0; i < thePlaylist.tracks.items.length; i++) {
         addBold="";
         if(thePlaylist.tracks.items[i].track.id==theTrack.id) {   
              addBold="<b>"; 
         }

         var theTrackID   ='"player",'+'"'+thePlaylist.uri+'","'+thePlaylist.tracks.items[i].track.id+'", 0, true';
         var theArtistID  ='"player",'+'"'+thePlaylist.tracks.items[i].track.artists[0].uri+'","000" ,0, true';
         var theAlbumID   ='"player",'+'"'+thePlaylist.tracks.items[i].track.album.uri+'", "'+thePlaylist.tracks.items[i].track.id+'", 0, true';
         
         var theTrackURL ="<a href='javascript:Player.playFromList("+theTrackID+");'>"+thePlaylist.tracks.items[i].track.name+"</a>";
         var theArtistURL="<a href='javascript:Player.playFromList("+theArtistID+");'>"+thePlaylist.tracks.items[i].track.artists[0].name+"</a>";
         var theAlbumURL ="<a href='javascript:Player.playFromList("+theAlbumID+");'>"+thePlaylist.tracks.items[i].track.album.name+"</a>";

//         theTable+="<tr><td>"+(i+1)+"</td>"+
         theTable+="<tr>"+
                   "    <td>"+addBold+theTrackURL+"</td>"+
                   "    <td>"+theArtistURL+"</td>"+
                   "    <td>"+theAlbumURL+"</td>"
                   
         theTable+=Context.add2QueueString(thePlaylist.tracks.items[i].track.id, thePlaylist.tracks.items[i].track.name, 
                                  thePlaylist.tracks.items[i].track.artists[0].name,thePlaylist.uri, i);          
         theTable+="</tr></b>";
      }
      theTable+="</table> ";
      return theTable;   
   }   
   
   static displayAlbumTable(){
      var theTable = "<table style='width:100%' class='spTable' id='albumTable'><tr><th>#</th><th>Track Name</th><th>Main Artists</th><th>Playing Queue</th></tr>";
      var addBold;
      for (let i=0; i < theAlbum.tracks.items.length; i++) {
         addBold="";
         if(theAlbum.tracks.items[i].id==theTrack.id) {   
              addBold="<b>"; 
         }
         var theID='"'+theAlbum.uri+'"';
         var theType='"player",';
         var theTID='"'+theAlbum.tracks.items[i].id+'"';
         var theURL="<a href='javascript:Player.playFromList("+theType+theID+", "+theTID+", 0, true);'>"+theAlbum.tracks.items[i].name+"</a>";
         theTable+="<tr><td>"+(i+1)+"</td><td>"+addBold+theURL+"</td><td>";

         let theArtistID  ='"player",'+'"'+theAlbum.tracks.items[i].artists[0].uri+'","000" ,0, true';
         let theArtistURL="<a href='javascript:Player.playFromList("+theArtistID+");'>"+theAlbum.tracks.items[i].artists[0].name+"</a>";
         theTable+=theArtistURL;
         
         if(theAlbum.tracks.items[i].artists.length > 1){
            let theArtistID  ='"artist",'+'"'+theAlbum.tracks.items[i].artists[1].uri+'","'+theAlbum.tracks.items[i].id+'" ,0, true';
            let theArtistURL="<a href='javascript:Player.playFromList("+theArtistID+");'>"+theAlbum.tracks.items[i].artists[1].name+"</a>";
    
            theTable+=", "+theArtistURL;
         } 
         
         theTable+="</td>"+Context.add2QueueString(theAlbum.tracks.items[i].id, theAlbum.tracks.items[i].name, 
                                  theAlbum.tracks.items[i].artists[0].name,theAlbum.uri, i);          
         theTable+="</tr></b>";
         
      }
      theTable+="</table> ";
      return theTable;   
   }  

   static displayArtistTable(){
      var theTable="<p>Note: Tracks when selected play within the context of the related Album."
      theTable += "<table style='width:100%' class='spTable' id='artistTopTable'><tr><th>#</th><th>Top 10 Tracks</th><th>Album</th><th>Playing Queue</th></tr>";
      var addBold;
      for (let i=0; i < theArtist.tracks.length; i++) {
         addBold="";
         if(theArtist.tracks[i].id==theTrack.id) {   
              addBold="<b>"; 
         }
         var albumURI='"'+theArtist.tracks[i].album.uri+'"';
         var trID ='"'+theArtist.tracks[i].id+'"';

         var theType='"player", ';
         
         var theURL="<a href='javascript:Player.playFromList("+
                    theType+albumURI+ "," +trID+ ", 0, true);'>"+
                    theArtist.tracks[i].name+"</a>";
                    
         var theURL2="<a href='javascript:Player.playFromList("+
                    theType+albumURI+ ", \"000\" , 0, true);'>"+
                    theArtist.tracks[i].album.name+"</a>";
                    
         theTable+="<tr><td>"+(i+1)+"</td><td>"+addBold+theURL+"</td>";
         theTable+="<td>"+theURL2+"</td>";

         theTable+=Context.add2QueueString(theArtist.tracks[i].id, theArtist.tracks[i].name, 
                                  theArtist.tracks[i].artists[0].name,theArtist.tracks[i].album.uri, i); 
         theTable+="</tr></b>";
      }
      theTable+="</table> ";
      return theTable;   
   }  
   
   static add2QueueString(trackId, trackName, trackArtist, trackURI, trackOffset){
         let escapedString=trackName+" ("+trackArtist+")";
         escapedString=escapedString.replace(/\"/g, "@@##");
         escapedString=escapedString.replace(/\'/g, "!!##");
         let theURL='Queue.addTrackToQueueTable("Awaiting", "'+trackId+'","'+
                        escapedString+'", "queue", "'+trackURI+'", '+trackOffset+', 0); '; 

         return "<td style='text-align:center'><b><a href='javascript:"+theURL+"'>Add</b></td>" 
   }
   
  
 }

