
let currentSong = new Audio;
let currentFolder;

let songs = [];

async function getSongs(folder) {
    currentFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/Spotify%20project/${currentFolder}/`)

    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    songs = [];
    let elements = div.getElementsByTagName("a");

    for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currentFolder}/`)[1]);
        }
    }

    let SongUl = document.querySelector(".SongList").getElementsByTagName("ul")[0];
    SongUl.innerHTML = "";
    for (const song of songs) {

        SongUl.innerHTML += `<li>
        <img class="invert" src="svg_images/music.svg" alt="music">
                            <div class="SongInfo">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Arijit Singh</div>
                            </div>
                            <div class="PlayNow">
                                <span><p>Play Now</p></span>
                                <img class="invert" src="svg_images/play.svg" alt="play">
                            </div> 
        </li>`;
    }

    //attach an event listner to each song
    Array.from(document.querySelector(".SongList").getElementsByTagName("li")).forEach(element => {

        let FirstTrack = songs[0].replaceAll("%20", " ").trim();
        PlayMusic(songs[0], false);
        document.querySelector(".SongTitle").innerHTML = FirstTrack;

        // in element's 1st div there is song info, and in this div there is song name in its 1st div

        // 1st logic to get song name only
        // PlayMusic(element.getElementsByTagName("div")[0].getElementsByTagName("div")[0].trim());

        //2nd logic
        element.addEventListener("click", (e) => {
            PlayMusic(element.querySelector(".SongInfo").firstElementChild.innerHTML.trim());
            //string.trim() - is a funtion to Removes the leading and trailing white space and line terminator characters from a string
        })
    });

    // return songs;
}

function SecToMin(time) {
    let min = parseInt(time / 60);
    let sec = parseInt(time % 60);
    if (isNaN(min) || isNaN(sec)) {
        return "00:00";
    }
    let ans;
    if (time < 60) {
        ans = `00:${sec}`;
        if(sec < 9) {
            ans = `00:0${sec}` ;
        }
    }
    else {
        ans = `${min}:${sec}`;
        if(min < 9) {
            ans = `0${min}:${sec}` ;
            if(sec < 9) {
                ans = `0${min}:0${sec}` ;
            }
        }
    }
    return ans;
}

//function to play a song
function PlayMusic(track, isPause = true) {
    currentSong.src = `/Spotify%20project/${currentFolder}/` + track;
    if (isPause == true) {
        currentSong.play();
        PlayBtn.src = "svg_images/play.svg";   //change the icon of play/pause
    }
    else {
        document.querySelector(".SongTime").innerHTML = "00:00 / 00:00";
    }

    document.querySelector(".SongTitle").innerHTML = track;

    let info = document.querySelector(".SongList");
    info.addEventListener("dblclick", (el) => {
        currentSong.pause();
        PlayBtn.src = "svg_images/pause.svg";
    })
}

async function displayAlbums() {
    //fetching the api 
    let a = await fetch(`http://127.0.0.1:5500/Spotify%20project/Mysong/`);

    //get the text from the fetched api
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        
        let card = document.querySelector(".CardContainer");
        if (element.href.includes("Mysong/")) {
            
            let folder = element.href.split("Mysong/", 2)[1];
            let a = await fetch(`http://127.0.0.1:5500/Spotify%20project/Mysong/${folder}/info.json`);
            //get the json files from the fetched api
            let response = await a.json();

            card.innerHTML += `<div data-folder="${folder}" class="card rounded">
                <div class="PlayBtn">
                    <img src="svg_images/cardPlayBtn.svg" alt="play">
                </div>
                <img src="Mysong/${folder}/cover.jpeg" alt="cover_image">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`
        }
    }

    //study currentTarget in detail
    //add eventListner to card for loading the respective playlist
    Array.from(document.getElementsByClassName("card")).forEach((e)=>{
        e.addEventListener("click", async (item)=>{
            await getSongs(`Mysong/${item.currentTarget.dataset.folder}`);
            PlayMusic(songs[0].replaceAll("%20"," "));
        })
    })
}

async function main() {

    //get the list of all songs
    await getSongs("Mysong/trending");

    //Add playlist name in the card
    displayAlbums();

    //attach an event listner to playbtn, previous, nextbtn
    PlayBtn.addEventListener("click", (e) => {
        if (currentSong.paused) {
            currentSong.play();
            PlayBtn.src = "svg_images/play.svg";
        }
        else {
            currentSong.pause();
            PlayBtn.src = "svg_images/pause.svg";
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".SongTime").innerHTML = `${SecToMin(currentSong.currentTime)} / ${SecToMin(currentSong.duration)}`;

        let progress = currentSong.currentTime / currentSong.duration;
        document.querySelector(".playcircle").style.left = (progress) * 100 + "%";
    })

    // to move the seek bar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        //getBoundingClientRect() gives the location where we clicked ON THE DOM(here seekbar)
        let percentProgress = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".playcircle").style.left = percentProgress + "%";
        currentSong.currentTime = (percentProgress / 100) * currentSong.duration;
    })

    // add an event listner to hamburger (bar)
    document.querySelector(".hamburger").addEventListener("click", (e) => {
        // document.querySelector(".left").style.width = "400px";   
        document.querySelector(".left").style.left = "0%";
    })

    //event listner to close the left (left menu)
    document.getElementById("closeLeft").addEventListener("click", (e) => {
        document.querySelector(".left").style.left = "-200%";
    })

    //add event listner to previous and next btns
    document.getElementById("PreviousBtn").addEventListener("click", (e) => {
        let toFind = currentSong.src.split(`${currentFolder}/`)[1];
        let index = songs.indexOf(toFind);
        if ((index - 1) >= 0) {
            PlayMusic(songs[index - 1].replaceAll("%20", " "));
        }
        else {
            PlayMusic(songs[songs.length - 1].replaceAll("%20", " "));
        }
    })

    document.getElementById("NextBtn").addEventListener("click", (e) => {
        let toFind = currentSong.src.split(`${currentFolder}/`)[1];
        let index = songs.indexOf(toFind);
        if ((index + 1) < songs.length) {
            PlayMusic(songs[index + 1].replaceAll("%20", " "));
        }
        else {
            PlayMusic(songs[0].replaceAll("%20", " "));
        }
    })

    //add eventListner to volume funtionality
    document.getElementById("VolRange").addEventListener("change", (e) => {
        //audio.volume takes i/p ranges[0, 1], so divide by 100
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    document.getElementById("volumebtn").addEventListener("click", (e) => {
        if(currentSong.volume == 0) {
            currentSong.volume = 0.9;
            // document.getElementById("volumebtn").src=  "volume.svg";
            e.target.src=  "svg_images/volume.svg";
        }
        else{
            currentSong.volume = 0;
            document.getElementById("volumebtn").src=  "svg_images/mute.svg";
        }
    })

    //add eventListner to card for loading the respective playlist
    // let card1 = document.querySelector(".CardContainer").firstElementChild;
    // card1.addEventListener("click", async (e) => {
    //     let folderName = "Mysong/" + document.querySelector(".Card_1Content").innerHTML;
    //     songs = await getSongs(folderName);
    //     currentFolder = folderName;
    //     loadPlaylist(songs);
    // })

    // audio.addEventListener("loadeddata", ()=>{
    //     // The duration variable now holds the duration (in seconds) of the audio clip
    //     let d = audio.duration;
    //     let ct = audio.currentTime;
    //     console.log(d, ct);
    // })
}

main();