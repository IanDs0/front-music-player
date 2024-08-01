"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { FaBackwardFast, FaForwardFast, FaPause, FaPlus, FaRotate, FaShuffle, FaSistrix, FaTrash } from "react-icons/fa6";
import { useEffect, useRef, useState } from "react";

import api from "../services/api";
import { AiFillCopy } from "react-icons/ai";
import { title } from "process";

type Music = {
  id: string;
  title: string;
}

type Album = {
  id: string;
  name: string;
  musics: Music[];
}

type SearchResult = {
  id: string;
  name: string;
  type?: "album" | "music";
};

export default function Home() {

  const selectRef = useRef([]);
  const formRefs = useRef([]);

  const [albums, setAlbums] = useState<Album[]>([]);

  const [searchValue, setSearchValue] = useState<string>("");
  const [resultSearch, setResultSearch] = useState<SearchResult[]>([]);
  const [visible, setVisible] = useState<boolean>(false);

  const [tasks, setTasks] = useState({ id: 1, text: 'Criar Musica', completed: false },);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/album/');
        setAlbums(response.data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, []);

  async function search(name: string) {
    
    if (name === "") {
      setResultSearch([]);
      setVisible(false)
      return;
    }

    const response = await api.get(`/search/${name}`);
    setVisible(true);
    setResultSearch(response.data.resultSearch);
    
  }

  async function create_album(album_name:string) {
    try {
      const response = await api.post('/album', { name: album_name });
      
      if (response.status !== 201) {
        console.error('Erro ao criar álbum:', response);
      }

      const novoAlbum = { id: response.data.album.id, name: response.data.album.name, musics: [] };
      setAlbums(prevAlbums => [...prevAlbums, novoAlbum]);
    } catch (error) {
      console.error('Erro ao criar album:', error);
    }
  }

  async function clone_album(album_id:string) {
    const albumToClone = albums.find(album => album.id === album_id);
    
    if (!albumToClone) {
      console.error('Álbum não encontrado');
      return null;
    }

    try {
      const response = await api.post('/album', { name: albumToClone.name+'(cópia)' });
      
      if (response.status !== 201) {
        console.error('Erro ao adicionar álbum:', response);
      }

      albumToClone.musics.forEach(async music => {add_music(response.data.album.id, music.id)});
      const new_response = await api.get('/album/');
      setAlbums(new_response.data);
      setVisible(false);
    } catch (error) {
      console.error('Erro ao criar album:', error);
    }
  }

  async function add_music(album_id:string, music_id:string) {
    try { 
      const add_music = await api.put(`/album/${album_id}/add_music/${music_id}`);
      
      if (add_music.status !== 200) {
        console.error('Erro ao adicionar música:', add_music);
      }

      const response = await api.get('/album/');
      setAlbums(response.data);
    } catch (error) {
      console.error('Erro ao adicionar dados:', error);
    }
  }

  async function create_music(music_name:string) {
    try {
      const response = await api.post('/music', { title: music_name });
      
      if (response.status !== 200) {
        console.error('Erro ao criar uma musica:', response);
      }
    } catch (error) {
      console.error('Erro ao criar musica:', error);
    }
  }

  async function delete_album(id:string) {
    try {
      const response = await api.delete(`/album/${id}`);
      
      if (response.status !== 200) {
        console.error('Erro ao adicionar álbum:', response);
      }

      const novosAlbuns = albums.filter(album => album.id !== id);
      setAlbums(novosAlbuns);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  }

  async function delete_music(id:string) {
    try {
      const response = await api.delete(`/music/${id}`);
      
      if (response.status !== 200) {
        console.error('Erro ao adicionar álbum:', response);
      }

      const res = await api.get('/album/');
      setAlbums(res.data);
      setVisible(false);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  }

  async function remove_music(album_id:string, music_id:string) {

    try { 
      const add_music = await api.delete(`/album/${album_id}/add_music/${music_id}`);
      
      if (add_music.status !== 200) {
        console.error('Erro ao adicionar música:', add_music);
      }
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
    } catch (error) {
      console.error('Erro ao adicionar dados:', error);
    }

  }

  const handleToggleTask = () => {
    setTasks({ ...tasks, completed: !tasks.completed });
  };
  

  return (
    <main className={styles.player}>
    <div className={styles.header}>
        <a href="#" className={styles.button}>
            <FaPlus className={styles.button_md} onClick={() => {
              if (!tasks.completed) {
                create_album(searchValue)
              }else {
                create_music(searchValue)
              }}
              } />
        </a>
        <div className={styles.input_search}>
          <input type="text" className={styles.search} onChange={e => setSearchValue(e.target.value)}/>
          <input
            type="checkbox"
            checked={tasks.completed}
            className={styles.checkbox}
            onChange={() => handleToggleTask()}
          />
        </div>
        <a href="#" className={styles.button}>
          <FaSistrix className={styles.button_md} onClick={() => search(searchValue)}/> 
        </a>
    </div>
    
    <ul className={`${styles.list_search} ${!visible ? styles.hidden : ""}`}>
      {resultSearch.map((result, index) => (
        <li key={result.id} className={styles.search_result}>
          <form ref={el => formRefs.current[index] = el} onSubmit={(e) => { 
            e.preventDefault(); 
            if (result.type === "album") {
              clone_album(result.id);
            }
            if (selectRef.current[index]?.value) {
              add_music(selectRef.current[index]?.value, result.id)
            }
          }}>
              <h2>{result.name}</h2>

              <select ref={el => selectRef.current[index] = el} className={result.type !== "music" ? styles.hidden : ""}>
                <option value="">Selecione um Álbum</option>
                {albums.map(album => (
                  <option key={album.id} value={album.id}>{album.name}</option>
                ))}
              </select>
            
            {
              result.type === "music" ?
              <div className={styles.button} > 
                <FaTrash className={styles.button_sm} onClick={()=>delete_music(result.id)}/>
              </div>
              : <></>
            }
            <div 
              className={styles.button} 
              onClick={() => formRefs.current[index]?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
              >
                {result.type !== "music" ?
                <AiFillCopy className={styles.button_sm} />
                :
                <FaPlus className={styles.button_sm} />
                }
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
                    <FaTrash className={styles.button_sm} onClick={()=>remove_music(album.id, music.id)}/>
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
          <h1>OneRepublic </h1>
          <p>Nobody</p>
      </div>


      <div className={styles.prog}>
          <div className={styles.prog_time}>
              <p className={styles.left}>0:00</p>
              <p className={styles.right}>2:33</p>
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
