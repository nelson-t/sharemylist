class Store{
   
   //static jsonBoxId="http://192.168.0.14:3000/box_9baaff0e1b4c9d89a2f3";
   
   static jsonBoxId="http://18.231.186.57:3000/box_c297ca22db513a3985fc";
   static recId="X";
   static shareCode="N/A"

   static storeJSON(json){
       $.ajax({
         url: Store.jsonBoxId,
         method: 'POST',
         headers: {'content-type' : 'application/json'} ,
         data: json,
         success: function(data, textStatus, xhr){
            if(xhr.readyState===4 && xhr.status===200){ //Response = OK
                document.getElementById("t-sharingStatus").innerHTML="(OK)";
                console.log("storeJSON: Json box OK _ID:"+data._id);
                Store.recId=data._id;
                Cookie.setCookie("recid", Store.recId, 1);
            }
         },
         error: function(xhr,textStatus, error){
            document.getElementById("t-sharingStatus").innerHTML=" ERROR ";
            console.log(textStatus+" -> "+error); 
         } 
      });
   }
   
   static updateJSON(json){ // get the JSON by the record's _ID
       console.log("updateJSON: " + json );
       let jId = Store.recId;
       $.ajax({
         url: Store.jsonBoxId+"/"+jId,
         method: 'PUT',
         headers: {'content-type' : 'application/json'} ,
         data: json,
         success: function(data, textStatus, xhr){
            if(xhr.readyState===4 && xhr.status===200){ //Response = OK
                document.getElementById("t-sharingStatus").innerHTML="(OK)";
                console.log("updateJSON: Json box PUT OK:"+data.message);
            }
         },
         error: function(xhr,textStatus, error){
            document.getElementById("t-sharingStatus").innerHTML="(ERROR)";
            console.log(textStatus+" -> "+error); 
         } 
      });
   }

   static deleteJSON(jId){
       $.ajax({
         url: Store.jsonBoxId+"/"+jId,
         method: 'DELETE',
         success: function(data, textStatus, xhr){
            if(xhr.readyState===4 && xhr.status===200){ //Response = OK
                Store.recId="X";                
                document.getElementById("t-sharingStatus").innerHTML="";
                Cookie.setCookie("recid", Store.recId, 1);
                console.log("deleteJSON: Json box DEL OK:"+Store.recId);
            } 
         },
         error: function(xhr,textStatus, error){
            document.getElementById("t-sharingStatus").innerHTML="(ERROR)";
            console.log(textStatus+" -> "+error); 
         }             
      });
   }
   
   static shareTracks(){
      if(Store.shareCode!=="N/A" || document.getElementById("b-shareTracks").innerHTML==="Stop Sharing >>"){
         Store.shareCode="N/A";
         document.getElementById("b-shareTracks").innerHTML="Share Local >>";
         document.getElementById("b-loadSharedTracks").disabled = false;
      } else { //Share the Queue here
         let tbl=document.getElementById("myQueueTable");
         if(tbl.rows.length<=1){    
            alert("Nothing to share!");
            return;
         }                        
         Store.shareCode=Store.getKey();         
         document.getElementById("b-shareTracks").innerHTML="Stop Sharing >>";
         document.getElementById("b-loadSharedTracks").disabled = true;
      }
      document.getElementById("s-sharing").innerHTML=Store.shareCode;
      Cookie.setCookie("qcode", Store.shareCode, 1);
      Cookie.storeQueueToCookie();
      console.log("shareTracks: qcode="+Cookie.getCookie("qcode"));
      if (Store.shareCode==="N/A")
         Store.deleteJSON(Store.recId);
       else 
         Store.storeJSON(Cookie.getCookie("queue"));
   }   
    
   static getSharedJSON(){ // get the JSON by the queue's ID
   
      let qId=document.getElementById("i-loadSharedTracks").value;
      
      if(qId===""){
         alert("Enter code first!");
         return;
      }   
      
      if(theDevice==null) {
         alert("Select a device!");
         document.getElementById("b-tutil").click();
         return;         
      }
      
      $.ajax({
         url: Store.jsonBoxId+"?q=code:"+qId,
         method: 'GET',
         success: function(data, textStatus, xhr){
            if(xhr.readyState===4 && xhr.status===200){ //Response = OK

               console.log("getSharedJSON: *** getSharedJSON *** GET OK [0]:"+JSON.stringify(data[0]));

               Store.loadSharedTracks(data[0]);
            }
         },
         error: function(xhr,textStatus, error){
            document.getElementById("t-sharingStatus").innerHTML="(ERROR)";
            console.log(textStatus+" -> "+error); 
         } 
      });
   }  
   
   static loadSharedTracks(sharedQ){
      
      var listCode=document.getElementById("i-loadSharedTracks").value; //code to load

      if(sharedQ==null || sharedQ.tracks==null){
         alert("Wrong code or nothing to play!");
         document.getElementById("t-sharingStatus").innerHTML="";
         document.getElementById("i-loadSharedTracks").value="";
         return;
      }
      
      clearInterval(theLoop);

      var sharedTracks=sharedQ.tracks; //Starts at [0]

      let uris="";
      //Create URIS list
      uris="[";
      let nuris=0;
      for(let i=0; i<sharedTracks.length; i++){
         if(nuris>0)
            uris+=", ";
         uris+='"spotify:track:'+sharedTracks[i].id+'"';
         nuris++;               
         } //for
      uris+="]";
      
      let tbl  = document.getElementById("myQueueTable");

      if(listCode!==antListCode) {  //Only the first time load the JSON eliminate queue in phone      
         if( !thePlayer.device.name.toUpperCase().includes("LIBRE")){
            for (let i=2; i<tbl.rows.length; i++)
               if (tbl.rows[i].cells[Queue.playingStatusCell].innerHTML!=="Awaiting") 
                  Player.next(0); //By pressing next, advances queue or user's list. This in order to clear up the queue 
         }
          antListCode=listCode;
      }

      //Borrar tabla
      for (let i=tbl.rows.length-1; i>=1; i--)
            tbl.deleteRow(i);
      
      ///////////////////////////////
      Player.playTracks(uris, Number(sharedTracks[0].ms)+msDelay);
      //////////////////////////////
            
      //Recreate the Queue table (should be empty now).

      document.getElementById("t-sharingStatus").innerHTML="(OK)";
      
      for (let i=0; i<sharedTracks.length; i++) 
         if(sharedTracks[i].st==="Queued" || sharedTracks[i].st==="Playing"){
            Queue.addTrackToQueueTable(
                  sharedTracks[i].st, 
                  sharedTracks[i].id, 
                  "?loadSharedTracks?",
                  "queue", 
                  sharedTracks[i].li,
                  sharedTracks[i].os,
                  sharedTracks[i].ms); /// delay
         console.log("loadSharedTracks --> lenght="+tbl.rows.length+"    "+sharedTracks[i].st+"  "+sharedTracks[i].id+" "+sharedTracks[i].li.split(":")[1] ) ;     
      }
      Cookie.storeQueueToCookie(); //Stores the new table in the cookie    
      Cookie.loadQueueFromCookie(); 
      setTimeout(function(){setLoops();}, Queue.qInterval); 
   }   
   
   static getKey(){
      // 8 char unique key
      return ((+new Date).toString().slice(8)+Math.random().toString(36).substring(7)).substr(-8);
   }
    
 
   
}

