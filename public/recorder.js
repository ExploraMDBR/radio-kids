
// let fileExample = {
// 	"path" : "something.mp3",
// 	"SoundFile" : new p5.SoundFile("path");
// 	"image": "path"
// }


class RAIRecorder {
	constructor(files) {
		this.audioCtx = getAudioContext();
		this.mic = new p5.AudioIn();
		this.mic.start();


		this.recorder = new p5.SoundRecorder();
		this.recorder.setInput(this.mic);


		this.sampleAudios = files;
		
		files.forEach(f => {
			f["SoundFile"] = new p5.SoundFile(f["path"]);
			f["SoundFile"].onended((s)=> {
					const event = new CustomEvent('playback_ended', { detail: f['name'] });
					window.dispatchEvent(event);
				});
		});

		this.reset();

		this._setupEvents();

		this.selectSong(0);

	} //end constructor

	/*----------  setup  ----------*/

	reset(){

		this.soundFile = new p5.SoundFile();
		this.soundFile.onended((s)=> {
					const event = new CustomEvent('playback_ended', { detail: 'MAIN' });
					window.dispatchEvent(event);
				});
		
		this._setupFilters();

		this.state = "IDLE";
		this.max_time = 5;
		this.time_left = this.max_time;

		this.prev_max_time = 3;
		this.prev_time_left = this.prev_max_time;


	}
	
	_setupEvents(){
		this.onended = [];
		let self = this;
		window.addEventListener('playback_ended', function (e) { 
			//timeout to eventualy let others start playing
			window.setTimeout(() =>{
				if (!self.isplaying){
					self.onended.forEach((callback) => callback())
					} 

			}, 200)
		});

	}

	_setupFilters(){
		// this.filters = [];
		// this.soundFile.disconnect();

		// let reverb = new p5.Reverb();
		// reverb.process(this.soundFile, 3, 2);
		// this.filters.push(reverb);

		// this.lastRecordingTime = 0
		// this.drywet_dynamic = 1;
		// this.drywet_static = 0.4;

		// this.soundFile._onTimeUpdate = (t) => {
		// 	if (t < this.lastRecordingTime){
		// 		this.drywet_dynamic = 1;
		// 	} else {
		// 		this.drywet_dynamic = 0;
		// 	}

		// 	let drywet_value = this.drywet_dynamic * this.drywet_static;
		// 	// console.log(drywet_value);

		// 	this.filters.forEach((f)=>{
		// 		f.drywet(drywet_value);
		// 	});
		// };
	}


	/*----------  Actions  ----------*/

	mic_analysis(connect = true){
		// if (connect){
		// 	this.mic.connect();
		// 	this.mic.output.gain.value = 0;
		// } else {
		// 	this.mic.output.gain.value = 1;
		// 	this.mic.disconnect();
		// 	this.recorder.setInput(this.mic);
		// }
	}


	checkAudio(){
	  // ensure audio is enabled
	  userStartAudio();

	  if (!this.mic.enabled){
	    alert("Microphone is disabled");
	    throw "Microphone is disabled";
	  }

	}
	
	selectSong(id){
		this.selectedAudio = this.sampleAudios[id]["SoundFile"];
		this.selectedName = this.sampleAudios[id]["name"];
		// const event = new CustomEvent('song_selected', { detail: f['name'] });
		// window.dispatchEvent(event);

	}

	previewSong(id){
		this.sampleAudios[id]["SoundFile"].play();
	}

	record(do_concatenate = false) {
		this.isrecording = true;
		this.mic_analysis(true);
		this.recorder.record(this.soundFile, null, ()=>{
			this.lastRecordingTime = this.soundFile.buffer.length;
			if (do_concatenate){
				this._concatenateAudio();
			} 

			this.mic_analysis(false);
			const event = new Event('recording_ended');
			window.dispatchEvent(event);
			this.isrecording = false;

			// window.setTimeout(() =>	, 200);

		});
	}


	stop_playback(){
		this.sampleAudios.forEach((a) =>{
			a["SoundFile"].stop();
		});
		this.soundFile.stop();
	}

	stop(){
		this.isrecording = false;
		this.recorder.stop();
	}

	play(){
		console.log("play")
		this.soundFile.play();
	}

	getBlob(){
		return this.soundFile.getBlob();
	}

	/*----------  getters  ----------*/
	
	get isplaying(){
		for (var i = this.sampleAudios.length - 1; i >= 0; i--) {
			if (this.sampleAudios[i]["SoundFile"].isPlaying())
				return true;
		}

		if (this.soundFile.isPlaying())
				return true;

		return false;
	}

	/*----------  private methods  ----------*/
	

	_concatenateAudio(){

		let buf_a = this.soundFile.buffer;
		console.log(this.soundFile.buffer.duration);
		let buf_b = this.selectedAudio.buffer;

		if (buf_a.sampleRate != buf_b.sampleRate || buf_a.sampleRate !=  this.audioCtx.sampleRate){
			 throw 'Sample rate of buffers don\'t match!';
		}

		let buffer = this.audioCtx.createBuffer(2, buf_a.length + buf_b.length, this.audioCtx.sampleRate);

	  	let chan_a, chan_b;

		for (var channel = 0; channel < buffer.numberOfChannels; channel++) {
			// This gives us the actual array that contains the data
			var nowBuffering = buffer.getChannelData(channel);

			if (channel <= buf_a.numberOfChannels -1)
				chan_a = buf_a.getChannelData(channel);

			if (channel <= buf_b.numberOfChannels -1)
				chan_b = buf_b.getChannelData(channel);

			//use TypedArray.prototype.set to copy one after the other
			nowBuffering.set(chan_a);
			nowBuffering.set(chan_b, chan_a.length);

		}
		// return buffer;
		this.soundFile.buffer = buffer;
		console.log("Concatenation done");
	}
}

