

function populateDOM(recorder) {
	populate_scegli(recorder);
	$(".stop-all").click((e)=>{
		recorder.stop_playback();
		$(".stop-all").prop( "disabled", true );
	});	

	recorder.onended.push( ()=> {
			$(".stop-all").prop( "disabled", true );
		});

	populate_questa(recorder);

	populate_premi(recorder);

	populate_intro(recorder);

	populate_final(recorder)
}

function get_parent(target){
	let parent= target.parentElement;

	if (target.nodeName === "IMG"){
		parent = parent.parentElement;
	}

	return parent;

		
}


function get_id(target){
	return parseInt(get_parent(target).id.substr(-1));

}


function populate_scegli(recorder){
	recorder.sampleAudios.forEach((f, i) => {
			let card = $( "#master_song_card" )
				.clone()
				.attr("id", "song_sample_" + i );

			card.children("img").attr("src", f["image"]);
			card.children("p").html(f["name"]);
			card.children("button.song_play").click((e)=>{
					
				let song_id = get_id(e.target);
				recorder.stop_playback();
				recorder.previewSong(song_id);
				$(".stop-all").prop( "disabled", false );
			});

			card.children(".song_select").click((e)=>{
				let song_id = get_id(e.target);
				recorder.selectSong(song_id); 

				$(".song_card").removeClass("selected_song");
				$(get_parent(e.target)).addClass("selected_song");

				$("#questa .song_card").children("img").attr("src", recorder.sampleAudios[song_id]["image"]);
				$("#questa .song_card").children("p").html(recorder.sampleAudios[song_id]["name"]);


			});

			card.appendTo( "#songs-container" );

		});
}


function populate_questa(recorder){
	let card = $( "#master_song_card" )
		.clone()
		.attr("id", "song_sample_0" );


	card.children("img").attr("src", recorder.sampleAudios[0]["image"]);
	card.children("p").html(recorder.sampleAudios[0]["name"]);
	card.children(".song_play").hide();
	card.children(".song_select").hide();

	$( "#questa #single-song-container" ).html(card);

}

/*----------  PREV  ----------*/


function testRecordPressed(recorder, evt){
   recorder.checkAudio();
   if (recorder.state === 'IDLE' || recorder.state === 'PREV') {
     recorder.record(false);
     recorder.state = 'REC_PREV';
     $("#play-test").prop( "disabled", true );
	$("#progress-canvas").show();
   
   } else if (recorder.state === 'REC_PREV') {
      recorder.stop();
      recorder.state = 'PREV';
		$("#progress-canvas").hide();

      // $(evt.target).text("REGISTRA");
      $( "#intro #play-test" ).prop( "disabled", false );
    }
}

function testPlayPressed(recorder, evt){
	recorder.checkAudio();
	if (recorder.state === 'PREV' ||  recorder.state === 'DONE'){
		recorder.play();
		recorder.state = 'PLAY_PREV';
		$("#test-record").prop( "disabled", true );
		// $(evt.target).text("STOP PLAYBACK");

		recorder.onended.push( ()=> {
				recorder.state = 'PREV';
				$("#test-record").prop( "disabled", false );
				// $(evt.target).text("SENTI LA TUA REGISTRAZIONE");
			});

	} else if (recorder.state === 'PLAY_PREV') {
		recorder.stop_playback();
		recorder.state = 'PREV';
		$("#test-record").prop( "disabled", false );
		// $(evt.target).text("SENTI LA TUA REGISTRAZIONE");

	}
}

function populate_intro(recorder){
	$( "#intro #test-record" ).click((e)=>{
		testRecordPressed(recorder, e);
	});

	$( "#intro #play-test" ).click((e)=>{
		testPlayPressed(recorder, e);
	});

	// $("#intro #delay_amount").on("input", (e)=>{
	// 	recorder.drywet_static = e.target.value;
	// })

	// $("#intro #delay_amount").get(0).value = recorder.drywet_static;
}

/*----------  RECORD  ----------*/

function recordPressed(recorder, evt){
   recorder.checkAudio();
   if (recorder.state === 'IDLE' || recorder.state === 'PREV') {
     recorder.record(true);
     recorder.state = 'REC_FINAL';

     $("#record").prop( "disabled", true );
     // $("#record img").prop( "src", "btn-rec-RED-on.png" );
   
   } else if (recorder.state === 'REC_FINAL') {
      recorder.stop();
      recorder.state = 'DONE';
      $("#record").prop( "disabled", false );
      $( "#intro #play-test" ).prop( "disabled", false );
    }
}


function populate_premi(recorder){
	$( "#seipronto #record" ).click((e)=>{
		recordPressed(recorder, e);
	});

	// $("#defaultCanvas0").appendTo("#seipronto");
}



function populate_final(recorder){
	$( "#finale #play-final" ).click((e)=>{
		console.log("Press final playback");

		window.addEventListener('playback_ended', function (e) { 
		  // console.log("RESET!!");
		  // if (recorder.state === 'DONE') recorder.reset();
			window.location.reload(false); 
		}); 

		window.setTimeout(()=>{
			window.location.reload(false); 
		}, 30000);

		testPlayPressed(recorder, e);
	});

	// $("#intro #delay_amount").on("input", (e)=>{
	// 	recorder.drywet_static = e.target.value;
	// })

	// $("#intro #delay_amount").get(0).value = recorder.drywet_static;
}
