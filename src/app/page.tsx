"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { FaBackwardFast, FaForwardFast, FaPause, FaPlus, FaRotate, FaShuffle, FaSistrix, FaTrash } from "react-icons/fa6";
import { useRef, useState } from "react";

type Music = {
  id: number;
  title: string;
}

type Album = {
  id: number;
  name: string;
  musics: Music[];
}

type SearchResult = {
  id: number;
  name: string;
  type?: "album" | "music";
};

export default function Home() {

  const selectRef = useRef([]);
  const formRefs = useRef([]);

  const [albums, setAlbums] = useState<Album[]>([
    {
      id: 1,
      name: "Revolver",
      musics: [{
        id: 1,
        title: "Elanor Rigby 1",
      },
      {
        id: 2,
        title: "Elanor Rigby 2",
      }]
    },
    {
      id: 2,
      name: "Testover",
      musics: [{
        id: 3,
        title: "Elanor Rigby 3",
      },
      {
        id: 4,
        title: "Elanor Rigby 4",
      }]
    }
    
  ])

  const [searchValue, setSearchValue] = useState<string>("");

  const [resultSearch, setResultSearch] = useState<SearchResult[]>([]);

  function search(name: string) {
    console.log("search: " + name);

    if (name === "") {
      setResultSearch([]);
      return;
    }
    const albumResults = albums.filter(album => album.name.toLowerCase().includes(name.toLowerCase()));
    const musicResults = albums.flatMap(album =>
      album.musics.filter(music => music.title.toLowerCase().includes(name.toLowerCase()))
    );

    const albumSearchResults: SearchResult[] = albumResults.map(album => ({ id: album.id, name: album.name, type: "album" }));
    const musicSearchResults: SearchResult[] = musicResults.map(music => ({ id: music.id, name: music.title, type: "music" }));
    setResultSearch([...albumSearchResults, ...musicSearchResults]);
  }

  function create_album(album_name:string) {
    console.log ("album: "+ album_name )
    const novoAlbum = { id: albums.length + 15, name: album_name, musics: [] };
    setAlbums(prevAlbums => [...prevAlbums, novoAlbum]);
  }

  function clone_album(album_id:number) {
    const albumToClone = albums.find(album => album.id === album_id);
    
    if (!albumToClone) {
      console.error('Álbum não encontrado');
      return null;
    }

    const clonedAlbum: Album = {
      ...albumToClone,
      id: albums.length + 100,
      musics: albumToClone.musics.map(song => ({ ...song, id: song.id + 100 }))
    };

    setAlbums([...albums, clonedAlbum]);
  }

  function add_music(album_id:number, music_name:string) {
    console.log ("album: "+ album_id + "\n music: "+ music_name)
    const novosAlbuns = albums.map(album => {
      if (album.id === album_id) {
        return {
          ...album,
          musics: [...album.musics, {id: album.musics.length + 10, title: music_name}]
        };
      }
      return album;
    });
    setAlbums(novosAlbuns);
  }

  function delete_album(id:number) {
    console.log ("album: "+ id )
    const novosAlbuns = albums.filter(album => album.id !== id);
    setAlbums(novosAlbuns);
  }

  function delete_music(album_id:number, music_id:number) {
    console.log ("album: "+ album_id + "\n music: "+ music_id)
    const novosAlbuns = albums.map(album => {
      if (album.id === album_id) {
        return {
          ...album,
          musics: album.musics.filter(musica => musica.id !== music_id)
        };
      }
      return album;
    });
    setAlbums(novosAlbuns);
  }

  return (
    <main className={styles.player}>
    <div className={styles.header}>
        <a href="#" className={styles.button}>
            <FaPlus className={styles.button_md} onClick={() => create_album(searchValue)} />
        </a>
        <input type="text" className={styles.search} onChange={e => setSearchValue(e.target.value)}/>
        <a href="#" className={styles.button}>
          <FaSistrix className={styles.button_md} onClick={() => search(searchValue)}/> 
        </a>
    </div>
    
    <ul className={`${styles.list_search} ${resultSearch.length <=0 ? styles.hidden : ""}`}>
      {resultSearch.map((result, index) => (
        <li key={result.id} className={styles.search_result}>
          <form ref={el => formRefs.current[index] = el} onSubmit={(e) => { 
            e.preventDefault(); 
            console.log(selectRef.current[index]?.value);
            if (result.type === "album") {
              console.log(result.type);
              clone_album(result.id);
            }
            if (selectRef.current[index]?.value) {
              console.log(result.type);
              add_music(Number(selectRef.current[index]?.value), result.name)
            }
          }}>
            <div className={styles.header_album}>
              <p>{result.name}</p>

              <select ref={el => selectRef.current[index] = el} className={result.type !== "music" ? styles.hidden : ""}>
                <option value="">Selecione um Álbum</option>
                {albums.map(album => (
                  <option key={album.id} value={album.id}>{album.name}</option>
                ))}
              </select>
            </div>
            
            <div 
              className={styles.button} 
              onClick={() => formRefs.current[index]?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
              >
                <FaPlus className={styles.button_sm} />
            </div>
          </form>
        </li>
      ))}
    </ul>

    <div className={styles.list}>
        {albums.map((album) => (
          <div key={album.id} className={`${styles.album} aligned`}>
            <h2>{album.name}</h2>
            <div className={styles.button}> 
              <FaTrash className={styles.button_sm} onClick={()=>delete_album(album.id)}/>
            </div>
            <ul>
              {album.musics.map((music) => (
                <li key={music.id} className={styles.music}>
                  <p>{music.title}</p>
                  <div className={styles.button}> 
                    <FaTrash className={styles.button_sm} onClick={()=>delete_music(album.id, music.id)}/>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>

    <div className={styles.music_player}>
      <Image 
        src="/album.png" 
        alt="album art" 
        width={130}
        height={130}
        className={styles.art}
        />

      <div className={styles.info}>
          <h1>The Beatles</h1>
          <p>Elanor Rigby</p>
      </div>


      <div className={styles.prog}>
          <div className={styles.prog_time}>
              <p className={styles.left}>0:00</p>
              <p className={styles.right}>2:06</p>
          </div>
          <div className={styles.prog_bar}>
              <div className={styles.prog_bar_inner}></div>
          </div>
      </div>


      <ul className={styles.buttons}>
          <li>
            <a href="#" className={styles.button}>
              <FaShuffle className={styles.button_sm} />
            </a>
          </li>
          <li>
              <a href="#" className={styles.button}>
                <FaBackwardFast className={styles.button_md} />
            </a>
          </li>
          <li>
              <a href="#" className={styles.button}>
                <FaPause className={styles.button_lg} />
              </a>
          </li>
          <li>
              <a href="#" className={styles.button}>
                <FaForwardFast className={styles.button_md} />
              </a>
          </li>
          <li>
              <a href="#" className={styles.button}>
                <FaRotate className={styles.button_sm} />
              </a>
          </li>
      </ul>
    </div>

    </main>
  );
}
