import React, { useEffect, useState, useRef, useMemo } from "react";
import "./home.css";
import logo from "../../assets/spotify-logo.png";

const Home = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTab, setCurrentTab] = useState("You");
  const [searchTerm, setSearchTerm] = useState("");
  const audioRef = useRef(null);
  const [backgroundColor, setBackgroundColor] = useState("#071952");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://cms.samespace.com/items/songs"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        const updatedData = result.data.map((eachItem) => ({
          accent: eachItem.accent,
          artist: eachItem.artist,
          cover: eachItem.cover,
          dateCreated: new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(new Date(eachItem.date_created)),
          id: eachItem.id,
          name: eachItem.name,
          sort: eachItem.sort,
          status: eachItem.status,
          topTrack: eachItem.top_track,
          url: eachItem.url,
          userCreated: eachItem.user_created,
          userUpdated: eachItem.user_updated,
          thumbnail: `https://cms.samespace.com/assets/${eachItem.cover}`,
        }));
        setData(updatedData);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSong && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [selectedSong]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNextPreviousSong = (direction) => {
    if (currentSongIndex !== null) {
      let newIndex =
        direction === "next"
          ? (currentSongIndex + 1) % data.length
          : (currentSongIndex - 1 + data.length) % data.length;
      setSelectedSong(data[newIndex]);
      setCurrentSongIndex(newIndex);
      setBackgroundColor(data[newIndex].accent || "#fff");
    }
  };

  const handleMuteUnmute = () => {
    if (audioRef.current) {
      const newVolume = isMuted ? 1 : 0;
      setVolume(newVolume);
      setIsMuted(!isMuted);
      audioRef.current.volume = newVolume;
    }
  };

  const handleProgressChange = (e) => {
    const newProgress = e.target.value;
    if (audioRef.current) {
      const newTime = (newProgress / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(newProgress);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(
        (audioRef.current.currentTime / audioRef.current.duration) * 100
      );
    }
  };

  const currentSongsList = useMemo(() => {
    let filteredSongs = data;
    if (currentTab !== "You") {
      filteredSongs = data.filter((item) => item.topTrack);
    }
    if (searchTerm) {
      filteredSongs = filteredSongs.filter(
        (song) =>
          song.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filteredSongs;
  }, [data, currentTab, searchTerm]);

  return (
    <div className="container-fluid" id="ChangeBgColor" style={{ backgroundColor }}>
      <div className="row">
        <div className="col-12 col-lg-2 start-card" style={{ height: '100vh' }}>
          <img src={logo} alt="logo image" className="logo" />
          <div className="avatar">
            {/* Avatar content */}
          </div>
        </div>

        <div className="col-12 col-lg-4 p-0">
          <div className="top-track-section">
            <button className="top-track-tit1" style={currentTab === "You" ? { color: "#fff" } : { color: "grey" }} onClick={() => setCurrentTab("You")}>
              For You
            </button>
            <button className="top-track-tit2" style={currentTab === "Tracks" ? { color: "#fff" } : { color: "grey" }} onClick={() => setCurrentTab("Tracks")}>
              Top Tracks
            </button>
          </div>
          <input
            type="search"
            placeholder="Search by song or artist"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-inp"
          />
          {currentSongsList.length > 0 && (
            <div>
              {currentSongsList.map((song) => (
                <div key={song.id} className="songs-card" style={{ background: song.id === selectedSong?.id ? "#241e16" : "transparent" }}>
                  <div className="songs-card1" onClick={() => setSelectedSong(song)}>
                    <div className="inside-card">
                      <img src={song.thumbnail} alt={song.name} className="song-image" />
                      <div className="songs-desc">
                        <span className="songs-des1">{song.artist}</span>
                        <span className="songs-des2">{song.name}</span>
                      </div>
                    </div>
                    <span className="songs-des-time">{song.dateCreated}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-12 col-lg-6 active-song-main">
          <div className="active-song-card">
            <div className="active-card1">
              <span className="card-tit1">{selectedSong ? selectedSong.name : "Select a song"}</span>
              <span className="card-tit2">{selectedSong ? selectedSong.artist : ""}</span>
            </div>
            <div className="active-card2">{selectedSong && <img src={selectedSong.thumbnail} alt={selectedSong.name} className="active-image" />}</div>
            <div className="audio-player-card">
              {selectedSong && (
                <div className="audio-player">
                  <audio ref={audioRef} src={selectedSong.url} onTimeUpdate={handleAudioTimeUpdate} preload="metadata">
                    Your browser does not support the audio element.
                  </audio>
                  <div className="audio-controls">
                    <input type="range" min="0" max="100" value={progress} onChange={handleProgressChange} className="progress-bar" />
                    <div className="songs-btn-section">
                      <button className="aud-btns" >
                        ⋯
                      </button>
                      <div className="songs-play-card">
                        <button className="control-btns" onClick={() => handleNextPreviousSong("previous")}>
                          ◄◄
                        </button>
                        <button className="control-btns" onClick={handlePlayPause}>
                          {isPlaying ? "🔊" : "🔇"}
                        </button>
                        <button className="control-btns" onClick={() => handleNextPreviousSong("next")}>
                          ►►
                        </button>
                      </div>
                      <button className="aud-btns" onClick={handleMuteUnmute}>
                        {isMuted ? "🔇" : "🔊"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
