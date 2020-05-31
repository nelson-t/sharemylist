class Queue{
   static qInterval=500; //INterval when sending tracks request to Spotify Queue
   static trackIdCell      =0;
   static trackNameCell    =1;
   static playingStatusCell=2;
   static progressCell     =3;
   static listTypeCell     =4;
   static playlistURICell  =5;
   static offsetCell       =6;
   static mSecondsCell     =7;
   static maxQLength       =30;

   static addToQueue(id){
      var xhr  = new XMLHttpRequest(); 
      var url  = "https://api.spotify.com/v1/me/player/queue?uri=spotify:track:"+id;
      xhr.open("POST", url, true);
      xhr.setRequestHeader('Authorization', 'Bearer '+token);
      xhr.onreadystatechange = function() {
         if (xhr.readyState === 4) {
             if (xhr.status!==204) {
               console.log("Queue.addToQueue()) - Error:"+JSON.parse(xhr.responseText).error.message);
            }              
         }
      }
      xhr.send();
   }
   
    static playQueueTracks(opt){
      if(theDevice==null) {
         alert("Select a device!");
         document.getElementById("b-tutil").click();
         return;         
      }
      let tbl  = document.getElementById("myQueueTable");
      if (tbl.rows.length<2) //At least one track to play  
         return false; 
     
      if (tbl.rows.length===2 && tbl.rows[1].cells[Queue.playingStatusCell].innerHTML==="Playing") //At least one track to play  
         return false; 
         
      let nothingNewToQueue=true;
      for(let i=1; i<tbl.rows.length; i++)
         if(tbl.rows[i].cells[Queue.playingStatusCell].innerHTML==="Awaiting")
            nothingNewToQueue=false;
  
      if (nothingNewToQueue) { return; }
 
      clearInterval(theLoop);
     
      let aNewTrackPlaying=false; 
      //Row 0 are headings
      if (opt==="restart") { 
         //Start playing first playing or queeued track in queue
         for(let i=1; i<tbl.rows.length; i++){
            if (tbl.rows[i].cells[Queue.playingStatusCell].innerHTML!=="Awaiting"){
              tbl.rows[i].cells[Queue.playingStatusCell].innerHTML="Gone";
              //alert("Adentro - restartt  -------->"+tbl.rows[i].cells[Queue.playingStatusCell].innerHTML);
            }
            else {
               if (!aNewTrackPlaying){
                  tbl.rows[i].cells[Queue.playingStatusCell].innerHTML="Playing";
                  Player.playFromList(tbl.rows[i].cells[Queue.listTypeCell].innerHTML, 
                                      tbl.rows[i].cells[Queue.playlistURICell].innerHTML,
                                      tbl.rows[i].cells[Queue.trackIdCell ].innerHTML,  /////trackIdCell 
                                      tbl.rows[i].cells[Queue.mSecondsCell].innerHTML,
                                      false); 

                  aNewTrackPlaying=true;
               }
            } //if
         } //for
      } //if 
      
      //Put the rest in the queue with time separation so that they keep the ordering
      var myInterval=1;
      for (let i=1; i<tbl.rows.length; i++) {     
         if (tbl.rows[i].cells[Queue.playingStatusCell].innerHTML==="Awaiting") {
            tbl.rows[i].cells[Queue.playingStatusCell].innerHTML="Queued";
            tbl.rows[i].cells[Queue.playingStatusCell].style.color="black";
            let id=document.getElementById("myQueueTable").rows[i].cells[0].innerHTML;
            setTimeout(function(){ Queue.addToQueue(id); }, myInterval*Queue.qInterval);
            myInterval++;   
         } //if
       }  //for

      setLoops();
   }
   
   static cancelQueue(){
      let tbl  = document.getElementById("myQueueTable");
      for (let i=tbl.rows.length-1; i>=1; i--)
         if (tbl.rows[i].cells[Queue.playingStatusCell].innerHTML==="Awaiting") 
            tbl.deleteRow(i);
   }
   
     
  static deleteQueued(){
      if(thePlayer.device.name.toUpperCase().includes("LIBRE")){
         Queue.deleteAllTableLines();       
         return;
      }   
      let tbl  = document.getElementById("myQueueTable");
      if(tbl.rows.length>1)
        stepTracks++;       
      for (let i=2; i<tbl.rows.length; i++)
         if (tbl.rows[i].cells[Queue.playingStatusCell].innerHTML!=="Awaiting"){ 
            Player.next(1); //By pressing next, advances queue or user's list. This in order to clear up the queue
                           //stepTracks is incremented by 1
         }
   }   

   static deleteAllTableLines(){
      let tbl  = document.getElementById("myQueueTable");
      for (let i=tbl.rows.length-1; i>=1; i--)
         if (tbl.rows[i].cells[Queue.playingStatusCell].innerHTML!=="Awaiting") {
            tbl.deleteRow(i);
         }
   }

   static trackInQueue(tId){
      var tbl  = document.getElementById("myQueueTable");
      for (let i=1 ; i<tbl.rows.length; i++)
         if(tbl.rows[i].cells[Queue.trackIdCell].innerHTML===tId) {            
            console.log("trackInQueue: Duplicated: "+i+" "+tbl.rows[i].cells[Queue.trackIdCell].innerHTML);            
            return true;
         } else {
            console.log("trackInQueue: NOT Duplicated: "+i+" "+tbl.rows[i].cells[Queue.trackIdCell].innerHTML); 
         }  
      return false;
   }

   static addTrackToQueueTable(tStatus, id, name, lType, plURI, offset, ms){
      if(Queue.trackInQueue(id) && lType==="queue"){
         alert("Selected track is already in the queue. Select a different one!");
         return;
      }
      var tbl   = document.getElementById("myQueueTable");
      if(lType==="player")
         var newRow= tbl.insertRow(1); //at position 1
      else
         var newRow= tbl.insertRow(-1); //at last position
         
      newRow.insertCell(Queue.trackIdCell).innerHTML      =id;
      newRow.cells[Queue.trackIdCell].style.display       ="none";
      //Replacing back the quotes
      newRow.insertCell(Queue.trackNameCell).innerHTML    =name.replace(/@@##/g, '"').replace(/!!##/g, "'");
      newRow.insertCell(Queue.playingStatusCell).innerHTML=tStatus;
      newRow.cells[Queue.playingStatusCell].style.color   ="red";
      newRow.insertCell(Queue.progressCell).innerHTML     =0;
      newRow.insertCell(Queue.listTypeCell).innerHTML     =lType;
      newRow.cells[Queue.listTypeCell].style.display      ="none";        
      newRow.insertCell(Queue.playlistURICell).innerHTML  =plURI;
      newRow.cells[Queue.playlistURICell].style.display   ="none";        
      newRow.insertCell(Queue.offsetCell).innerHTML       =offset;
      newRow.cells[Queue.offsetCell].style.display        ="none";      
      newRow.insertCell(Queue.mSecondsCell).innerHTML     =ms;
      newRow.cells[Queue.mSecondsCell].style.display      ="none";
      
      console.log("addTrackToQueueTable: added --> "+newRow.cells[Queue.trackIdCell].innerHTML+" "+
                                                     newRow.cells[Queue.trackNameCell].innerHTML);
   }
   
   static updateQueueTable() {
      if (thePlayer==null||theTrack==null)
         return;
      if(Store.shareCode!=="N/A")
         document.getElementById("b-shareTracks").innerHTML="Stop Sharing >>";      
         
      var tbl  = document.getElementById("myQueueTable");
      
      Queue.disableEnableButtons();

      // This in case NEXT pressed multiple times      
      // Eliminates records in que table - those that have a status different to Awaiting    
      if(stepTracks>0){
         for (let i=1; i<=stepTracks; i++)
            if(tbl.rows[i]!=null && tbl.rows[i].cells[Queue.playingStatusCell].innerHTML!=="Awaiting")
               tbl.rows[i].cells[Queue.playingStatusCell].innerHTML="Gone";
         stepTracks=0;
      }

      let isPlaying=false;
      
      if(tbl.rows.length>1 && tbl.rows[1].cells[Queue.trackIdCell].innerHTML===theTrack.id){
         tbl.rows[1].cells[Queue.playingStatusCell].innerHTML="Playing";
         tbl.rows[1].cells[Queue.playingStatusCell].style.color="black";
         tbl.rows[1].style.fontWeight="bold";
         let currProgress=tbl.rows[1].cells[Queue.mSecondsCell].innerHTML;
         tbl.rows[1].cells[Queue.progressCell].innerHTML=Math.round(thePlayer.progress_ms/theTrack.duration_ms*100);
         tbl.rows[1].cells[Queue.mSecondsCell].innerHTML=thePlayer.progress_ms;
         isPlaying=true;
      } else {
         if(tbl.rows.length>1 && tbl.rows[1].cells[Queue.playingStatusCell].innerHTML==="Playing" ) {
            tbl.deleteRow(1);  //gone, playing somethin else
         }
         for(let i=1; i<tbl.rows.length; i++) {
            if(tbl.rows[i].cells[Queue.playingStatusCell].innerHTML!=="Awaiting"){

              if(tbl.rows[i].cells[Queue.trackIdCell].innerHTML===theTrack.id){
                  tbl.rows[i].cells[Queue.playingStatusCell].innerHTML="Playing";
                  isPlaying=true;
                  break;
               } else {
                  tbl.rows[i].cells[Queue.playingStatusCell].innerHTML="Gone";
               }

            }
         }
      }  
      //Directamente insertamos lo que toca 
      if(tbl.rows.length===1 || (tbl.rows.length>1 && !isPlaying)){
  
            let ctx="spotify:track:"+theTrack.id;
            if (thePlayer.context!=null)
               ctx=thePlayer.context.uri;
               //Insert at position [1]   
            Queue.addTrackToQueueTable("Playing", theTrack.id,
                  theTrack.name+" ("+theTrack.album.artists[0].name+")", "player", ctx,theTrack.id , 0);
             
            tbl.rows[1].cells[Queue.playingStatusCell].innerHTML="Playing";

      }      
     
      for (let i=tbl.rows.length-1; i>=1; i--)
         if(tbl.rows[i].cells[Queue.playingStatusCell].innerHTML==="Gone")             
            tbl.deleteRow(i);   
   
       ////////////////////////////      
      Cookie.storeQueueToCookie();
      let qc=Cookie.getCookie("qcode");
      if(qc==="")
         qc="N/A"
      document.getElementById("s-sharing").innerHTML=qc;
       
      Store.recId=Cookie.getCookie("recid");

      if(Store.shareCode!=="N/A"){
         Store.updateJSON(Cookie.getCookie('queue'));
         console.log("updateQueueTable: updateJSON with cookie: "+Cookie.getCookie('queue'));
      }
  
}   
   
   static disableEnableButtons(){
      let qId=document.getElementById("i-loadSharedTracks").value;
      if(qId===""){
         document.getElementById("b-queueTracks").disabled  = false;
         document.getElementById("b-playQueue").disabled    = false;
         document.getElementById("b-cancelQueue").disabled  = false;
         document.getElementById("b-shareTracks").disabled  = false;                           
      }else {
         document.getElementById("b-queueTracks").disabled  = true;
         document.getElementById("b-playQueue").disabled    = true;
         document.getElementById("b-cancelQueue").disabled  = true;
         document.getElementById("b-shareTracks").disabled  = true;  
      }
   } // 
   
  
   static trackInQueue(tId){
      let tbl  = document.getElementById("myQueueTable");      
      for (let i=1; i<tbl.rows.length; i++){
         if (tbl.rows[i].cells[Queue.trackIdCell].innerHTML===tId) {
            return true;
         } 
      }
      return false;
   }    
   
   static restartPlayingQueue = async () =>{
      let tbl  = document.getElementById("myQueueTable");
      let nothingNewToQueue=true;
      for(let i=1; i<tbl.rows.length; i++)
         if(tbl.rows[i].cells[Queue.playingStatusCell].innerHTML==="Awaiting")
            nothingNewToQueue=false;      
      if (nothingNewToQueue) { return; }

      Queue.clearSpotifyQueue(0, true);
      
      //Queue.playQueueTracks("Restart");      
   }   
   
   static clearSpotifyQueue(init, restart){ //Recursive
      let i=init;
      let r=restart;
      let id="0ICWP0NnWaJUCgp6EvgNmT"; //Mission Imposible Track...can be changed
      //let id="6mFkJmJqdDVQ1REhVfGgd1"; //Pink Floy
      
      let tId="";
      let fDelay=1000;
      if(thePlayer.device.name.toUpperCase().includes("LIBRE"))
         fDelay=2000;
    
      if(i>=20){setLoops(); return false;} //Max number of tracks in the que that will be removed, avoid infinite loop
   
      if(i===0){
         clearInterval(theLoop);
         $.ajax({
            url: 'https://api.spotify.com/v1/me/player/queue?uri=spotify:track:'+id , method:'POST', 
            headers: Player.getHeaders()  
         }).done(setTimeout(function(){Queue.clearSpotifyQueue(i+1, r);},fDelay));
      } else {  
         $.ajax({ 
            url: 'https://api.spotify.com/v1/me/player/currently-playing', method: 'GET', headers: Player.getHeaders()
         }).done(function (data) {
            tId = data.item.id;
            console.log("clearSpotifyQueue: Track Id : "+data.item.id);
            if(tId===id) {
               console.log("clearSpotifyQueue: A match. Exiting");
               document.getElementById("b-clearSpotify").innerHTML="Clear";
 
               if(r) {
                  Queue.playQueueTracks("Restart");
                  setTimeout(()=> { Player.next(0); }, 1000);
                  setTimeout(()=> { setLoops(); }, 2000);
                  
               }  else {           
                  Player.next(0);
                  setLoops();
               }
               


               return true;
            } else {
               $.ajax({
                  url: 'https://api.spotify.com/v1/me/player/next', method:'POST', headers: Player.getHeaders()  
               }).done(setTimeout(function(){Queue.clearSpotifyQueue(i+1,r );},fDelay));
               document.getElementById("b-clearSpotify").innerHTML="Cleared "+i;
            }
         });
      }
   }
      
   static delay(s){
      var now = new Date().getTime();
      var millisecondsToWait = s*1000; /* i.e. 1 second */
      while ( new Date().getTime() < now + millisecondsToWait ) {}
   }

}

