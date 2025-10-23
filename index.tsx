import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// Helper function for base64 encoding (if needed for future image uploads, etc.)
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return btoa(binary);
}

// Utility function to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String.split(',')[1]); // Remove the data:image/png;base64, prefix
    };
    reader.readAsDataURL(blob);
  });
};

// --- Component Definitions ---

// Shared styles for buttons/shields
const buttonBaseStyle: React.CSSProperties = {
  background: 'linear-gradient(to bottom right, #4c0370, #250136)',
  border: '3px solid gold',
  borderRadius: '8px',
  color: 'white',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
  position: 'relative', // For icon positioning
};

const buttonHoverStyle: React.CSSProperties = {
  transform: 'scale(1.05)',
  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.6)',
};

const shieldIconStyle: React.CSSProperties = {
  filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.7))', // Adds shadow to icon
};

const shieldTitleStyle: React.CSSProperties = {
  fontFamily: "'MedievalSharp', serif",
  margin: 0,
  color: 'white',
  textShadow: '1px 1px 2px black',
};

interface ShieldProps {
  title: string;
  iconSrc: string;
  onClick: () => void;
}

const Shield: React.FC<ShieldProps> = ({ title, iconSrc, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isUrl = iconSrc.startsWith('http');

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ ...buttonBaseStyle, ...(isHovered ? buttonHoverStyle : {}) }}
      className="shield-button" // Added class for responsive styling
      aria-label={title}
    >
      {isUrl ? (
        <img src={iconSrc} alt={`${title} Icon`} style={shieldIconStyle} className="shield-button-icon" />
      ) : (
        <span className="material-symbols-outlined shield-button-icon" style={shieldIconStyle}>
          {iconSrc}
        </span>
      )}
      <p style={shieldTitleStyle} className="shield-button-title">{title}</p>
    </button>
  );
};

const HomePage: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const handleAboutMsMyriamClick = () => {
    window.open('https://sites.google.com/view/grammarquestapp/bio', '_blank');
  };
  
  const handleGoogleClassroomClick = () => {
    window.open('https://classroom.google.com/c/NzYxMDc4MTU5NjU3', '_blank');
  };

  const handleClassHandoutsClick = () => {
    window.open('https://drive.google.com/drive/folders/1Sr9xbEXpw6OUlLqInbPMPbAZtk2zegBc?usp=sharing', '_blank');
  };

  const shieldData = [
    { title: 'About Ms. Myriam', icon: 'https://lh7-rt.googleusercontent.com/slidesz/AGV_vUe34BMHKLy2DjwZMyKmn2socMmFySutrGCMGKtxBIIi_RBUClS4_PpYynF40VL4h-KK0-EPdWuc4cIp8q5fjFkZpRVZ_NMABUT5FFEe7XJOF7CFL1DAxkHdNGVrSJJwIurCYW0Cmw=s2048?key=z2lFMMCePVixtAxYRREAHg', onClick: handleAboutMsMyriamClick },
    { title: 'Recovered Scrolls', icon: 'history_edu', onClick: () => setPage('recoveredScrolls') },
    { title: 'Kingdom Of Gramaria', icon: 'castle', onClick: () => setPage('kingdomOfGramaria') },
    { title: 'Hero Leaderboard', icon: 'leaderboard', onClick: () => setPage('heroLeaderboard') },
    { title: 'Heroes Hall Of Fame', icon: 'wall_art', onClick: () => setPage('heroesHallOfFame') },
    { title: 'Class Handouts', icon: 'book', onClick: handleClassHandoutsClick },
    { title: 'Google Classroom Portal', icon: 'door_open', onClick: handleGoogleClassroomClick },
    { title: 'Music of Gramaria', icon: 'music_note', onClick: () => setPage('musicOfGramaria') },
  ];

  return (
    <div style={homePageContainerStyle}>
      <h1 style={titleStyle} className="main-title">Ms. Myriam's GrammarQuest! Class App</h1>
      <p className="subtitle">Updated, Improved, And Redesigned by Caiden</p>
      <div style={shieldsGridStyle} className="shields-grid">
        {shieldData.map((shield, index) => (
          <Shield
            key={index}
            title={shield.title}
            iconSrc={shield.icon}
            onClick={shield.onClick}
          />
        ))}
      </div>
      <div className="home-footer">
        If you have a suggestion, Please <a href="https://classroom.google.com/c/NzYxMDc4MTU5NjU3/p/ODA0OTA5MzI1MTc0/details" target="_blank" rel="noopener noreferrer">Add A Class Comment!</a>
      </div>
    </div>
  );
};

interface PageContainerProps {
  children: React.ReactNode;
  setPage: (page: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const PageContainer: React.FC<PageContainerProps> = ({ children, setPage, className, style }) => {
  return (
    <div style={{ ...fullPageContentStyle, ...style }} className={className}>
      <button
        onClick={() => setPage('home')}
        className="back-button-style"
        aria-label="Back to Main Page"
      >
        &#x2190; Back to Main
      </button>
      {children}
    </div>
  );
};

// --- Recovered Scrolls Page ---

interface Scroll {
  id: number;
  name: string;
  recoveryDate: string;
  imageUrl: string;
}

const scrollsData: Scroll[] = [
    { id: 1, name: "The Scroll of Accuracy", recoveryDate: "Recovered: Sep 11, 2025", imageUrl: "https://github.com/caidenfredrickson2022/ImageHosting/blob/701fbcc03973fa7c7560a0eb0619a07ab3aca805/1_ScrollOfAccuracy.png?raw=true" },
    { id: 2, name: "The Scroll of Punctuation", recoveryDate: "Recovered: Sep 22, 2025", imageUrl: "https://github.com/caidenfredrickson2022/ImageHosting/blob/main/2_ScrollOfPunctuation.png?raw=true" },
    { id: 3, name: "The Scroll of Order", recoveryDate: "Recovered: Sep 29, 2025", imageUrl: "https://github.com/caidenfredrickson2022/ImageHosting/blob/main/3_ScrollOfOrder.png?raw=true" },
    { id: 4, name: "The Scroll of Meaning", recoveryDate: "Recovered: Oct 13, 2025", imageUrl: "https://github.com/caidenfredrickson2022/ImageHosting/blob/main/4_ScrollOfMeaning.png?raw=true" },
    { id: 5, name: "Scroll of the Unknown", recoveryDate: "Not yet recovered", imageUrl: "https://github.com/caidenfredrickson2022/ImageHosting/blob/main/flip.png?raw=true" },
];

interface ScrollItemProps {
  scroll: Scroll;
  onSelect: (scroll: Scroll) => void;
}

const ScrollItem: React.FC<ScrollItemProps> = ({ scroll, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div 
      className="scroll-item"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(scroll)}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${scroll.name}`}
    >
      <img src={scroll.imageUrl} alt={scroll.name} />
      {isHovered && (
        <div className="scroll-overlay">
          <h3 className="scroll-name">{scroll.name}</h3>
          <p className="scroll-description">{scroll.recoveryDate}</p>
        </div>
      )}
    </div>
  );
};

const ScrollDetailView: React.FC<{ scroll: Scroll; onClose: () => void; }> = ({ scroll, onClose }) => {
  return (
    <div className="scroll-detail-view">
      <button onClick={onClose} className="scroll-detail-close-btn" aria-label="Close scroll view">&times;</button>
      <img src={scroll.imageUrl} alt={scroll.name} className="scroll-detail-img" />
      <div className="scroll-detail-info">
          <h3 className="scroll-detail-name">{scroll.name}</h3>
          <p className="scroll-detail-date">{scroll.recoveryDate}</p>
      </div>
    </div>
  );
};

const RecoveredScrollsPage: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const [selectedScroll, setSelectedScroll] = useState<Scroll | null>(null);

  return (
    <PageContainer setPage={setPage} className="recovered-scrolls-page-background">
      <h2 style={{ ...titleStyle, textShadow: '2px 2px 4px black' }} className="main-title page-title">Recovered Scrolls</h2>
      {selectedScroll ? (
        <ScrollDetailView scroll={selectedScroll} onClose={() => setSelectedScroll(null)} />
      ) : (
        <>
          <p style={{ ...shieldTitleStyle, fontSize: '1.5em', marginTop: '20px', marginBottom: '40px' }}>
            Hover over a scroll to reveal its secrets. Click to inspect.
          </p>
          <div className="scrolls-container">
            {scrollsData.map(scroll => (
              <ScrollItem key={scroll.id} scroll={scroll} onSelect={setSelectedScroll} />
            ))}
          </div>
        </>
      )}
    </PageContainer>
  );
};

// --- Hero Leaderboard Page ---

interface Hero {
  name: string;
  points: number;
  rank: string;
}

const leaderboardRawData = `Name: LARRY THE WORDSMITH
Points: 127
Rank: Emerald
Name: MASON THE CARTOGRAPHER
Points: 125
Rank: Emerald
Name: GIDEON THE CHRONICLER
Points: 116
Rank: Emerald
Name: NATHAN THE NAVIGATOR
Points: 110
Rank: Emerald
Name: SOPHIA OF THE NORTHERN LIBRARIES
Points: 96
Rank: None
Name: EPIC THE INVENTOR
Points: 93
Rank: None
Name: NORAH THE COMPOSER
Points: 92
Rank: None
Name: CAIDEN THE BARD
Points: 91
Rank: None
Name: LADY STELLA OF SCRIPTORIA
Points: 91
Rank: None
Name: LUIS THE ARCHIVIST
Points: 85
Rank: None
Name: DANIEL THE BINDER
Points: 82
Rank: None`;

const parseLeaderboardData = (rawData: string) => {
  const lines = rawData.trim().split('\n');
  const heroes: Hero[] = [];
  for (let i = 0; i < lines.length; i += 3) {
    const name = lines[i].replace('Name: ', '').trim();
    const points = parseInt(lines[i + 1].replace('Points: ', '').trim(), 10);
    const rank = lines[i + 2].replace('Rank: ', '').trim();
    heroes.push({ name, points, rank });
  }
  return heroes;
};

const leaderboardData: Hero[] = parseLeaderboardData(leaderboardRawData);

const HeroLeaderboardPage: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  return (
    <PageContainer setPage={setPage} style={placeholderPageStyle}> {/* Reusing placeholderPageStyle for background */}
      <>
        <h2 style={{ ...titleStyle, textShadow: '2px 2px 4px black' }} className="main-title page-title">Hero Leaderboard</h2>
        <div className="leaderboard-container">
          {leaderboardData.map((hero, index) => (
            <div key={index} className="leaderboard-item">
              <span className="leaderboard-item-name">{hero.name}</span>
              <span className="leaderboard-item-points">{hero.points} Points</span>
              <span className={`leaderboard-item-rank-badge rank-${hero.rank.toLowerCase().replace(/\s/g, '-')}`}>
                {hero.rank === 'Emerald' ? (
                  <span className="material-symbols-outlined">diamond</span>
                ) : hero.rank === 'None' ? (
                  'No Rank'
                ) : (
                  hero.rank
                )}
              </span>
            </div>
          ))}
        </div>
      </>
    </PageContainer>
  );
};

// --- Heroes Hall of Fame Page ---

interface FameItem {
  title: string;
  author: string;
  image: string;
  content: string;
}

const hallOfFameData: FameItem[] = [
  {
    title: "Christians Dissociation from Society",
    author: "Nathan the Navigator",
    image: "https://github.com/caidenfredrickson2022/ImageHosting/blob/main/christians.png?raw=true",
    content: "Throughout the Middle Ages, in an effort to become more holy, Christians dissociated from society because of the mainstream unholy nature of peoples as it was in that time. The Christians predominantly evaded cities and eventually congregated into communities in the wilderness. In the monastery, the men were nominated “Monks”, the head monk was called “Abbot” meaning father. Many of the Monks created duplicates of scripture and wrote many important events of the time. Monks established monasteries. In the monasteries the Monks would teach society how to read and write. They were also peaceful places where the Monks served food and even lodging whether or not the folk could pay. The monasteries played a crucial role in civilizing the masses."
  },
  {
    title: "Monasteries",
    author: "Norah the Composer",
    image: "https://github.com/caidenfredrickson2022/ImageHosting/blob/main/monasteries.png?raw=true",
    content: "\tDuring the Middle Ages, some Christians believed that to be holier, you must separate yourself from society. They escaped away to the wilderness and began living as hermits in caverns. Eventually, groups of those with this belief gathered to create monasteries. Then men were known as monks and the top monk was called the abbot, which meant father. These monks would write astutely (voc), making many copies of scriptures. Records of important events were also made. Monasteries became beautiful places of wisdom and learning. It was almost like an inn too, graciously welcoming outsiders and travelers without asking to be paid in return. Faith resided within the monasteries, giving them hope on difficult days."
  }
];

const FameDetailView: React.FC<{ item: FameItem; onClose: () => void; }> = ({ item, onClose }) => {
  return (
    <div className="fame-detail-view">
      <button onClick={onClose} className="fame-detail-close-btn" aria-label="Close view">&times;</button>
      <img src={item.image} alt={item.title} className="fame-detail-img" />
      <div className="fame-detail-body">
        <h3 className="fame-detail-title">{item.title}</h3>
        <h4 className="fame-detail-author">By {item.author}</h4>
        <p className="fame-detail-content">{item.content.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}</p>
      </div>
    </div>
  );
};


const HeroesHallOfFamePage: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const [selectedFameItem, setSelectedFameItem] = useState<FameItem | null>(null);

  return (
    <PageContainer setPage={setPage} style={placeholderPageStyle}>
        <h2 style={{ ...titleStyle, textShadow: '2px 2px 4px black' }} className="main-title page-title">Heroes Hall Of Fame</h2>
        {selectedFameItem ? (
          <FameDetailView item={selectedFameItem} onClose={() => setSelectedFameItem(null)} />
        ) : (
          <div className="hall-of-fame-grid">
              {hallOfFameData.map((item, index) => (
                  <div 
                    key={index} 
                    className="fame-card" 
                    onClick={() => setSelectedFameItem(item)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View details for ${item.title}`}
                  >
                      <img src={item.image} alt={item.title} className="fame-card-img" />
                      <div className="fame-card-body">
                          <h3 className="fame-card-title">{item.title}</h3>
                          <h4 className="fame-card-author">By {item.author}</h4>
                          <p className="fame-card-content">{item.content.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}</p>
                      </div>
                  </div>
              ))}
          </div>
        )}
    </PageContainer>
  );
};

// --- Music of Gramaria Page ---

const playlist = [
  { title: "Whispers of the Ancients", src: "https://github.com/caidenfredrickson2022/ImageHosting/raw/refs/heads/main/celtic-fantasy-357901.mp3", albumCover: "https://github.com/caidenfredrickson2022/ImageHosting/blob/main/whispers-of-ancients.png?raw=true" },
  { title: "Acoustic Lore", src: "https://github.com/caidenfredrickson2022/ImageHosting/raw/refs/heads/main/celtic-fantasy-acoustic-378624.mp3", albumCover: "https://github.com/caidenfredrickson2022/ImageHosting/blob/main/acoutisc-lore.png?raw=true" },
  { title: "Lumina's Light", src: "https://github.com/caidenfredrickson2022/ImageHosting/raw/refs/heads/main/fantasy-music-lumina-143991.mp3", albumCover: "https://github.com/caidenfredrickson2022/ImageHosting/blob/main/luminas-light.png?raw=true" },
  { title: "Dance of the Isles", src: "https://github.com/caidenfredrickson2022/ImageHosting/raw/refs/heads/main/medieval-irish-celtic-ireland-music-311693.mp3", albumCover: "https://github.com/caidenfredrickson2022/ImageHosting/blob/main/dance-of-isles.png?raw=true" },
  { title: "Forest Folk's Hymn", src: "https://github.com/caidenfredrickson2022/ImageHosting/raw/refs/heads/main/nature-celtic-folk-instrumental-415815.mp3", albumCover: "https://github.com/caidenfredrickson2022/ImageHosting/blob/main/forest-folk-hymn.png?raw=true" },
  { title: "Journey Through the Glen", src: "https://github.com/caidenfredrickson2022/ImageHosting/raw/refs/heads/main/through-the-glen-celtic-music-342771.mp3", albumCover: "https://github.com/caidenfredrickson2022/ImageHosting/blob/main/journey-through-glen.png?raw=true" },
];


const MusicOfGramariaPage: React.FC<{ setPage: (page: string) => void }> = ({ setPage }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [duration, setDuration] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [loopMode, setLoopMode] = useState<'off' | 'all' | 'one'>('off');

  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => console.error("Audio play failed:", error));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = volume;
    }
  }, [volume]);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = loopMode === 'one';
    }
  }, [loopMode]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = playlist[currentTrackIndex].src;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrackIndex]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
        setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
        setDuration(audioRef.current.duration);
    }
  };

  const handleTrackEnd = () => {
    if (loopMode === 'one') {
      return; // The audio element's loop attribute handles this
    }

    const isLastTrackNonLooping = loopMode === 'off' && !isShuffled && currentTrackIndex === playlist.length - 1;

    if (isLastTrackNonLooping) {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      setProgress(0);
    } else {
      handleNextTrack();
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    if (isShuffled) {
      let nextIndex;
      if (playlist.length <= 1) {
        nextIndex = 0;
      } else {
        do {
          nextIndex = Math.floor(Math.random() * playlist.length);
        } while (nextIndex === currentTrackIndex);
      }
      setCurrentTrackIndex(nextIndex);
    } else {
      setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
    }
  };

  const handlePrevTrack = () => {
    if (isShuffled) {
        handleNextTrack(); // In shuffle, "previous" just plays another random track
    } else {
        setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + playlist.length) % playlist.length);
    }
  };
  
  const handleTrackClick = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };
  
  const handleShuffleToggle = () => {
    setIsShuffled(!isShuffled);
  };

  const handleLoopToggle = () => {
    setLoopMode(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
        audioRef.current.currentTime = Number(e.target.value);
        setProgress(Number(e.target.value));
    }
  };

  return (
    <PageContainer setPage={setPage} style={placeholderPageStyle}>
      <h2 style={{ ...titleStyle, textShadow: '2px 2px 4px black' }} className="main-title page-title">Music of Gramaria</h2>
      <div className="music-player-container">
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleTrackEnd}
          src={playlist[currentTrackIndex].src}
        />
        <img src={playlist[currentTrackIndex].albumCover} alt={playlist[currentTrackIndex].title} className="album-cover-art" />
        <div className="track-info">
            <h3 className="track-title">{playlist[currentTrackIndex].title}</h3>
        </div>
        <div className="progress-bar-container">
            <span>{formatTime(progress)}</span>
            <input 
                type="range" 
                className="progress-bar"
                min="0"
                max={duration || 0}
                value={progress}
                onChange={handleProgressChange}
            />
            <span>{formatTime(duration)}</span>
        </div>
        <div className="controls-container">
            <button className={`control-button secondary-control ${isShuffled ? 'active' : ''}`} onClick={handleShuffleToggle} aria-label="Shuffle">
                <span className="material-symbols-outlined">shuffle</span>
            </button>
            <button className="control-button" onClick={handlePrevTrack} aria-label="Previous Track">
                <span className="material-symbols-outlined">skip_previous</span>
            </button>
            <button className="control-button play-pause-button" onClick={handlePlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
                <span className="material-symbols-outlined">{isPlaying ? 'pause' : 'play_arrow'}</span>
            </button>
            <button className="control-button" onClick={handleNextTrack} aria-label="Next Track">
                <span className="material-symbols-outlined">skip_next</span>
            </button>
            <button className={`control-button secondary-control ${loopMode !== 'off' ? 'active' : ''}`} onClick={handleLoopToggle} aria-label="Loop">
                <span className="material-symbols-outlined">{loopMode === 'one' ? 'repeat_one' : 'repeat'}</span>
            </button>
        </div>
        <div className="volume-container">
            <span className="material-symbols-outlined">volume_up</span>
            <input 
                type="range" 
                className="volume-slider"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
            />
        </div>
      </div>
      <div className="playlist-container">
        {playlist.map((track, index) => (
          <div 
            key={index}
            className={`playlist-item ${index === currentTrackIndex ? 'active' : ''}`}
            onClick={() => handleTrackClick(index)}
          >
            <img src={track.albumCover} alt={track.title} className="playlist-item-cover" />
            <span className="playlist-item-title">{track.title}</span>
          </div>
        ))}
      </div>
    </PageContainer>
  );
};

const PlaceholderPage: React.FC<{ setPage: (page: string) => void; title: string }> = ({ setPage, title }) => {
  return (
    <PageContainer setPage={setPage} style={placeholderPageStyle}>
      <>
        <h2 style={{ ...titleStyle, textShadow: '2px 2px 4px black' }} className="main-title page-title">{title}</h2>
        <p style={{ ...shieldTitleStyle, fontSize: '1.5em', marginTop: '20px' }}>This quest is coming soon, brave hero! Check back later.</p>
      </>
    </PageContainer>
  );
};


// --- Main App Component ---
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div style={appContainerStyle} className="app-container-background">
      {currentPage === 'home' && <HomePage setPage={setCurrentPage} />}
      {currentPage === 'recoveredScrolls' && <RecoveredScrollsPage setPage={setCurrentPage} />}
      {currentPage === 'kingdomOfGramaria' && <PlaceholderPage setPage={setCurrentPage} title="Kingdom Of Gramaria" />}
      {currentPage === 'heroLeaderboard' && <HeroLeaderboardPage setPage={setCurrentPage} />}
      {currentPage === 'heroesHallOfFame' && <HeroesHallOfFamePage setPage={setCurrentPage} />}
      {currentPage === 'musicOfGramaria' && <MusicOfGramariaPage setPage={setCurrentPage} />}
    </div>
  );
};

// --- Styles for the App ---
const appContainerStyle: React.CSSProperties = {
  minHeight: '100vh',
  width: '100vw',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: 'linear-gradient(to bottom right, #580381, #300142)', // Primary gradient
  fontFamily: "'MedievalSharp', serif",
  color: 'white',
  padding: '20px',
  boxSizing: 'border-box',
  position: 'relative', // Needed for absolute positioning of sub-pages
};

const homePageContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  maxWidth: '1200px',
  width: '100%',
  textAlign: 'center',
};

const titleStyle: React.CSSProperties = {
  fontFamily: "'Cinzel Decorative', serif",
  // fontSize: '4em', // Now handled by CSS class
  fontWeight: 700,
  color: 'gold',
  textShadow: '3px 3px 5px rgba(0,0,0,0.8), -2px -2px 2px rgba(255,255,255,0.3)',
  // marginBottom: '40px', // Now handled by CSS class
  // marginTop: '20px', // Now handled by CSS class
  lineHeight: '1.2',
};

const shieldsGridStyle: React.CSSProperties = {
  display: 'grid',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '900px',
};

const fullPageContentStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100vw',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start', // Align content to the top
  alignItems: 'center',
  padding: '20px',
  boxSizing: 'border-box',
  color: 'white',
  fontFamily: "'MedievalSharp', serif",
  textAlign: 'center',
  overflowY: 'auto', // Allow scrolling on the page itself
};

const placeholderPageStyle: React.CSSProperties = {
  background: 'linear-gradient(to bottom right, #580381, #300142)',
};


// --- Render the App ---
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
