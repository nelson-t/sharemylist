//Global variables
const timeInterval   =5000; //UpdatesPlayer/Track information every 5 secs.
var token            =""; 
var debug            =true;
var contextUri       ="";
var updateList       =true;
var currentTrack     ="*";  
var contextUri       ="";
var theLoop          =null;
// var theQLoop         =null;
var thePlaylistImage =null;
var thePlayer        =null; 
var theTrack         =null;
var theDevice        =null;
var thePlaylist      =null;
var theDevices       =null;
var theAlbum         =null;
var theArtist        ="Only when the context is Artist";
var allPlaylists     =null;
var firstCycle       =true;
var msDelay          =2000;
var stepTracks       =0;
var antListCode      ="";

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

function setLoops(){
   //Loop continously displaying the track's info
   theLoop=setInterval(function() {
      Player.getPlayingTrackInfo(); //Also update queue table
   }, timeInterval);
}

$(document).ready(function(){
   //Get Spotify authorization token from response url's hash (#)   
   token = window.location.hash.split("&")[0].split("=")[1];

   $("#b-tutil").click(function(){
      Util.getDevices();
      devicesDiv.style.display = "none";
      playlistJsonDiv.style.display = "none"
      playlistsJsonDiv.style.display = "none"
      artistJsonDiv.style.display = "none"
      playerJsonDiv.style.display = "none"
      trackJsonDiv.style.display = "none"   
   });

   $("#b-tplaylists").click(function(){
      if(firstCycle){
         Playlist.getPlaylistsTracks();
         firstCycle=false;
      }
   });
   
   $("#b-updateDevices").click(function(){
      Util.getDevices();
   });
   
   $("#b-clearSpotify").click(function(){
      Queue.clearSpotifyQueue(0);
   });
   
   $("#b-cancelQueue").click(function(){
      Queue.cancelQueue();
   });   
   
   
   $("#b-getAllPlaylists").click(function(){
      Playlist.getPlaylists();
      Playlist.getPlaylistsTracks();
   });
    
   $("#b-findDuplicateTracks").click(function(){
      Playlist.findDuplicateTracks();
   });  

   $("#b-playQueue").click(function(){
      if( ! thePlayer.device.name.toUpperCase().includes("LIBRE"))
         Queue.restartPlayingQueue();
      else 
         Queue.playQueueTracks("restart"); 
   });  

   $("#b-queueTracks").click(function(){
      Queue.playQueueTracks("continue");
   });  
  
   $("#b-updateQueue").click(function(){
      Queue.updateQueueTable();
   });  
   
   $("#b-shareTracks").click(function(){
       Store.shareTracks();
   });  
   
   $("#b-loadSharedTracks").click(function(){
      Store.getSharedJSON();
   });
      
   $("#b-clearCode").click(function(){
      document.getElementById("i-loadSharedTracks").value="";
   });
   
   $("#devicesJsonButton").click(function(){
      Util.getDevicesJson();
   });
         
   $("#playerJsonButton").click(function(){
      Util.getPlayerJson(); 
   });

   $("#playlistJsonButton").click(function(){
      Util.getPlaylistJson();
   });
   
   $("#artistJsonButton").click(function(){
      Util.getArtistJson();
   });

   $("#trackJsonButton").click(function(){
      Util.getTrackJson();
   });
   
   $("#playlistsJsonButton").click(function(){
      Util.getPlaylistsJson();
   });   
   
   $("#playerVolume").change(function(){
      Player.setVolume($("#playerVolume").val());
   });

   $("#playerVolume").mousedown(function(){
      clearInterval(theLoop);
   });
   
   $("#playerVolume").mouseup(function(){
      setLoops();
   });

   $("#b-next").click(function(){
     Player.next(1);
   });

   $("#b-prev").click(function(){
     Player.previous();
   });
  
   $("#b-pause").click(function(){
      Player.pause();
   });

   $("#b-play").click(function(){
      Player.play();
   }); 

  $("#s-artists").on('change', function(){
      Playlist.filterByArtistName(this.value);
      document.getElementById("s-playlists").selectedIndex=0;
   }); 

  $("#s-playlists").on('change', function(){
      Playlist.filterByPlaylist(this.value);
      document.getElementById("s-artists").selectedIndex=0;
   }); 
   
   $("#img1").click(function(){
      window.open(theTrack.album.images[0].url,'viewwin', 'width=500,height=500');
   });
   
   $("#img2").click(function(){
      window.open(thePlaylistImage,'viewwin', 'width=500,height=500');
   });
   //**** INITIALIZE *************************
   //Select and activate first tab
   document.getElementById("b-tplayer").click();
   //Display the info for the first time
   Util.getDevices();  
   Cookie.loadQueueFromCookie();  
   Player.getPlayingTrackInfo();
   Playlist.getPlaylists();
   //Loop continously displaying the track's info , also starts Queue Loop
   setLoops();
});
