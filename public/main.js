// 
let DEBUG_MODE = false;

let recorder;
const screens = ["invito", "scopo", "scegli", "questa", "intro", "seipronto", "play", "finale" ];
const random_scelta_video = ["DJ_EXPLORA_04.mp4",
"DJ_EXPLORA_05.mp4",
"DJ_EXPLORA_06.mp4",
"DJ_EXPLORA_07.mp4",];

Array.prototype.pickone = function () {
  return this[Math.floor((Math.random()*this.length))];
}

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

let current_screen = 0;

if (window.location.hash){
  if (screens.indexOf(window.location.hash.substr(1)) != -1)
    current_screen = screens.indexOf(window.location.hash.substr(1));

  if (window.location.hash == "#debug")
    DEBUG_MODE = true;

}


let transition_time = 100;
const final_screen_time = 5000;


const color_light_blue = "#22b8e7";
// const color_light_blue = "#FFFFFF";

const color_orange = '#f7943c';
// const color_red = "#ff591c"
const color_red = '#FFBCA3'

let bg_wave = color_red;
let bg_wave_white = "#FFFFFF";

let bg_prog = color_light_blue;

let waveform, progress, fft;

function enable_buttons(enable = true){
  if (enable || DEBUG_MODE){
    $(`#${screens[current_screen]}`).removeClass("disable");
    document.querySelectorAll(`#${screens[current_screen]} button`)
    .forEach((e)=>{e.disabled = false})

    $(".stop-all").removeClass("disable");

  } else {
    $(`#${screens[current_screen]}`).addClass("disable");
    document.querySelectorAll(`#${screens[current_screen]} button`)
    .forEach((e)=>{e.disabled = true})
  }
}

function stop_all_videos(){
  document.querySelectorAll("video").forEach((e)=>{
    e.pause();
    e.currentTime=0;
  });
}

function goto_next(){
  current_screen = (current_screen + 1) % screens.length;

  if (screens[current_screen] == "intro"){
    set_progress(1);
    $("#intro-controls").append(waveform.canvas);
    $("#intro-controls").append(progress.canvas);
    $(waveform.canvas).show();
    $(progress.canvas).show();

  } else if (screens[current_screen] == "seipronto"){
    set_progress(1);
    $("#rec-controls").append(waveform.canvas);
    $("#rec-controls").append(progress.canvas);
    $(waveform.canvas).show();
    $(progress.canvas).show();

  } else if (screens[current_screen] == "play"){
    $("#big_waveform").append(waveform.canvas);

  } else if (screens[current_screen] == "play"){
    window.location.reload(false); 
  
  } else {
    $(waveform.canvas).hide();
    $(progress.canvas).hide();
  }


  console.log(`Churrent ${screens[current_screen]}`)

  $("#transition").fadeIn( transition_time, ()=> {
    $("#transition").fadeOut(transition_time*2);

    if (recorder.state !== 'DONE'){
      recorder.stop_playback();
    }

    $(".screen").addClass("hidden");
    $(`#${screens[current_screen]}`).removeClass("hidden");

    stop_all_videos();

    document.querySelector("#questa video").src = "video/" + random_scelta_video.pickone();

    let v = document.querySelector(`#${screens[current_screen]} video`);
    if (v){
      $(v).fadeIn(transition_time*3)
      if (v.parentElement.classList.contains("video_cornice")){
        $(v.parentElement).fadeIn(transition_time*3);  
      }
      enable_buttons(false);
      v.currentTime =0;
      v.play();
    }
  });
}


function createRecorder(){
  let samples = [
  {
    "path": 'songs/jerusalema.mp3',
    "SoundFile": null,
    "image": "songs/jerusalema.jpg",
    "name" : "<strong>Jerusalema</strong><br><br>"
  },
  {
    "path": 'songs/coccodrillo.mp3',
    "SoundFile": null,
    "image": "songs/coccodrillo.jpg",
    "name" : "<strong>Il coccodrillocome fa?</strong><br><br>"
  },
  {
    "path": 'songs/cantstopthefeeling.mp3',
    "SoundFile": null,
    "image": "songs/cantstopthefeeling.jpg",
    "name" : "<strong>Justin Timberlake</strong><br>Can't stop the feeling"
  },
  {
    "path": 'songs/tagliatelle.mp3',
    "SoundFile": null,
    "image": "songs/tagliatelle.jpg",
    "name" : "<strong>Le tagliatelle di nonna Pina</strong><br>"
  },
  {
    "path": 'songs/mipiacesetimuovi.mp3',
    "SoundFile": null,
    "image": "songs/mipiacesetimuovi.jpg",
    "name" : "<strong>Madagascar</strong><br>Mi piaci se ti muovi"
  },
  {
    "path": 'songs/infondoalmar.mp3',
    "SoundFile": null,
    "image": "songs/infondoalmar.jpg",
    "name" : "<strong>Ronny grant</strong><br>In fondo al mar"
  },
  {
    "path": 'songs/sorgero.mp3',
    "SoundFile": null,
    "image": "songs/sorgero.jpg",
    "name" : "<strong>Serena autieri</strong><br>All'alba sorgera"
  },
  {
    "path": 'songs/karaoke.mp3',
    "SoundFile": null,
    "image": "songs/karaoke.jpg",
    "name" : "<strong>karaoke</strong><br><br>"
  },
  ]

  if (DEBUG_MODE){
    let tone = {
      "path": 'tone.ogg',
      "SoundFile": null,
      "image": "tone.jpg",
      "name" : "440Hz tone"
    }
    samples[0]=tone;
  }

  recorder = new RAIRecorder( samples );

}


function uploadBlob(name) {

  var jqxhr = $.ajax({
    type:"POST",
    cache:false,
    url:`/recordings/${name}.wav`,
    processData: false,
    data:recorder.getBlob()   

  }).done(function() {
    console.log( "upload wav success!" );
  })
  .fail(function(jq, text, err) {
    console.log( err );
  })
  .always(function(jq) {

      //SIGNAL END OF AJAX to eventually wait on the end screen
      console.log( jq );
    });

}

function set_progress(val){
  progress.noStroke();
  progress.fill(bg_prog);
  progress.clear()

  if (val >= 1) return; 

  val = 1 - val.clamp(0,1);

  let from = 0 - HALF_PI;
  let to = PI * 2 * val - HALF_PI;
  progress.arc(progress.width/2, progress.height/2, 
    progress.width-10, progress.height-10,  from, to, PIE);
}

function setup() {
  $(`#${screens[current_screen]}`).removeClass("hidden");
  $("#transition").fadeOut(500);
  if (!DEBUG_MODE){
    $("#stats").hide();
  }


  waveform = createGraphics(500*2, 150*2);
  progress = createGraphics(400, 400);
  $(progress.canvas).attr("style", "").attr("id", "progress-canvas").hide();
  $(waveform.canvas).attr("style", "").attr("id", "waveform-canvas").hide();



  waveform.background(bg_wave);

  fft = new p5.FFT();

  noCanvas();
  frameRate(25);
  
  createRecorder();
  recorder.mic.connect(fft);

  text('tap to record', width/2, height/2);

  populateDOM(recorder);

  $(".btn-next").click(goto_next);

  $("#intro .btn-next").click(()=> recorder.reset());

  document.querySelectorAll("video").forEach((e)=>{
    e.onended = goto_next; 

  });

  document.querySelectorAll("video.vid-same-screen").forEach((e)=>{
   e.onended = ()=>{
    enable_buttons(true);

    if (e.parentElement.classList.contains("video_cornice")){
      $(e.parentElement).fadeOut(transition_time*3);  
    }
    $(e).fadeOut(transition_time*3);

  };
});



  window.addEventListener('recording_ended', function (e) { 
    if (recorder.state === 'DONE') {
      console.log("Recording ended, Uploading blob");
      uploadBlob(`rec_${Date.now()}_${recorder.selectedName.replace(/ /g,"_")}`)
      goto_next();
      recorder.play();
    }
  }); 

  // window.addEventListener('playback_ended', function (e) { 
  //   if (recorder.state === 'DONE') {
  //     recorder.reset();
  //   }
  // });


}

let reset_waveform = true;

function draw(){
  if (frameCount % 12 == 0){
    $("#stats pre").html("RECORDER STATE\n==============\n")

    $("#stats pre").append(`STATE: ${recorder.state}\n`);
    $("#stats pre").append(`SELECTED: ${recorder.selectedAudio.file}\n`);
    $("#stats pre").append(`DRY/WET EFFECT: ${recorder.drywet_static}\n`);
    $("#stats pre").append(`PREV TIME LEFT: ${recorder.prev_time_left}\n`);
    $("#stats pre").append(`REC TIME LEFT: ${recorder.time_left}\n`);
    if (recorder.SoundFile){
      $("#stats pre").append(`BUFFER DURATION: ${recorder.SoundFile.duration()}\n`);

    }
  }

  if (recorder.isrecording || recorder.isplaying ){
    let waveform_graph = fft.waveform(512);
    waveform.noFill();
    bg_wave = recorder.isplaying ? bg_wave_white : color_red;
    waveform.background( bg_wave );
    waveform.beginShape();
    waveform.stroke(20);
    for (let i = 0; i < waveform_graph.length; i++){
      let x = map(i, 0, waveform_graph.length, 0, waveform.width);
      let y = map( waveform_graph[i], -1, 1, 0, waveform.height);
      waveform.vertex(x,y);
    }
    waveform.endShape();
    reset_waveform = true;

  } else if (reset_waveform) {
    waveform.background(bg_wave_white);
    waveform.line(0, waveform.height/2, waveform.width, waveform.height/2);
    reset_waveform = false;
  }

  if (recorder.state === 'REC_PREV'){
    bg_prog = color_light_blue;
    if (recorder.prev_time_left > 0){
      recorder.prev_time_left -= (deltaTime / 1000);
      set_progress(recorder.prev_time_left/ recorder.prev_max_time);

    } else {
      recorder.state = 'PREV';
      recorder.prev_time_left = recorder.prev_max_time;
      $( "#test-record" ).prop( "disabled", false );
      $( "#play-test" ).prop( "disabled", false );
      $(progress.canvas).hide();
      
      window.setTimeout(()=>{
        recorder.stop()
      }, 200);
    }

  } else if (recorder.state === 'REC_FINAL'){
    bg_prog = color_orange;
    if (recorder.time_left > 0){
      recorder.time_left -= (deltaTime / 1000);
      set_progress(recorder.time_left/ recorder.max_time);

    } else {
      recorder.state = 'DONE';

      window.setTimeout(()=>{
        recorder.stop()
      }, 200);

      window.addEventListener('playback_ended', function (e) { 
        // console.log("RESET!!");
        // if (recorder.state === 'DONE') recorder.reset();
        $(".song_card").removeClass("selected_song");
        populate_questa(recorder);

        if (screens[current_screen] == "play") goto_next();
      }); 

      // $( "#seipronto #record" ).text("PLAYING");
    }   
  }

}

