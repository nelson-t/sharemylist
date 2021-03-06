class Playlist {
   
   static getPlaylists(){
      $.ajax({
         url: 'https://api.spotify.com/v1/me/playlists?limit=50',
         method: 'GET',
         headers: Player.getHeaders() ,
         success: function(data, textStatus, xhr){
            if(xhr.status==200) {//Response = OK
               allPlaylists=data;
               document.getElementById("playlistsJsonTextarea").value=JSON.stringify(allPlaylists, undefined, 2);
            } else { 
               document.getElementById("playlistsJsonTextarea").value="None found!"
               allPlaylists=null;
            }
         }
      });
   }
   
   static getPlaylistsTracks(){
      if(allPlaylists==null)
         return;
      var theTable="<table class='spTable' id='allPlaylistsTable'><tbody>"+
                   " <tr>"+
                   "   <th style='display: none'>type</th>"+
                   "   <th style='display: none'>Playlist Id</th>"+
                   "   <th style='display: none'>Playlist Name</th>"+
                   "   <th style='display: none'>Playlist Id</th>"+
                   "   <th style='display: compact'>Tracks</th>"+
                   "   <th style='display: compact'>Artist(s)</th>"+
                   "   <th style='display: compact'>Queue</th>"+
                   "   <th style='display: none'>D</th>"+                 
                   " </tr>";
      // One by one gest each playlist's tracks      
      var theUrl="";
      //var lists=["--- Playlists ---"];
      
      var opc = document.getElementById("s-playlists");
      for (let i=opc.length; i>0; i-- ) 
         opc.remove(i);

      for (var i=0; i<allPlaylists.items.length; i++) {
 
         var theUrl='Player.playFromList("player", "'+allPlaylists.items[i].uri+'", "000", 0, true)';

         theTable+="<tr id='row"+allPlaylists.items[i].id+"'>"+
                   "  <td style='display: none'>playlist</td>"+
                   "  <td style='display: none'>"+allPlaylists.items[i].id+"</td>"+
                   "  <td style='display: none'>"+allPlaylists.items[i].name+"</td>"+
                   "  <td style='display:none'>"+allPlaylists.items[i].id+"</td>"+
                   "  <td style='text-align:center'><b><a href='javascript:"+theUrl+"'>"+(i+1)+"-"+allPlaylists.items[i].name+"</a></b>  ("+(allPlaylists.items[i].public?'public':'private')+")</td>"+
                   "  <td></td>"+"<td>-</td>"+
                   "  <td style='display: none'>-</td>"+
                   "</tr>";

         let l=document.createElement("option");
         l.value=allPlaylists.items[i].id;        
         l.text=(i+1)+"-"+allPlaylists.items[i].name+" ("+(allPlaylists.items[i].public?'public':'private')+")";
         
         opc.add(l,i+1); 
         ////////////////         
         Playlist.getAPlaylist(allPlaylists.items[i].id);
      }
      theTable+="</tbody></table>";
      document.getElementById("playlistsTable").innerHTML=theTable;
      setTimeout(function(){Playlist.findArtists();;}, 2000);
   }
   
   static getAPlaylist(id){
      $.ajax({
         url: 'https://api.spotify.com/v1/playlists/'+id,
         method: 'GET',
         headers: Player.getHeaders() ,
         success: function(data, textStatus, xhr){//Inverse order so that by adding after Playlist all items it does not get messed up
            if(xhr.status==200){ //Response = OK
               for (let j=data.tracks.items.length-1; j>=0; j--) {
//                  var theUrl='Player.playFromList("playlist", "'+data.uri+'", "'+data.tracks.items[j].track.id+'", 0)';
                  
                  var theUrl='Player.playFromList("player", "'+data.uri+'", "'+data.tracks.items[j].track.id+'", 0, true)';

                  //Replace double quotations by single quotations in track title to avoid error with strings
                  let escapedString=data.tracks.items[j].track.name+" ("+data.tracks.items[j].track.album.artists[0].name+")";
                  escapedString=escapedString.replace(/\"/g, "@@##");
                  escapedString=escapedString.replace(/\'/g, "!!##");
                  //alert(escapedString);
//                  let theArtistID  ='"artist",'+'"'+data.tracks.items[j].track.artists[0].uri+'","000" ,0';
                  let theArtistID  ='"player",'+'"'+data.tracks.items[j].track.artists[0].uri+'","000" ,0, true';
                  
                  let theArtistURL="<a href='javascript:Player.playFromList("+theArtistID+");'>"+data.tracks.items[j].track.artists[0].name+"</a>";
                  
                  var theQUrl='Queue.addTrackToQueueTable("Awaiting", "'+data.tracks.items[j].track.id+'","'+
                        escapedString+'", "queue", "'+data.uri+'", '+j+', 0, true); '; 
                  
                  $("#row"+id).after("<tr>"+
                     "<td style='display: none'>track</td>"+
                     "<td style='display: none'>"+data.id+"</td>"+        
                     "<td style='display: none'>"+data.name+"</td>"+
                     "<td style='display:none'>"+data.tracks.items[j].track.id+"</td>"+
                     "<td><a href='javascript:"+theUrl+"'>"+data.tracks.items[j].track.name+"</td>"+
                     "<td>"+theArtistURL+"</td>"+
                     "<td><b><a href='javascript:"+theQUrl+"'>Add</b></td>"+   //(dta.public ? "<td><b><a href='javascript:"+theQUrl+"'>Add</b></td>" : "<td>-</td>")+
                     "<td style='display: none'>-</td>"+
                  "</tr>");
               }
            } 
         }
      });
   }
   
   static findDuplicateTracks(){
      var tbl = document.getElementById("allPlaylistsTable");
      //Find duplicates starting on second row (index=1)
      for (let i=1;i<tbl.rows.length;i++) {
         for (let j=i+1;j<tbl.rows.length;j++){
            if (tbl.rows[i].cells[3].innerHTML==tbl.rows[j].cells[3].innerHTML){
               tbl.rows[i].cells[7].innerHTML="D";
               tbl.rows[j].cells[7].innerHTML="D";   
            }
         } 
      }
      //Delete all rows that are not dupicates
      for (let i=tbl.rows.length-1;i>=0;i--) 
         if (tbl.rows[i].cells[7].innerHTML != "D")
            tbl.deleteRow(i);
            
      //Order by track name, except row 0, headings
      let cp=[];
      if (tbl.rows.length>0){
         tbl.rows[0].cells[2].style="display:compact";
         tbl.rows[0].cells[4].innerHTML="Duplicated Tracks";
      }
         
      for (let ant=1; ant < tbl.rows.length; ant++){
         tbl.rows[ant].cells[2].style="display:compact";
         for (let i=ant+1; i < tbl.rows.length; i++) {
          if (tbl.rows[i].cells[5].textContent+tbl.rows[i].cells[4].textContent < tbl.rows[ant].cells[5].textContent+tbl.rows[ant].cells[4].textContent) {
                for (let j=0; j < 6; j++) {
                  cp[j]=tbl.rows[ant].cells[j].innerHTML;
                  tbl.rows[ant].cells[j].innerHTML=tbl.rows[i].cells[j].innerHTML;
                  tbl.rows[i].cells[j].innerHTML=cp[j];
               }    
            } 
         }
      }
   } 
   static findArtists(){
      var opc = document.getElementById("s-artists"); //Select
      for (let i=opc.length-1; i>=0 ;i--)  opc.remove(i);
      var tbl = document.getElementById("allPlaylistsTable");
      var names=["- ARTIST -"];
      for (let i=1;i<tbl.rows.length;i++) {
         
         let artist=tbl.rows[i].cells[5].innerHTML.toUpperCase();  //Artist column = 5
         if (artist!=="") {
           artist=artist.split(';">')[1].split("</")[0]; //extract from A REF TAG only the Artist's name text
           if ( !names.includes(artist))
              names.push(artist);
         }   
      }
      names=names.sort();
      for (let i=0; i<names.length; i++){
        let o=document.createElement("option");
        o.text=names[i];
        opc.add(o,i); 
     }
   }
   
   static filterByArtistName(name){
      var tbl = document.getElementById("allPlaylistsTable");
      for (let i=1;i<tbl.rows.length;i++) 
         if(tbl.rows[i].cells[5].innerHTML!=="" && tbl.rows[i].cells[5].innerHTML.toUpperCase().split(';">')[1].split("</")[0] === name) 
               tbl.rows[i].style="display:compact";
            else 
               if(name=="- ARTIST -")
                  tbl.rows[i].style="display:compact";
               else 
                  tbl.rows[i].style="display:none";
   }


  static filterByPlaylist(id){
      var tbl = document.getElementById("allPlaylistsTable");
      for (let i=1;i<tbl.rows.length;i++)
        if(tbl.rows[i].cells[1].innerHTML===id) 
               tbl.rows[i].style="display:compact";
            else 
               if(id==="-999")
                  tbl.rows[i].style="display:compact";
               else 
                  tbl.rows[i].style="display:none";
   }
       
}

