class Cookie{
   
   static storeQueueToCookie(){ //writes to cookie
      if(theDevice==null || thePlayer==null) 
         return;
         
      let tbl  = document.getElementById("myQueueTable");
      //console.log("storeQueutable tbl.length :"+tbl.rows.length);

      let txtQueue ='{"code":"'+Store.shareCode+'", ';
          txtQueue+='"tracks":[';
                
      for (let i=1 ; i<tbl.rows.length && i<=Queue.maxQLength ; i++){
            txtQueue+='{';   
            txtQueue+='"id":"'+tbl.rows[i].cells[Queue.trackIdCell].innerHTML+'",';
            txtQueue+='"st":"'+tbl.rows[i].cells[Queue.playingStatusCell].innerHTML+'",';
            txtQueue+='"li":"'+tbl.rows[i].cells[Queue.playlistURICell].innerHTML+'",';
            txtQueue+='"os":"'+tbl.rows[i].cells[Queue.offsetCell].innerHTML+'", ';
            txtQueue+='"ms":' +tbl.rows[i].cells[Queue.mSecondsCell].innerHTML;
            txtQueue+='}';
            if((i+1) !== tbl.rows.length && (i) !== Queue.maxQLength)
               txtQueue+=',';
      }
      txtQueue+=']}';
      Cookie.setCookie("queue", txtQueue, 1);
      //if(debug) console.log("Written to Cookies: "+Cookie.getCookie("queue"));
   }

   static loadQueueFromCookie(){
      try {
         var lQueue =JSON.parse(Cookie.getCookie("queue") );
      } catch (err) {
         console.log("Error loading cookie (does not exist). Loading empty one");
         var lQueue =JSON.parse('{"code":"N/A", "tracks":[]}');
      }

      let tbl  = document.getElementById("myQueueTable");
     
      //Delete all before restoring from Cookie.
      for (let i=tbl.rows.length-1; i>=1; i--)
            tbl.deleteRow(i);
 
      //if(debug) console.log("loadQueueFromCookie get--> "+Cookie.getCookie("queue")+" Que TableLenght here="+tbl.rows.length);
     
      for (let i=0; i<lQueue.tracks.length; i++ ) { 
            let newRow = tbl.insertRow(-1); //after last position
            newRow.insertCell(Queue.trackIdCell).innerHTML      =lQueue.tracks[i].id;
            newRow.insertCell(Queue.trackNameCell).innerHTML    ="?*?*";
            newRow.insertCell(Queue.playingStatusCell).innerHTML=lQueue.tracks[i].st;
            newRow.insertCell(Queue.progressCell).innerHTML     =0;
            newRow.insertCell(Queue.listTypeCell).innerHTML     =lQueue.tracks[i].li.split(":")[1];
            newRow.insertCell(Queue.playlistURICell).innerHTML  =lQueue.tracks[i].li;
            newRow.insertCell(Queue.offsetCell).innerHTML       =lQueue.tracks[i].os;
            newRow.insertCell(Queue.mSecondsCell).innerHTML     =lQueue.tracks[i].ms;
            newRow.cells[Queue.trackIdCell].style.display    ="none";          
            newRow.cells[Queue.mSecondsCell].style.display   ="none";
            newRow.cells[Queue.offsetCell].style.display     ="none";  
            newRow.cells[Queue.playlistURICell].style.display="none";    
            newRow.cells[Queue.listTypeCell].style.display   ="none";   
      }
      for (let j=0; j<lQueue.tracks.length; j++ ) { 
         if(tbl.rows[j+1].cells[Queue.playingStatusCell].innerHTML==="Awaiting")
            tbl.rows[j+1].cells[Queue.playingStatusCell].style.color="red";
         Player.getATrackName(lQueue.tracks[j].id, tbl, j+1, Queue.trackNameCell);
      }
      // Gets also the shared code
      Store.shareCode=Cookie.getCookie("qcode");
      if (Store.shareCode==="") 
         Store.shareCode="N/A"
      // Gets also the remote queue code
      document.getElementById("i-loadSharedTracks").value=Cookie.getCookie("remoteQueueCode");
   }    
   
   static setCookie(cname, cvalue, exhours) {
      var d = new Date();
      d.setTime(d.getTime() + (exhours*60*60*1000));
      var expires = "expires="+ d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
   }
   
   static getCookie(cname) {
      var name = cname + "=";
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(';');
      for(var i = 0; i <ca.length; i++) {
         var c = ca[i];
         while (c.charAt(0) == ' ') 
            c = c.substring(1);
         if (c.indexOf(name) == 0) 
            return c.substring(name.length, c.length);
      }
      return "";
   }
   
}

